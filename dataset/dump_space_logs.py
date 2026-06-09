import os
from huggingface_hub import HfApi

TOKEN = os.environ.get("HF_TOKEN", "")
REPO_ID = "Finish-him/naiara-chatbot"

if not TOKEN:
    raise RuntimeError("HF_TOKEN environment variable is required")

api = HfApi(token=TOKEN)

with open("dataset/space_runtime.log", "w", encoding="utf-8") as f:
    try:
        logs = api.fetch_space_logs(repo_id=REPO_ID, build=False)
        for line in logs:
            f.write(line)
        print("✅ Runtime logs salvos em dataset/space_runtime.log")
    except Exception as e:
        f.write(f"ERROR: {e}")
        print(f"❌ Erro ao buscar runtime logs: {e}")

with open("dataset/space_build.log", "w", encoding="utf-8") as f:
    try:
        logs = api.fetch_space_logs(repo_id=REPO_ID, build=True)
        for line in logs:
            f.write(line)
        print("✅ Build logs salvos em dataset/space_build.log")
    except Exception as e:
        f.write(f"ERROR: {e}")
        print(f"❌ Erro ao buscar build logs: {e}")
