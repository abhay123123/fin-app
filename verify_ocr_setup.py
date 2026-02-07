import pytesseract
import sys
import os

# Set tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def check_tesseract():
    print("Checking Tesseract Configuration...")
    
    # 1. Check if file exists
    if not os.path.exists(pytesseract.pytesseract.tesseract_cmd):
        print("[FAIL] Tesseract executable not found at configured path.")
        return False
        
    print(f"[PASS] Found executable at: {pytesseract.pytesseract.tesseract_cmd}")

    # 2. Check if we can get version
    try:
        version = pytesseract.get_tesseract_version()
        print(f"[PASS] Tesseract Version: {version}")
        return True
    except Exception as e:
        print(f"[FAIL] Failed to run Tesseract: {e}")
        return False

if __name__ == "__main__":
    if check_tesseract():
        print("\n[PASS] OCR SETUP PASSED")
        sys.exit(0)
    else:
        print("\n[FAIL] OCR SETUP FAILED")
        sys.exit(1)
