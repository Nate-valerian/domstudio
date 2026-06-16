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

## June 11, 2026 — Tier 6: Registration fixed, E2E verified

### What was done

#### 1. Traced and fixed registration 500 error

Three bugs were found and fixed, one at a time via debug tracing:

**Bug 1 — asyncpg prepared statement cache (cosmetic fix, kept)**

Added `connect_args={"prepared_statement_cache_size": 0}` to the SQLAlchemy
engine in `database.py`. Standard fix for asyncpg + Supabase Session Pooler.
Not the root cause but correct practice.

**Bug 2 — SQLAlchemy native PostgreSQL ENUM types with asyncpg**

Changed all `Column(Enum(...))` to `Column(Enum(..., native_enum=False))` in
`database.py`. Affects: `Subscription.plan`, `Payment.plan`,
`Payment.provider`, `Payment.status`, `GenerationJob.status`.
Without `native_enum=False`, asyncpg cannot register type codecs for custom
PostgreSQL ENUM types and INSERTs fail at commit time.

**Bug 3 — passlib 1.7.4 + bcrypt 4.x incompatibility (root cause)**

`passlib 1.7.4` uses a >72-byte test password internally in `detect_wrap_bug`
to probe for a bcrypt vulnerability. `bcrypt 4.0.0+` added a strict
`ValueError` for passwords over 72 bytes, which crashed passlib's internal
test on every first hash call.

Fix: removed `passlib` entirely. Replaced with direct `bcrypt` calls in
`auth_utils.py`:

```python
import bcrypt as _bcrypt

def hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())
```

`requirements.txt`: removed `passlib[bcrypt]==1.7.4`, added `bcrypt==4.2.1`.

#### 2. Email sender fixed

Resend rejected OTP emails because `domstudio.ru` is not a verified sender
domain. Changed `EMAIL_FROM` on Render to `DomStudio <onboarding@resend.dev>`.
Emails now deliver. For production, verify `domstudio.ru` at resend.com/domains.

#### 3. E2E registration verified

Full flow confirmed working on the live site:
- Register at domstudio.vercel.app → OTP email arrives → enter code → studio opens
- 500 tokens seeded, marketplace presets loaded, generate button visible

### Files changed

```
domstudio-backend/database.py     — asyncpg engine fix + native_enum=False
domstudio-backend/auth_utils.py   — replaced passlib with direct bcrypt
domstudio-backend/requirements.txt — removed passlib, pinned bcrypt==4.2.1
domstudio-backend/main.py         — version marker added/removed during debug
```

### What is still not done

1. **Real image generation** — `GENERATION_PROVIDER=worker` on Render returns
   a placeholder. This is the #1 next priority.

   Steps to fix:
   - Boot AutoDL instance `autodl-container-95c4479bc9-7f1ffc79`
   - Open ComfyUI at `http://127.0.0.1:6006`
   - Load example workflow:
     `/root/autodl-tmp/ComfyUI/custom_nodes/ComfyUI-nunchaku/example_workflows/nunchaku-qwen-image-edit-2509-lightning.json`
   - Upload one product photo, run it, confirm product is preserved
   - Export working graph as API JSON
   - Replace `domstudio-backend/workflows/product_image.json`
   - Set `GENERATION_PROVIDER=comfy` on Render
   - Set `COMFYUI_URL` on Render to the AutoDL tunnel URL

2. **Video job stub** — `_run_video_job` sleeps 5s, no real video.

3. **Resend domain** — verify `domstudio.ru` at resend.com/domains before
   going live with real users. Current sender `onboarding@resend.dev` works
   but looks unprofessional.

4. **Render free tier cold starts** — 30s wake-up after 15 min idle.
---

## June 14, 2026 - End-of-Day Continuation Note

### What was fixed today

- Committed `e29cf5b Fix AutoDL discovery config and backend tests`.
- Backend test suite is green again: `19 tests OK`.
- Frontend production build still passes.
- AutoDL discovery now supports both:
  - `AUTODL_INSTANCE_UUID` for instance/pro snapshot discovery.
  - `AUTODL_DEPLOYMENT_UUID` for legacy elastic deployment discovery.
- `.env.example` and backend README were updated to document both paths.
- Local experiment artifacts and logs were added to `.gitignore`.

### Product direction reminder

React Native mobile app is feasible and likely a good phase-2 path. Use Expo +
React Native, reusing the current FastAPI backend.

Do not start mobile as the main priority yet unless the user explicitly changes
direction. The current gating work is still the sellable core:

1. Prove product-preserving image generation.
2. Make marketplace-ready WB/Ozon/Yandex outputs reliable.
3. Test the full FastAPI `GENERATION_PROVIDER=comfy` path.
4. Only then build the React Native mobile wrapper/app.

