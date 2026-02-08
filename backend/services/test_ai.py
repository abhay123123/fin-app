import sys
import os

# Add root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

try:
    from backend.services.ai_analyst import AIAnalyst
    print("AIAnalyst imported successfully.")
    
    # Mock DB session? Or just check class import.
    # If import works, syntax and static imports are likely fine.
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
