# DomStudio Archive

## June 7, 2026 - Midday Status Note

User asked:

> so, since morning, what have you done and accomplished?

Archived answer:

Honestly: not enough, and not the right final outcome for the visual cards.

What did get accomplished today:

1. AutoDL / ComfyUI is running and reachable at `http://127.0.0.1:6006`.
2. We picked and used the `vGPU-32GB` AutoDL instance.
3. You downloaded the Qwen/Nunchaku model successfully:
   `svdq-int4_r32-qwen-image-lightningv1.1-8steps.safetensors`
4. Backend Comfy foundation was added and committed:
   - `55de9d2 Add ComfyUI generation client`
   - `785555f Wire Comfy Qwen image workflow`
5. The backend now has a Comfy client, AutoDL URL support, workflow loading, and tests/build around that path.
6. I confirmed the current Comfy setup is Qwen/Nunchaku image generation, not Flux Kontext, not Qwen Image Edit, not dedicated virtual try-on.
7. I proved AutoDL has many video nodes installed, including Wan/VideoHelperSuite, but I did not produce a real proper per-function video workflow.
8. I made a bad generic "live video" pass, then reverted it:
   - bad commit: `602ea82`
   - revert commit: `8003074`
9. Frontend build currently passes after the revert.

What did not get accomplished:

1. The site cards are not finished to your standard.
2. The before/after product consistency problem is not properly solved.
3. The 3-second videos are not real AI videos. My pan/zoom/shaking approach was lame, and you were right to reject it.
4. I did not correctly respect that each card has its own functionality.
5. I wasted time trying to patch visuals instead of setting up the correct workflow per mode.

So the real status is: backend/AutoDL foundation moved forward, but the landing visuals/videos are still not solved.

## June 8, 2026 - Early Morning AutoDL/Qwen Edit Setup

Goal:

Get a real product-preserving Qwen/Nunchaku image-edit workflow working for
DomStudio Catalog/Product mode.

What went wrong:

1. The first AutoDL/tzwm setup partially downloaded model files, then repeatedly
   crashed in the initializer cleanup step:

```text
OSError: [Errno 39] Directory not empty: '/root/autodl-tmp/tzwm_qwen-image'
```

2. That same broken path later looked for missing files in the stale temp folder:

```text
/root/autodl-tmp/tzwm_qwen-image/qwen_2.5_vl_7b_fp8_scaled.safetensors
```

3. The first instance could see the VAE and some Nunchaku diffusion models, but
   `CLIPLoader` had an empty `clip_name` list. The missing file was:

```text
qwen_2.5_vl_7b_fp8_scaled.safetensors
```

4. Hugging Face timed out from AutoDL, and ModelScope started downloading extra
   files, including a large unnecessary diffusion model. That path was stopped.

Decision:

Stop fighting the broken initializer. Use a fresh AutoDL instance and verify
models through ComfyUI `/object_info` before doing any more workflow work.

What worked:

1. New AutoDL instance:

```text
autodl-container-95c4479bc9-7f1ffc79
```

2. ComfyUI reachable inside the instance:

```text
http://127.0.0.1:6006
```

3. `CLIPLoader` now sees:

```text
qwen_2.5_vl_7b_fp8_scaled.safetensors
qwen_3_4b.safetensors
```

4. `VAELoader` now sees:

```text
qwen_image_vae.safetensors
```

5. `NunchakuQwenImageDiTLoader` now sees:

```text
svdq-int4_r128-qwen-image-edit-2509-lightning-4steps-251115.safetensors
z_image_turbo_bf16.safetensors
```

6. Matching Qwen edit example workflows exist:

```text
/root/autodl-tmp/ComfyUI/custom_nodes/ComfyUI-nunchaku/example_workflows/nunchaku-qwen-image-edit-2509-lightning.json
/root/autodl-tmp/ComfyUI/custom_nodes/ComfyUI-nunchaku/example_workflows/nunchaku-qwen-image-edit-2509.json
/root/autodl-tmp/ComfyUI/custom_nodes/ComfyUI-nunchaku/example_workflows/nunchaku-qwen-image-edit.json
/root/autodl-tmp/ComfyUI/custom_nodes/ComfyUI-nunchaku/example_workflows/nunchaku-qwen-image.json
```

Local repo update made:

```text
domstudio-backend/workflows/product_image.json
```

was patched from the unavailable old model:

