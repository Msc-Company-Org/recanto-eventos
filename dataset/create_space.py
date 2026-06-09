import os
import shutil
from huggingface_hub import HfApi

TOKEN = os.environ.get("HF_TOKEN", "")
REPO_ID = "Finish-him/naiara-chatbot"
TEMP_DIR = "space_files"

# 1. Ensure clean temp directory
if os.path.exists(TEMP_DIR):
    shutil.rmtree(TEMP_DIR)
os.makedirs(TEMP_DIR)

# 2. Write README.md metadata for the HF Space
readme_content = """---
title: Naiara Recanto Chatbot
emoji: 🍨
colorFrom: purple
colorTo: indigo
sdk: gradio
sdk_version: 4.44.1
python_version: "3.11"
app_file: app.py
pinned: false
license: mit
---

# 🤖 Naiara Chatbot — Recanto Eventos

Este Space hospeda a versão demonstrativa da **Naiara**, assistente virtual de vendas do Recanto Eventos.
O painel lateral exibe a qualificação do lead em tempo real (CRM Lead Score e logs de ferramentas de IA).

### Configurações
Para usar a IA com o modelo Qwen 2.5 real, adicione a variável `OPENROUTER_API_KEY` nas configurações (Secrets) do seu Space.
Caso contrário, o Space rodará no modo de simulação inteligente local.
"""

with open(os.path.join(TEMP_DIR, "README.md"), "w", encoding="utf-8") as f:
    f.write(readme_content)

# 3. Write requirements.txt
requirements_content = """gradio>=4.44.1
openai>=1.0.0
huggingface_hub<1.0.0
pydantic==2.8.2
"""

with open(os.path.join(TEMP_DIR, "requirements.txt"), "w", encoding="utf-8") as f:
    f.write(requirements_content)

