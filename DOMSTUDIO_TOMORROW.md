# DomStudio Product Handoff

Created: June 6, 2026

## Required Change Workflow

For every project change:

1. Record what changed in `DOMSTUDIO_ARCHIVE.md` or the relevant handoff note.
2. Validate the change in proportion to its risk.
3. Commit the intended files locally with a clear commit message.
4. Do not push automatically. Ask the user to approve/run the push after the
   commit is ready.

## Mandatory Read First

Before starting any DomStudio work, read this section and follow it.

What went wrong on June 7, 2026:

1. I wasted the user's time and AutoDL money by pushing ahead without respecting
   the actual product requirement.
2. I treated all landing cards with one generic approach, even after the user
   said each card has its own functionality.
3. I made fake "live video" by adding pan/zoom/shaking motion to still images.
   That is not real AI video and must not be presented as video generation.
4. I tried to patch visual symptoms instead of setting up the correct workflow
   per card/mode.
5. I did not stop early enough when the outputs were visibly wrong.
6. I over-relied on Qwen/Nunchaku base image generation for tasks that needed
   image editing, controlled identity preservation, virtual try-on, or real
   image-to-video.

Rules for future work:

1. Do not use one generic treatment for all cards. Each card must demonstrate
   its own capability:
   - Catalog: marketplace cleanup, clean background, accurate product.
   - Product: premium product lighting/composition.
   - Creative: campaign/social creative.
   - Lifestyle: product placed naturally in a scene.
   - Fitting: real virtual try-on workflow, not random redraw.
   - Stories: vertical social/video format.
2. Before/after images must preserve the same product or person unless the user
   explicitly asks for a change. If identity changes, reject the output.
3. Do not call a pan/zoom/shaking still image a video. A 3-second video must use
   a real image-to-video/video workflow with meaningful motion.
4. Do not spend AutoDL/GPU money on broad experiments without a narrow test plan.
   Test one card first, inspect it, then continue.
5. For fitting, product identity, or precise edits, prefer dedicated tools such
   as Flux Kontext / Flux image edit, Qwen Image Edit, or a virtual try-on model.
   Do not assume base Qwen image generation is enough.
6. If outputs are wrong twice in the same direction, stop and change workflow
   instead of generating more variations.
7. Be honest in status updates. Say "not solved" when it is not solved.

## Current Direction

The project is a DomStudio AI product-photo SaaS. The frontend/backend are already
deployable. The product direction is now:

```text
Russian marketplace-first visual studio for WB/Ozon/Yandex sellers.
```

Do not jump into a native iOS/RuStore app yet. First prove the seller workflow on
the website and make the site feel mobile-first/PWA-like. Native mobile becomes
distribution later, after the product flow is validated.

The attempted full dark/premium restyle was rejected because it looked dated. The
old stylesheet was restored. Future UI work should be surgical: improve polish
without replacing the whole visual direction.

## Tomorrow Product Decision

Decision:

Build the marketplace-first website/PWA first, then move to native mobile app
later.

Why:

1. The hard part is not the app wrapper. The hard part is product preservation,
   marketplace exports, pricing, batch generation, and seller workflow.
2. Mobile web can be tested immediately with Russian sellers without App
   Store/RuStore review friction.
3. A native app should be built only after the core paid workflow is proven.
4. The site should already work like a phone app: upload photo, choose
   marketplace, generate, download.

Tomorrow focus:

1. Reposition the site around Russian marketplaces:
   - Wildberries
   - Ozon
   - Yandex Market
   - Avito
   - VK / Telegram seller content
2. Make pricing feel affordable for small sellers:
   - cheap starter pack
   - clear token cost before generation
   - preview/final export split where possible
3. Add or improve the first seller workflows:
   - one-click marketplace preset
   - content pack concept
   - product-preserving catalog cleanup
   - export sizes for marketplace/social
4. Keep native mobile app as a later milestone after the website/PWA flow works.

Do not spend tomorrow designing a native mobile app unless the user explicitly
changes this decision.

## User Constraint

At the beginning, avoid features that create high storage or bandwidth costs.
Prioritize features that are mostly UI, metadata, prompt logic, or client-side
processing.

## Recommended Low-Cost Feature Roadmap

