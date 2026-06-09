import os
import re
import random
import gradio as gr

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
        reply = f"Pô, que bacana! Um evento lindo para {lead['convidados']} convidados! 🥳\n\nComo é uma festa de grande porte, nós precisamos fazer um estudo de logística personalizado para garantir o açaí geladinho e sem filas.\n\nEstou acionando o nosso time comercial agora mesmo. Um atendente humano vai assumir o atendimento para te passar um desconto especial! Só um minutinho! 💜"
    elif requests_human:
        local_call_human(lead, "Solicitado diretamente pelo cliente")
        reply = "Com certeza! Sem problemas. Estou acionando um dos nossos consultores de eventos aqui do Recanto. Em instantes um humano vai te chamar por aqui, beleza? Tamo junto! 💜"
    elif not lead["nome"]:
        reply = "E aí, beleza? ☀️ Aqui é a Naiara, especialista de vendas do Recanto Eventos! Fico feliz demais com o contato.\n\nPra gente começar a planejar o buffet de açaí e sorvete mais brabo do Rio pro seu evento, me conta: qual é o seu nome? 🍨"
    elif not lead["data"]:
        reply = f"Prazer falar com você, {lead['nome']}! 💜\n\nMe conta, qual é a data do seu evento? Assim eu já dou uma olhada na nossa agenda de finais de semana pra ver se tá liberado."
    elif not lead["convidados"]:
        reply = f"Maravilha, {lead['nome']}! A data está livre aqui na agenda. E para quantas pessoas você está planejando essa festa? (Lembrando que nossos pacotes base atendem até 50 pessoas, mas cobrimos qualquer tamanho!)"
    elif not lead["pacote"]:
        reply = f"Show! Anotado: {lead['convidados']} convidados.\n\nPara esse tamanho de festa, você prefere o **Combo Carioca Express (3 horas de buffet)** ou o **Combo Redentor Premium (4 horas de buffet com adicionais extras)**?"
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
        
        reply = f"Maneiro demais, {lead['nome']}! Seu orçamento está pronto: o **{lead['pacote']}** para **{lead['convidados']} pessoas** em **{lead['local']}** fica no total de **{formatted_total}**.\n\nComo a data de {lead['data']} é super concorrida, quer que eu faça a reserva temporária dela de 24h sem custo pra você garantir? Para confirmar, a gente faz o Pix de 50% de sinal. O que acha? 💜"
        
        if any(w in normalized for w in ["sim", "quero", "reserva", "fechar", "pix"]):
            local_reserve_date(lead, lead["nome"], lead["data"], lead["pacote"])
            half_price = f"R$ {total_val / 2:,.2f}".replace(".", "X").replace(",", ".").replace("X", ",")
            reply = f"Perfeito, {lead['nome']}! Já fiz a reserva temporária da sua data de {lead['data']} por 24 horas! 🥳\n\nO sinal de 50% fica em **{half_price}**. Para confirmar com segurança, nosso time comercial envia os dados oficiais de pagamento por aqui — sem passar dados sensíveis automaticamente.\n\nPosso te ajudar em algo mais? 🍨💜"
    else:
        reply = f"Opa, {lead['nome']}! Já temos todos os dados do seu evento mapeados aqui no CRM. Seu lead está super quente! \n\nPara o sinal de 50%, nosso time comercial te envia os dados oficiais de pagamento com segurança. Se tiver mais alguma dúvida sobre acompanhamentos ou montagem, só me chamar! 🍨"
        
    lead["logs"].append(f"[Naiara] {reply[:60]}...")
    return reply

def chat_interface(message, history, lead_state):
    lead = lead_state or initial_lead_state()
    lead["logs"].append(f"[User] {message}")
    reply = run_local_fallback(lead, message)
    
    lead["score"] = calculate_score(lead)
    lead["temperatura"] = get_temperature(lead["score"])
    
    if lead["status"] != "[Transbordo Humano]" and lead["status"] != "[Aguardando Sinal]":
        if lead["score"] >= 90:
            lead["status"] = "[Lead Quente]"
        elif lead["score"] >= 40:
            lead["status"] = "[Orçamento em Andamento]"
        else:
            lead["status"] = "[Lead Novo]"

    history.append((message, reply))
    
    checklist = f"""
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
    """
    
    logs_display = "\n".join(lead["logs"])
    return history, lead, checklist, logs_display

with gr.Blocks() as demo:
    # Use direct initial dict call instead of function reference to support older Gradio
    lead_state = gr.State(initial_lead_state())
    
    chatbot = gr.Chatbot(value=[("", "Oi!")], height=300)
    msg = gr.Textbox()
    
    msg.submit(chat_interface, [msg, chatbot, lead_state], [chatbot, lead_state])

# Test launching
print("Testing Gradio blocks...")
