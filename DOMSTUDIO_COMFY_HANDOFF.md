# DomStudio ComfyUI / Video Handoff

Created: June 7, 2026

## Mandatory Read First

Before doing any new ComfyUI, AutoDL, image, card, or video work, read
`DOMSTUDIO_TOMORROW.md` section `Mandatory Read First`.

Key rule: do not repeat the June 7 mistake of applying one generic treatment to
all cards. Each landing card has its own functionality, and fake pan/zoom stills
must not be presented as real 3-second video.

## Current Frontend Decision

- Keep the frontend as Vite, not Next.js.
- Reason: the app is a client-heavy product dashboard and already works with the
  FastAPI backend. AI API secrets should stay in FastAPI, not in the browser.
- Current flow should remain:
  `Vite frontend -> FastAPI backend -> ComfyUI/worker -> FastAPI -> frontend`.

## Recent Commits

- `6aae757` - improved landing proof imagery with consistent before/after
  product pairs.
- `f4804a7` - refreshed landing page style with a Comfy-inspired dark hero and
  amber-orange accent.

## ComfyUI Provider Direction

Preferred AutoDL mirror:

```text
comfyanonymous/ComfyUI/tzwm_ComfyUI
```

Why:

- Practical all-in-one ComfyUI package.
- Supports newer GPU stacks.
- Includes useful plugins/models such as Wan, Qwen-Image, z-image, nunchaku.
- Better fit for image and short video workflows than older CUDA-specific
  packages.

## GPU Choice

Prefer the AutoDL machine with:

```text
vGPU-48GB / 48 GB
CPU: 25 cores
RAM: 90 GB
Data disk: 50 GB, expandable by 1858 GB
CUDA <= 13.0
```

Reason: 48 GB VRAM is enough for short image-to-video experiments, but video
models, frames, cache, and outputs need expandable disk. More CPU also helps
with ComfyUI overhead, preprocessing, and ffmpeg encoding.

## Video Product Plan

Video should make DomStudio feel alive, but protect GPU cost.

Recommended rollout:

1. Image generation stays core.
2. Add 3-second image-to-video first.
3. Add 5-second video later as Pro/high-token option.

Suggested product tiers:

```text
Fast Preview: 3 sec, 576p
Ad Clip:      3 sec, 720p
Premium Clip: 5 sec, 720p
```

Avoid positioning 480p as the main output because it may feel too cheap for
product ads. If used, label it as preview only.

Suggested token costs:

```text
Image:        100 tokens
3 sec 576p:   700 tokens
3 sec 720p:  1000 tokens
5 sec 720p:  1800 tokens
```

Rules:

- No free-tier video.
- One active video job per user.
- Temporary output storage only.
- Auto-delete video outputs after about 24 hours.

## Backend Architecture

Short videos must be async. Do not run video generation inside a normal
synchronous HTTP request.

Target API shape:

```text
POST /generation/jobs
GET  /generation/jobs/{job_id}
GET  /generation/jobs/{job_id}/download
```

Backend responsibilities:

- Auth and token checks.
- Token charging/refund on failure.
- Queue jobs in Redis.
- Send prompt/workflow to ComfyUI.
- Poll status.
- Download image/video output.
- Return result or downloadable URL/base64.

## AutoDL URL Discovery

AutoDL elastic deployments expose mapped public URLs for ports 6006 and 6008.
ComfyUI should run inside AutoDL on one of those ports:

```bash
python main.py --listen 0.0.0.0 --port 6006
```

AutoDL ESD API host:

```text
https://api.autodl.com
```

Auth header:

```text
Authorization: AUTODL_DEVELOPER_TOKEN
```

Developer token location:

```text
AutoDL console -> Settings -> Developer Token
```

The ESD API can return:

```text
info.service_6006_port_url
info.service_6008_port_url
```

Recommended backend config:

```env
COMFYUI_URL=
COMFYUI_PORT=6006
AUTODL_TOKEN=
AUTODL_DEPLOYMENT_UUID=
COMFYUI_API_KEY=
```

Recommended resolution order:

1. If `COMFYUI_URL` is set, use it.
2. Else, if `AUTODL_TOKEN` and `AUTODL_DEPLOYMENT_UUID` are set, call AutoDL ESD
   API and discover `service_6006_port_url`.
3. Else fail with a clear configuration error.

Important: do not commit real API keys. The Comfy key was shared in chat and
should be rotated if possible before production.

## Implementation Order

1. Add backend Comfy client with AutoDL URL discovery.
2. Wire existing image generation route to ComfyUI image workflow.
3. Add Redis-backed job table/queue.
4. Add 3-second 720p image-to-video.
5. Add frontend controls for Image / Video, duration, quality, polling, preview.
6. Add 5-second Pro video.
7. Add cleanup/auto-delete for temporary outputs.

## Implemented On June 7, 2026

Backend Comfy foundation was added.

Files added:

```text
domstudio-backend/services/__init__.py
domstudio-backend/services/comfy_client.py
domstudio-backend/workflows/product_image.json
domstudio-backend/tests/test_comfy_client.py
```

Files updated:

```text
domstudio-backend/routers/generation.py
domstudio-backend/.env.example
domstudio-backend/README.md
domstudio-backend/tests/test_generation.py
```

What exists now:

- `GENERATION_PROVIDER=worker` remains the default legacy worker path.
- `GENERATION_PROVIDER=comfy` switches `/generation/generate` to ComfyUI.
- `COMFYUI_URL` is used directly when set.
- If `COMFYUI_URL` is empty, backend can discover an AutoDL public service URL
  via:

```text
POST https://api.autodl.com/api/v1/dev/deployment/container/list
```

- AutoDL discovery reads:

```text
info.service_6006_port_url
```

or whichever port is configured through:

```env
COMFYUI_PORT=6006
```

- Comfy client supports:

```text
POST /prompt
GET  /history/{prompt_id}
GET  /view?filename=...
```

- `COMFYUI_API_KEY` is sent as `X-API-Key`.
- Optional `COMFYUI_AUTH_HEADER=authorization` also sends `Authorization`.

Workflow placeholders currently supported:

```text
{{prompt}}
{{subject}}
{{style_hint}}
{{seed}}
{{image_base64}}
{{upscale_4k}}
{{mode}}
```

Test status after implementation:

```text
python -m unittest discover -s tests -v
17 tests OK
```

Current limitation before the later AutoDL retry:

```text
domstudio-backend/workflows/product_image.json
```

was a simple text-to-image workflow and was not enough for product-preserving
Catalog/Product editing.

## AutoDL / Qwen Edit Status For Tomorrow

New working AutoDL instance:

```text
autodl-container-95c4479bc9-7f1ffc79
```

ComfyUI is reachable inside the instance at:

```text
http://127.0.0.1:6006
```

The first AutoDL/tzwm setup path failed because the initializer repeatedly
crashed after partial downloads, especially around:

```text
/root/autodl-tmp/tzwm_qwen-image
```

Do not restart broad tzwm model initialization unless there is no alternative.
It wasted time by downloading partial files, then expecting them in stale temp
paths. Prefer checking ComfyUI `/object_info` and downloading only the exact
missing model file.

The new instance has the missing Qwen text encoder:

```text
qwen_2.5_vl_7b_fp8_scaled.safetensors
```

Verified by:

```bash
curl -s http://127.0.0.1:6006/object_info/CLIPLoader | python -m json.tool | head -100
```

The new instance also has:

```text
Nunchaku model:
svdq-int4_r128-qwen-image-edit-2509-lightning-4steps-251115.safetensors

VAE:
qwen_image_vae.safetensors
```

Verified by:

```bash
curl -s http://127.0.0.1:6006/object_info/NunchakuQwenImageDiTLoader | python -m json.tool | head -100
curl -s http://127.0.0.1:6006/object_info/VAELoader | python -m json.tool | head -80
```

The matching example workflow exists:

```text
/root/autodl-tmp/ComfyUI/custom_nodes/ComfyUI-nunchaku/example_workflows/nunchaku-qwen-image-edit-2509-lightning.json
```

Local backend workflow file was patched to use the installed Nunchaku model:

```text
domstudio-backend/workflows/product_image.json
```

But this local workflow is still too simple. It is filename-compatible with the
new instance, but the real DomStudio workflow should be the exported API version
of the Qwen image-edit workflow above.

## Current Conversation Decisions

- Keep Vite. Next.js is not needed for AI image/video because secrets stay in
  FastAPI.
- The browser must never call ComfyUI directly with API keys.
- Video should be added after image Comfy generation works.
- 480p is likely too weak for main product video. Use 576p as preview and 720p
  for paid/pro clips.
- Launch video as:

```text
3 sec / 720p first
5 sec / 720p later as Pro/high-token
```

- Video must use Redis/async jobs rather than a blocking HTTP request.
- Prefer the AutoDL GPU option with expandable data disk for video.

## Immediate Next Step

1. Keep using the new working AutoDL instance if it is still available:

```bash
cd /root/autodl-tmp/ComfyUI
python main.py --listen 0.0.0.0 --port 6006
```

2. In ComfyUI, load:

```text
/root/autodl-tmp/ComfyUI/custom_nodes/ComfyUI-nunchaku/example_workflows/nunchaku-qwen-image-edit-2509-lightning.json
```

3. Run one manual product-preserving Catalog test with an uploaded product image.
   Use a narrow prompt:

```text
clean ecommerce catalog photo, preserve the exact product shape, material, color, and label, remove cluttered background, place product on pure white background, realistic soft studio shadow, sharp details
```

4. If it preserves the product, export the workflow in API format.
5. Replace:

```text
domstudio-backend/workflows/product_image.json
```

6. Set backend env:

```env
GENERATION_PROVIDER=comfy
COMFYUI_URL=https://your-autodl-service-url
COMFYUI_IMAGE_WORKFLOW=product_image.json
COMFYUI_API_KEY=
```

or use AutoDL discovery:

```env
GENERATION_PROVIDER=comfy
COMFYUI_URL=
COMFYUI_PORT=6006
AUTODL_TOKEN=
AUTODL_DEPLOYMENT_UUID=
```

7. Test one real `/generation/generate` request through FastAPI.