```text
svdq-int4_r32-qwen-image-lightningv1.1-8steps.safetensors
```

to the model visible on the new instance:

```text
svdq-int4_r128-qwen-image-edit-2509-lightning-4steps-251115.safetensors
```

Important limitation:

The local `product_image.json` is still a simple graph. It should not be treated
as the final product-preserving workflow. Tomorrow, load the Qwen image-edit
example manually in ComfyUI, test one uploaded product image, then export the
working graph in API format and wire that into DomStudio.

## June 8, 2026 - Product Direction For Tomorrow

User asked whether DomStudio should become a native mobile app now, or whether
the Russian marketplace-first feature set should be built on the site first.

Decision:

Build the website/mobile-web/PWA product first. Native iOS/RuStore app comes
later.

Reasoning:

1. The risky part is not the mobile wrapper. The risky part is proving the seller
   workflow:
   - product preservation
   - WB/Ozon/Yandex presets
   - affordable pricing
   - batch upload/export
   - marketplace card/infographic builder
   - SEO/listing assistant
2. The site can be tested immediately with sellers and can be made mobile-first.
3. A native app should be distribution after the workflow is validated, not the
   first build target.

Positioning to use tomorrow:

```text
DomStudio is a Russian marketplace-first visual studio for WB/Ozon/Yandex
sellers.
```

Suggested build direction:

1. Improve the site around Russian marketplace sellers.
2. Make the phone/mobile-web flow feel app-like:
   upload photo -> choose marketplace -> generate -> download.
3. Add affordable packs and clear token costs.
4. Add content-pack workflow before video/native app work.
5. Keep native mobile as a later milestone after paid website workflow is proven.

## June 9, 2026 - Marketplace Features, Pricing Overhaul, PWA + Mobile Pass

### What was done

#### 1. Marketplace presets completed

Added **Avito** as a full marketplace preset with its own catalog-mode prompt
tuned for honest Avito listings.

Updated **VK / Social Post** → **VK / Telegram** with a revised hint covering
Telegram channel posts.

Updated nav preset dropdown descriptions to Russian:
"карточка маркетплейса", "4:5 · VK / Telegram", "9:16 · сторис",
"баннер · премиум".

#### 2. Content pack — marketplace quick-export

Added `PACK_FORMATS` constant (7 entries: WB, Ozon, Yandex, Avito, Story 9:16,
Пост 4:5, Баннер 16:9).

Added `contentPackTools()` panel that appears in the result column after
generation. Each button downloads the generated image in the correct
size/format for that platform with one click.

Refactored the canvas export logic out of `exportGeneratedImage()` into a
shared `renderToCanvas()` helper. Both the custom export and the pack buttons
now use it.

#### 3. Token cost hint

Added a small hint line below the generate button:

```text
У вас X токенов · хватит на ~N фото
```

When tokens < 100, it turns red and shows a "пополнить тариф" link.

#### 4. Landing page — marketplace-first repositioning

- Eyebrow: "AI-студия для продавцов маркетплейсов"
- Hero `<p>` now explicitly names Wildberries, Ozon, Yandex, Avito.
- Trust row: "WB · Ozon · Yandex · Avito"
- Hero studio card top: "WB · Ozon · Yandex · Avito"
- Preset pills in hero: Wildberries, Ozon, Avito, 1080×1080

#### 5. Pricing overhaul

Both `domstudio-backend/database.py` (source of truth) and
`domstudio-frontend/src/app.js` `FALLBACK_PLANS` updated to:

| Тариф    | Цена   | Фото | ₽/фото | Токены |
|----------|--------|------|--------|--------|
| Free     | 0 ₽    | 5    | 0      | 500    |
| Старт    | 270 ₽  | 30   | 9      | 3 000  |
| Селлер   | 790 ₽  | 100  | 7.9    | 10 000 |
| Рост     | 1 490 ₽| 300  | 5      | 30 000 |

Updated home page trust row and proof-section stat from "500 ₽" to "270 ₽".

#### 6. PWA

Created `domstudio-frontend/public/manifest.json`:

```json
{
  "name": "DomStudio — AI-фотостудия",
  "short_name": "DomStudio",
  "theme_color": "#ff9d2e",
  "display": "standalone"
}
```

Generated `icon-192.png` and `icon-512.png` (orange DS circle, Python Pillow).

Updated `index.html`:

