# DomStudio

DomStudio is three deployable applications:

1. `domstudio-frontend` — the customer website and dashboard.
2. `domstudio-backend` / `main.py` — authentication, subscriptions, payments,
   tokens, and the authenticated generation proxy.
3. `domstudio-backend` / `domstudio_generate_api.py` — the GPU generation
   worker.

The original `domstudio-landing.html` is a design prototype. Deploy
`domstudio-frontend/dist` for the working website.

## Local development

Start the core API:

```powershell
cd domstudio-backend
python -m pip install -r requirements.txt
uvicorn main:app --port 8000
```

Start the generation worker in a separate terminal:

```powershell
cd domstudio-backend
python -m pip install -r requirements-generation.txt
uvicorn domstudio_generate_api:app --port 8001
```

Start the frontend:

```powershell
cd domstudio-frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production deployment

Deploy the frontend as a static site:

- Root directory: `domstudio-frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://your-api.example.com`

Root-level `vercel.json` and `netlify.toml` files are included, so importing the
whole repository into Vercel or Netlify will build the frontend automatically.

Deploy the core API with:

- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Root directory: `domstudio-backend`
- `CORS_ORIGINS=https://your-frontend.example.com`
- `GENERATION_API_URL=https://your-generation-worker.example.com`
- All required values from `.env.example`

The generation worker needs a GPU environment and the packages from
`requirements-generation.txt`.
