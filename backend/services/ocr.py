import re
import pytesseract
from PIL import Image
from io import BytesIO

import shutil
import os

# Set tesseract path
# 1. Try to find in system PATH (works for Linux/Docker/Correctly configured Windows)
tesseract_path = shutil.which("tesseract")

# 2. If not found, fall back to common Windows location
if not tesseract_path:
    possible_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    if os.path.exists(possible_path):
        tesseract_path = possible_path

if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
else:
    print("Warning: Tesseract not found in PATH or common locations.")
def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Extracts text from an image byte stream using Tesseract OCR.
    """
    try:
        image = Image.open(BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"Error during OCR extraction: {e}")
        return ""

def extract_amount(text: str) -> float:
    """
    Extracts the total amount from receipt text using regex.
    """
    # Regex for currency patterns (e.g., $12.34, 12.34, Total: 12.34)
    # This is a basic pattern; real-world receipts vary wildly.
    # Looking for 'Total' or equivalent followed by numbers
    
    # 1. Clean the text, remove extra whitespace
    lines = text.split('\n')
    
    # Heuristic: Look for "Total" line often at the bottom
    for line in reversed(lines):
        line_lower = line.lower()
        
        # Safe fix: Just exclude subtotal lines
        if 'subtotal' in line_lower:
            continue
            
        if 'total' in line_lower:
            # Attempt to extract number
            # Using regex to find float values
            match = re.search(r'(\d+\.\d{2})', line)
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    continue

    # Fallback: Just look for the largest monetary value in the text? 
    # That might pick up a subtotal or tax, but often totals are largest.
    # For now, stick to simple "Total" finding.
    
    return 0.0

def extract_store_name(text: str) -> str:
    """
    Extracts the store name from receipt text.
    Assumption: Store name is usually on the first non-empty line.
    """
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        # Return the first line, seemingly the header/store name
        return lines[0]
    return "Unknown Store"

def process_receipt(image_bytes: bytes):
    text = extract_text_from_image(image_bytes)
    amount = extract_amount(text)
    store_name = extract_store_name(text)
    # Return structure matching what frontend expects/can use
    return {
        "text": text, 
        "amount": amount, 
        "store_name": store_name,
        "category": "Uncategorized" # Default category hint
    }