- `<link rel="manifest">`, `<link rel="apple-touch-icon">`
- `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`
- `viewport-fit=cover` for notched iPhones
- OG title and description tags
- Page title updated to "AI-студия для продавцов маркетплейсов"

#### 7. Mobile studio — collapsible sections

Added `brandPrefsOpen` and `promptHelperOpen` boolean flags to state
(both default `false`).

"Бренд" and "Помощник промпта" sections are now collapsible accordion panels.
On first load, the studio form shows only:

- Площадка, Шаблон стиля, Режим съёмки
- Что снимаем (textarea)
- Пожелания к стилю
- Upload area
- 4K checkbox
- Generate button + token hint

Advanced sections expand with a `+` tap. This dramatically reduces form length
on mobile.

#### 8. Account page improvements

Rebuilt `accountPage()` to include:

- **Upgrade CTA** (orange gradient banner): appears when plan is `free` or
  tokens < 300. Shows plan name + description + "Выбрать тариф" button.
- **Recent results**: shows last 3 browser history items with thumbnails,
  subject, mode. Only renders if history exists.
- **Brand summary**: 2-column grid of saved brand values (colors, background,
  mood, avoid). Only renders if brand has been configured.
- **Account data**: email/phone + verified status with green "✓ Подтверждён".

#### 9. CSS additions

- `.collapsible-head`, `.collapsible-body`, `.collapsible.open` — accordion
  styles for Бренд and Помощник промпта.
- `.upgrade-cta` — orange-tinted CTA bar for account page.
- `.account-section`, `.account-section-head` — consistent panel sections.
- `.brand-summary` — 2-col `dl` grid for saved brand values.
- `.account-contact`, `.account-status.verified / .pending` — account data.
- `@supports (padding-bottom: env(safe-area-inset-bottom))` — safe-area
  padding for workspace and toast root on notched iPhones.
- `@media (pointer: coarse)` — minimum 44px tap targets on chips, pack
  buttons, history delete, close, upload area, collapsible heads.
- Fixed two missing `-webkit-backdrop-filter` prefixes on `.modal-backdrop`
  and `.result-status` (were causing CSS errors in Safari).

### Files changed

```text
domstudio-frontend/src/app.js
domstudio-frontend/src/styles.css
domstudio-frontend/index.html
domstudio-frontend/public/manifest.json      (new)
domstudio-frontend/public/icon-192.png       (new)
domstudio-frontend/public/icon-512.png       (new)
domstudio-backend/database.py
```

### What is still not done

1. **ComfyUI / Qwen workflow** — the backend Comfy client exists but
   `product_image.json` is still a simple graph. Real product-preserving
   generation requires:
   - Boot AutoDL instance `autodl-container-95c4479bc9-7f1ffc79`
   - Load and test Qwen image-edit example workflow in ComfyUI
   - Export in API format, replace `product_image.json`
   - Set `GENERATION_PROVIDER=comfy` in `.env`

2. **Async video jobs** — Redis-backed job queue for 3s/720p image-to-video
   not yet implemented (requires backend work, per `DOMSTUDIO_COMFY_HANDOFF.md`).

3. **Preview/final export split** — requires a `/generation/preview` backend
   endpoint; not yet added.

## June 9, 2026 — Afternoon: Tier 2 Frontend (history, batch, share, payment return, SEO)

Commits: `71db365`

### Changes in this session

#### 1. Full history page (`#history`)

Added a dedicated history page accessible from nav and sidebar (logged-in
users only). Shows all stored items (limit raised from 5 → 20).

Features:

- Filter chips per shooting mode: Все / Каталог / Предметная / Креатив /
  Lifestyle / Примерка / Stories
- "Очистить всё" button clears all IndexedDB history
- Grid layout: thumbnail (80×80), subject, mode + variation + resolution,
  date + time
- Empty state with CTA to studio
- "No results for this mode" message when filter returns zero items
- Responsive: single column on mobile

New functions: `purgeHistory()`, `clearAllHistory()`, `historyPage()`.
New CSS: `.chip-active`, `.history-full-grid`, `.history-card`,
`.history-card-info`, `.history-card-thumb`, `.history-empty`.

#### 2. Batch upload

File input now accepts `multiple` attribute. When the user selects N > 1
files:

