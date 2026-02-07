from PIL import Image, ImageDraw
import io
from services import ocr

def test_ocr():
    # Create an image with text
    img = Image.new('RGB', (200, 100), color = (255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((10,10), "Store Name", fill=(0,0,0))
    d.text((10,30), "Item 1 10.00", fill=(0,0,0))
    d.text((10,50), "Total: 25.50", fill=(0,0,0))
    
    # Save to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    
    # Test OCR
    print("Testing OCR...")
    try:
        result = ocr.process_receipt(img_bytes)
        print("OCR Result:", result)
        if result['amount'] == 25.50:
            print("SUCCESS: Amount extracted correctly.")
        else:
            print("FAILURE: Amount not extracted correctly.")
    except Exception as e:
        print(f"OCR Failed: {e}")
        print("Tesseract might not be installed or not in PATH.")

if __name__ == "__main__":
    test_ocr()
