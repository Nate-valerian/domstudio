"""
Generate before/after card images for DomStudio landing page.
Uses Qwen Image Edit (TextEncodeQwenImageEdit) to transform each before image
into its mode-specific after while preserving product identity.
"""

import json
import subprocess
import time
import uuid
from pathlib import Path

COMFY  = "https://testing-armor-tank-antibody.trycloudflare.com"
ASSETS = Path("domstudio-frontend/src/assets")

MODES = [
    {
        "name": "catalog",
        "before": "mode-catalog-before.webp",
        "after":  "mode-catalog-real-v3.webp",
        "width": 1024, "height": 1024, "steps": 4,
        "prompt": (
            "Professional marketplace catalog product photo. "
            "Keep the exact same white pump dispenser bottle and white box from the input image. "
            "Replace the background with a pure white seamless studio background. "
            "Center the products with soft even lighting and a subtle shadow at the base. "
            "Clean commercial e-commerce shot ready for Wildberries or Ozon marketplace listing."
        ),
    },
    {
        "name": "product",
        "before": "mode-product-before.webp",
        "after":  "mode-product-real-v3.webp",
        "width": 1024, "height": 1024, "steps": 4,
        "prompt": (
            "Premium luxury product photography studio shot. "
            "Keep the exact same black square glass perfume bottle from the input image. "
            "Place it on a dark polished marble surface with a dramatic dark background. "
            "Apply cinematic side lighting with sharp specular highlights on the glass edges. "
            "Luxury fragrance brand campaign quality, sharp product detail, 8k commercial photography."
        ),
    },
    {
        "name": "creative",
        "before": "mode-creative-before.webp",
        "after":  "mode-creative-real-v3.webp",
        "width": 1024, "height": 1024, "steps": 4,
        "prompt": (
            "Creative editorial social media campaign shot. "
            "Keep the exact same beige chunky sneaker from the input image as the hero product. "
            "Place it on a bold pastel colored background with dynamic trendy composition. "
            "Floating or angled sneaker presentation, modern Instagram campaign aesthetic, "
            "scroll-stopping visual, fashion brand quality."
        ),
    },
    {
        "name": "lifestyle",
        "before": "mode-lifestyle-before.webp",
        "after":  "mode-lifestyle-real-v3.webp",
        "width": 1024, "height": 1024, "steps": 4,
        "prompt": (
            "Lifestyle editorial product photo. "
            "Keep the exact same tan brown leather crossbody bag from the input image. "
            "Place it as the hero on a marble cafe table with a coffee cup beside it, "
            "warm afternoon natural light, editorial magazine quality, "
            "authentic everyday lifestyle scene, the bag is clearly the main subject."
        ),
    },
    {
        "name": "fitting",
        "before": "mode-fitting-before.webp",
        "after":  "mode-fitting-real-v2.webp",
        "width": 832, "height": 1216, "steps": 4,
        "prompt": (
            "Fashion e-commerce virtual try-on photo. "
            "Show the exact same beige linen blazer and matching wide-leg trousers from the input image "
            "being worn by a slim female model. "
            "Clean white studio background, full body portrait shot, "
            "correct professional fit with natural fabric drape, "
            "fashion marketplace listing quality."
        ),
    },
    {
        "name": "stories",
        "before": "mode-stories-before.webp",
        "after":  "mode-stories-real-v3.webp",
        "width": 608, "height": 1080, "steps": 4,
        "prompt": (
            "Vertical 9:16 Instagram story creative. "
            "Keep the exact same clear glass juice bottle and small green dropper serum bottle "
            "from the input image as the featured products. "
            "Minimal wellness aesthetic, soft natural light, indoor plants in background, "
            "products centered in the safe zone, "
            "UGC organic feel, mobile-first composition."
        ),
    },
]


def curl_post_json(url, data):
    r = subprocess.run(
        ["curl", "-s", "--max-time", "30", "-X", "POST", url,
         "-H", "Content-Type: application/json", "-d", json.dumps(data)],
        capture_output=True, text=True,
    )
    return json.loads(r.stdout)


def curl_get_json(url):
    r = subprocess.run(
        ["curl", "-s", "--max-time", "15", url],
        capture_output=True, text=True,
    )
    return json.loads(r.stdout)


def upload_image(path: Path) -> str:
    r = subprocess.run(
        ["curl", "-s", "--max-time", "30", "-X", "POST",
         f"{COMFY}/upload/image",
         "-F", f"image=@{path}",
         "-F", "type=input",
         "-F", "overwrite=true"],
        capture_output=True, text=True,
    )
    return json.loads(r.stdout)["name"]


