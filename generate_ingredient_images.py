import os
import time
import io
import requests
from PIL import Image

POLLINATION_URL = "https://image.pollinations.ai/prompt/"

# Prompts for each ingredient (one image per ingredient)
INGREDIENT_PROMPTS = {
    # PROTEINS
    "Chicken": "Cute cartoon whole chicken, thick black outlines, flat 2D vector style, simple geometric shapes, warm orange-yellow color, minimal details, white background",
    "Beef": "Cute cartoon beef steak with marbling pattern, thick black outlines, flat 2D vector style, simple shapes, red-pink color, minimal details, white background",
    "Turkey": "Cute cartoon turkey bird, thick black outlines, flat 2D vector style, simple geometric shapes, brown-tan color, minimal details, white background",
    "Duck": "Cute cartoon duck, thick black outlines, flat 2D vector style, simple geometric shapes, brown color, minimal details, white background",
    "Quail": "Cute cartoon quail bird, thick black outlines, flat 2D vector style, simple geometric shapes, speckled brown pattern, minimal details, white background",
    "Lamb": "Cute cartoon lamb, thick black outlines, flat 2D vector style, simple geometric shapes, white fluffy texture suggested, minimal details, white background",
    "Rabbit": "Cute cartoon rabbit, thick black outlines, flat 2D vector style, simple geometric shapes, gray-white color, floppy ears, minimal details, white background",
    "Pork": "Cute cartoon pig, thick black outlines, flat 2D vector style, simple geometric shapes, pink color, minimal details, white background",
    "Eggs": "Cute cartoon eggs in carton, thick black outlines, flat 2D vector style, simple geometric shapes, white and cream colors, minimal details, white background",
    "Salmon": "Cute cartoon salmon fish, thick black outlines, flat 2D vector style, simple geometric shapes, pink-orange color, minimal details, white background",
    "Sardines": "Cute cartoon sardine fish, thick black outlines, flat 2D vector style, simple geometric shapes, silver-blue color, minimal details, white background",
    "Mackerel": "Cute cartoon mackerel fish with stripes, thick black outlines, flat 2D vector style, simple geometric shapes, blue-silver color, minimal details, white background",
    "Herring": "Cute cartoon herring fish, thick black outlines, flat 2D vector style, simple geometric shapes, silver color, minimal details, white background",
    "Anchovy": "Cute cartoon anchovy fish, thick black outlines, flat 2D vector style, simple geometric shapes, small silver fish, minimal details, white background",
    "Fish": "Cute cartoon generic fish, thick black outlines, flat 2D vector style, simple geometric shapes, blue-orange color, minimal details, white background",
    "Crickets": "Cute cartoon cricket insect, thick black outlines, flat 2D vector style, simple geometric shapes, brown-green color, minimal details, white background",
    "Roaches": "Cute cartoon dubia roach, thick black outlines, flat 2D vector style, simple geometric shapes, brown color, minimal details, white background",
    "Worms": "Cute cartoon mealworm, thick black outlines, flat 2D vector style, simple geometric shapes, yellow-tan color, minimal details, white background",

    # GRAINS & LEGUMES
    "Rice": "Cute cartoon rice grains in bowl, thick black outlines, flat 2D vector style, simple geometric shapes, white color, minimal details, white background",
    "Oats": "Cute cartoon oat flakes in bowl, thick black outlines, flat 2D vector style, simple geometric shapes, beige-tan color, minimal details, white background",
    "Quinoa": "Cute cartoon quinoa seeds pile, thick black outlines, flat 2D vector style, simple geometric shapes, cream-tan color, minimal details, white background",
    "Buckwheat": "Cute cartoon buckwheat groats, thick black outlines, flat 2D vector style, simple geometric shapes, brown color, minimal details, white background",
    "Barley": "Cute cartoon barley grains, thick black outlines, flat 2D vector style, simple geometric shapes, golden-tan color, minimal details, white background",
    "Millet": "Cute cartoon millet seeds, thick black outlines, flat 2D vector style, simple geometric shapes, yellow color, minimal details, white background",
    "Sorghum": "Cute cartoon sorghum grains, thick black outlines, flat 2D vector style, simple geometric shapes, cream color, minimal details, white background",
    "Farro": "Cute cartoon farro grains, thick black outlines, flat 2D vector style, simple geometric shapes, tan-brown color, minimal details, white background",
    "Bulgur": "Cute cartoon bulgur wheat, thick black outlines, flat 2D vector style, simple geometric shapes, golden-brown color, minimal details, white background",
    "Beans": "Cute cartoon kidney beans, thick black outlines, flat 2D vector style, simple geometric shapes, red-brown color, minimal details, white background",
    "Chickpeas": "Cute cartoon chickpeas, thick black outlines, flat 2D vector style, simple geometric shapes, beige-tan color, minimal details, white background",
    "Lentils": "Cute cartoon lentils pile, thick black outlines, flat 2D vector style, simple geometric shapes, orange-brown color, minimal details, white background",
    "Split Peas": "Cute cartoon split peas, thick black outlines, flat 2D vector style, simple geometric shapes, yellow-green color, minimal details, white background",
    "Peas": "Cute cartoon pea pods, thick black outlines, flat 2D vector style, simple geometric shapes, bright green color, minimal details, white background",
    "Wheat": "Cute cartoon wheat stalks, thick black outlines, flat 2D vector style, simple geometric shapes, golden-yellow color, minimal details, white background",

    # VEGETABLES
    "Bok Choi": "Cute cartoon bok choy vegetable, thick black outlines, flat 2D vector style, simple geometric shapes, white-green color, minimal details, white background",
    "Purslane": "Cute cartoon purslane leaves, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Miner's Lettuce": "Cute cartoon miner's lettuce plant, thick black outlines, flat 2D vector style, simple geometric shapes, bright green color, minimal details, white background",
    "Green Beans": "Cute cartoon green beans, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Fennel": "Cute cartoon fennel bulb, thick black outlines, flat 2D vector style, simple geometric shapes, white-green color, minimal details, white background",
    "Leeks": "Cute cartoon leek vegetable, thick black outlines, flat 2D vector style, simple geometric shapes, white-green color, minimal details, white background",
    "Zucchini": "Cute cartoon zucchini, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Delicata Squash": "Cute cartoon delicata squash, thick black outlines, flat 2D vector style, simple geometric shapes, cream with green stripes, minimal details, white background",
    "Napa Cabbage": "Cute cartoon napa cabbage, thick black outlines, flat 2D vector style, simple geometric shapes, pale green color, minimal details, white background",
    "Acorn Squash": "Cute cartoon acorn squash, thick black outlines, flat 2D vector style, simple geometric shapes, dark green-orange color, minimal details, white background",
    "Turnip Greens": "Cute cartoon turnip greens, thick black outlines, flat 2D vector style, simple geometric shapes, green leaves, minimal details, white background",
    "Yellow Squash": "Cute cartoon yellow squash, thick black outlines, flat 2D vector style, simple geometric shapes, bright yellow color, minimal details, white background",
    "Brussels Sprouts": "Cute cartoon brussels sprouts, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Lamb's Quarters": "Cute cartoon lamb's quarters leaves, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Watercress": "Cute cartoon watercress bunch, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Eggplant": "Cute cartoon eggplant, thick black outlines, flat 2D vector style, simple geometric shapes, purple color, minimal details, white background",
    "Artichokes": "Cute cartoon artichoke, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Asparagus": "Cute cartoon asparagus spears, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Radicchio": "Cute cartoon radicchio head, thick black outlines, flat 2D vector style, simple geometric shapes, purple-red color, minimal details, white background",
    "Endive": "Cute cartoon endive, thick black outlines, flat 2D vector style, simple geometric shapes, pale green-white color, minimal details, white background",
    "Frisée": "Cute cartoon frisée lettuce, thick black outlines, flat 2D vector style, simple geometric shapes, pale yellow-green color, minimal details, white background",
    "Broccoli": "Cute cartoon broccoli floret, thick black outlines, flat 2D vector style, simple geometric shapes, bright green color, minimal details, white background",
    "Cauliflower": "Cute cartoon cauliflower head, thick black outlines, flat 2D vector style, simple geometric shapes, white color, minimal details, white background",
    "Tomatoes": "Cute cartoon tomato, thick black outlines, flat 2D vector style, simple geometric shapes, red color, minimal details, white background",
    "Pumpkin": "Cute cartoon pumpkin, thick black outlines, flat 2D vector style, simple geometric shapes, orange color, minimal details, white background",
    "Sweet Potato": "Cute cartoon sweet potato, thick black outlines, flat 2D vector style, simple geometric shapes, orange color, minimal details, white background",
    "Regular Potato": "Cute cartoon potato, thick black outlines, flat 2D vector style, simple geometric shapes, brown-tan color, minimal details, white background",
    "Spinach": "Cute cartoon spinach leaves, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Kale": "Cute cartoon kale leaves, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Collard Greens": "Cute cartoon collard greens, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Mustard Greens": "Cute cartoon mustard greens, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Dandelion Greens": "Cute cartoon dandelion leaves, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Beet Greens": "Cute cartoon beet greens, thick black outlines, flat 2D vector style, simple geometric shapes, green with red stems, minimal details, white background",
    "Amaranth Leaves": "Cute cartoon amaranth leaves, thick black outlines, flat 2D vector style, simple geometric shapes, green-purple color, minimal details, white background",
    "Red Cabbage": "Cute cartoon red cabbage head, thick black outlines, flat 2D vector style, simple geometric shapes, purple-red color, minimal details, white background",

    # OILS & FATS
    "Salmon Oil": "Cute cartoon oil bottle with salmon icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden-orange color, minimal details, white background",
    "Coconut Oil": "Cute cartoon coconut with oil drop, thick black outlines, flat 2D vector style, simple geometric shapes, white-brown color, minimal details, white background",
    "Flaxseed": "Cute cartoon flaxseeds pile, thick black outlines, flat 2D vector style, simple geometric shapes, brown color, minimal details, white background",
    "Hemp Seeds": "Cute cartoon hemp seeds, thick black outlines, flat 2D vector style, simple geometric shapes, tan-green color, minimal details, white background",
    "Walnut Oil": "Cute cartoon oil bottle with walnut icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden-brown color, minimal details, white background",
    "Black Currant Oil": "Cute cartoon oil bottle with berry icon, thick black outlines, flat 2D vector style, simple geometric shapes, dark purple-gold color, minimal details, white background",
    "Almond Oil": "Cute cartoon oil bottle with almond icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden color, minimal details, white background",
    "Sunflower Oil": "Cute cartoon sunflower with oil drop, thick black outlines, flat 2D vector style, simple geometric shapes, yellow-gold color, minimal details, white background",
    "Chia Seed Oil": "Cute cartoon chia seeds with oil drop, thick black outlines, flat 2D vector style, simple geometric shapes, black speckled, minimal details, white background",
    "Fish Oil": "Cute cartoon oil capsule with fish icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden-orange color, minimal details, white background",
    "Olive Oil": "Cute cartoon olive oil bottle with olive branch, thick black outlines, flat 2D vector style, simple geometric shapes, green-gold color, minimal details, white background",
    "Pumpkin Seed Oil": "Cute cartoon pumpkin seeds with oil drop, thick black outlines, flat 2D vector style, simple geometric shapes, green-gold color, minimal details, white background",

    # SUPPLEMENTS
    "Kelp Powder": "Cute cartoon kelp seaweed, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Eggshells": "Cute cartoon crushed eggshells, thick black outlines, flat 2D vector style, simple geometric shapes, white color, minimal details, white background",
    "Turmeric": "Cute cartoon turmeric root, thick black outlines, flat 2D vector style, simple geometric shapes, orange-yellow color, minimal details, white background",
    "Pectin": "Cute cartoon apple with pectin molecules, thick black outlines, flat 2D vector style, simple geometric shapes, red-clear color, minimal details, white background",
    "Cranberry Extract": "Cute cartoon cranberries, thick black outlines, flat 2D vector style, simple geometric shapes, red color, minimal details, white background",
    "Omega-3": "Cute cartoon supplement capsule with omega-3 label, thick black outlines, flat 2D vector style, simple geometric shapes, orange-gold color, minimal details, white background",
    "SAM-e": "Cute cartoon supplement pill bottle, thick black outlines, flat 2D vector style, simple geometric shapes, blue-white color, minimal details, white background",
    "Psyllium Husk": "Cute cartoon psyllium husks, thick black outlines, flat 2D vector style, simple geometric shapes, tan-brown color, minimal details, white background",
    "Vitamin C": "Cute cartoon orange slice with vitamin label, thick black outlines, flat 2D vector style, simple geometric shapes, orange color, minimal details, white background",
    "Bone Broth": "Cute cartoon steaming bowl, thick black outlines, flat 2D vector style, simple geometric shapes, brown-beige color, minimal details, white background",
    "Fructooligosaccharides": "Cute cartoon prebiotic fiber icon, thick black outlines, flat 2D vector style, simple geometric shapes, green-white color, minimal details, white background",
    "Curcumin": "Cute cartoon turmeric powder pile, thick black outlines, flat 2D vector style, simple geometric shapes, bright orange color, minimal details, white background",
    "Joint Health Supplement": "Cute cartoon joint/bone icon, thick black outlines, flat 2D vector style, simple geometric shapes, blue-white color, minimal details, white background",
    "Brewer's Yeast": "Cute cartoon yeast powder jar, thick black outlines, flat 2D vector style, simple geometric shapes, tan-brown color, minimal details, white background",

    # OTHER
    "Honey": "Cute cartoon honey jar with dipper, thick black outlines, flat 2D vector style, simple geometric shapes, golden-yellow color, minimal details, white background",
    "Peanut Butter": "Cute cartoon peanut butter jar with peanuts, thick black outlines, flat 2D vector style, simple geometric shapes, brown-tan color, minimal details, white background",
    "Spirulina Powder": "Cute cartoon spirulina powder bowl, thick black outlines, flat 2D vector style, simple geometric shapes, dark green-blue color, minimal details, white background",
    "Probiotic Powder": "Cute cartoon probiotic supplement jar, thick black outlines, flat 2D vector style, simple geometric shapes, white-blue color, minimal details, white background",
    "Vitamin D3": "Cute cartoon sun with vitamin pill, thick black outlines, flat 2D vector style, simple geometric shapes, yellow-orange color, minimal details, white background",
    "Herring Oil": "Cute cartoon oil bottle with herring fish icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden-silver color, minimal details, white background",
}


