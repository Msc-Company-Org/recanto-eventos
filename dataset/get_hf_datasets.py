import os
from huggingface_hub import HfApi

TOKEN = os.environ.get("HF_TOKEN", "")
if not TOKEN:
    raise RuntimeError("HF_TOKEN environment variable is required")

api = HfApi(token=TOKEN)

try:
    print("🔍 Buscando datasets na conta 'Finish-him'...")
    datasets = api.list_datasets(author="Finish-him")
    for ds in datasets:
        print(f"\n📂 Dataset: {ds.id}")
        print(f"   Criado em: {ds.lastModified}")
        
        # List files inside this dataset
        print("   Arquivos no Repositório:")
        files = api.list_repo_files(repo_id=ds.id, repo_type="dataset")
        for file in files:
            print(f"    - {file}")
except Exception as e:
    print(f"❌ Erro ao buscar dados do Hugging Face Hub: {e}")
