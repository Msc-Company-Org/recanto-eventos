import os
from huggingface_hub import HfApi

TOKEN = os.environ.get("HF_TOKEN", "")
REPO_ID = "Finish-him/naiara-chatbot"

if not TOKEN:
    raise RuntimeError("HF_TOKEN environment variable is required")

api = HfApi(token=TOKEN)

try:
    print(f"🔍 Buscando status do Space '{REPO_ID}'...")
    info = api.space_info(repo_id=REPO_ID)
    runtime = info.runtime
    print(f"\n⚡ Estado Atual: {runtime.stage}")
    if runtime.stage == "RUNNING":
        print(f"🟢 O Space está online e rodando normalmente!")
    elif runtime.stage == "BUILDING":
        print(f"🟡 O Space ainda está compilando no Hugging Face. Aguarde mais uns instantes.")
    elif runtime.stage == "ERROR":
        print(f"❌ Ocorreu um erro na execução do Space!")
        print(f"   Mensagem de Erro: {runtime.error_message}")
except Exception as e:
    print(f"❌ Erro ao consultar o status do Space: {e}")
