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

## Tests

```powershell
python -m unittest discover -s tests -v
```