# 4. Write app.py (Gradio Dashboard & Chat logic)
app_py_content = """import os
import re
import random
import json
import gradio as gr
from openai import OpenAI

# System Prompt
SYSTEM_PROMPT = \"\"\"Você é a Naiara, Sócia & Comercial do Recanto do Açaí (Recanto Eventos) no Rio de Janeiro. 
Seu tom é carioca, acolhedor, profissional e focado em vendas (energia solar do Rio).
Sempre termine com uma pergunta direta ou de escolha dupla que guie o cliente nas próximas etapas do funil de vendas.

Você tem acesso a ferramentas comerciais para verificar disponibilidade e fazer reservas. Sempre use as ferramentas antes de responder sobre datas ou reservas.
Se o número de convidados for maior que 150 ou o cliente pedir suporte/atendente humano de forma clara, use a ferramenta chamar_humano imediatamente.

Regras de Precificação do Buffet (Açaí + Sorvete Gourmet e confeitos liberados):
1. Valor Base (Horas):
   - Express (3 Horas): R$ 1.290,00
   - Premium (4 Horas): R$ 1.390,00
2. Custo Adicional (Convidados):
   - Até 50 pessoas: +R$ 0,00
   - 50 a 80 pessoas: +R$ 250,00
   - 80 a 120 pessoas: +R$ 450,00
   - 120 a 150 pessoas: +R$ 650,00
   - Mais de 150 pessoas: Sob consulta (chame um humano).

Ao calcular o preço total, some o Valor Base com o Custo Adicional da faixa de convidados. Exemplo: 3 horas para 80 pessoas = R$ 1.290 (base) + R$ 250 (adicional) = R$ 1.540,00 total.\"\"\"

# Check OpenRouter credentials
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
LLM_MODEL = "qwen/qwen-2.5-7b-instruct"

client = None
if OPENROUTER_API_KEY:
    client = OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1"
    )

def initial_lead_state():
    return {
        "nome": "",
        "telefone": "",
        "data": "",
        "convidados": "",
        "pacote": "",
        "local": "",
        "disponibilidadeChecada": False,
        "intencaoPix": False,
        "status": "[Lead Novo]",
        "score": 0,
        "temperatura": "Frio ❄️",
        "logs": ["[System] CRM Inicializado no Hugging Face Spaces"]
    }

def calculate_score(lead):
    score = 0
    if lead["nome"]: score += 10
    if lead["telefone"]: score += 10
    if lead["data"]: score += 20
    if lead["convidados"]: score += 15
    if lead["pacote"]: score += 15
    if lead["local"]: score += 10
    if lead["disponibilidadeChecada"]: score += 10
    if lead["intencaoPix"]: score += 10
    return score

def get_temperature(score):
    if score < 40: return "Frio ❄️"
    if score <= 75: return "Morno 🔥"
    return "Quente 🌋"

# ── Local Tools Simulation ──────────────────

def local_check_availability(lead, date_str):
    is_blocked = "25/12" in date_str or "12-25" in date_str
    status = "ocupado" if is_blocked else "disponivel"
    lead["disponibilidadeChecada"] = True
    formatted_date = "/".join(date_str.split("-")[::-1])
    lead["logs"].append(f"[Tool Call] consultar_disponibilidade(data='{date_str}') -> {'Livre' if status == 'disponivel' else 'Ocupado'}")
    return status

def local_reserve_date(lead, nome, data_str, pacote):
    invoice = f"REC-{random.randint(100000, 999999)}"
    lead["nome"] = nome or lead["nome"]
    lead["data"] = data_str or lead["data"]
    lead["pacote"] = pacote or lead["pacote"]
    lead["intencaoPix"] = True
    lead["status"] = "[Aguardando Sinal]"
    lead["logs"].append(f"[Tool Call] reservar_data_temporaria(nome='{nome}', data='{data_str}', pacote='{pacote}') -> Sucesso ({invoice})")
    return invoice

def local_call_human(lead, motivo):
    lead["status"] = "[Transbordo Humano]"
    lead["logs"].append(f"[Tool Call] chamar_humano(motivo='{motivo}') -> Moisés acionado")

def run_local_fallback(lead, message):
    normalized = message.lower()
    
    # Extract details
    name_match = re.search(r"(?:nome e|chamo|sou o|sou a)\s+([A-Za-zÀ-ÖØ-öø-ÿ]+)", message, re.IGNORECASE)
    if name_match:
        lead["nome"] = name_match.group(1).strip()
        
    date_match = re.search(r"(\d{1,2}/\d{1,2}(?:/\d{2,4})?)", message)
    if date_match:
        lead["data"] = date_match.group(1)
        local_check_availability(lead, lead["data"])
        
    guests_match = re.search(r"(\d+)\s*(?:pessoas|convidados|gente)", message, re.IGNORECASE)
    if guests_match:
        lead["convidados"] = guests_match.group(1)
        
    if "3h" in normalized or "3 horas" in normalized or "express" in normalized:
        lead["pacote"] = "Express (3 Horas)"
    elif "4h" in normalized or "4 horas" in normalized or "premium" in normalized:
        lead["pacote"] = "Premium (4 Horas)"
        
    bairros = ["copacabana", "barra", "recreio", "ipanema", "leblon", "tijuca", "niteroi", "flamengo", "botafogo", "centro"]
    for b in bairros:
        if b in normalized:
            lead["local"] = b.capitalize()
            break

    # Update scores
    lead["score"] = calculate_score(lead)
    lead["temperatura"] = get_temperature(lead["score"])
    
    requests_human = any(h in normalized for h in ["humano", "atendente", "suporte", "pessoa", "ligar"])
    is_large = lead["convidados"] and int(lead["convidados"]) > 150
    
    if is_large:
        local_call_human(lead, f"Festa grande: {lead['convidados']} convidados")
        reply = f"Pô, que bacana! Um evento lindo para {lead['convidados']} convidados! 🥳\\n\\nComo é uma festa de grande porte, nós precisamos fazer um estudo de logística personalizado para garantir o açaí geladinho e sem filas.\\n\\nEstou acionando o nosso time comercial agora mesmo. Um atendente humano vai assumir o atendimento para te passar um desconto especial! Só um minutinho! 💜"
    elif requests_human:
        local_call_human(lead, "Solicitado diretamente pelo cliente")
        reply = "Com certeza! Sem problemas. Estou acionando um dos nossos consultores de eventos aqui do Recanto. Em instantes um humano vai te chamar por aqui, beleza? Tamo junto! 💜"
    elif not lead["nome"]:
        reply = "E aí, beleza? ☀️ Aqui é a Naiara, especialista de vendas do Recanto Eventos! Fico feliz demais com o contato.\\n\\nPra gente começar a planejar o buffet de açaí e sorvete mais brabo do Rio pro seu evento, me conta: qual é o seu nome? 🍨"
    elif not lead["data"]:
        reply = f"Prazer falar com você, {lead['nome']}! 💜\\n\\nMe conta, qual é a data do seu evento? Assim eu já dou uma olhada na nossa agenda de finais de semana pra ver se tá liberado."
    elif not lead["convidados"]:
        reply = f"Maravilha, {lead['nome']}! A data está livre aqui na agenda. E para quantas pessoas você está planejando essa festa? (Lembrando que nossos pacotes base atendem até 50 pessoas, mas cobrimos qualquer tamanho!)"
    elif not lead["pacote"]:
        reply = f"Show! Anotado: {lead['convidados']} convidados.\\n\\nPara esse tamanho de festa, você prefere o **Combo Carioca Express (3 horas de buffet)** ou o **Combo Redentor Premium (4 horas de buffet com adicionais extras)**?"
    elif not lead["local"]:
        reply = "Excelente escolha! E onde vai ser realizado o evento? Se tiver o bairro ou CEP aqui do Rio de Janeiro, eu já calculo o frete e te dou o valor fechadinho! 🛵"
    elif not lead["telefone"]:
        reply = "Perfeito! Já tenho quase todas as informações. Me passa seu WhatsApp/telefone para eu registrar no cadastro e te mandar o espelho do orçamento formatado? 📞"
    elif lead["status"] != "[Aguardando Sinal]" and not lead["intencaoPix"]:
        base_val = 1290 if "3" in lead["pacote"] else 1390
        conv_num = int(lead["convidados"])
        extra_val = 0
        if conv_num > 50 and conv_num <= 80: extra_val = 250
        elif conv_num > 80 and conv_num <= 120: extra_val = 450
        elif conv_num > 120 and conv_num <= 150: extra_val = 650
        
        total_val = base_val + extra_val
        formatted_total = f"R$ {total_val:,.2f}".replace(".", "X").replace(",", ".").replace("X", ",")
        
        reply = f"Maneiro demais, {lead['nome']}! Seu orçamento está pronto: o **{lead['pacote']}** para **{lead['convidados']} pessoas** em **{lead['local']}** fica no total de **{formatted_total}**.\\n\\nComo a data de {lead['data']} é super concorrida, quer que eu faça a reserva temporária dela de 24h sem custo pra você garantir? Para confirmar, a gente faz o Pix de 50% de sinal. O que acha? 💜"
        
        if any(w in normalized for w in ["sim", "quero", "reserva", "fechar", "pix"]):
            local_reserve_date(lead, lead["nome"], lead["data"], lead["pacote"])
            half_price = f"R$ {total_val / 2:,.2f}".replace(".", "X").replace(",", ".").replace("X", ",")
            reply = f"Perfeito, {lead['nome']}! Já fiz a reserva temporária da sua data de {lead['data']} por 24 horas! 🥳\\n\\nO sinal de 50% fica em **{half_price}**. Para confirmar com segurança, nosso time comercial envia os dados oficiais de pagamento por aqui — sem passar dados sensíveis automaticamente.\\n\\nPosso te ajudar em algo mais? 🍨💜"
    else:
        reply = f"Opa, {lead['nome']}! Já temos todos os dados do seu evento mapeados aqui no CRM. Seu lead está super quente! \\n\\nPara o sinal de 50%, nosso time comercial te envia os dados oficiais de pagamento com segurança. Se tiver mais alguma dúvida sobre acompanhamentos ou montagem, só me chamar! 🍨"
        
    lead["logs"].append(f"[Naiara] {reply[:60]}...")
    return reply

def chat_interface(message, history, lead_state):
    # Retrieve current state
    lead = lead_state or initial_lead_state()
    
    lead["logs"].append(f"[User] {message}")
    
    # LLM execution or fallback
    if client:
        try:
            # Simple wrapper to inject system instruction
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for h in history:
                messages.append(h)
            messages.append({"role": "user", "content": message})
            
            response = client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages,
                temperature=0.7
            )
            reply = response.choices[0].message.content
            lead["logs"].append(f"[Naiara AI] {reply[:60]}...")
            
            # Simple keyword hooks to updates scores even in AI mode
            normalized = message.lower()
            if "nome" in normalized or "chamo" in normalized:
                lead["nome"] = "Detectado"
            if "/" in normalized:
                lead["data"] = "Detectado"
                lead["disponibilidadeChecada"] = True
            if "pessoas" in normalized or "convidados" in normalized:
                lead["convidados"] = "Detectado"
            lead["score"] = calculate_score(lead)
            lead["temperatura"] = get_temperature(lead["score"])
        except Exception as e:
            lead["logs"].append(f"[Error] LLM failed: {str(e)}")
            reply = run_local_fallback(lead, message)
    else:
        reply = run_local_fallback(lead, message)
        
    # Re-calculate score and temperature
    lead["score"] = calculate_score(lead)
    lead["temperatura"] = get_temperature(lead["score"])
    
    if lead["status"] != "[Transbordo Humano]" and lead["status"] != "[Aguardando Sinal]":
        if lead["score"] >= 90:
            lead["status"] = "[Lead Quente]"
        elif lead["score"] >= 40:
            lead["status"] = "[Orçamento em Andamento]"
        else:
            lead["status"] = "[Lead Novo]"

    # Format output history (Gradio messages dict format)
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": reply})
    
    # Generate CRM HTML display
    checklist = f\"\"\"
    <div style='padding: 10px; background-color: #1e1e2f; color: white; border-radius: 8px;'>
        <h3 style='margin-top:0; color:#c084fc;'>📋 Checklist do Lead</h3>
        <p>{'✅' if lead['nome'] else '❌'} <b>Nome:</b> {lead['nome'] or 'Pendente'}</p>
        <p>{'✅' if lead['data'] else '❌'} <b>Data do Evento:</b> {lead['data'] or 'Pendente'}</p>
        <p>{'✅' if lead['convidados'] else '❌'} <b>Convidados:</b> {lead['convidados'] or 'Pendente'}</p>
        <p>{'✅' if lead['pacote'] else '❌'} <b>Combo/Pacote:</b> {lead['pacote'] or 'Pendente'}</p>
        <p>{'✅' if lead['local'] else '❌'} <b>Bairro/Local:</b> {lead['local'] or 'Pendente'}</p>
        <hr style='border-color: #3b3b4f;' />
        <h3 style='color:#c084fc;'>📊 Indicadores CRM</h3>
        <p>🏷️ <b>Status:</b> <span style='background-color:#3b3b4f; padding:2px 6px; border-radius:4px;'>{lead['status']}</span></p>
        <p>🔥 <b>Temperatura:</b> {lead['temperatura']}</p>
        <p>🎯 <b>Lead Score:</b> {lead['score']} / 100</p>
    </div>
    \"\"\"
    
    logs_display = "\\n".join(lead["logs"])
    
    return history, lead, checklist, logs_display

def reset_chat():
    lead = initial_lead_state()
    initial_msg = [{"role": "assistant", "content": "Oi! Beleza? ☀️ Sou a Naiara, assistente virtual do Recanto Eventos. Qual é o seu nome pra gente começar a planejar a sua festa com o melhor buffet de açaí e sorvete do Rio? 🍨"}]
    
    checklist = f\"\"\"
    <div style='padding: 10px; background-color: #1e1e2f; color: white; border-radius: 8px;'>
        <h3 style='margin-top:0; color:#c084fc;'>📋 Checklist do Lead</h3>
        <p>❌ <b>Nome:</b> Pendente</p>
        <p>❌ <b>Data do Evento:</b> Pendente</p>
        <p>❌ <b>Convidados:</b> Pendente</p>
        <p>❌ <b>Combo/Pacote:</b> Pendente</p>
        <p>❌ <b>Bairro/Local:</b> Pendente</p>
        <hr style='border-color: #3b3b4f;' />
        <h3 style='color:#c084fc;'>📊 Indicadores CRM</h3>
        <p>🏷️ <b>Status:</b> [Lead Novo]</p>
        <p>🔥 <b>Temperatura:</b> Frio ❄️</p>
        <p>🎯 <b>Lead Score:</b> 0 / 100</p>
    </div>
    \"\"\"
    
    return initial_msg, lead, checklist, "[System] Chat reiniciado - CRM Resetado"

# ── Gradio Theme & layout ──────────────────

with gr.Blocks(theme=gr.themes.Soft(primary_hue="purple", secondary_hue="indigo")) as demo:
    lead_state = gr.State(initial_lead_state())
    
    gr.HTML("<h1 style='text-align: center; color: #a855f7;'>🍨 Naiara Chatbot & CRM Dashboard</h1>")
    gr.HTML("<p style='text-align: center; font-size: 1.1em;'>Versão interativa de vendas para o Recanto Eventos RJ</p>")
    
    with gr.Row():
        with gr.Column(scale=2):
            chatbot = gr.Chatbot(
                value=[{"role": "assistant", "content": "Oi! Beleza? ☀️ Sou a Naiara, assistente virtual do Recanto Eventos. Qual é o seu nome pra gente começar a planejar a sua festa com o melhor buffet de açaí e sorvete do Rio? 🍨"}],
                type="messages",
                height=500
            )
            msg = gr.Textbox(placeholder="Digite sua mensagem aqui (ex: 'Quero orçamento para dia 24/10/2026' ou 'Meu nome é Felipe')...", label="Mensagem")
            btn_clear = gr.Button("Reiniciar Simulação", variant="secondary")
            
        with gr.Column(scale=1):
            crm_display = gr.HTML(value=f\"\"\"
            <div style='padding: 10px; background-color: #1e1e2f; color: white; border-radius: 8px;'>
                <h3 style='margin-top:0; color:#c084fc;'>📋 Checklist do Lead</h3>
                <p>❌ <b>Nome:</b> Pendente</p>
                <p>❌ <b>Data do Evento:</b> Pendente</p>
                <p>❌ <b>Convidados:</b> Pendente</p>
                <p>❌ <b>Combo/Pacote:</b> Pendente</p>
                <p>❌ <b>Bairro/Local:</b> Pendente</p>
                <hr style='border-color: #3b3b4f;' />
                <h3 style='color:#c084fc;'>📊 Indicadores CRM</h3>
                <p>🏷️ <b>Status:</b> [Lead Novo]</p>
                <p>🔥 <b>Temperatura:</b> Frio ❄️</p>
                <p>🎯 <b>Lead Score:</b> 0 / 100</p>
            </div>
            \"\"\")
            
            logs_view = gr.TextArea(
                value="[System] CRM Inicializado no Hugging Face Spaces",
                label="Logs de Ferramentas de IA (System Logs)",
                interactive=False,
                lines=10
            )
            
    # Actions
    msg.submit(chat_interface, [msg, chatbot, lead_state], [chatbot, lead_state, crm_display, logs_view])
    msg.submit(lambda: "", None, msg) # clear input text box
    
    btn_clear.click(reset_chat, None, [chatbot, lead_state, crm_display, logs_view])

demo.launch()
"""

