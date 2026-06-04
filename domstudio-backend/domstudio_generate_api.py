"""
DomStudio — Generation API
RunPod Serverless Handler + FastAPI local dev server
Supports all 6 shooting modes + 4K upscale

Deploy: Docker image on RunPod Serverless
Local:  uvicorn domstudio_generate_api:app --port 8000
"""

import os
import io
import time
import base64
import logging
from typing import Optional

import torch
from PIL import Image
from fastapi import FastAPI
from pydantic import BaseModel
from diffusers import FluxPipeline, FluxImg2ImgPipeline

# ─── LOGGING ────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("domstudio")

# ─── CONSTANTS ──────────────────────────────────────────────────────────────
WEIGHTS_DIR   = os.getenv("WEIGHTS_DIR", "/weights")
FLUX_MODEL    = os.getenv("FLUX_MODEL",  "black-forest-labs/FLUX.1-dev")
ESRGAN_MODEL  = os.path.join(WEIGHTS_DIR, "RealESRGAN_x2plus.pth")
DEVICE        = "cuda" if torch.cuda.is_available() else "cpu"

# ─── MODE CONFIGS ───────────────────────────────────────────────────────────
# Each mode defines: prompt template, dimensions, steps, guidance, strength
MODES = {
    "catalog": {
        # Wildberries / Ozon / Yandex Market — clean white/cream background
        "prompt_template": (
            "professional product photography of {subject}, "
            "clean white seamless background, studio lighting, "
            "sharp focus, commercial e-commerce shot, "
            "soft shadows, centered composition, ultra detailed"
        ),
        "negative": (
            "blurry, dark background, busy background, text, "
            "watermark, low quality, distorted"
        ),
        "width":  1024,
        "height": 1024,
        "steps":  28,
        "guidance": 3.5,
        "upscale_to_2k": True,
        "description": "Clean catalog shot for WB, Ozon, Yandex"
    },

    "product": {
        # Premium studio with props, textures, dramatic light
        "prompt_template": (
            "luxury product photography of {subject}, "
            "dark moody studio background, dramatic side lighting, "
            "shallow depth of field, bokeh, premium commercial shot, "
            "marble or wood surface, cinematic, 8k quality"
        ),
        "negative": (
            "cheap, low quality, blurry, flat lighting, "
            "cluttered, busy background"
        ),
        "width":  1024,
        "height": 1024,
        "steps":  35,
        "guidance": 4.0,
        "upscale_to_2k": True,
        "description": "Premium studio shot with props and dramatic light"
    },

    "creative": {
        # Instagram / Telegram / social — lifestyle, editorial, brand mood
        "prompt_template": (
            "creative lifestyle product photography of {subject}, "
            "editorial style, moody color grading, "
            "trendy aesthetic, social media ready, "
            "dynamic composition, vibrant or pastel palette, "
            "Instagram fashion shoot quality"
        ),
        "negative": (
            "boring, plain, corporate, stock photo feel, "
            "low resolution, overexposed"
        ),
        "width":  1080,
        "height": 1350,   # 4:5 Instagram feed ratio
        "steps":  32,
        "guidance": 3.8,
        "upscale_to_2k": False,
        "description": "Creative editorial for Instagram / social"
    },

    "image": {
        # Lifestyle with AI model — product worn or held in scene
        "prompt_template": (
            "lifestyle fashion photography, model wearing or holding {subject}, "
            "natural indoor or outdoor setting, soft natural light, "
            "editorial magazine quality, authentic lifestyle feel, "
            "Canon 5D shot, 85mm lens, beautiful composition"
        ),
        "negative": (
            "mannequin, flat lay, no model, artificial, "
            "studio white background, low quality"
        ),
        "width":  832,
        "height": 1216,   # portrait 2:3
        "steps":  35,
        "guidance": 4.0,
        "upscale_to_2k": True,
        "description": "Lifestyle shot with AI model in scene"
    },

    "fitting": {
        # AI virtual try-on — garment or jewelry on model
        "prompt_template": (
            "professional virtual try-on photo, model wearing {subject}, "
            "full body or upper body shot, clean studio background, "
            "correct fit and drape of clothing, "
            "realistic fabric texture and lighting, "
            "fashion e-commerce quality, white background"
        ),
        "negative": (
            "bad anatomy, deformed, floating garment, "
            "wrong proportions, blurry, low quality, "
            "ghosting, double exposure"
        ),
        "width":  832,
        "height": 1216,
        "steps":  40,
        "guidance": 4.5,
        "upscale_to_2k": True,
        "description": "Virtual try-on with AI model"
    },

    "mobile": {
        # Stories 9:16, UGC style, vertical social
        "prompt_template": (
            "mobile-first vertical product photo of {subject}, "
            "9:16 format, Instagram Stories style, "
            "UGC authentic feel, trendy background or gradient, "
            "lifestyle context, phone camera aesthetic, "
            "bright and engaging, social media viral quality"
        ),
        "negative": (
            "horizontal, landscape format, professional studio, "
            "boring, flat, low engagement"
        ),
        "width":  608,
        "height": 1080,   # 9:16 vertical
        "steps":  28,
        "guidance": 3.5,
        "upscale_to_2k": False,
        "description": "Vertical Stories/Reels format 9:16"
    },
}

