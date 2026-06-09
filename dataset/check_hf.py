import os
import sys
from huggingface_hub import HfApi

token = os.environ.get("HF_TOKEN", "")
if not token:
    raise RuntimeError("HF_TOKEN environment variable is required")

api = HfApi(token=token)

try:
    user_info = api.whoami()
    print(f"SUCCESS:{user_info['name']}")
except Exception as e:
    print(f"ERROR:{str(e)}")
    sys.exit(1)
