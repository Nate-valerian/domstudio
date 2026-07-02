# DomStudio

DomStudio is an AI product-content studio for sellers, local businesses, and
marketplace teams. It combines product image generation, video previews,
marketplace-ready export tools, copywriting workflows, and an AdPilot AI chat
assistant in one web and mobile workspace.

<img width="1280" height="4120" alt="DomStudio home screenshot" src="https://github.com/user-attachments/assets/0b235782-ce1c-4f66-99c0-3f42ed0755d4" />

## What It Does

- AI product photos from an upload or text prompt
- Marketplace presets for Wildberries, Ozon, Avito, Yandex Market, social posts,
  banners, and vertical stories
- Generation modes for catalog, product, lifestyle, creative, fitting, stories,
  and video previews
- Quick tools for background removal, resizing, compression, watermarking,
  promo badges, collages, and product-card checks
- AdPilot AI for product descriptions, marketplace listings, social posts,
  buyer replies, review replies, ad text, and launch ideas
- Auth, token limits, subscription/payment endpoints, contact forms, and
  marketplace credential storage on the backend
- Expo mobile app with auth, generation, history, sharing, and settings
- Telegram bot for account-linked copy tools

## Repository Layout

```text
.
|-- domstudio-frontend/     # Vite web app and PWA assets
|-- domstudio-backend/      # FastAPI API, auth, payments, generation routes
|-- domstudio-mobile/       # Expo / React Native mobile app
|-- domstudio-telegram/     # Telegram bot for copy tools
|-- tools/                  # Internal scripts and asset generators
|-- temp-preview/           # Local preview screenshots and generated samples
|-- DOMSTUDIO_ARCHIVE.md    # Detailed development archive / handoff log
`-- domstudio-spaceweb-dist.zip
```

## Tech Stack

- Frontend: Vite, vanilla JavaScript, CSS, GSAP, PWA manifest/service worker
- Backend: FastAPI, SQLAlchemy async, PostgreSQL, Redis, JWT auth
- Generation: ComfyUI workflows or a separate generation worker
- Image tools: IMG.LY background removal, Pillow-based backend helpers
- Mobile: Expo SDK 54, React Native, TypeScript
- Bot: python-telegram-bot, aiohttp, SQLite

## Local Development

### Backend

```powershell
cd domstudio-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:

```text
http://localhost:8000
```

Useful endpoints:

- `GET /health`
- `GET /version`
- `POST /auth/login/email`
- `POST /generation/generate`
- `POST /content/generate`
- `POST /ad-chat`
- `POST /contact`

### Frontend

```powershell
cd domstudio-frontend
npm install
Copy-Item .env.example .env
npm run dev
```

By default the frontend expects:

```env
VITE_API_URL=http://localhost:8000
```

### Mobile App

```powershell
cd domstudio-mobile
npm install
Copy-Item .env.example .env
npm run start
```

Set `EXPO_PUBLIC_API_URL` to a backend URL reachable from the device:

- iOS simulator: `http://localhost:8000`
- Android emulator: `http://10.0.2.2:8000`
- Physical phone: your computer LAN IP, for example `http://192.168.1.20:8000`

### Telegram Bot

```powershell
cd domstudio-telegram
python -m pip install -r requirements.txt
$env:TELEGRAM_TOKEN="your-telegram-bot-token"
$env:DOMSTUDIO_API="http://localhost:8000"
python bot.py
```

## Environment

Copy the example env files before running each app:

```text
domstudio-backend/.env.example
domstudio-frontend/.env.example
domstudio-mobile/.env.example
domstudio-telegram/.env.example
```

Important backend variables include:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `API_URL`
- `GENERATION_API_URL`
- `GENERATION_PROVIDER`
- `COMFYUI_URL`
- `TEXT_AI_BASE_URL`
- `TEXT_AI_API_KEY`
- `TEXT_AI_MODEL`
- `TINKOFF_TERMINAL_KEY`
- `TINKOFF_SECRET_KEY`
- `YANDEX_PAY_MERCHANT_ID`
- `YANDEX_PAY_SECRET`
- `SMS_API_KEY`
- `RESEND_API_KEY`

Do not commit real `.env` files or secrets.

## AI Generation Providers

The backend supports two generation paths:

1. `GENERATION_PROVIDER=worker`
   - Uses the separate FastAPI generation worker in
     `domstudio-backend/domstudio_generate_api.py`.
   - Start it with:

```powershell
cd domstudio-backend
python -m pip install -r requirements-generation.txt
uvicorn domstudio_generate_api:app --host 0.0.0.0 --port 8001
```

2. `GENERATION_PROVIDER=comfy`
   - Uses exported ComfyUI API workflows from `domstudio-backend/workflows/`.
   - Supports product images and Wan image-to-video workflows.
   - Can connect to a fixed `COMFYUI_URL` or discover AutoDL deployments through
     `AUTODL_*` variables.

See [domstudio-backend/README.md](domstudio-backend/README.md) for ComfyUI
placeholders, workflow names, and video provider notes.

## Verification

Backend tests:

```powershell
cd domstudio-backend
python -m unittest discover -s tests -v
```

Frontend build:

```powershell
cd domstudio-frontend
npm run build
```

Mobile type check:

```powershell
cd domstudio-mobile
npm run typecheck
```

## Deployment Notes

- The frontend can be built with Vite and deployed as static files.
- `domstudio-spaceweb-dist.zip` is a generated static frontend package for
  SpaceWeb upload.
- Backend deployment needs the FastAPI app plus configured PostgreSQL, secrets,
  CORS origins, and the selected generation provider.
- `amvera.yml`, `vercel.json`, and `netlify.toml` contain deployment-specific
  config used during previous hosting experiments.

## Development Archive

`DOMSTUDIO_ARCHIVE.md` is the source-of-truth project archive. It records the
major implementation sessions, current production notes, generation workflow
changes, AdPilot AI behavior, mobile app progress, deployment findings, and
next-step ideas.

## Contact

Created by **Nate**

- Email: [n.nate1544@gmail.com](mailto:n.nate1544@gmail.com)
- GitHub: [github.com/Nate-valerian](https://github.com/Nate-valerian)

  
## License

No license has been published yet. Treat this repository as proprietary unless a
license file is added.


