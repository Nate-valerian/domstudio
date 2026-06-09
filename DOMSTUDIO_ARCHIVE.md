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