- All files are read as base64 immediately
- `state.batchQueue` holds the queue
- Upload label updates to "N фото в очереди · N×100 токенов"
- Generate button updates to "Создать пакет · N×100 токенов"
- `processBatch()` runs them sequentially via `generateWithPayload()`
- Button shows "Пакет 2/3…" during processing
- Toast on completion: "Пакет готов — N фото"

Each batch item lands in browser history independently.

#### 3. Share result (Web Share API)

"Поделиться" button added to the export row (next to "Скачать").

Priority chain:

1. `navigator.canShare({ files })` → native share sheet with image file
2. `navigator.clipboard.write` → copy image to clipboard + toast
3. Fallback → trigger download

Error on `AbortError` (user cancelled) is silently swallowed.

#### 4. Payment return handling

On app init, checks `new URLSearchParams(location.search).get("payment")`:

- `payment=success` → reload user data, show toast, navigate `#account`
- `payment=failed` → show toast, navigate `#pricing`
- Clears the query param from URL via `history.replaceState`

No backend changes needed; Tinkoff already redirects to the configured URL.

#### 5. SEO route titles

`document.title` is updated every time `navigate()` or `render()` runs.

```text
home    → DomStudio — AI-студия для продавцов маркетплейсов
studio  → Студия — DomStudio
pricing → Тарифы — DomStudio
account → Аккаунт — DomStudio
history → История генераций — DomStudio
```

### Files changed in this session

```text
domstudio-frontend/src/app.js
domstudio-frontend/src/styles.css
```

### Remaining after this session

1. **ComfyUI / Qwen workflow** — unchanged from above.
2. **Subscription renewal** — fixed in Tier 3 (see below).
3. **Token top-up packs** — implemented in Tier 3 (see below).
4. **Async video job API** — implemented in Tier 3 (see below).

## June 9, 2026 — Evening: Tier 3 Backend (renewal, top-up, video jobs)

### What was built

#### 1. Subscription renewal date

`activate_subscription()` in `payments.py` now sets:

```python
renews_at = datetime.now(timezone.utc) + timedelta(days=30)
```

Previously it was always `None`. The field already existed in the model and
is returned in `/users/me/full`; it was just never populated.

#### 2. Token top-up packs

Sellers can now buy extra tokens without switching plan.

**Backend (`database.py`):**

```python
TOKEN_PACKS = {
    "pack_500":  {"tokens": 500,  "price_rub": 99,  "label": "500 токенов"},
    "pack_1500": {"tokens": 1500, "price_rub": 249, "label": "1 500 токенов"},
    "pack_5000": {"tokens": 5000, "price_rub": 699, "label": "5 000 токенов"},
}
```

Added `pack_id = Column(String(50), nullable=True)` to the `Payment` model.
Existing plan payments have `pack_id = None`; top-up payments have `plan = None`.

New endpoints in `payments.py`:

- `POST /payments/tinkoff/topup` — creates a top-up Payment with `pack_id`,
  calls Tinkoff Init, returns `payment_url`.
- `GET /payments/packs` — returns the list of available packs.
- `activate_topup()` helper — called by the webhook when `payment.pack_id`
  is set; adds tokens without touching the subscription.

Tinkoff webhook now branches: if `payment.pack_id` is set → `activate_topup`,
otherwise → `activate_subscription`.

**Frontend (`app.js` + `styles.css`):**

- `TOKEN_PACKS` constant mirrors backend config.
- `pricingPage()` appends a "Докупить токены" section below the plan grid:
  3 cards (500 / 1 500 / 5 000 токенов) with price and "Купить" button.
- `choosePack(packId)` calls `POST /payments/tinkoff/topup`, redirects to
  Tinkoff on success.
- `[data-pack-id]` wired in `bind()`.
- New CSS: `.topup-section`, `.topup-grid`, `.topup-card`, `.topup-price`.

#### 3. Async video job API

`GenerationJob` model already existed. Added three endpoints to
`generation.py`:

**`POST /generation/video`**

- Validates token balance (costs 300 tokens).
- Creates a `GenerationJob` record with `status=queued`.
- Schedules `_run_video_job()` as a FastAPI `BackgroundTask`.
- Returns `{job_id, status, tokens_charged, token_balance}` immediately.

**`_run_video_job(job_id, req)`** (background):

- Sets job status → `processing`.
- Calls the real ComfyUI video workflow (currently stubbed with
  `asyncio.sleep(5)` until the workflow is wired).
