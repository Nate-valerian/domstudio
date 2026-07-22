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
- The Live Scenario media order is Before on the left, autoplay Video in the
  large center card, and AI After on the right.
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

## July 21, 2026 Continuation Note

Completed today:

- Resolved the image usage-accounting decision.
- Tokens remain the only hard image-generation limit.
- Successful image generations now increment `Subscription.photos_used`.
- Failed generations refund tokens without incrementing photo usage.
- Users with top-up tokens may honestly show usage above `photos_limit`.
- Focused generation tests passed: 10 tests.
- Full backend suite passed: 69 tests.
- Implementation and archive commit: `46b9125 Track successful photo usage`.
- `main` and `origin/main` are aligned at `46b9125`.
- Existing untracked preview media, temporary output, ZIP artifacts, and helper
  scripts remain intentionally untouched.

Start tomorrow with the desktop/tablet navigation fix:

1. Reproduce the header at 1024, 1180, 1280, 1366, and 1440px.
2. Check both logged-out and logged-in navigation states.
3. Prevent Login/Register/Create/mode/language controls from being clipped or
   hidden beyond the viewport.
4. Prefer a higher collapsed-navigation breakpoint or progressive action
   simplification; keep the approved wide-desktop design intact.
5. Run the frontend production build and browser viewport checks.
6. Record the result in `DOMSTUDIO_ARCHIVE.md`, commit locally, and do not push
   without explicit approval.

After navigation:

1. Optimize and shorten the homepage:
   - mount only active videos;
   - stop duplicate and off-screen video requests;
   - optimize large images to WebP/AVIF where quality permits;
   - keep the strongest proof on Home and move excess proof to Examples.
2. Build the complete improved frontend and deploy it to `domstudio.site`, so
   the real domain receives the fixes in one intentional release.

Do not restart a broad redesign. Keep the approved orange/cream,
marketplace-first direction.

## July 22, 2026 Continuation Note

Completed:

- Fixed the desktop/tablet header overflow in
  `domstudio-frontend/src/styles.css`.
- Raised only the navigation collapsed-menu breakpoint from 980px to 1620px.
- Kept the rest of the tablet/page layout on its existing 980px breakpoint, so
  the change does not trigger a broad layout redesign.
- Removed the inherited intermediate `max-width` restriction from the open
  navigation panel so its controls remain inside the viewport.
- The approved full desktop header remains active from 1621px upward.
- Login, Register, Create photo, Fast/Advanced mode, language, token/profile,
  and navigation destinations remain accessible through the header or open
  menu in the relevant authenticated/logged-out state.
- Added the full implementation and validation record to
  `DOMSTUDIO_ARCHIVE.md`.
- Implementation/archive commit: `5cc73de Fix responsive header overflow`.
- The production build passed with `VITE_IMGLY_PUBLIC_PATH=cdn`.
- Rechecked the production bundle after the connection interruption across 20
  Russian-language state/viewport combinations:
  - logged out and authenticated;
  - 390, 640, 1024, 1180, 1280, 1366, 1440, 1620, 1621, and 1920px;
  - zero clipped header controls;
  - zero clipped open-menu controls;
  - zero horizontal document overflow.
- Representative 1024px logged-out, 1440px authenticated, and 1920px desktop
  screenshots were inspected.
- `main` and `origin/main` are currently aligned at `5cc73de`.
- Existing untracked preview media, temporary output, ZIP artifacts, and helper
  scripts remain intentionally untouched.
- No production deployment was performed as part of the navigation task.

Tomorrow's primary task: reduce homepage media cost and page length without
changing the approved orange/cream marketplace-first direction.

Implementation order:

1. Establish a fresh production baseline on desktop and mobile:
   - document height;
   - image/video element counts;
   - initial transferred bytes;
   - duplicate, aborted, and off-screen video requests.
2. Fix video loading first:
   - mount only the currently active scenario/showcase video;
   - avoid duplicate video elements for the same active proof;
   - use posters and `preload="none"` for inactive/off-screen media;
   - confirm changing a scenario starts the correct video without retaining the
     previous request.
