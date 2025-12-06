import os
import time
import io
import requests
from PIL import Image

POLLINATION_URL = "https://image.pollinations.ai/prompt/"

# 25 prompts per species (provided by user)
SPECIES_PROMPTS = {
    "dogs": [
        "Cute cartoon bowl with chicken pieces, white rice, and green peas, thick black outlines, flat 2D vector style, simple geometric shapes, orange chicken, white rice, green peas, minimal details, white background",
        "Cute cartoon bowl with beef chunks, orange sweet potato cubes, and green beans, thick black outlines, flat 2D vector style, simple shapes, red-brown beef, orange sweet potato, green beans, minimal details, white background",
        "Cute cartoon bowl with pink salmon, beige quinoa, and dark green spinach, thick black outlines, flat 2D vector style, simple geometric shapes, pink salmon, tan quinoa, green spinach, minimal details, white background",
        "Cute cartoon bowl with turkey pieces, brown rice, and orange carrot rounds, thick black outlines, flat 2D vector style, simple shapes, tan turkey, brown rice, orange carrots, minimal details, white background",
        "Cute cartoon bowl with lamb chunks, barley grains, and orange pumpkin cubes, thick black outlines, flat 2D vector style, simple geometric shapes, brown lamb, tan barley, orange pumpkin, minimal details, white background",
        "Cute cartoon bowl with white fish pieces, oat groats, and green zucchini slices, thick black outlines, flat 2D vector style, simple shapes, white fish, beige oats, green zucchini, minimal details, white background",
        "Cute cartoon bowl with duck meat, buckwheat groats, and green broccoli florets, thick black outlines, flat 2D vector style, simple geometric shapes, brown duck, tan buckwheat, green broccoli, minimal details, white background",
        "Cute cartoon bowl with tuna chunks, couscous, and red pepper strips, thick black outlines, flat 2D vector style, simple shapes, pink tuna, yellow couscous, red peppers, minimal details, white background",
        "Cute cartoon bowl with cod pieces, millet grains, and green asparagus spears, thick black outlines, flat 2D vector style, simple geometric shapes, white cod, yellow millet, green asparagus, minimal details, white background",
        "Cute cartoon bowl with small sardines, round chickpeas, and white fennel slices, thick black outlines, flat 2D vector style, simple shapes, silver sardines, tan chickpeas, white fennel, minimal details, white background",
        "Cute cartoon bowl with mackerel pieces, orange lentils, and dark green kale, thick black outlines, flat 2D vector style, simple geometric shapes, blue-silver mackerel, orange lentils, green kale, minimal details, white background",
        "Cute cartoon bowl with trout pieces, farro grains, and round green peas, thick black outlines, flat 2D vector style, simple shapes, pink trout, tan farro, green peas, minimal details, white background",
        "Cute cartoon bowl with chicken pieces, bulgur wheat, and cucumber slices, thick black outlines, flat 2D vector style, simple geometric shapes, orange chicken, tan bulgur, green cucumber, minimal details, white background",
        "Cute cartoon bowl with turkey pieces, yellow corn kernels, and baby spinach leaves, thick black outlines, flat 2D vector style, simple shapes, tan turkey, yellow corn, green spinach, minimal details, white background",
        "Cute cartoon bowl with beef chunks, red lentils, and orange butternut squash cubes, thick black outlines, flat 2D vector style, simple geometric shapes, red beef, orange lentils, orange squash, minimal details, white background",
        "Cute cartoon bowl with salmon pieces, couscous, and green edamame beans, thick black outlines, flat 2D vector style, simple shapes, pink salmon, yellow couscous, green edamame, minimal details, white background",
        "Cute cartoon bowl with tuna chunks, white rice, and green bok choy, thick black outlines, flat 2D vector style, simple geometric shapes, pink tuna, white rice, green bok choy, minimal details, white background",
        "Cute cartoon bowl with white fish pieces, potato cubes, and green parsley garnish, thick black outlines, flat 2D vector style, simple shapes, white fish, tan potatoes, green parsley, minimal details, white background",
        "Cute cartoon bowl with turkey pieces, quinoa, and yellow squash rounds, thick black outlines, flat 2D vector style, simple geometric shapes, tan turkey, beige quinoa, yellow squash, minimal details, white background",
        "Cute cartoon bowl with lamb pieces, couscous, and roasted red pepper strips, thick black outlines, flat 2D vector style, simple shapes, brown lamb, yellow couscous, red peppers, minimal details, white background",
        "Cute cartoon bowl with beef chunks, brown rice, and white cauliflower florets, thick black outlines, flat 2D vector style, simple geometric shapes, red beef, brown rice, white cauliflower, minimal details, white background",
        "Cute cartoon bowl with chicken pieces, barley grains, and green beans, thick black outlines, flat 2D vector style, simple shapes, orange chicken, tan barley, green beans, minimal details, white background",
        "Cute cartoon bowl with salmon pieces, bulgur, dill sprigs, and yellow lemon slices, thick black outlines, flat 2D vector style, simple geometric shapes, pink salmon, tan bulgur, green dill, yellow lemon, minimal details, white background",
        "Cute cartoon bowl with cod pieces, orange sweet potato cubes, and green snap peas, thick black outlines, flat 2D vector style, simple shapes, white cod, orange sweet potato, green peas, minimal details, white background",
        "Cute cartoon bowl with duck meat, dark wild rice, and brown mushroom slices, thick black outlines, flat 2D vector style, simple geometric shapes, brown duck, dark rice, brown mushrooms, minimal details, white background",
    ],
    "cats": [
        "Cute cartoon bowl with salmon pieces, white rice, and spinach leaves, thick black outlines, flat 2D vector style, simple geometric shapes, pink salmon, white rice, dark green spinach, minimal details, white background",
        "Cute cartoon bowl with tuna chunks, orange sweet potato cubes, and green peas, thick black outlines, flat 2D vector style, simple shapes, pink tuna, orange sweet potato, green peas, minimal details, white background",
        "Cute cartoon bowl with white fish pieces, quinoa, and green zucchini slices, thick black outlines, flat 2D vector style, simple geometric shapes, white fish, beige quinoa, green zucchini, minimal details, white background",
        "Cute cartoon bowl with small sardines, couscous, and parsley garnish, thick black outlines, flat 2D vector style, simple shapes, silver sardines, yellow couscous, green parsley, minimal details, white background",
        "Cute cartoon bowl with chicken pieces, white rice, and orange pumpkin cubes, thick black outlines, flat 2D vector style, simple geometric shapes, orange chicken, white rice, orange pumpkin, minimal details, white background",
        "Cute cartoon bowl with mackerel pieces, barley grains, and green beans, thick black outlines, flat 2D vector style, simple shapes, blue-silver mackerel, tan barley, green beans, minimal details, white background",
        "Cute cartoon bowl with trout pieces, millet grains, and green asparagus spears, thick black outlines, flat 2D vector style, simple geometric shapes, pink trout, yellow millet, green asparagus, minimal details, white background",
        "Cute cartoon bowl with cod pieces, oat groats, and green broccoli florets, thick black outlines, flat 2D vector style, simple shapes, white cod, beige oats, green broccoli, minimal details, white background",
        "Cute cartoon bowl with tuna chunks, couscous, and orange carrot rounds, thick black outlines, flat 2D vector style, simple geometric shapes, pink tuna, yellow couscous, orange carrots, minimal details, white background",
        "Cute cartoon bowl with salmon pieces, farro grains, and dark green kale, thick black outlines, flat 2D vector style, simple shapes, pink salmon, tan farro, green kale, minimal details, white background",
        "Cute cartoon bowl with chicken pieces, buckwheat groats, and baby bok choy, thick black outlines, flat 2D vector style, simple geometric shapes, orange chicken, tan buckwheat, green bok choy, minimal details, white background",
        "Cute cartoon bowl with white fish pieces, orange lentils, and red pepper strips, thick black outlines, flat 2D vector style, simple shapes, white fish, orange lentils, red peppers, minimal details, white background",
        "Cute cartoon bowl with small sardines, white rice, and green cucumber slices, thick black outlines, flat 2D vector style, simple geometric shapes, silver sardines, white rice, green cucumber, minimal details, white background",
        "Cute cartoon bowl with salmon pieces, potato cubes, and dill sprigs, thick black outlines, flat 2D vector style, simple shapes, pink salmon, tan potatoes, green dill, minimal details, white background",
        "Cute cartoon bowl with tuna chunks, quinoa, and green edamame beans, thick black outlines, flat 2D vector style, simple geometric shapes, pink tuna, beige quinoa, green edamame, minimal details, white background",
        "Cute cartoon bowl with mackerel pieces, brown rice, and spinach leaves, thick black outlines, flat 2D vector style, simple shapes, blue-silver mackerel, brown rice, green spinach, minimal details, white background",
        "Cute cartoon bowl with trout pieces, orange sweet potato cubes, and parsley garnish, thick black outlines, flat 2D vector style, simple geometric shapes, pink trout, orange sweet potato, green parsley, minimal details, white background",
        "Cute cartoon bowl with cod pieces, couscous, and green peas, thick black outlines, flat 2D vector style, simple shapes, white cod, yellow couscous, green peas, minimal details, white background",
        "Cute cartoon bowl with chicken pieces, barley grains, and orange pumpkin cubes, thick black outlines, flat 2D vector style, simple geometric shapes, orange chicken, tan barley, orange pumpkin, minimal details, white background",
        "Cute cartoon bowl with white fish pieces, millet grains, and green beans, thick black outlines, flat 2D vector style, simple shapes, white fish, yellow millet, green beans, minimal details, white background",
        "Cute cartoon bowl with salmon pieces, bulgur wheat, and white fennel slices, thick black outlines, flat 2D vector style, simple geometric shapes, pink salmon, tan bulgur, white fennel, minimal details, white background",
        "Cute cartoon bowl with tuna chunks, white rice, and roasted red pepper strips, thick black outlines, flat 2D vector style, simple shapes, pink tuna, white rice, red peppers, minimal details, white background",
        "Cute cartoon bowl with small sardines, round chickpeas, and green zucchini slices, thick black outlines, flat 2D vector style, simple geometric shapes, silver sardines, tan chickpeas, green zucchini, minimal details, white background",
        "Cute cartoon bowl with mackerel pieces, orange lentils, and carrot ribbon strips, thick black outlines, flat 2D vector style, simple shapes, blue-silver mackerel, orange lentils, orange carrots, minimal details, white background",
        "Cute cartoon bowl with trout pieces, brown rice, and green snap peas, thick black outlines, flat 2D vector style, simple geometric shapes, pink trout, brown rice, green peas, minimal details, white background",
    ],
    "birds": [
        "Cute cartoon bowl with mixed seeds and chopped spinach, thick black outlines, flat 2D vector style, simple geometric shapes, brown-tan seeds, dark green spinach, minimal details, white background",
        "Cute cartoon bowl with round pellets and red apple slices, thick black outlines, flat 2D vector style, simple shapes, brown pellets, red apples, minimal details, white background",
        "Cute cartoon bowl with quinoa grains, green peas, and orange carrot pieces, thick black outlines, flat 2D vector style, simple geometric shapes, beige quinoa, green peas, orange carrots, minimal details, white background",
        "Cute cartoon bowl with yellow millet seeds and blue blueberries, thick black outlines, flat 2D vector style, simple shapes, yellow millet, blue berries, minimal details, white background",
        "Cute cartoon bowl with sprouted seeds and green cucumber slices, thick black outlines, flat 2D vector style, simple geometric shapes, tan-green sprouts, green cucumber, minimal details, white background",
        "Cute cartoon bowl with sunflower seeds and yellow corn kernels, thick black outlines, flat 2D vector style, simple shapes, black-white seeds, yellow corn, minimal details, white background",
        "Cute cartoon bowl with oat groats and green bean pieces, thick black outlines, flat 2D vector style, simple geometric shapes, beige oats, green beans, minimal details, white background",
        "Cute cartoon bowl with buckwheat groats and red pepper pieces, thick black outlines, flat 2D vector style, simple shapes, brown buckwheat, red peppers, minimal details, white background",
        "Cute cartoon bowl with brown rice and green edamame beans, thick black outlines, flat 2D vector style, simple geometric shapes, brown rice, green edamame, minimal details, white background",
        "Cute cartoon bowl with amaranth seeds and green zucchini cubes, thick black outlines, flat 2D vector style, simple shapes, tan-red amaranth, green zucchini, minimal details, white background",
        "Cute cartoon bowl with barley grains, parsley, and green peas, thick black outlines, flat 2D vector style, simple geometric shapes, tan barley, green parsley, green peas, minimal details, white background",
        "Cute cartoon bowl with mixed grain seeds and orange carrot cubes, thick black outlines, flat 2D vector style, simple shapes, tan-brown grains, orange carrots, minimal details, white background",
        "Cute cartoon bowl with round pellets and orange mango slices, thick black outlines, flat 2D vector style, simple geometric shapes, brown pellets, orange mango, minimal details, white background",
        "Cute cartoon bowl with quinoa grains and green broccoli florets, thick black outlines, flat 2D vector style, simple shapes, beige quinoa, green broccoli, minimal details, white background",
        "Cute cartoon bowl with yellow millet seeds and red apple cubes, thick black outlines, flat 2D vector style, simple geometric shapes, yellow millet, red apples, minimal details, white background",
        "Cute cartoon bowl with sprouted seeds and dark leafy greens, thick black outlines, flat 2D vector style, simple shapes, tan-green sprouts, dark green leaves, minimal details, white background",
        "Cute cartoon bowl with oat flakes and colorful bell pepper bits, thick black outlines, flat 2D vector style, simple geometric shapes, beige oats, red-yellow-green peppers, minimal details, white background",
        "Cute cartoon bowl with mixed seeds and orange papaya cubes, thick black outlines, flat 2D vector style, simple shapes, brown seeds, orange papaya, minimal details, white background",
        "Cute cartoon bowl with buckwheat groats, cucumber slices, and herb sprigs, thick black outlines, flat 2D vector style, simple geometric shapes, brown buckwheat, green cucumber, green herbs, minimal details, white background",
        "Cute cartoon bowl with white rice and shredded kale, thick black outlines, flat 2D vector style, simple shapes, white rice, dark green kale, minimal details, white background",
        "Cute cartoon bowl with round pellets and green pear slices, thick black outlines, flat 2D vector style, simple geometric shapes, brown pellets, green-yellow pear, minimal details, white background",
        "Cute cartoon bowl with quinoa grains and orange pumpkin cubes, thick black outlines, flat 2D vector style, simple shapes, beige quinoa, orange pumpkin, minimal details, white background",
        "Cute cartoon bowl with yellow millet seeds and spinach ribbon strips, thick black outlines, flat 2D vector style, simple geometric shapes, yellow millet, green spinach, minimal details, white background",
        "Cute cartoon bowl with mixed grain seeds and colorful berries, thick black outlines, flat 2D vector style, simple shapes, tan grains, red-blue berries, minimal details, white background",
        "Cute cartoon bowl with sprouted seeds and green celery strips, thick black outlines, flat 2D vector style, simple geometric shapes, tan-green sprouts, light green celery, minimal details, white background",
    ],
    "reptiles": [
        "Cute cartoon bowl with dark collard greens and colorful bell pepper strips, thick black outlines, flat 2D vector style, simple geometric shapes, dark green collards, red-yellow peppers, minimal details, white background",
        "Cute cartoon bowl with mustard greens and yellow squash cubes, thick black outlines, flat 2D vector style, simple shapes, green mustard greens, yellow squash, minimal details, white background",
        "Cute cartoon bowl with turnip greens and orange carrot ribbon strips, thick black outlines, flat 2D vector style, simple geometric shapes, green turnip greens, orange carrots, minimal details, white background",
        "Cute cartoon bowl with dandelion greens and green zucchini slices, thick black outlines, flat 2D vector style, simple shapes, bright green dandelion, green zucchini, minimal details, white background",
        "Cute cartoon bowl with dark kale and orange butternut squash cubes, thick black outlines, flat 2D vector style, simple geometric shapes, dark green kale, orange squash, minimal details, white background",
        "Cute cartoon bowl with romaine lettuce and green cucumber rounds, thick black outlines, flat 2D vector style, simple shapes, light green romaine, green cucumber, minimal details, white background",
        "Cute cartoon bowl with pale endive and orange sweet potato cubes, thick black outlines, flat 2D vector style, simple geometric shapes, pale green endive, orange sweet potato, minimal details, white background",
        "Cute cartoon bowl with bok choy and yellow squash pieces, thick black outlines, flat 2D vector style, simple shapes, white-green bok choy, yellow squash, minimal details, white background",
        "Cute cartoon bowl with dark watercress and colorful bell pepper pieces, thick black outlines, flat 2D vector style, simple geometric shapes, dark green watercress, red-yellow peppers, minimal details, white background",
        "Cute cartoon bowl with swiss chard and orange pumpkin cubes, thick black outlines, flat 2D vector style, simple shapes, green-red chard, orange pumpkin, minimal details, white background",
        "Cute cartoon bowl with escarole and green bean pieces, thick black outlines, flat 2D vector style, simple geometric shapes, pale green escarole, green beans, minimal details, white background",
        "Cute cartoon bowl with collard greens and pink hibiscus flower petals, thick black outlines, flat 2D vector style, simple shapes, dark green collards, pink petals, minimal details, white background",
        "Cute cartoon bowl with mustard greens and blue blueberries, thick black outlines, flat 2D vector style, simple geometric shapes, green mustard greens, blue berries, minimal details, white background",
        "Cute cartoon bowl with arugula and orange carrot shavings, thick black outlines, flat 2D vector style, simple shapes, dark green arugula, orange carrots, minimal details, white background",
        "Cute cartoon bowl with dark kale and orange mango cubes, thick black outlines, flat 2D vector style, simple geometric shapes, dark green kale, orange mango, minimal details, white background",
        "Cute cartoon bowl with turnip greens and pink cactus pear cubes, thick black outlines, flat 2D vector style, simple shapes, green turnip greens, pink cactus pear, minimal details, white background",
        "Cute cartoon bowl with dandelion greens and red apple slices, thick black outlines, flat 2D vector style, simple geometric shapes, bright green dandelion, red apples, minimal details, white background",
        "Cute cartoon bowl with romaine lettuce and green snap pea pods, thick black outlines, flat 2D vector style, simple shapes, light green romaine, green peas, minimal details, white background",
        "Cute cartoon bowl with pale endive and mixed squash cubes in yellow and green, thick black outlines, flat 2D vector style, simple geometric shapes, pale endive, yellow-green squash, minimal details, white background",
        "Cute cartoon bowl with watercress, herb sprigs, and cucumber slices, thick black outlines, flat 2D vector style, simple shapes, dark green watercress, green herbs, green cucumber, minimal details, white background",
        "Cute cartoon bowl with bok choy and orange papaya cubes, thick black outlines, flat 2D vector style, simple geometric shapes, white-green bok choy, orange papaya, minimal details, white background",
        "Cute cartoon bowl with collard greens, orange pumpkin cubes, and green peas, thick black outlines, flat 2D vector style, simple shapes, dark green collards, orange pumpkin, green peas, minimal details, white background",
        "Cute cartoon bowl with mustard greens and spiralized zucchini, thick black outlines, flat 2D vector style, simple geometric shapes, green mustard greens, green zucchini spirals, minimal details, white background",
        "Cute cartoon bowl with dark arugula and colorful bell pepper bits, thick black outlines, flat 2D vector style, simple shapes, dark green arugula, red-yellow-green peppers, minimal details, white background",
        "Cute cartoon bowl with dark kale and colorful bell pepper rings, thick black outlines, flat 2D vector style, simple geometric shapes, dark green kale, red-yellow pepper rings, minimal details, white background",
    ],
    "pocket-pets": [
        "Cute cartoon bowl with golden hay and orange carrot shavings, thick black outlines, flat 2D vector style, simple geometric shapes, golden-brown hay, orange carrots, minimal details, white background",
        "Cute cartoon bowl with brown pellets and red apple slices, thick black outlines, flat 2D vector style, simple shapes, brown pellets, red apples, minimal details, white background",
        "Cute cartoon bowl with golden hay and green cucumber rounds, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, green cucumber, minimal details, white background",
        "Cute cartoon bowl with brown pellets and colorful bell pepper pieces, thick black outlines, flat 2D vector style, simple shapes, brown pellets, red-yellow-green peppers, minimal details, white background",
        "Cute cartoon bowl with golden hay, parsley, and cilantro sprigs, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, green herbs, minimal details, white background",
        "Cute cartoon bowl with brown pellets and blue blueberries, thick black outlines, flat 2D vector style, simple shapes, brown pellets, blue berries, minimal details, white background",
        "Cute cartoon bowl with golden hay and green broccoli florets, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, green broccoli, minimal details, white background",
        "Cute cartoon bowl with brown pellets and green zucchini cubes, thick black outlines, flat 2D vector style, simple shapes, brown pellets, green zucchini, minimal details, white background",
        "Cute cartoon bowl with golden hay and green pea pods, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, green peas, minimal details, white background",
        "Cute cartoon bowl with brown pellets and red strawberry slices, thick black outlines, flat 2D vector style, simple shapes, brown pellets, red strawberries, minimal details, white background",
        "Cute cartoon bowl with golden hay and bright green dandelion leaves, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, green dandelion, minimal details, white background",
        "Cute cartoon bowl with brown pellets and orange pumpkin cubes, thick black outlines, flat 2D vector style, simple shapes, brown pellets, orange pumpkin, minimal details, white background",
        "Cute cartoon bowl with golden hay, purple radicchio, and pale endive, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, purple radicchio, pale endive, minimal details, white background",
        "Cute cartoon bowl with brown pellets and orange mango slices, thick black outlines, flat 2D vector style, simple shapes, brown pellets, orange mango, minimal details, white background",
        "Cute cartoon bowl with golden hay and green snap pea pods, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, green peas, minimal details, white background",
        "Cute cartoon bowl with brown pellets and orange carrot rounds, thick black outlines, flat 2D vector style, simple shapes, brown pellets, orange carrots, minimal details, white background",
        "Cute cartoon bowl with golden hay, white fennel, and green herb sprigs, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, white fennel, green herbs, minimal details, white background",
        "Cute cartoon bowl with brown pellets and green pear slices, thick black outlines, flat 2D vector style, simple shapes, brown pellets, green-yellow pear, minimal details, white background",
        "Cute cartoon bowl with golden hay and green spinach ribbon strips, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, green spinach, minimal details, white background",
        "Cute cartoon bowl with brown pellets and orange sweet potato cubes, thick black outlines, flat 2D vector style, simple shapes, brown pellets, orange sweet potato, minimal details, white background",
        "Cute cartoon bowl with golden hay and green bean pieces, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, green beans, minimal details, white background",
        "Cute cartoon bowl with brown pellets and red cranberry pieces, thick black outlines, flat 2D vector style, simple shapes, brown pellets, red cranberries, minimal details, white background",
        "Cute cartoon bowl with golden hay, dark kale, and parsley, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, dark green kale, green parsley, minimal details, white background",
        "Cute cartoon bowl with brown pellets and orange melon cubes, thick black outlines, flat 2D vector style, simple shapes, brown pellets, orange melon, minimal details, white background",
        "Cute cartoon bowl with golden hay, bok choy, and yellow squash, thick black outlines, flat 2D vector style, simple geometric shapes, golden hay, white-green bok choy, yellow squash, minimal details, white background",
    ],
}


