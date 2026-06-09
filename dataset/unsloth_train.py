# -*- coding: utf-8 -*-
"""
🚀 Script de Treinamento da Naiara com Unsloth (Fine-Tuning LoRA)
Este script carrega o dataset sintético gerado em JSONL e executa o fine-tuning
do modelo Qwen-2.5-7B-Instruct (ou Llama-3-8B-Instruct) para o assistente de WhatsApp do Recanto do Açaí.
"""

import os
import torch
from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

# 1. Configurações básicas
max_seq_length = 2048 # Define o contexto máximo de conversas
dtype = None # Auto detecção (Float16 ou Bfloat16 dependendo da GPU)
load_in_4bit = True # Habilita quantização de 4-bit para economizar memória VRAM (roda em GPUs de 12GB/16GB)

# 2. Carregar o Modelo e Tokenizador via Unsloth
print("⏳ Carregando o modelo e o tokenizador...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen2.5-7B-Instruct-bnb-4bit", # Modelo base otimizado
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

# 3. Configurar parâmetros de Adaptação (LoRA)
print("⚙️ Configurando adaptadores LoRA...")
model = FastLanguageModel.get_peft_model(
    model,
    r = 16, # Rank do LoRA (16 ou 32 são ideais)
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj"],
    lora_alpha = 16,
    lora_dropout = 0, # Otimizado para 0
    bias = "none",    # Otimizado para "none"
    use_gradient_checkpointing = "unsloth", # Economiza VRAM
    random_state = 3407,
    use_rslora = False,
    loftq_config = None,
)

# 4. Formatação do Dataset no formato HuggingFace / ChatML
# Mapeia os dados do JSONL para o formato de mensagens conversacionais
def format_prompts(examples):
    formatted_texts = []
    for messages in examples["messages"]:
        # Usa o helper de templates do tokenizador para gerar os tokens de chat corretos
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        formatted_texts.append(text)
    return { "text" : formatted_texts }

print("📊 Carregando e formatando o dataset...")
# Carrega o arquivo do Hugging Face Hub de forma privada
TOKEN = os.environ.get("HF_TOKEN", "")
REPO_NAME = os.environ.get("HF_DATASET_REPO", "Finish-him/naiara-recanto-dataset-v2")
if not TOKEN:
    raise RuntimeError("HF_TOKEN environment variable is required")

dataset = load_dataset(REPO_NAME, split="train", token=TOKEN)
dataset = dataset.map(format_prompts, batched=True)

# 5. Configurar o Trainer (SFTTrainer)
print("🏋️ Inicializando o SFTTrainer do TRL...")
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False, # Define False para pequenos diálogos
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        max_steps = 60, # Ajuste o número de passos com base no tamanho do dataset
        learning_rate = 2e-4,
        fp16 = not torch.cuda.is_bf16_supported(),
        bf16 = torch.cuda.is_bf16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
    ),
)

# 6. Rodar o Treinamento!
print("🚀 Iniciando o treinamento do modelo comercial...")
trainer_stats = trainer.train()

# 7. Salvar os adaptadores LoRA locais e enviar para o Hugging Face Hub
print("💾 Salvando os adaptadores LoRA em 'lora_adapters'...")
model.save_pretrained("lora_adapters")
tokenizer.save_pretrained("lora_adapters")

HF_MODEL_REPO = "Finish-him/qwen2.5-7b-naiara-lora"
print(f"🚀 Enviando adaptadores LoRA para o Hugging Face Hub: '{HF_MODEL_REPO}'...")
try:
    model.push_to_hub(HF_MODEL_REPO, token=TOKEN, private=True)
    tokenizer.push_to_hub(HF_MODEL_REPO, token=TOKEN, private=True)
    print(f"\n🎉 Treinamento e upload concluídos com sucesso!")
    print(f"O modelo de adaptadores LoRA está disponível de forma privada em:")
    print(f"🔗 https://huggingface.co/{HF_MODEL_REPO}")
except Exception as e:
    print(f"❌ Erro ao enviar modelo para Hugging Face Hub: {e}")
