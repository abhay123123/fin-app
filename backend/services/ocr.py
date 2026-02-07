import re
import pytesseract
from PIL import Image
from io import BytesIO

# Set tesseract path if not in system PATH
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

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
