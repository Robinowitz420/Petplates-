# scripts/split-mascot-faces.py
# Split the mascot_face_emojis image into individual mascot face images

from PIL import Image
import os
from pathlib import Path

# Mascot face order (left to right in the image) - Brand Bible names
MASCOT_FACES = [
    ('puppy-prepper', 'Puppy Prepper', 'The Chef & Meal-Prep Lead - Light gold dog with chef hat'),
    ('professor-purrfessor', 'Professor Purrfessor', 'The Researcher & Recipe Tester - Black cat with glasses'),
    ('sherlock-shells', 'Sherlock Shells', 'Explorer & Risk Inspector - Green turtle with orange cap and monocle'),
    ('farmer-fluff', 'Farmer Fluff', 'Ingredient Provider & Farm Manager - Dark brown hamster'),
    ('robin-redroute', 'Robin Redroute', 'Packaging & Delivery Specialist - Red bird with captain hat and goggles'),
]

def split_mascot_faces():
    """Split mascot_face_emojis-removebg-preview.png into individual mascot face images"""
    input_path = Path('IMAGES FOR SITE/Mascots/Final Dafts/mascot_face_emojis-removebg-preview.png')
    output_dir = Path('public/images/emojis/mascots')
    
    if not input_path.exists():
        print(f"❌ File not found: {input_path}")
        return
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Open the image
    img = Image.open(input_path)
    width, height = img.size
    
    print(f"📐 Image dimensions: {width}x{height}")
    print(f"🔍 Detected: 5 mascot faces in a horizontal row")
    
    # Calculate cell width (5 faces in a row)
    cell_width = width / 5
    cell_height = height  # Full height for each face
    
    print(f"📏 Cell size: {cell_width:.0f}x{cell_height:.0f}")
    
    # Split into individual images
    for index, (file_name, display_name, description) in enumerate(MASCOT_FACES):
        # Calculate crop box
        left = int(index * cell_width)
        top = 0
        right = int(left + cell_width)
        bottom = int(height)
        
        # Crop the cell
        cell = img.crop((left, top, right, bottom))
        
        # Save with descriptive name
        output_path = output_dir / f"{file_name}_face.png"
        cell.save(output_path, 'PNG')
        
        print(f"  ✅ [{index+1}/5] Saved: {output_path.name} - {display_name}")
        print(f"     {description}")
    
    print(f"\n✅ Successfully split {len(MASCOT_FACES)} mascot face images!")
    print(f"📁 Output directory: {output_dir.absolute()}")

if __name__ == '__main__':
    split_mascot_faces()