### Next best task tomorrow

Run one real product-preserving Catalog test through Comfy/Qwen Image Edit:

1. Start or confirm AutoDL + ComfyUI.
2. Load the Qwen image-edit workflow.
3. Upload one real product photo.
4. Prompt for clean marketplace catalog output while preserving exact product,
   shape, material, color, and label.
5. If the result is good, export API workflow JSON and wire it into the backend.
6. Test `/generation/generate` through FastAPI with `GENERATION_PROVIDER=comfy`.

Do not spend tomorrow on more UI polish or native mobile until generation quality
is proven.

---

## June 15, 2026 - Export Pack Update

### What changed

- Expanded frontend export presets in `domstudio-frontend/src/app.js`.
- Added square 2000, portrait 3:4, landscape 4:3, story crop, banner crop,
  Telegram post, VK post, and WebP square outputs.
- Updated marketplace pack defaults:
  - Ozon now exports as 2000 x 2000 JPEG.
  - Avito now exports as 1600 x 1200 landscape JPEG.
  - Stories and banners now have both fit and crop options.
- Added canvas export layout modes:
  - `fit` keeps the whole image visible on a clean background.
  - `cover` crops to fill the requested aspect ratio.
  - `blur` fills wide/tall formats with a blurred background plus fitted image.
- Removed the old unused `mode-product-real.webp` asset. The app currently uses
  `mode-product-real-v3.webp`.

### Why it matters

DomStudio can now produce more practical deliverables from the same generated
image: marketplace catalog squares, Ozon high-resolution square, Avito
landscape, social posts, stories, banners, and WebP. This makes the export pack
closer to a sellable workflow after generation quality is proven.

### Still not done

- Real product-preserving generation is still the main blocker.
- Need to verify the new export presets visually in the browser before shipping.

## June 16, 2026 - Comfy Workflow Bug Fixed + Live AutoDL Verification

### What was wrong

`generate_image_with_comfy()` in `domstudio-backend/services/comfy_client.py`
selected the right `workflow_file` per mode but never loaded or rendered it
before calling `client.run_workflow(workflow)` — `workflow` was an undefined
variable. Any real request with `GENERATION_PROVIDER=comfy` would fail
immediately with a `NameError`, before ever reaching ComfyUI.

### What changed

- Fixed `comfy_client.py` (line ~481): now calls `load_workflow(workflow_file)`,
  renders it via `render_workflow(...)` with `request`, `image_name`, and
  `expanded_prompt`, and passes the rendered workflow into `run_workflow()`.
- Added a regression test in `tests/test_comfy_client.py`
  (`test_generate_image_loads_renders_and_runs_selected_workflow`) that
  verifies product mode selects `product_image_img2img.json`, substitutes the
  uploaded image name and expanded Qwen prompt into the rendered workflow, and
  that the rendered (not raw) workflow is what gets sent to Comfy.
- Backend test suite: 20/20 passing.
- Committed as `ce97185 Fix unrendered Comfy workflow bug in generate_image_with_comfy`.

### Live verification on remote AutoDL/SeetaCloud box

Connected via `ssh -p 57689 root@connect.westc.seetacloud.com`. Confirmed:

- ComfyUI running on port 6006.
- Qwen model, Qwen CLIP, and Qwen VAE installed and visible to Comfy.
- Product img2img workflow (`product_image_img2img.json`) ran successfully —
  produced a usable preserved-product result (test case: black bottle).
- Catalog BiRefNet workflow ran successfully — produced a transparent cutout;
  backend's white-composite logic correctly turns that into a clean white-bg
  output.

### Known issue to watch

Remote disk is tight: ~2.4 GB free. An unrelated
`z_image_turbo_bf16.safetensors` (~12 GB) is taking most of the space. Will
need to be cleared or the instance resized before heavier generation testing.

### Next step

Get the public 6006 service URL from AutoDL/SeetaCloud, then set in the live
backend env:

```
GENERATION_PROVIDER=comfy
COMFYUI_URL=<public Comfy 6006 URL>
```

Then test `/generation/generate` end-to-end through the deployed frontend —
Catalog mode first, then Product mode.

## June 16, 2026 - New Cloudflare Tunnel Restored (cloudflared was wiped)

### What was wrong

The AutoDL box's `cloudflared` binary was gone (likely wiped on a container
restart — `/usr/local/bin` isn't on the persistent `/root/autodl-tmp` disk),
and no tunnel process was running, so there was no public URL to point
`COMFYUI_URL` at. ComfyUI itself was still alive on port 6006 internally.

### What went wrong trying to fix it

- GitHub downloads from the AutoDL box are extremely slow/unreliable
  (~20-30 KB/s, matches the earlier HuggingFace timeout issue) — a clean
  37MB `cloudflared` binary download would take 20-30 minutes.
