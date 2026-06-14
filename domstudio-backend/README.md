# DomStudio Backend

## Core API

Create `.env` from `.env.example`, then install and run:

```powershell
python -m pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Generation Worker

Install the separate pinned generation stack:

```powershell
python -m pip install -r requirements-generation.txt
uvicorn domstudio_generate_api:app --host 0.0.0.0 --port 8001
```

The worker uses a Lanczos upscale fallback by default. If a compatible
Real-ESRGAN installation and `RealESRGAN_x2plus.pth` are available, it uses
Real-ESRGAN automatically.

RunPod serverless mode starts when `RUNPOD_POD_ID` is set.

## ComfyUI Provider

The authenticated `/generation/generate` route can call an exported ComfyUI API
workflow instead of the legacy worker:

```powershell
GENERATION_PROVIDER=comfy
COMFYUI_URL=https://your-comfy-service
COMFYUI_IMAGE_WORKFLOW=product_image.json
```

If `COMFYUI_URL` is empty, the backend can discover an AutoDL elastic deployment
service URL:

```powershell
GENERATION_PROVIDER=comfy
COMFYUI_PORT=6006
AUTODL_TOKEN=your-developer-token
AUTODL_DEPLOYMENT_UUID=your-deployment-uuid
```

For AutoDL instance/pro snapshots, use `AUTODL_INSTANCE_UUID` instead of
`AUTODL_DEPLOYMENT_UUID`. Both discovery paths are supported.

Run ComfyUI in AutoDL on the mapped port:

```powershell
python main.py --listen 0.0.0.0 --port 6006
```

Export the ComfyUI API workflow JSON into `workflows/product_image.json`. The
backend replaces these placeholders anywhere in the workflow before queueing it:

```text
{{prompt}}
{{subject}}
{{style_hint}}
{{seed}}
{{image_base64}}
{{upscale_4k}}
{{mode}}
```

## Tests

```powershell
python -m unittest discover -s tests -v
```
