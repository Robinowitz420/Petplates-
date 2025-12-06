# scripts/split-new-amojis.py
# Split the new amojis.png (8x10 grid, 80 icons) into individual emoji images

from PIL import Image
import os
from pathlib import Path

# Grid layout: 8 rows x 10 columns = 80 icons
ROWS = 8
COLS = 10

def split_new_amojis():
    """Split amojis.png into 80 individual emoji images"""
    input_path = Path('IMAGES FOR SITE/emojis/amojis.png')
    output_dir = Path('public/images/emojis')
    
    if not input_path.exists():
        print(f"❌ File not found: {input_path}")
        return
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Open the image
    img = Image.open(input_path)
    width, height = img.size
    
    print(f"📐 Image dimensions: {width}x{height}")
    print(f"🔍 Detected: {ROWS} rows x {COLS} columns = {ROWS * COLS} icons")
    
    # Calculate cell dimensions
    cell_width = width / COLS
    cell_height = height / ROWS
    
    print(f"📏 Cell size: {cell_width:.0f}x{cell_height:.0f}")
    
    # Split into individual images
    count = 0
    for row in range(ROWS):
        for col in range(COLS):
            # Calculate crop box
            left = int(col * cell_width)
            top = int(row * cell_height)
            right = int(left + cell_width)
            bottom = int(top + cell_height)
            
            # Crop the cell
            cell = img.crop((left, top, right, bottom))
            
            # Save with sequential number (001-080)
            count += 1
            output_path = output_dir / f"amojis_{count:03d}.png"
            cell.save(output_path, 'PNG')
            
            if count % 10 == 0:
                print(f"  ✅ Processed {count}/{ROWS * COLS} icons...")
    
    print(f"\n✅ Successfully split {count} emoji images!")
    print(f"📁 Output directory: {output_dir.absolute()}")
    print(f"📝 Files saved as: amojis_001.png through amojis_{count:03d}.png")

if __name__ == '__main__':
    split_new_amojis()

