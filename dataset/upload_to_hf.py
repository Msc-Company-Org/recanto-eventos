import os
import json
from datasets import Dataset
from huggingface_hub import HfApi

TOKEN = os.environ.get("HF_TOKEN", "")
REPO_NAME = "Finish-him/naiara-recanto-dataset"

print(f"⏳ Lendo o dataset local 'dataset/naiara_dataset.jsonl'...")
try:
    data = []
    with open("dataset/naiara_dataset.jsonl", "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))
    
    print(f"✅ Carregadas {len(data)} conversas qualificadas.")
except Exception as e:
    print(f"❌ Erro ao ler arquivo local: {e}")
    exit(1)

print("📊 Convertendo para o formato Hugging Face Dataset...")
try:
    hf_dataset = Dataset.from_list(data)
except Exception as e:
    print(f"❌ Erro na conversão do formato: {e}")
    exit(1)

print(f"🚀 Fazendo upload do dataset para Hugging Face Hub: '{REPO_NAME}'...")
try:
    if not TOKEN:
        raise RuntimeError("HF_TOKEN environment variable is required")

    hf_dataset.push_to_hub(REPO_NAME, token=TOKEN, private=True)
    print(f"\n🎉 Sucesso! O dataset está publicado como PRIVADO em:")
    print(f"🔗 https://huggingface.co/datasets/{REPO_NAME}")
except Exception as e:
    print(f"❌ Erro no upload para o Hugging Face Hub: {e}")
    exit(1)