# ─── MODEL LOADING (happens once at container start) ────────────────────────
log.info("Loading FLUX pipeline...")
_flux_txt2img: Optional[FluxPipeline] = None
_flux_img2img: Optional[FluxImg2ImgPipeline] = None
_upsampler: Optional[object] = None
_upsampler_checked = False

def get_flux_txt2img() -> FluxPipeline:
    global _flux_txt2img
    if _flux_txt2img is None:
        log.info("Initialising FLUX txt2img...")
        _flux_txt2img = FluxPipeline.from_pretrained(
            FLUX_MODEL,
            torch_dtype=torch.bfloat16,
            cache_dir=WEIGHTS_DIR,
        ).to(DEVICE)
        _flux_txt2img.enable_model_cpu_offload()
    return _flux_txt2img

def get_flux_img2img() -> FluxImg2ImgPipeline:
    global _flux_img2img
    if _flux_img2img is None:
        log.info("Initialising FLUX img2img...")
        base = get_flux_txt2img()
        _flux_img2img = FluxImg2ImgPipeline(
            transformer=base.transformer,
            scheduler=base.scheduler,
            vae=base.vae,
            text_encoder=base.text_encoder,
            text_encoder_2=base.text_encoder_2,
            tokenizer=base.tokenizer,
            tokenizer_2=base.tokenizer_2,
        ).to(DEVICE)
    return _flux_img2img

def get_upsampler() -> Optional[object]:
    global _upsampler, _upsampler_checked
    if _upsampler_checked:
        return _upsampler

    _upsampler_checked = True
    if os.path.exists(ESRGAN_MODEL):
        try:
            from basicsr.archs.rrdbnet_arch import RRDBNet
            from realesrgan import RealESRGANer
        except ImportError:
            log.warning("Real-ESRGAN dependencies unavailable; using Lanczos fallback")
            return None

        log.info("Loading Real-ESRGAN upsampler...")
        model = RRDBNet(
            num_in_ch=3, num_out_ch=3,
            num_feat=64, num_block=23, num_grow_ch=32, scale=2
        )
        _upsampler = RealESRGANer(
            scale=2,
            model_path=ESRGAN_MODEL,
            model=model,
            tile=400,
            tile_pad=10,
            pre_pad=0,
            half=True,
        )
    return _upsampler

# ─── HELPERS ────────────────────────────────────────────────────────────────
def decode_image(b64: str) -> Image.Image:
    data = base64.b64decode(b64)
    return Image.open(io.BytesIO(data)).convert("RGB")

def encode_image(img: Image.Image, fmt: str = "PNG") -> str:
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return base64.b64encode(buf.getvalue()).decode()

def upscale_2x(img: Image.Image) -> Image.Image:
    """Upscale with Real-ESRGAN. Falls back to Lanczos if model not loaded."""
    upsampler = get_upsampler()
    if upsampler:
        import numpy as np
        import cv2
        arr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        out, _ = upsampler.enhance(arr, outscale=2)
        return Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))
    # Fallback: Lanczos 2x
    return img.resize((img.width * 2, img.height * 2), Image.LANCZOS)

def build_prompt(mode_cfg: dict, subject: str, style_hint: str = "") -> str:
    prompt = mode_cfg["prompt_template"].format(subject=subject)
    if style_hint:
        prompt = f"{prompt}, {style_hint}"
    return prompt