def build_workflow(image_name, prompt, width, height, steps, seed, mode):
    return {
        "1": {
            "class_type": "NunchakuQwenImageDiTLoader",
            "inputs": {
                "model_name": "svdq-int4_r128-qwen-image-edit-2509-lightning-4steps-251115.safetensors",
                "cpu_offload": "auto",
                "num_blocks_on_gpu": 24,
                "use_pin_memory": "disable",
            },
        },
        "2": {"class_type": "ModelSamplingAuraFlow", "inputs": {"model": ["1", 0], "shift": 3.1}},
        "3": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image", "device": "default"}},
        "4": {"class_type": "VAELoader", "inputs": {"vae_name": "qwen_image_vae.safetensors"}},
        "5": {"class_type": "LoadImage", "inputs": {"image": image_name}},
        "6": {
            "class_type": "TextEncodeQwenImageEdit",
            "inputs": {
                "clip":   ["3", 0],
                "vae":    ["4", 0],
                "image":  ["5", 0],
                "prompt": prompt,
            },
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["3", 0], "text": "low quality, blurry, distorted, watermark, text overlay, logo, extra objects"},
        },
        "8": {"class_type": "EmptySD3LatentImage", "inputs": {"width": width, "height": height, "batch_size": 1}},
        "9": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["2", 0], "seed": seed, "steps": steps,
                "cfg": 1.0, "sampler_name": "euler", "scheduler": "simple",
                "positive": ["6", 0], "negative": ["7", 0],
                "latent_image": ["8", 0], "denoise": 1.0,
            },
        },
        "10": {"class_type": "VAEDecode", "inputs": {"samples": ["9", 0], "vae": ["4", 0]}},
        "11": {"class_type": "SaveImage", "inputs": {"images": ["10", 0], "filename_prefix": f"domstudio/{mode}"}},
    }


def wait_for_result(prompt_id, timeout=300):
    deadline = time.time() + timeout
    while time.time() < deadline:
        time.sleep(5)
        data = curl_get_json(f"{COMFY}/history/{prompt_id}")
        job = data.get(prompt_id, {})
        status = job.get("status", {})
        msgs = [m[0] for m in status.get("messages", []) if isinstance(m, list)]
        print(f"    [{int(time.time() - (deadline - timeout))}s] {status.get('status_str', 'waiting')} {msgs[-1] if msgs else ''}")
        if status.get("completed"):
            for node_out in job.get("outputs", {}).values():
                for img in node_out.get("images", []):
                    return img
            return None
        if status.get("status_str") == "error":
            print(f"    ERROR: {status}")
            return None
    print("    TIMEOUT")
    return None


def download_bytes(output_info) -> bytes:
    fn  = output_info["filename"]
    sub = output_info.get("subfolder", "")
    typ = output_info.get("type", "output")
    r = subprocess.run(
        ["curl", "-s", "--max-time", "60",
         f"{COMFY}/view?filename={fn}&subfolder={sub}&type={typ}",
         "-o", "-"],
        capture_output=True,
    )
    return r.stdout


def save_as_webp(png_bytes: bytes, out_path: Path):
    try:
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
        img.save(str(out_path), "WEBP", quality=87, method=6)
        print(f"    Saved WebP {img.width}x{img.height} -> {out_path.name}")
    except ImportError:
        # Pillow not available — save raw bytes (PNG content under .webp extension)
        out_path.write_bytes(png_bytes)
        print(f"    Saved (no Pillow, raw PNG bytes) → {out_path.name}")


def main():
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else None
    modes_to_run = [m for m in MODES if target is None or m["name"] == target]
    if not modes_to_run:
        print(f"Unknown mode '{target}'. Valid: {[m['name'] for m in MODES]}")
        sys.exit(1)
    for cfg in modes_to_run:
        print(f"\n{'='*50}")
        print(f"  MODE: {cfg['name'].upper()}  ({cfg['width']}x{cfg['height']})")
        print(f"{'='*50}")

        before = ASSETS / cfg["before"]
        after  = ASSETS / cfg["after"]

        print(f"  Uploading {cfg['before']} ...")
        img_name = upload_image(before)
        print(f"  Uploaded as '{img_name}'")

        seed     = int(time.time_ns() % (2**32))
        workflow = build_workflow(img_name, cfg["prompt"], cfg["width"], cfg["height"], cfg["steps"], seed, cfg["name"])

        print(f"  Submitting workflow ...")
        resp = curl_post_json(f"{COMFY}/prompt", {"prompt": workflow, "client_id": str(uuid.uuid4())})
        node_errors = resp.get("node_errors", {})
        if node_errors:
            print(f"  NODE ERRORS: {json.dumps(node_errors, indent=2)}")
            continue

        prompt_id = resp["prompt_id"]
        print(f"  Queued: {prompt_id}")

        output = wait_for_result(prompt_id, timeout=300)
        if not output:
            print(f"  SKIPPING {cfg['name']} — no output received")
            continue

        print(f"  Generated: {output['filename']}")
        img_bytes = download_bytes(output)
        save_as_webp(img_bytes, after)

        time.sleep(2)

    print("\n\nAll modes done. Check assets and commit when happy with results.")


if __name__ == "__main__":
    main()