3. Reduce image weight:
   - identify the largest landing PNG assets from the production build;
   - convert suitable assets to WebP/AVIF while visually checking product and
     text quality;
   - keep originals where conversion causes visible degradation.
4. Shorten Home surgically:
   - retain the hero and strongest marketplace proof;
   - retain three strongest proof/workflow sections, pricing, and a clear final
     CTA;
   - move redundant or deep example collections to Examples instead of
     deleting useful proof;
   - preserve the approved comparison, video-honesty, FAQ, support, and free
     tools decisions unless the new section inventory shows genuine
     duplication.
5. Validate the complete frontend:
   - run the production build with the IMG.LY CDN path;
   - compare before/after page weight and request counts;
   - check desktop and mobile layout, active video switching, and the fixed
     navigation states;
   - archive the measurements and commit the intended files locally.
6. Prepare one intentional custom-domain release:
   - verify the built asset hashes and service-worker cache version;
   - request explicit approval before any push or production deployment;
   - after approval, deploy the completed frontend to `domstudio.site` and
     verify it in a fresh/incognito context.

Do not work on native mobile expansion, a broad visual redesign, permanent
media storage, or paid GPU experiments during this pass.

## July 22, 2026 Release-Preparation Continuation Note

Completed after the homepage optimization sequence:

- Ran the final production build and complete frontend regression.
- Fixed the Tools page's missing `main` landmark without changing its layout.
- Tested nine routes at 390, 640, 1024, 1440, and 1920px in anonymous and
  authenticated states: 90 combinations and 688 passing assertions.
- Confirmed zero horizontal overflow, zero broken images, zero browser/API
  errors, and correct navigation and showcase interactions.
- Bumped and verified the PWA shell cache as `domstudio-shell-v19`; the cached
  application shell also passed an offline reload.
- Confirmed the live SpaceWeb custom domain is still on cache `v5`, while the
  Vercel preview is on cache `v18`; neither currently serves this release.
- Prepared `tmp/domstudio-spaceweb-dist-2026-07-22-v19.zip` as a portable,
  root-level SpaceWeb package.
- Package SHA-256:
  `8D18A31A4C8D8C5BD91E48337BD45B11361543B4B810D80DC7188E7311BC55AB`.
- Preserved all earlier untracked preview/temp artifacts and the old untracked
  deployment ZIP.

Next action only after explicit approval:

1. Push the release-preparation commit.
2. Upload the versioned `v19` ZIP contents to the SpaceWeb document root.
3. Verify `https://domstudio.site`, `https://www.domstudio.site`, their served
   index asset hashes, and service-worker cache `domstudio-shell-v19` in a fresh
   browser context.
4. If the old build remains visible, clear only the site's service-worker/cache
   data and verify again; do not make unrelated frontend changes during release.

## July 23, 2026 Live-Release Continuation Note

The prepared frontend release is now live on SpaceWeb.

- Commit `3537231` is on `origin/main`.
- The versioned `v19` ZIP was extracted into
  `domstudio_site/public_html` without removing `.htaccess`, `cgi-bin`, or
  `yandex.html`.
- Both `https://domstudio.site` and `https://www.domstudio.site` serve the exact
  prepared index, JS, CSS, and service worker hashes.
- Both HTTPS origins run only `domstudio-shell-v19` and pass an offline Home
  reload.
- The production smoke covered all nine routes on mobile and desktop for both
  hosts: 250 assertions, zero failures, zero broken images, and zero horizontal
  overflow.
- The live API permits the custom-domain origin.

Next separate item:

1. Add an HTTP-to-HTTPS redirect to the preserved SpaceWeb `.htaccess`.
2. Upload only the reviewed `.htaccess` change.
3. Confirm `http://domstudio.site` and `http://www.domstudio.site` redirect to
   HTTPS while both secure hosts and SPA fallback routes continue returning the
   v19 application.

Do not rebuild or redeploy the v19 frontend assets for that redirect-only task.