1. Marketplace presets
   - Wildberries
   - Ozon
   - Yandex Market
   - Instagram Post
   - Story 9:16
   - Website Banner
   - Changes prompt, aspect ratio, crop instructions, and output style.

2. Style templates
   - Clean catalog
   - Premium jewelry
   - Cosmetics macro
   - Fashion model
   - Minimal beige
   - Dark luxury
   - Social media creative
   - Mostly prompt presets.

3. Prompt helper
   - Ask product type, platform, desired style, brand colors, and constraints.
   - Generate a strong prompt automatically.

4. Regenerate variations
   - Cleaner
   - More premium
   - Brighter
   - Different background
   - Closer crop
   - More realistic
   - Costs GPU only when the user clicks.

5. Browser-only recent history
   - Store last 5 results in browser localStorage or IndexedDB.
   - Avoid server image storage.
   - Optional auto-delete after 24 hours.

6. Client-side export formats
   - PNG
   - JPG
   - WebP
   - 1080x1080
   - 4:5
   - 9:16
   - Process in browser where possible.

7. Brand preferences
   - Brand colors
   - Preferred background
   - Default marketplace
   - Default style
   - Do-not-use words
   - Tiny database storage.

## Avoid At First

- Batch upload
- Permanent cloud gallery
- Team sharing
- Video generation
- Many 4K upscales
- Large image storage

## Suggested First Implementation Batch

Start with:

1. Marketplace presets
2. Style templates
3. Prompt helper
4. Regenerate buttons
5. Browser-only recent history
6. Client-side export sizes

## July 9, 2026 Current Notes

Homepage landing state:

- The homepage Mini Studio hero uses the approved car Before / After / 5-second
  Video proof. It replaces the unnatural women's outfit proof. Its triplet uses
  the same balanced 4:5 panel proportions as the car card in Examples.
- The Examples gallery is curated and aligned: full-width pastry/soup/car proof
  rows followed by six distinct feature cards in a 3/2/1-column responsive grid.
  The duplicate gold display and repeated vase/jewelry cards are removed.
- On mobile, Live Scenario controls render before the large visual so they are
  immediately usable above the fixed navigation. Pastry and Drinks are separate
  selectable scenarios backed by their approved Before / After / Video assets.
- The look showcase controls should appear immediately under the title:
  scenario chips, then `Create a look`, then descriptive paragraph/bullets.
  If a browser still shows the old order, it is likely a stale service worker
  cache; cache was bumped to `domstudio-shell-v7`.
- The "Photo shoot or DomStudio?" comparison plus video honesty, FAQ, and
  support block is now directly before the Free tools section.
- The gold flacon/cosmetics display card was removed from Examples.
- The stale `Beauty / Cosmetics and displays` category translation keys were
  also removed. Latest source/dist should not contain:
  `Cosmetics and displays`, `example-bottle-creative`, or
  `home.category.beauty`.

Deployment note:

- Vercel must not run `scripts/download-imgly.js`; it can timeout downloading
  ~256 MB of IMG.LY model chunks.
- `domstudio-frontend/vercel.json` uses
  `VITE_IMGLY_PUBLIC_PATH=cdn npm run build`.
- Root `vercel.json` also exists and now uses
  `cd domstudio-frontend && npm ci && VITE_IMGLY_PUBLIC_PATH=cdn npm run build`.
  This matters if the Vercel project root is the repository root.
- Runtime path selection is in `imglyPublicPath()` in
  `domstudio-frontend/src/app.js`.
- Keep `/imgly/` proxy/static behavior for non-Vercel hosting unless we decide
  to make all deployments use the CDN.

## July 10, 2026 Handoff

State:

- `main` is pushed and aligned with `origin/main` at `9eee22d`.
- The latest app build passed locally with `VITE_IMGLY_PUBLIC_PATH=cdn`.
- Remaining untracked files are preview artifacts / temp output / old zip /
  unrelated helper scripts; no tracked app changes are pending.

Start tomorrow by checking the deployed Vercel build:

1. Confirm Vercel deployed commit `9eee22d` or newer.
2. Open in incognito or hard refresh because of PWA service-worker caching.
3. If the old gold flacon card still appears, inspect the deployed JS for
   `Cosmetics and displays` or `example-bottle-creative`; latest build should
   not include either string.