# ─── CORE GENERATION ────────────────────────────────────────────────────────
def generate_image(
    mode: str,
    subject: str,
    input_image_b64: Optional[str] = None,
    style_hint: str = "",
    seed: int = -1,
    upscale_4k: bool = False,
) -> dict:
    """
    Main generation function.
    Returns dict with base64 PNG, metadata.
    """
    if mode not in MODES:
        raise ValueError(f"Unknown mode: {mode}. Valid: {list(MODES.keys())}")

    cfg = MODES[mode]
    prompt   = build_prompt(cfg, subject, style_hint)
    negative = cfg["negative"]
    t_start  = time.time()

    generator = torch.Generator(device=DEVICE)
    if seed >= 0:
        generator.manual_seed(seed)
    else:
        seed = generator.seed()

    log.info(f"Generating | mode={mode} | {cfg['width']}×{cfg['height']} | steps={cfg['steps']}")

    if input_image_b64:
        # ── IMG2IMG: refine uploaded photo into studio shot ──────────────
        pipe     = get_flux_img2img()
        init_img = decode_image(input_image_b64).resize(
            (cfg["width"], cfg["height"]), Image.LANCZOS
        )
        result = pipe(
            prompt=prompt,
            image=init_img,
            strength=0.80,          # 80% transformation, keeps product shape
            num_inference_steps=cfg["steps"],
            guidance_scale=cfg["guidance"],
            generator=generator,
        ).images[0]
    else:
        # ── TXT2IMG: pure generation ──────────────────────────────────────
        pipe   = get_flux_txt2img()
        result = pipe(
            prompt=prompt,
            negative_prompt=negative,
            width=cfg["width"],
            height=cfg["height"],
            num_inference_steps=cfg["steps"],
            guidance_scale=cfg["guidance"],
            generator=generator,
        ).images[0]

    gen_time = time.time() - t_start
    output_w, output_h = result.size

    # ── UPSCALE ───────────────────────────────────────────────────────────
    if upscale_4k or cfg.get("upscale_to_2k"):
        log.info("Upscaling 2x with Real-ESRGAN...")
        result   = upscale_2x(result)
        output_w, output_h = result.size

    total_time = time.time() - t_start
    log.info(f"Done in {total_time:.1f}s | output {output_w}×{output_h}")

    return {
        "image":       encode_image(result),
        "format":      "PNG",
        "width":       output_w,
        "height":      output_h,
        "mode":        mode,
        "seed":        seed,
        "gen_time_s":  round(gen_time, 2),
        "total_time_s": round(total_time, 2),
        "upscaled":    (upscale_4k or cfg.get("upscale_to_2k", False)),
        "description": cfg["description"],
    }

# ─── RUNPOD SERVERLESS HANDLER ───────────────────────────────────────────────
def runpod_handler(job: dict) -> dict:
    """
    RunPod calls this function for every job.
    Input shape (job["input"]):
    {
        "mode":             "catalog" | "product" | "creative" |
                            "image"   | "fitting"  | "mobile",
        "subject":          "gold hoop earrings",
        "image":            "<base64 jpeg>",   # optional — user's phone photo
        "style_hint":       "dark moody tones", # optional
        "seed":             42,                 # optional, -1 = random
        "upscale_4k":       false               # optional, extra 2x on top
    }
    """
    try:
        inp = job["input"]
        result = generate_image(
            mode            = inp.get("mode", "catalog"),
            subject         = inp.get("subject", "product"),
            input_image_b64 = inp.get("image"),
            style_hint      = inp.get("style_hint", ""),
            seed            = inp.get("seed", -1),
            upscale_4k      = inp.get("upscale_4k", False),
        )
        return {"status": "success", **result}

    except Exception as e:
        log.exception("Generation failed")
        return {"status": "error", "error": str(e)}


# ─── FASTAPI LOCAL DEV SERVER ────────────────────────────────────────────────
# Run locally with: uvicorn domstudio_generate_api:app --port 8000

app = FastAPI(title="DomStudio Generation API", version="1.0")

class GenerateRequest(BaseModel):
    mode:         str           = "catalog"
    subject:      str           = "product"
    image:        Optional[str] = None      # base64 input photo
    style_hint:   str           = ""
    seed:         int           = -1
    upscale_4k:   bool          = False

class GenerateResponse(BaseModel):
    status:        str
    image:         Optional[str] = None     # base64 output PNG
    format:        Optional[str] = None
    width:         Optional[int] = None
    height:        Optional[int] = None
    mode:          Optional[str] = None
    seed:          Optional[int] = None
    gen_time_s:    Optional[float] = None
    total_time_s:  Optional[float] = None
    upscaled:      Optional[bool] = None
    description:   Optional[str] = None
    error:         Optional[str] = None

@app.get("/health")
def health():
    return {
        "status": "ok",
        "device": DEVICE,
        "modes":  list(MODES.keys()),
        "cuda":   torch.cuda.is_available(),
        "vram_gb": round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1)
                   if torch.cuda.is_available() else 0,
    }

@app.get("/modes")
def list_modes():
    return {k: v["description"] for k, v in MODES.items()}

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    try:
        result = generate_image(
            mode            = req.mode,
            subject         = req.subject,
            input_image_b64 = req.image,
            style_hint      = req.style_hint,
            seed            = req.seed,
            upscale_4k      = req.upscale_4k,
        )
        return {"status": "success", **result}
    except Exception as e:
        log.exception("API error")
        return GenerateResponse(status="error", error=str(e))


# ─── ENTRYPOINT ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Detect environment: RunPod vs local
    if os.getenv("RUNPOD_POD_ID"):
        log.info("Starting RunPod serverless handler...")
        import runpod
        runpod.serverless.start({"handler": runpod_handler})
    else:
        import uvicorn
        log.info("Starting local FastAPI dev server on :8000")
        uvicorn.run("domstudio_generate_api:app", host="0.0.0.0", port=8000, reload=False)
