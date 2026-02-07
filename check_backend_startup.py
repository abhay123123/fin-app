import sys
import os

# Add the parent directory to sys.path to allow importing backend modules
current_dir = os.path.dirname(os.path.abspath(__file__))
# Assuming this script is in d:/mini/, and backend is in d:/mini/backend
sys.path.append(current_dir)

try:
    print("Attempting to import backend.main...")
    from backend import main
    print("[PASS] Backend main module imported successfully.")
except Exception as e:
    print(f"[FAIL] Backend Startup Error: {e}")
    import traceback
    traceback.print_exc()