def download_image(prompt: str, species: str, index: int, output_dir: str):
    """Download a single image with retry/backoff and deterministic seed."""
    filename = f"{species}-meal-{index}.png"
    seed = hash((species, index)) % (2**31)
    url = POLLINATION_URL + prompt.replace(" ", "%20") + f"?seed={seed}&width=512&height=512"

    max_retries = 7
    for attempt in range(max_retries):
        try:
            resp = requests.get(url, timeout=60)
            resp.raise_for_status()
            img = Image.open(io.BytesIO(resp.content))
            img_path = os.path.join(output_dir, filename)
            img.save(img_path)
            return f"Downloaded {filename}"
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait = 2 ** attempt
                print(f"Timeout on {filename}, retrying in {wait}s...")
                time.sleep(wait)
            else:
                return f"Failed {filename}: Timeout"
        except requests.exceptions.RequestException as e:
            if ("429" in str(e) or "502" in str(e)) and attempt < max_retries - 1:
                wait = 3 ** attempt
                print(f"Rate/server issue on {filename}, retrying in {wait}s...")
                time.sleep(wait)
                continue
            return f"Failed {filename}: {e}"
    return None


def generate_meal_images():
    """Generate 25 images per species, filenames: {species}-meal-1..25.png."""
    output_dir = os.path.join("public", "images", "meals")
    os.makedirs(output_dir, exist_ok=True)

    total = sum(len(v) for v in SPECIES_PROMPTS.values())
    current = 0

    for species, prompts in SPECIES_PROMPTS.items():
        print(f"\n=== {species}: {len(prompts)} images ===")
        for idx, prompt in enumerate(prompts, start=1):
            filename = f"{species}-meal-{idx}.png"
            out_path = os.path.join(output_dir, filename)

            if os.path.exists(out_path):
                print(f"[SKIP] {filename} exists")
                current += 1
                continue

            current += 1
            print(f"[{current}/{total}] {filename}")
            result = download_image(prompt, species, idx, output_dir)
            if result:
                print(result)

            time.sleep(1.5)  # gentle pacing

    print(f"\n✅ Done. Images saved to {output_dir}")


if __name__ == "__main__":
    generate_meal_images()
