from PIL import Image, ImageDraw, ImageFont
import os

def create_receipt():
    # Create white image
    img = Image.new('RGB', (400, 600), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    
    # Try to load a font, or use default
    try:
        # standard windows font
        font_large = ImageFont.truetype("arial.ttf", 24)
        font_medium = ImageFont.truetype("arial.ttf", 16)
    except IOError:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()

    # Content
    # Store Name (Top)
    d.text((100, 20), "Walmart Supercenter", font=font_large, fill=(0, 0, 0))
    d.text((120, 50), "123 Main Street", font=font_medium, fill=(0, 0, 0))
    d.text((120, 70), "Anytown, USA", font=font_medium, fill=(0, 0, 0))
    
    # Separator
    d.line((20, 100, 380, 100), fill=(0, 0, 0), width=2)
    
    # Items
    y = 120
    items = [
        ("Milk Gallon", "3.50"),
        ("Dozen Eggs", "4.25"),
        ("Bread Loaf", "2.99"),
        ("APPLES 1LB", "1.99"),
        ("Chicken Breast", "8.50")
    ]
    
    for name, price in items:
        d.text((30, y), name, font=font_medium, fill=(0, 0, 0))
        d.text((300, y), price, font=font_medium, fill=(0, 0, 0))
        y += 30
        
    # Separator
    d.line((20, y + 10, 380, y + 10), fill=(0, 0, 0), width=2)
    y += 30
    
    # Total
    d.text((30, y), "TOTAL", font=font_large, fill=(0, 0, 0))
    d.text((300, y), "21.23", font=font_large, fill=(0, 0, 0))
    
    # Footer
    d.text((100, 550), "Thank you for shopping!", font=font_medium, fill=(0, 0, 0))

    # Save
    output_path = "d:/mini/sample_receipt.png"
    img.save(output_path)
    print(f"Sample receipt saved to {output_path}")

if __name__ == "__main__":
    create_receipt()
