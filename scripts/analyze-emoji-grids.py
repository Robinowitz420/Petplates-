# scripts/analyze-emoji-grids.py
# Analyze emoji grid images to determine cell dimensions

from PIL import Image
import os
from pathlib import Path

def analyze_grid_image(image_path, grid_cols, grid_rows):
    """Analyze a grid image and calculate cell dimensions"""
    try:
        img = Image.open(image_path)
        width, height = img.size
        
        # Calculate cell dimensions
        cell_width = width / grid_cols
        cell_height = height / grid_rows
        
        return {
            'file': os.path.basename(image_path),
            'total_width': width,
            'total_height': height,
            'grid_cols': grid_cols,
            'grid_rows': grid_rows,
            'cell_width': cell_width,
            'cell_height': cell_height,
            'total_cells': grid_cols * grid_rows
        }
    except Exception as e:
        return {'file': os.path.basename(image_path), 'error': str(e)}

def main():
    emojis_dir = Path('IMAGES FOR SITE/emojis')
    
    if not emojis_dir.exists():
        print(f"❌ Directory not found: {emojis_dir}")
        return
    
    print("🔍 Analyzing emoji grid images...\n")
    
    # Known grid layouts based on image descriptions
    grid_configs = {
        'amojis.png': (8, 8),  # 8x8 grid = 64 emojis
        'Copilot_20251203_002753.png': (10, 11),  # 10 columns, 11 rows = 110 emojis
        # For the grid JPG files, we'll detect them
    }
    
    results = []
    
    # Analyze PNG files
    for image_file in emojis_dir.glob('*.png'):
        if image_file.name in grid_configs:
            cols, rows = grid_configs[image_file.name]
            result = analyze_grid_image(image_file, cols, rows)
            results.append(result)
    
    # Analyze JPG files - try to detect grid layout
    for image_file in emojis_dir.glob('*.jpg'):
        img = Image.open(image_file)
        width, height = img.size
        
        print(f"\n📐 {image_file.name}:")
        print(f"   Image size: {width}x{height}px")
        print(f"   Possible grid layouts:")
        
        # Try common grid layouts
        possible_layouts = [
            (8, 8),   # 64 emojis
            (10, 10), # 100 emojis
            (10, 11), # 110 emojis
            (15, 10), # 150 emojis
            (12, 10), # 120 emojis
        ]
        
        best_match = None
        for cols, rows in possible_layouts:
            cell_w = width / cols
            cell_h = height / rows
            # Check if it divides evenly (within 1 pixel tolerance)
            if abs(cell_w - round(cell_w)) < 1 and abs(cell_h - round(cell_h)) < 1:
                cell_w_int = round(cell_w)
                cell_h_int = round(cell_h)
                print(f"   ✅ {cols}x{rows} grid → {cell_w_int}x{cell_h_int}px per cell")
                if best_match is None:
                    best_match = (cols, rows, cell_w_int, cell_h_int)
        
        if best_match:
            cols, rows, cell_w, cell_h = best_match
            results.append({
                'file': image_file.name,
                'total_width': width,
                'total_height': height,
                'grid_cols': cols,
                'grid_rows': rows,
                'cell_width': cell_w,
                'cell_height': cell_h,
                'total_cells': cols * rows
            })
    
    # Print summary
    print("\n" + "="*60)
    print("📊 GRID ANALYSIS SUMMARY")
    print("="*60)
    
    for result in results:
        if 'error' in result:
            print(f"\n❌ {result['file']}: {result['error']}")
        else:
            print(f"\n📁 {result['file']}")
            print(f"   Grid: {result['grid_cols']}x{result['grid_rows']} = {result['total_cells']} cells")
            print(f"   Image: {result['total_width']}x{result['total_height']}px")
            print(f"   Cell size: {result['cell_width']:.1f}x{result['cell_height']:.1f}px")
            if result['cell_width'] == int(result['cell_width']):
                print(f"   ✅ Exact: {int(result['cell_width'])}x{int(result['cell_height'])}px per emoji")
    
    # Save results to JSON for the split script
    import json
    output_file = Path('data/emoji-grid-analysis.json')
    output_file.parent.mkdir(exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Analysis saved to: {output_file}")

if __name__ == '__main__':
    main()

