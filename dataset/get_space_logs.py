import os
from huggingface_hub import HfApi

TOKEN = os.environ.get("HF_TOKEN", "")
REPO_ID = "Finish-him/naiara-chatbot"

if not TOKEN:
    raise RuntimeError("HF_TOKEN environment variable is required")

api = HfApi(token=TOKEN)

try:
    print(f"📡 Buscando runtime logs do Space '{REPO_ID}'...")
    logs = api.fetch_space_logs(repo_id=REPO_ID, build=False)
    print("\n📋 RUNTIME LOGS DO SPACE:")
    for line in logs:
        print(line, end="")
except Exception as e:
    print(f"❌ Erro ao buscar runtime logs: {e}")

try:
    print(f"\n📡 Buscando build logs do Space '{REPO_ID}'...")
    logs = api.fetch_space_logs(repo_id=REPO_ID, build=True)
    print("\n📋 BUILD LOGS DO SPACE:")
    for line in logs:
        print(line, end="")
except Exception as e:
    print(f"❌ Erro ao buscar build logs: {e}")