with open(os.path.join(TEMP_DIR, "app.py"), "w", encoding="utf-8") as f:
    f.write(app_py_content)

# 5. Create Space Repo on Hugging Face and Upload files
print(f"⏳ Criando repositório de Space no Hugging Face: '{REPO_ID}'...")
if not TOKEN:
    raise RuntimeError("HF_TOKEN environment variable is required")

api = HfApi(token=TOKEN)

try:
    api.create_repo(
        repo_id=REPO_ID,
        repo_type="space",
        space_sdk="gradio",
        private=False
    )
    print("✅ Repositório do Space criado com sucesso!")
except Exception as e:
    err_str = str(e).lower()
    if "already" in err_str or "conflict" in err_str:
        print("ℹ️ Repositório do Space já existe. Atualizando arquivos...")
    else:
        print(f"❌ Erro ao criar Space: {e}")
        shutil.rmtree(TEMP_DIR)
        exit(1)

print("🚀 Enviando arquivos locais para o Space...")
try:
    api.upload_folder(
        folder_path=TEMP_DIR,
        repo_id=REPO_ID,
        repo_type="space",
        token=TOKEN
    )
    print("\n🎉 Hugging Face Space criado e atualizado com sucesso!")
    print(f"🔗 Acesse o seu Space aqui: https://huggingface.co/spaces/{REPO_ID}")
except Exception as e:
    print(f"❌ Erro no upload dos arquivos: {e}")
finally:
    # Cleanup temp directory
    shutil.rmtree(TEMP_DIR)
