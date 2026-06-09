import os
import sys
import json
from pathlib import Path
from datasets import Dataset

TOKEN = os.environ.get("HF_TOKEN", "")
DEFAULT_FILE = Path("dataset/naiara_dataset_v2.jsonl")
DATASET_FILE = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_FILE
REPO_NAME = os.environ.get("HF_DATASET_REPO", "Finish-him/naiara-recanto-dataset-v2")
PRIVATE = os.environ.get("HF_DATASET_PRIVATE", "true").lower() != "false"

if not TOKEN:
    raise RuntimeError("HF_TOKEN environment variable is required")

print(f"⏳ Lendo dataset local: {DATASET_FILE}...")
try:
    data = []
    with DATASET_FILE.open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))

    print(f"✅ Carregadas {len(data)} conversas qualificadas.")
except Exception as e:
    print(f"❌ Erro ao ler arquivo local: {e}")
    raise SystemExit(1)

print("📊 Convertendo para o formato Hugging Face Dataset...")
try:
    hf_dataset = Dataset.from_list(data)
except Exception as e:
    print(f"❌ Erro na conversão do formato: {e}")
    raise SystemExit(1)

print(f"🚀 Fazendo upload para Hugging Face Hub: '{REPO_NAME}' (private={PRIVATE})...")
try:
    hf_dataset.push_to_hub(REPO_NAME, token=TOKEN, private=PRIVATE)
    print("\n🎉 Sucesso! Dataset publicado em:")
    print(f"🔗 https://huggingface.co/datasets/{REPO_NAME}")
except Exception as e:
    print(f"❌ Erro no upload para o Hugging Face Hub: {e}")
    raise SystemExit(1)
