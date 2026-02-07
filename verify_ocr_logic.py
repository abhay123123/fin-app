import sys
import os

# Add the parent directory to sys.path to allow importing backend modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, '..'))

try:
    from backend.services import ocr
    print("[PASS] Successfully imported ocr service")
except Exception as e:
    print(f"[FAIL] Failed to import ocr service: {e}")
    sys.exit(1)

# Mock image bytes (just a text file really, or invalid image)
# Tesseract might fail to process it, but we want to see if the function call itself crashes
try:
    # Use a dummy byte string. Tesseract will return empty string for garbage input, which is handled.
    # To test logic, we ideally need a real image, but let's see if it crashes on basic execution.
    print("Testing process_receipt with dummy data...")
    result = ocr.process_receipt(b"dummy_image_data")
    print(f"Result: {result}")
    
    if "store_name" in result:
        print("[PASS] store_name field present")
    else:
        print("[FAIL] store_name field missing")
        
    print("[PASS] ocr.process_receipt executed without crashing")
except Exception as e:
    print(f"[FAIL] process_receipt crashed: {e}")
    import traceback
    traceback.print_exc()

# Also check if we can actually import the changes I made
if hasattr(ocr, 'extract_store_name'):
    print("[PASS] extract_store_name function exists")
else:
    print("[FAIL] extract_store_name function missing")
