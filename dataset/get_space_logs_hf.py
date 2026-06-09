import os
from huggingface_hub import HfApi

TOKEN = os.environ.get("HF_TOKEN", "")
REPO_ID = "Finish-him/naiara-chatbot"

if not TOKEN:
    raise RuntimeError("HF_TOKEN environment variable is required")

api = HfApi(token=TOKEN)

try:
    print(f"📡 Buscando logs do Space '{REPO_ID}' usando HfApi...")
    logs = api.read_space_logs(repo_id=REPO_ID)
    print("\n📋 LOGS DO SPACE:")
    print(logs)
except Exception as e:
    print(f"❌ Erro ao buscar logs com HfApi: {e}")