def slugify(name: str) -> str:
    """Simple slug: lowercase, replace spaces with hyphens."""
    return name.lower().replace(" ", "-")


def download_image(prompt: str, name: str, output_dir: str):
    """Download a single image with retry and backoff."""
    filename = f"{slugify(name)}.png"
    seed = sum(ord(c) for c in name)  # deterministic seed
    url = POLLINATION_URL + prompt.replace(" ", "%20") + f"?seed={seed}&width=512&height=512"

    max_retries = 7
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            img = Image.open(io.BytesIO(response.content))
            img_path = os.path.join(output_dir, filename)
            img.save(img_path)
            return f"Downloaded {filename}"
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"Timeout for {name}, retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                return f"Failed to download {name}: Timeout"
        except requests.exceptions.RequestException as e:
            if "429" in str(e) or "502" in str(e):
                if attempt < max_retries - 1:
                    wait_time = 3 ** attempt
                    print(f"Rate/Server issue for {name}, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue
            return f"Failed to download {name}: {e}"
    return None


def generate_ingredient_images():
    output_dir = os.path.join("public", "images", "ingredients")
    os.makedirs(output_dir, exist_ok=True)

    total = len(INGREDIENT_PROMPTS)
    print(f"=== Generating {total} ingredient images ===")

    for idx, (name, prompt) in enumerate(INGREDIENT_PROMPTS.items(), start=1):
        filename = f"{slugify(name)}.png"
        img_path = os.path.join(output_dir, filename)

        if os.path.exists(img_path):
            print(f"[SKIP] {filename} already exists")
            continue

        print(f"[{idx}/{total}] {name}")
        result = download_image(prompt, name, output_dir)
        if result:
            print(result)

        time.sleep(1.5)  # gentle pacing

    print(f"\n✅ Done. Images saved to {output_dir}")


if __name__ == "__main__":
    generate_ingredient_images()
import requests
import os
import time
from PIL import Image
import io

# Pollination API URL
POLLINATION_URL = "https://image.pollinations.ai/prompt/"

# Ingredient Prompts Dictionary
INGREDIENT_PROMPTS = {
    # PROTEINS
    "Chicken": "Cute cartoon whole chicken, thick black outlines, flat 2D vector style, simple geometric shapes, warm orange-yellow color, minimal details, white background",
    "Beef": "Cute cartoon beef steak with marbling pattern, thick black outlines, flat 2D vector style, simple shapes, red-pink color, minimal details, white background",
    "Turkey": "Cute cartoon turkey bird, thick black outlines, flat 2D vector style, simple geometric shapes, brown-tan color, minimal details, white background",
    "Duck": "Cute cartoon duck, thick black outlines, flat 2D vector style, simple geometric shapes, brown color, minimal details, white background",
    "Quail": "Cute cartoon quail bird, thick black outlines, flat 2D vector style, simple geometric shapes, speckled brown pattern, minimal details, white background",
    "Lamb": "Cute cartoon lamb, thick black outlines, flat 2D vector style, simple geometric shapes, white fluffy texture suggested, minimal details, white background",
    "Rabbit": "Cute cartoon rabbit, thick black outlines, flat 2D vector style, simple geometric shapes, gray-white color, floppy ears, minimal details, white background",
    "Pork": "Cute cartoon pig, thick black outlines, flat 2D vector style, simple geometric shapes, pink color, minimal details, white background",
    "Eggs": "Cute cartoon eggs in carton, thick black outlines, flat 2D vector style, simple geometric shapes, white and cream colors, minimal details, white background",
    "Salmon": "Cute cartoon salmon fish, thick black outlines, flat 2D vector style, simple geometric shapes, pink-orange color, minimal details, white background",
    "Sardines": "Cute cartoon sardine fish, thick black outlines, flat 2D vector style, simple geometric shapes, silver-blue color, minimal details, white background",
    "Mackerel": "Cute cartoon mackerel fish with stripes, thick black outlines, flat 2D vector style, simple geometric shapes, blue-silver color, minimal details, white background",
    "Herring": "Cute cartoon herring fish, thick black outlines, flat 2D vector style, simple geometric shapes, silver color, minimal details, white background",
    "Anchovy": "Cute cartoon anchovy fish, thick black outlines, flat 2D vector style, simple geometric shapes, small silver fish, minimal details, white background",
    "Fish": "Cute cartoon generic fish, thick black outlines, flat 2D vector style, simple geometric shapes, blue-orange color, minimal details, white background",
    "Crickets": "Cute cartoon cricket insect, thick black outlines, flat 2D vector style, simple geometric shapes, brown-green color, minimal details, white background",
    "Roaches": "Cute cartoon dubia roach, thick black outlines, flat 2D vector style, simple geometric shapes, brown color, minimal details, white background",
    "Worms": "Cute cartoon mealworm, thick black outlines, flat 2D vector style, simple geometric shapes, yellow-tan color, minimal details, white background",

    # GRAINS & LEGUMES
    "Rice": "Cute cartoon rice grains in bowl, thick black outlines, flat 2D vector style, simple geometric shapes, white color, minimal details, white background",
    "Oats": "Cute cartoon oat flakes in bowl, thick black outlines, flat 2D vector style, simple geometric shapes, beige-tan color, minimal details, white background",
    "Quinoa": "Cute cartoon quinoa seeds pile, thick black outlines, flat 2D vector style, simple geometric shapes, cream-tan color, minimal details, white background",
    "Buckwheat": "Cute cartoon buckwheat groats, thick black outlines, flat 2D vector style, simple geometric shapes, brown color, minimal details, white background",
    "Barley": "Cute cartoon barley grains, thick black outlines, flat 2D vector style, simple geometric shapes, golden-tan color, minimal details, white background",
    "Millet": "Cute cartoon millet seeds, thick black outlines, flat 2D vector style, simple geometric shapes, yellow color, minimal details, white background",
    "Sorghum": "Cute cartoon sorghum grains, thick black outlines, flat 2D vector style, simple geometric shapes, cream color, minimal details, white background",
    "Farro": "Cute cartoon farro grains, thick black outlines, flat 2D vector style, simple geometric shapes, tan-brown color, minimal details, white background",
    "Bulgur": "Cute cartoon bulgur wheat, thick black outlines, flat 2D vector style, simple geometric shapes, golden-brown color, minimal details, white background",
    "Beans": "Cute cartoon kidney beans, thick black outlines, flat 2D vector style, simple geometric shapes, red-brown color, minimal details, white background",
    "Chickpeas": "Cute cartoon chickpeas, thick black outlines, flat 2D vector style, simple geometric shapes, beige-tan color, minimal details, white background",
    "Lentils": "Cute cartoon lentils pile, thick black outlines, flat 2D vector style, simple geometric shapes, orange-brown color, minimal details, white background",
    "Split Peas": "Cute cartoon split peas, thick black outlines, flat 2D vector style, simple geometric shapes, yellow-green color, minimal details, white background",
    "Peas": "Cute cartoon pea pods, thick black outlines, flat 2D vector style, simple geometric shapes, bright green color, minimal details, white background",
    "Wheat": "Cute cartoon wheat stalks, thick black outlines, flat 2D vector style, simple geometric shapes, golden-yellow color, minimal details, white background",

    # VEGETABLES
    "Bok Choi": "Cute cartoon bok choy vegetable, thick black outlines, flat 2D vector style, simple geometric shapes, white-green color, minimal details, white background",
    "Purslane": "Cute cartoon purslane leaves, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Miner's Lettuce": "Cute cartoon miner's lettuce plant, thick black outlines, flat 2D vector style, simple geometric shapes, bright green color, minimal details, white background",
    "Green Beans": "Cute cartoon green beans, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Fennel": "Cute cartoon fennel bulb, thick black outlines, flat 2D vector style, simple geometric shapes, white-green color, minimal details, white background",
    "Leeks": "Cute cartoon leek vegetable, thick black outlines, flat 2D vector style, simple geometric shapes, white-green color, minimal details, white background",
    "Zucchini": "Cute cartoon zucchini, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Delicata Squash": "Cute cartoon delicata squash, thick black outlines, flat 2D vector style, simple geometric shapes, cream with green stripes, minimal details, white background",
    "Napa Cabbage": "Cute cartoon napa cabbage, thick black outlines, flat 2D vector style, simple geometric shapes, pale green color, minimal details, white background",
    "Acorn Squash": "Cute cartoon acorn squash, thick black outlines, flat 2D vector style, simple geometric shapes, dark green-orange color, minimal details, white background",
    "Turnip Greens": "Cute cartoon turnip greens, thick black outlines, flat 2D vector style, simple geometric shapes, green leaves, minimal details, white background",
    "Yellow Squash": "Cute cartoon yellow squash, thick black outlines, flat 2D vector style, simple geometric shapes, bright yellow color, minimal details, white background",
    "Brussels Sprouts": "Cute cartoon brussels sprouts, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Lamb's Quarters": "Cute cartoon lamb's quarters leaves, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Watercress": "Cute cartoon watercress bunch, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Eggplant": "Cute cartoon eggplant, thick black outlines, flat 2D vector style, simple geometric shapes, purple color, minimal details, white background",
    "Artichokes": "Cute cartoon artichoke, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Asparagus": "Cute cartoon asparagus spears, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Radicchio": "Cute cartoon radicchio head, thick black outlines, flat 2D vector style, simple geometric shapes, purple-red color, minimal details, white background",
    "Endive": "Cute cartoon endive, thick black outlines, flat 2D vector style, simple geometric shapes, pale green-white color, minimal details, white background",
    "Frisée": "Cute cartoon frisée lettuce, thick black outlines, flat 2D vector style, simple geometric shapes, pale yellow-green color, minimal details, white background",
    "Broccoli": "Cute cartoon broccoli floret, thick black outlines, flat 2D vector style, simple geometric shapes, bright green color, minimal details, white background",
    "Cauliflower": "Cute cartoon cauliflower head, thick black outlines, flat 2D vector style, simple geometric shapes, white color, minimal details, white background",
    "Tomatoes": "Cute cartoon tomato, thick black outlines, flat 2D vector style, simple geometric shapes, red color, minimal details, white background",
    "Pumpkin": "Cute cartoon pumpkin, thick black outlines, flat 2D vector style, simple geometric shapes, orange color, minimal details, white background",
    "Sweet Potato": "Cute cartoon sweet potato, thick black outlines, flat 2D vector style, simple geometric shapes, orange color, minimal details, white background",
    "Regular Potato": "Cute cartoon potato, thick black outlines, flat 2D vector style, simple geometric shapes, brown-tan color, minimal details, white background",
    "Spinach": "Cute cartoon spinach leaves, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Kale": "Cute cartoon kale leaves, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Collard Greens": "Cute cartoon collard greens, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Mustard Greens": "Cute cartoon mustard greens, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Dandelion Greens": "Cute cartoon dandelion leaves, thick black outlines, flat 2D vector style, simple geometric shapes, green color, minimal details, white background",
    "Beet Greens": "Cute cartoon beet greens, thick black outlines, flat 2D vector style, simple geometric shapes, green with red stems, minimal details, white background",
    "Amaranth Leaves": "Cute cartoon amaranth leaves, thick black outlines, flat 2D vector style, simple geometric shapes, green-purple color, minimal details, white background",
    "Red Cabbage": "Cute cartoon red cabbage head, thick black outlines, flat 2D vector style, simple geometric shapes, purple-red color, minimal details, white background",

    # OILS & FATS
    "Salmon Oil": "Cute cartoon oil bottle with salmon icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden-orange color, minimal details, white background",
    "Coconut Oil": "Cute cartoon coconut with oil drop, thick black outlines, flat 2D vector style, simple geometric shapes, white-brown color, minimal details, white background",
    "Flaxseed": "Cute cartoon flaxseeds pile, thick black outlines, flat 2D vector style, simple geometric shapes, brown color, minimal details, white background",
    "Hemp Seeds": "Cute cartoon hemp seeds, thick black outlines, flat 2D vector style, simple geometric shapes, tan-green color, minimal details, white background",
    "Walnut Oil": "Cute cartoon oil bottle with walnut icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden-brown color, minimal details, white background",
    "Black Currant Oil": "Cute cartoon oil bottle with berry icon, thick black outlines, flat 2D vector style, simple geometric shapes, dark purple-gold color, minimal details, white background",
    "Almond Oil": "Cute cartoon oil bottle with almond icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden color, minimal details, white background",
    "Sunflower Oil": "Cute cartoon sunflower with oil drop, thick black outlines, flat 2D vector style, simple geometric shapes, yellow-gold color, minimal details, white background",
    "Chia Seed Oil": "Cute cartoon chia seeds with oil drop, thick black outlines, flat 2D vector style, simple geometric shapes, black speckled, minimal details, white background",
    "Fish Oil": "Cute cartoon oil capsule with fish icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden-orange color, minimal details, white background",
    "Olive Oil": "Cute cartoon olive oil bottle with olive branch, thick black outlines, flat 2D vector style, simple geometric shapes, green-gold color, minimal details, white background",
    "Pumpkin Seed Oil": "Cute cartoon pumpkin seeds with oil drop, thick black outlines, flat 2D vector style, simple geometric shapes, green-gold color, minimal details, white background",

    # SUPPLEMENTS
    "Kelp Powder": "Cute cartoon kelp seaweed, thick black outlines, flat 2D vector style, simple geometric shapes, dark green color, minimal details, white background",
    "Eggshells": "Cute cartoon crushed eggshells, thick black outlines, flat 2D vector style, simple geometric shapes, white color, minimal details, white background",
    "Turmeric": "Cute cartoon turmeric root, thick black outlines, flat 2D vector style, simple geometric shapes, orange-yellow color, minimal details, white background",
    "Pectin": "Cute cartoon apple with pectin molecules, thick black outlines, flat 2D vector style, simple geometric shapes, red-clear color, minimal details, white background",
    "Cranberry Extract": "Cute cartoon cranberries, thick black outlines, flat 2D vector style, simple geometric shapes, red color, minimal details, white background",
    "Omega-3": "Cute cartoon supplement capsule with omega-3 label, thick black outlines, flat 2D vector style, simple geometric shapes, orange-gold color, minimal details, white background",
    "SAM-e": "Cute cartoon supplement pill bottle, thick black outlines, flat 2D vector style, simple geometric shapes, blue-white color, minimal details, white background",
    "Psyllium Husk": "Cute cartoon psyllium husks, thick black outlines, flat 2D vector style, simple geometric shapes, tan-brown color, minimal details, white background",
    "Vitamin C": "Cute cartoon orange slice with vitamin label, thick black outlines, flat 2D vector style, simple geometric shapes, orange color, minimal details, white background",
    "Bone Broth": "Cute cartoon steaming bowl, thick black outlines, flat 2D vector style, simple geometric shapes, brown-beige color, minimal details, white background",
    "Fructooligosaccharides": "Cute cartoon prebiotic fiber icon, thick black outlines, flat 2D vector style, simple geometric shapes, green-white color, minimal details, white background",
    "Curcumin": "Cute cartoon turmeric powder pile, thick black outlines, flat 2D vector style, simple geometric shapes, bright orange color, minimal details, white background",
    "Joint Health Supplement": "Cute cartoon joint/bone icon, thick black outlines, flat 2D vector style, simple geometric shapes, blue-white color, minimal details, white background",
    "Brewer's Yeast": "Cute cartoon yeast powder jar, thick black outlines, flat 2D vector style, simple geometric shapes, tan-brown color, minimal details, white background",

    # OTHER
    "Honey": "Cute cartoon honey jar with dipper, thick black outlines, flat 2D vector style, simple geometric shapes, golden-yellow color, minimal details, white background",
    "Peanut Butter": "Cute cartoon peanut butter jar with peanuts, thick black outlines, flat 2D vector style, simple geometric shapes, brown-tan color, minimal details, white background",
    "Spirulina Powder": "Cute cartoon spirulina powder bowl, thick black outlines, flat 2D vector style, simple geometric shapes, dark green-blue color, minimal details, white background",
    "Probiotic Powder": "Cute cartoon probiotic supplement jar, thick black outlines, flat 2D vector style, simple geometric shapes, white-blue color, minimal details, white background",
    "Vitamin D3": "Cute cartoon sun with vitamin pill, thick black outlines, flat 2D vector style, simple geometric shapes, yellow-orange color, minimal details, white background",
    "Herring Oil": "Cute cartoon oil bottle with herring fish icon, thick black outlines, flat 2D vector style, simple geometric shapes, golden-silver color, minimal details, white background"
}

def download_image(prompt, name, output_dir):
    """Download a single image with retry logic"""
    # Create filename from ingredient name (e.g. "Bok Choi" -> "bok-choi.png")
    filename = f"{name.lower().replace(' ', '-')}.png"
    
    # Add seed for variation (deterministic based on name)
    seed = sum(ord(c) for c in name)
    url = POLLINATION_URL + prompt.replace(' ', '%20') + f"?seed={seed}&width=512&height=512"
    
    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            img = Image.open(io.BytesIO(response.content))
            img_path = os.path.join(output_dir, filename)
            img.save(img_path)
            return f"Downloaded {filename}"
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait_time = 5 ** attempt
                print(f"Timeout for {name}, retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                return f"Failed to download {name}: Timeout"
        except requests.exceptions.RequestException as e:
            if "429" in str(e):
                if attempt < max_retries - 1:
                    wait_time = 10 ** attempt
                    print(f"Rate limit for {name}, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    return f"Failed to download {name}: Rate limit"
            else:
                return f"Failed to download {name}: {e}"
    return None

def generate_ingredient_images():
    """Generate images for all ingredients"""
    output_dir = os.path.join("public", "images", "ingredients")
    os.makedirs(output_dir, exist_ok=True)
    
    total_images = len(INGREDIENT_PROMPTS)
    current_image = 0
    
    print(f"=== Generating {total_images} ingredient images ===")
    
    for name, prompt in INGREDIENT_PROMPTS.items():
        # Check if image already exists
        filename = f"{name.lower().replace(' ', '-')}.png"
        img_path = os.path.join(output_dir, filename)
        
        if os.path.exists(img_path):
            print(f"[SKIP] {filename} already exists, skipping...")
            current_image += 1
            continue
        
        current_image += 1
        print(f"[{current_image}/{total_images}] Generating {name}...")
        
        result = download_image(prompt, name, output_dir)
        if result:
            print(result)
        
        # Sleep to avoid rate limits
        time.sleep(2)

    print(f"\n✅ Process complete! Images saved to {output_dir}")

if __name__ == "__main__":
    generate_ingredient_images()