- Multiple retry attempts left **3 duplicate `curl` processes** running
  concurrently against the same destination file, splitting bandwidth and
  corrupting the binary (segfault on `--version`).
- A resume attempt (`curl -C -`) hit `curl: (16) Error in the HTTP2 framing
  layer` — a known issue on throttled/unstable connections.
- A second resume attempt with `--http1.1` hit a flat connection timeout —
  GitHub access from the box appears to be intermittently/fully blocked.

### What fixed it

Downloaded `cloudflared-linux-amd64` locally (full, unrestricted internet —
15 seconds for 39MB) and **SFTP'd the binary directly to the remote box**,
bypassing the box's GitHub connectivity entirely. Verified `cloudflared
--version` runs clean, started the tunnel, confirmed the public URL returns
HTTP 200 on `/system_stats`.

### Result

New public tunnel URL (changes again on next AutoDL reboot):

```
https://weapon-steven-norman-importance.trycloudflare.com
```

### Next step

Set in Amvera dashboard:

```
GENERATION_PROVIDER=comfy
COMFYUI_URL=https://weapon-steven-norman-importance.trycloudflare.com
```

Then run one real generation through the deployed frontend — Catalog mode
first, then Product mode. Remote disk is still at ~2.4GB free — watch for
disk-related failures during testing.

**Lesson for next time:** if a remote box's outbound GitHub/HuggingFace
access is slow or blocked, download the asset locally and `sftp.put()` it
across rather than fighting the remote connection.

## June 16, 2026 - First Real Product-Preserving Generation Verified Live (the boss fight)

### What was tested

With `GENERATION_PROVIDER=comfy` and `COMFYUI_URL` set in Amvera to the
restored tunnel, called `/generation/generate` directly against the live
backend (`https://domstudio1-nate.amvera.io`) with a real test account,
using the black perfume bottle product photo
(`domstudio-frontend/src/assets/mode-product-before.webp`) as input.

### Catalog mode — SUCCESS

- Request: `mode=catalog`, subject "black perfume bottle"
- Result: clean white-background cutout, 960x599, bottle shape/color/
  reflections preserved precisely. Genuinely marketplace-ready.
- 100 tokens charged, balance 4300 → 4200

### Product mode — SUCCESS

- Request: `mode=product`, subject "marble table with candles, warm evening
  lighting", style_hint "premium boutique feel"
- Result: 1024x1024, scene fully changed to a marble table with warm lamp
  lighting in the background, bottle shape/color/cap preserved (label detail
  slightly softened vs. the catalog cutout, but clearly the same product).
- First attempt: response was truncated client-side (`IncompleteRead`) over
  the long-running connection — token deduction (4200 → 4100) confirmed the
  generation itself succeeded server-side, just the transfer dropped.
  Retried with `curl -o file` (more robust than Python `urllib` for a large,
  slow streamed response) and got the full 1MB PNG response cleanly.
  Balance 4100 → 4000 on the successful retry.

### Why this matters

This is the actual gating milestone the project has been blocked on: proof
that the Comfy/Qwen pipeline can take a real uploaded product photo and
produce both (a) a clean marketplace catalog cutout and (b) a scene-changed
lifestyle/product shot, while preserving the product itself, end-to-end
through the live deployed backend — not just in an isolated ComfyUI test.

### Next steps

- Test via the actual frontend UI (domstudio.vercel.app) for a full
  user-facing pass, not just direct API calls.
- Try a few more product types (not just a black bottle) to check
  generalization.
- Watch the AutoDL remote disk (still ~2.4GB free) and the trycloudflare
  tunnel (URL rotates on every reboot — re-run the SFTP-binary + tunnel
  steps from the entry above if it goes down).

## June 16, 2026 - Remote Disk Pressure Reduced

User pointed out the AutoDL file-storage page shows 20GB free storage.

Checked the running container:

- `/root/autodl-fs` exists but is a broken symlink to `/autodl-fs/data`.
- `/autodl-fs/data` is not mounted in the current container.
- Therefore the console file store is not usable from this live SSH session
  until AutoDL actually attaches/mounts it to the instance.

What was usable:

- The container root filesystem had about 19GB free.
- Comfy already scans `/root/models` via `extra_model_paths.yaml`.

Action taken:

- Moved the unrelated `z_image_turbo_bf16.safetensors` model (~12GB) from:

```text
/root/autodl-tmp/models/diffusion_models/
```

to:

```text
/root/models/diffusion_models/
```

Result:

- `/root/autodl-tmp` free space improved from ~2.4GB to ~14GB.
- Qwen Image Edit files stayed on `/root/autodl-tmp/models`, so the current
  DomStudio generation path remains unchanged.
