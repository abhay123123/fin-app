import requests
import os
from PIL import Image, ImageDraw, ImageFont

# 1. Create a dummy receipt image
img = Image.new('RGB', (300, 600), color = (255, 255, 255))
d = ImageDraw.Draw(img)
# Try to use a default font, otherwise load one? 
# Default bitmap font is fine for basic text
d.text((10,10), "Walmart", fill=(0,0,0))
d.text((10,50), "Milk 3.00", fill=(0,0,0))
d.text((10,70), "Eggs 2.50", fill=(0,0,0))
d.text((10,100), "Total: 5.50", fill=(0,0,0))

img_path = "test_receipt.png"
img.save(img_path)
print(f"Created test image: {img_path}")

# 2. Upload it to the backend
url = 'http://localhost:8000/upload-receipt/'
files = {'file': open(img_path, 'rb')}

print(f"Uploading to {url}...")
try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        json_resp = response.json()
        if "store_name" in json_resp and json_resp["store_name"] == "Walmart":
            print("[PASS] Upload successful and OCR extracted store name.")
        else:
            print("[WARN] Upload successful but OCR content might be unexpected.")
            print(json_resp)
            
    else:
        print("[FAIL] Upload failed with non-200 status.")
        
except Exception as e:
    print(f"[FAIL] Connection failed: {e}")
    # Hint: is the server running?

# Cleanup
files['file'].close()
if os.path.exists(img_path):
    os.remove(img_path)
