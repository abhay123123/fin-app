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
        
        # Explicitly skip subtotal/tax lines to avoid false positives
        if 'subtotal' in line_lower or 'tax' in line_lower:
            continue
            
        # Check for Total or variations
        if 'total' in line_lower or 'amount due' in line_lower:
            # Attempt to extract number
            # Using regex to find float values, allowing for spaces and commas
            # Matches: 154.06, 154 . 06, 154,06, $154.06
            # Clean the line of non-numeric chars except dot/comma first? 
            # Or just use a flexible regex.
            
            # Simple flexible regex: look for digits, maybe space/dot/comma, then 2 digits
            match = re.search(r'(\d+[\s\.,]*\d{2})', line)
            if match:
                val_str = match.group(1).replace(' ', '').replace(',', '.')
                try:
                    return float(val_str)
                except ValueError:
                    continue

    # Fallback: Find the largest monetary value in the text
    # This handles cases where "Total" isn't read correctly (e.g. "7OTAL")
    try:
        all_amounts = []
        for line in lines:
            line_lower = line.lower()
            # CRITICAL: Exclude subtotal/tax from fallback too!
            if 'subtotal' in line_lower or 'tax' in line_lower:
                continue

            # valid amounts often have a dot for cents
            # Use same flexible regex
            matches = re.findall(r'(\d+[\s\.,]*\d{2})', line)
            for m in matches:
                val_str = m.replace(' ', '').replace(',', '.')
                try:
                    val = float(val_str)
                    all_amounts.append(val)
                except ValueError:
                    continue
        
        if all_amounts:
            return max(all_amounts)
    except Exception:
        pass
    
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