- Sets status → `done` + `output_url` on success.
- Sets status → `failed` and refunds tokens on error.

**`GET /generation/jobs`**

Returns the 20 most recent jobs for the current user.

**`GET /generation/jobs/{job_id}`**

Returns a single job; 404 if it belongs to another user.

Using FastAPI `BackgroundTasks` instead of Redis/Celery keeps the stack
simple. The API surface is identical to what a Redis-backed worker would
expose — swapping in Celery later requires only replacing
`_run_video_job` with a task decorator.

### Tier 3 files changed

```text
domstudio-backend/database.py
domstudio-backend/routers/payments.py
domstudio-backend/routers/generation.py
domstudio-frontend/src/app.js
domstudio-frontend/src/styles.css
DOMSTUDIO_ARCHIVE.md
```

### Still remaining after Tier 3

1. **ComfyUI / Qwen image workflow** — `product_image.json` is still a stub.
   Boot `autodl-container-95c4479bc9-7f1ffc79`, load Qwen image-edit example,
   export API format, replace the file, set `GENERATION_PROVIDER=comfy`.
2. **Video workflow stub** — `_run_video_job` sleeps 5s. Replace with real
   ComfyUI image-to-video call once the workflow is available.
3. **SMS / email OTP service** — not yet wired.
4. **Deployment** — frontend + backend not live yet.
5. **DB migration** — `Payment.pack_id` column needs `ALTER TABLE` on existing
   deployments (new installs get it from `create_all`).

## June 9, 2026 — Evening: Tier 4 (OTP providers, DB migrations, deployment)

Commits: `32c996e`, `cb3e3e1`, `030dfcb`

### What was built

#### 1. Email OTP — Resend

`send_email_otp()` in `auth_utils.py` now makes a real HTTP POST to
`https://api.resend.com/emails` using `httpx`. Falls back to console log
when `RESEND_API_KEY` is unset (dev-friendly).

New env vars: `RESEND_API_KEY`, `EMAIL_FROM`.
API key saved to `.env` (not committed).

#### 2. SMS OTP — SMS.ru

`send_sms_otp()` switched from SMSC.ru (login+password) to SMS.ru
(`api_id` auth). POST to `https://sms.ru/sms/send`. Same console fallback
pattern when `SMS_API_KEY` is unset.

`SMS_LOGIN` env var removed (not needed by SMS.ru).
API key (`FBD1E9E3-…`) saved to `.env`.

Sender name `Domstudio` submitted for registration on SMS.ru.

#### 3. DB migration runner (`migrate.py`)

Standalone `asyncpg` script — no Alembic config needed.

Tracks applied versions in a `schema_migrations` table (safe to re-run).
Three migrations:

- `001` — `ALTER TABLE payments ADD COLUMN IF NOT EXISTS pack_id VARCHAR(50)`
- `002` — `CREATE TABLE IF NOT EXISTS generation_jobs` (for existing DBs that
  predate the Tier 3 model addition)
- `003` — `ALTER TABLE payments ALTER COLUMN plan DROP NOT NULL`

Usage: `python migrate.py` (reads `DATABASE_URL` from `.env`).

#### 4. Deployment configs

- `domstudio-frontend/vercel.json` — SPA rewrite rule + explicit
  `buildCommand: "npm run build"` and `outputDirectory: "dist"` (needed
  because Vercel's auto-detected command included a broken `cd` prefix for
  the monorepo).
- `domstudio-backend/Procfile` — `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- `domstudio-backend/railway.toml` — nixpacks build, health check at `/health`.

#### 5. Frontend live on Vercel

Project: `domstudio3.vercel.app` (Nate-valerian/domstudio, branch: main).
Root directory set to `domstudio-frontend`.
Auto-deploys on push to `main`.

`VITE_API_URL` not yet set — frontend hits `localhost:8000` by default until
the backend is deployed.

### Tier 4 files changed (OTP + migrations + deploy)

```text
domstudio-backend/auth_utils.py
domstudio-backend/.env.example
domstudio-backend/migrate.py          (new)
domstudio-backend/Procfile            (new)
domstudio-backend/railway.toml        (new)
domstudio-frontend/vercel.json        (new)
domstudio-frontend/.env.example
DOMSTUDIO_ARCHIVE.md
```

### Next session — backend deploy (Supabase + Render)

1. Create Supabase project → copy connection string → replace `DATABASE_URL`
2. Deploy FastAPI to Render (free tier) → get public URL
3. Run `python migrate.py` against Supabase once to create all tables
4. In Vercel → Environment Variables → set `VITE_API_URL` to Render URL → redeploy
5. Test registration end-to-end (email OTP → account created → token balance seeded)

## June 10, 2026 — Tier 5: Supabase + Render Deploy

Commits: `0a02c84`

### What was done

#### 1. Supabase database initialized

Connected to the existing Supabase project `domstudio`
(project ref: `zohlbeimqgnzsgrfjniz`, region: `ap-northeast-2`).

Used the **Session Pooler** connection string (IPv4-compatible) because Render
runs on IPv4 and the Direct connection is IPv6-only on the free tier.

Connection string format:
```
postgresql+asyncpg://postgres.zohlbeimqgnzsgrfjniz:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

