import sys
import os

# Add the parent directory (d:/mini) to sys.path so we can import 'backend'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

try:
    print("Attempting to import backend.main...")
    from backend import main
    print("Successfully imported backend.main")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