## July 23, 2026 Canonical-Redirect Preparation Note

The redirect-only SpaceWeb update is prepared and locally validated.

- Updated `domstudio-frontend/hosting/.htaccess` to canonicalize HTTP and `www`
  traffic to `https://domstudio.site`.
- Preserved request paths and query strings.
- Preserved the existing IMG.LY proxy and Vite SPA fallback rules.
- Passed a real Apache 2.4 four-case redirect matrix with no syntax error,
  redirect loop, or SPA fallback regression.
- Prepared `tmp/domstudio-spaceweb-https-canonical-2026-07-23.zip`, containing
  exactly the one replacement `.htaccess` file.
- Package SHA-256:
  `6BE542894D6DA9E00E32D8713DB67692350D8C1216392CE1C87CE28205E940FB`.

Next action:

1. Upload that ZIP into `domstudio_site/public_html` and extract it there,
   replacing only `.htaccess`.
2. Do not upload or rebuild the full frontend package.
3. Verify HTTP apex, HTTP `www`, and HTTPS `www` each redirect in one hop to
   HTTPS apex, then recheck the v19 PWA and SPA fallback.

## July 23, 2026 AdPilot Redesign Continuation Note

The AdPilot AI landing experience is redesigned and implemented locally.

- The new campaign desk replaces the centered input and seven identical
  buttons with a product brief, live channel preview, three workflow cards, and
  a collapsible index of all 19 tools.
- WB/Ozon, Avito, VK, and Yandex preview tabs retain the typed product and drive
  the matching existing quick generator.
- Existing detailed tool forms, AI chat, photo-to-AdPilot context, and
  marketplace drafts remain connected.
- Russian and English states are complete.
- Browser checks passed at 390, 640, 1024, 1440, and 1920px with no horizontal
  overflow; anonymous and authenticated behavior was checked.
- The production build passes and is marked with PWA cache
  `domstudio-shell-v20`.

Next actions remain intentionally separate:

1. Push the completed local commits when approved.
2. If the canonical redirect package has not yet been uploaded, deploy and
   verify that one-file `.htaccess` change independently of frontend assets.
3. When ready to release the redesign, prepare a new versioned SpaceWeb package
   from the verified v20 build, upload it as a separate frontend release, and
   repeat the production route/PWA verification matrix.

Do not overwrite the verified v19 production assets until the v20 frontend
release package has been intentionally prepared and approved.

## July 23, 2026 Free Tools Catalog Continuation Note

The Free Tools catalog shell is complete and validated locally.

- The catalog shows 15 tools across 4 categories.
- The 7 existing tools open in dedicated working routes.
- The 8 approved additions are clearly marked Coming soon.
- Search, filters, quick workflow, Russian/English copy, and responsive layouts
  are complete.
- The production build passes and is marked with PWA cache
  `domstudio-shell-v21`.

Next separate item:

1. Show the Smart Crop & Rotate workspace design for approval.
2. After approval, implement and browser-test only that tool.
3. Commit Smart Crop & Rotate separately before moving to Format Converter.

Continue the approved additions one by one; do not activate a catalog card
until its tool is implemented and verified.

## July 23, 2026 AdPilot Image Upload Continuation Note

The missing AdPilot product-image input is now implemented and validated.

- The empty brief shows an obvious optional upload area instead of a stock
  sample image.
- A selected photo shows its real thumbnail and filename with Replace and
  Remove controls.
- Product text and the image survive channel changes and continue into the
  detailed AdPilot generator workspace.
- JPG, PNG, and WebP files up to 10 MB are accepted; unsupported formats are
  rejected.
- The frontend is marked with PWA cache `domstudio-shell-v22`.

Technical boundary:

- The current copy API is text-only. The photo stays in browser context and is
  not uploaded to or analyzed by `/content/generate`.
- Multimodal product recognition would require a separate backend/model task
  and must not be implied by the uploader copy.

Next product task remains Smart Crop & Rotate: show its workspace design first,
then implement and commit it separately after approval.