#### 2. migrate.py fixes

Three bugs fixed in `migrate.py`:

- **BOM encoding** — `.env` saved with UTF-8 BOM on Windows caused
  `os.environ["DATABASE_URL"]` to fail with `KeyError`. Fixed by rewriting
  the file without BOM via PowerShell
  `[System.Text.UTF8Encoding]::new($false)`.

- **Special chars in password** — Supabase-generated passwords contain `[`
  and `]` which break `urlparse`. Replaced `urlparse` with a regex
  (`re.match`) that extracts host/user/password/port/db separately and passes
  them as keyword args to `asyncpg.connect(**_PG_PARAMS)`.

- **Cursor outside transaction** — Supabase Session Pooler rejects
  `conn.cursor()` outside a transaction. Replaced with `conn.fetch()`.

- **Fresh DB** — migrations 001/003 `ALTER TABLE payments` failed because
  tables didn't exist yet. Added SQLAlchemy `create_all()` as the first step
  in `run()` so `migrate.py` works on both fresh and existing databases.

All 3 migrations applied successfully:
```
Base tables ensured.
  [apply] 001 — Add pack_id to payments
  [apply] 002 — Create generation_jobs table
  [apply] 003 — Make payments.plan nullable
Migrations complete.
```

#### 3. Python version pinned for Render

Added `domstudio-backend/.python-version` with `3.11.9`.

Render defaulted to Python 3.14.3 which has no pre-built wheel for
`pydantic-core==2.18.2`. Compilation from source failed due to a read-only
Cargo registry path on Render. Pinning to 3.11 fixes this.

#### 4. Backend live on Render

URL: `https://domstudio.onrender.com`

Health check: `GET /health` → `{"status":"ok","service":"domstudio-api"}`

Render service config:
- Root directory: `domstudio-backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Instance type: Free

Key env vars set on Render:
```
DATABASE_URL        = postgresql+asyncpg://...(Supabase session pooler)
JWT_SECRET          = (random secret)
FRONTEND_URL        = https://domstudio.vercel.app
CORS_ORIGINS        = https://domstudio.vercel.app
RESEND_API_KEY      = (set)
EMAIL_FROM          = DomStudio <noreply@domstudio.ru>
SMS_API_KEY         = (set)
SMS_SENDER          = DomStudio
GENERATION_PROVIDER = worker
```

#### 5. Frontend live on Vercel

URL: `https://domstudio.vercel.app`

`VITE_API_URL` set to `https://domstudio.onrender.com` in Vercel environment
variables. Frontend redeployed and pointing at the live backend.

CORS fixed: initial `CORS_ORIGINS` was set to `domstudio3.vercel.app` but
the actual Vercel domain is `domstudio.vercel.app`. Updated on Render.

### Files changed

```
domstudio-backend/migrate.py
domstudio-backend/.python-version   (new)
```

### What is still not done

1. **End-to-end registration test** — email OTP flow not yet verified on the
   live site. Should test: register → OTP email arrives → account created →
   token balance seeded.

2. **ComfyUI / Qwen image workflow** — `product_image.json` is still a stub.
   `GENERATION_PROVIDER=worker` on Render means generation returns a
   placeholder. Real images require AutoDL + Qwen image-edit workflow.

3. **Video job stub** — `_run_video_job` still sleeps 5s (placeholder).

4. **Render free tier cold starts** — backend sleeps after 15 min inactivity.
   First request after sleep takes ~30s. Acceptable for now; upgrade to paid
   ($7/mo) when real users onboard.