- Comfy stayed healthy on port 6006 after the move.

Future note:

If `/root/autodl-fs` is mounted later, prefer moving non-critical or secondary
models there because `/root/models` is useful but less ideal than real attached
file storage.

## June 16, 2026 - Candle Prompt Failure Diagnosed + Prompt Builder Strengthened

User tested the frontend with:

```text
on marbel tabel with candels.
```

and asked why no candles appeared.

Diagnosis:

- The frontend sends the user scene in `subject`, but useful style context
  like warm light / premium minimalism is bundled into `style_hint`.
- Backend `expand_prompt_for_qwen()` was sending only `subject` to DeepSeek
  because raw marketplace/style hints previously confused Qwen.
- If DeepSeek is unavailable or the prompt is weak, the fallback prompt passed
  typo-heavy text straight through (`marbel`, `tabel`, `candels`) and did not
  explicitly require visible props.
- Qwen Image Edit tends to preserve the product and can ignore optional props
  unless the prompt says they must be visible and forbids a plain empty
  background.

Code fix:

- Added scene typo normalization for common product-scene mistakes:
  `marbel -> marble`, `tabel -> table`, `candels -> candles`.
- Strengthened fallback prompt:
  - "Place the product in a new environment..."
  - explicitly include requested props such as candles, marble, table surfaces,
    flowers, or lights.
  - explicitly avoid plain white/empty backgrounds when props are requested.
  - preserve product shape/cap/color/label.
- DeepSeek now receives both normalized scene request and style context, but
  system instructions tell it to ignore marketplace/export/crop/platform noise.

Verification:

- Backend tests increased to 22 and pass.
- Direct remote Comfy test with the typoed request produced a correct result:
  black bottle preserved, visible lit candles behind it, marble surface, warm
  light.

## June 16, 2026 - Amvera Backend Deploy Restored

Problem:

- Amvera was deploying from `master`, while local work was on `main`.
- The Web IDE showed old `master` at commit `782b2cd`, so user force-pushed
  the latest branch state to Amvera `master`.
- After that, deploy moved forward but the container could not start.

Observed Amvera errors:

```text
bash: line 1: uvicorn: command not found
/app/venv/bin/python: No module named uvicorn
ERROR: Error loading ASGI app. Could not import module "main".
```

Diagnosis:

- `requirementsPath` must point at the backend requirements file so Amvera
  installs `uvicorn`.
- Runtime command runs from the repository root, so `uvicorn main:app` cannot
  find `domstudio-backend/main.py`.
- Running `cd domstudio-backend && ...` was rejected by Amvera validation.

Config fix in `amvera.yml`:

```yaml
build:
  requirementsPath: domstudio-backend/requirements.txt
  useCache: false
run:
  command: python -m uvicorn --app-dir domstudio-backend main:app --host 0.0.0.0 --port 80
  persistenceMount: /data
  containerPort: 80
```

Verification:

- Local backend tests passed: 22 tests.
- Local import check from repo root loaded `DomStudio API`.
- Pushed commit `8120bb0` to GitHub `main`, Amvera `main`, and Amvera
  `master`.
- Live health recovered:

```json
{"status":"ok","service":"domstudio-api","v":4,"prompt_version":"visible-props-2026-06-16"}
```

## June 16, 2026 - Six Generation Modes Checked and Separated

User asked to check all six product-photo functions after the candle result
started working.

Finding:

- The frontend exposes six shooting modes:
  `catalog`, `product`, `creative`, `image`, `fitting`, `mobile`.
- Backend workflow routing was technically functional, but only had two real
  branches:
  - `catalog` -> `catalog_birefnet.json`
  - all non-catalog modes -> `product_image_img2img.json`
- That meant Product, Creative, Lifestyle, Fitting, and Stories could behave
  too similarly unless the user prompt carried all the intent.

Fix:

- Added mode-specific prompt objectives before Qwen prompt expansion:
  - Product: premium commercial product photography.
  - Creative: expressive social media campaign visual.
  - Lifestyle (`image`): believable natural environment.
  - Fitting: model-worn result when item type makes sense; otherwise scale/use
    scene.
  - Stories (`mobile`): mobile-first safe-center story composition.
- Catalog remains a clean background/cutout workflow and intentionally has no
  Qwen prompt objective.
- Bumped health marker to:

```json
{"status":"ok","service":"domstudio-api","v":5,"prompt_version":"six-mode-objectives-2026-06-16"}
```

Verification:

- Backend tests now cover all six mode IDs and expected workflow branches.
- Backend tests passed: 25 tests.
- Frontend production build passed.
- Pushed commit `76eebd4` to GitHub `main`, Amvera `main`, and Amvera
  `master`.
- Live Amvera health returned v5 with `six-mode-objectives-2026-06-16`.
