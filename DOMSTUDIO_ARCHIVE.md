# DomStudio Archive

## June 22, 2026 - Mobile Checkout Return Refresh Hardening

Next implementation step after mobile payment handoff: make the Expo Go return
path less stale after checkout opens.

Implemented in `domstudio-mobile/App.tsx`:

- Pricing now marks checkout as pending before handing off to the secure payment
  URL.
- When the app becomes active again, Pricing automatically reloads plans, token
  packs, payment history, and the account profile.
- Added a localized return-from-checkout status banner for English and Russian.
- If checkout fails to open, the pending refresh state is cleared before showing
  the error.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200.

---

## June 22, 2026 - Mobile Pricing Payment Handoff and Token Packs

Next implementation step after Studio workflow polish: wire mobile Pricing to
real backend payment data and checkout handoff.

Implemented in `domstudio-mobile/src/api.ts`:

- Added `SubscriptionPlan`, `TokenPack`, `PaymentInit`, and
  `PaymentHistoryItem` types.
- Added API methods:
  - `listPlans()` -> `/subscriptions/plans`
  - `listTokenPacks()` -> `/payments/packs`
  - `initPlanPayment()` -> `/payments/tinkoff/init`
  - `initTopUpPayment()` -> `/payments/tinkoff/topup`
  - `listPaymentHistory()` -> `/payments/history`

Implemented in `domstudio-mobile/App.tsx`:

- Pricing screen now loads live backend plans, token packs, and payment history.
- Static plan cards remain as an offline/fallback display.
- Paid plan cards have upgrade buttons that create a Tinkoff checkout and open
  the returned payment URL with `Linking.openURL`.
- Added token top-up section with buy buttons.
- Added recent payment history section.
- Pricing copy now describes the real checkout handoff and account refresh flow.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200.

---

## June 22, 2026 - Mobile Studio Result and Video Workflow Polish

Second implementation step after quota correctness: make the mobile Studio flow
more useful after generation and video queueing.

Implemented in `domstudio-mobile/App.tsx`:

- Added `videoSourceFromJob` and `videoJobToFile` helpers for backend video
  outputs from either `output_url` or base64 `output_data`.
- Added controlled `PlaybackVideo` for generated video output playback with
  native controls and fullscreen support.
- Studio now keeps the queued video job visible below the queue action.
- Added refresh support for the current Studio video job via `/generation/jobs/{id}`.
- Added reusable `VideoJobCard` with:
  - status
  - pending state
  - playable video when ready
  - share action
  - save-to-library action
  - failure/error display
- History video jobs now use the same playable `VideoJobCard` instead of
  text-only rows.
- Photo result panel now has a clearer "Ready result" reveal header and format
  badge.
- Increased generic mobile page bottom padding so Studio/Pricing content clears
  the floating tab bar more comfortably.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200.

---

## June 22, 2026 - Enforce Photo Quota Before Image Generation

User asked to proceed one by one from the missing project implementation list,
starting with account/quota correctness.

Fixed in `domstudio-backend/routers/generation.py`:

- Added atomic `reserve_photo_quota` before image generation.
- Image generation now returns `402 Photo quota exceeded` when
  `photos_used >= photos_limit`.
- Photo quota is released if token charging fails.
- Photo quota and tokens are both released/refunded if the generation worker
  fails after reservation.
- Successful image generation now returns `quota_used` and `quota_limit`.

Updated:

- `domstudio-backend/tests/test_generation.py`
  - Added photo quota exhausted coverage.
  - Updated token failure and worker failure tests for quota release behavior.
- `domstudio-mobile/src/api.ts`
  - Added optional `quota_used` and `quota_limit` fields to `GenerateResult`.

Validation:

```bash
cd domstudio-backend
python -m unittest tests.test_generation
python -m unittest discover -s tests -p "test_*.py"

cd ../domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Generation tests passed, full backend suite passed, mobile typecheck passed,
and the Expo iOS bundle request returned HTTP 200.

---

## June 22, 2026 - Video Examples, Motion Gallery, and Usage Limit Feedback

### Changes

**expo-video integration (`domstudio-mobile/package.json`, `app.json`)**
- Added `expo-video ~3.0.16` dependency and registered the `expo-video` plugin in `app.json`.

**Video assets added (`domstudio-mobile/assets/visual/`)**
- `wine-after-smoke-5s.mp4` — proof-of-concept wine bottle product motion
- `perfume-product-5s.mp4` — perfume bottle product scene motion
- `wine-product-5s.mp4` — wine bottle product scene motion
- `fashion-fitting-5s.mp4` — beige suit virtual fitting motion preview

**`AutoplayVideo` component (`App.tsx`)**
- New reusable component using `useVideoPlayer` + `VideoView` from `expo-video`.
- Always plays muted, looped, inline, no native controls, `contentFit="cover"`.

**Home screen — proof strip videos**
- The third slot (previously a static `proofAfter` image with a "Video" badge) now renders `AutoplayVideo` with `proofVideo` instead of an `<Image>`. Applied in both the English and Russian proof sections.
- Added `homeProofVideo` style: `100% × 100%`, dark `#11110f` background.

**Examples screen — side-by-side image/video cards**
- `exampleImages` entries for Perfume Product and Wine Product now carry a `video` field pointing to their respective `.mp4` assets.
- Gallery renderer branches: cards with a `video` render a `exampleVideoPair` row (image left / autoplay video right, each in `exampleVideoHalf`); cards without a `video` keep the existing single-image layout.
- New `motionExamples` array adds two wide cards at the bottom of the gallery: "Product video" (wine bottle) and "Fitting video" (beige suit), each shown as image + autoplay video pairs.
- New styles: `exampleVideoPair`, `exampleVideoHalf`, `exampleVideo`.

**Pricing screen — usage limit feedback**
- New `usageStatus(value, limit)` helper returns `{ display, overLimit, helper }`.
  - Shows remaining quota when under limit.
  - Shows over-limit count when exceeded.
  - Handles `limit === 0` (no allowance on plan) and missing values gracefully.
- `StatCard` extended with optional `helper` (subtitle text) and `tone?: "default" | "warn"`.
  - Warn tone applies red border/background (`statCardWarn`), red label/value/helper text.
- Photos, Videos, and Premium stat cards now derive display + tone + helper from `usageStatus`.
- `statCard` min-height raised from `82` → `104` to accommodate the helper line.
- New styles: `statCardWarn`, `statLabelWarn`, `statValueWarn`, `statHelper`, `statHelperWarn`.

**Tab bar — focused pill highlight moved to icon**
- Removed `tabBarActiveBackgroundColor: "#fff4cf"` from the navigator options (was coloring the whole tab item background).
- `TabGlyph` now receives `focused: boolean` from the tab bar and applies `tabGlyphActive` (`backgroundColor: "#fff4cf"`, `borderRadius: 15`) only to the glyph wrapper.
- All four tab screens updated to forward `focused` to `TabGlyph`.
- `tabGlyph` base size enlarged to `38 × 30` (from `24 × 24`) to contain the pill highlight.
- `nativeTabItem` background set to `"transparent"` to prevent double highlight.
- New style: `tabGlyphActive`.

---

## June 21, 2026 - Wire Native Language Toggle To App Copy

User reported the Home language toggle only changed the pill text and did not
change the app language.

Fixed in `domstudio-mobile/App.tsx`:

- Moved language state from `HomeScreen` local state to the root app state.
- Passed language and setter through `MainTabs`.
- Updated bottom tab labels from the shared language state.
- Added English/Russian copy for Home, menu, Examples, and Pricing.
- The Home language pill now shows the target language (`RU` / `EN`) and
  updates visible app copy when pressed.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200.

---

## June 21, 2026 - Fix Native Proof Media Blowout

User shared iPhone screenshots showing the native Home proof strip stretching
into a tall cropped mess after the web-parity pass.

Fixed in `domstudio-mobile/App.tsx`:

- Replaced unbounded `minHeight` proof media rows with fixed heights.
- Removed destructive cover/zoom cropping from the Home proof images.
- Tightened mini studio spacing, badge sizes, and upload control scale.
- Applied the same fixed-height guard to the larger proof section.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200.

---

## June 21, 2026 - Native Web-Parity Mobile Pass

User asked to make the mobile app identical to the web app.

Implemented in `domstudio-mobile/App.tsx`:

- Tightened the native Home header to match the web mobile pill nav scale.
- Expanded Home to follow the web page order:
  - dark grid hero
  - primary and secondary CTA
  - mini studio before / after / video proof card
  - warm proof section with stats
  - six mode cards with before overlays and after labels
  - dark workflow section with three steps
- Copied the web example gallery images into `domstudio-mobile/assets/visual/`.
- Rebuilt the native Examples screen around the same perfume/bottle gallery set
  used by web.
- Updated Pricing to mirror the web tariff structure:
  Free, Basic, Pro, Business, with Pro as the dark featured plan.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200.

---

## June 21, 2026 - Native Home Controls + Mobile Branding Pass

User reported the native Home screen felt unresponsive because the burger/menu
and language controls did not react, then asked to continue with point 2:
real mobile branding.

Fixes in `domstudio-mobile/App.tsx`:

- Converted Home language pill from static `View` to `Pressable`.
- Language pill now toggles `RU` / `EN` visibly.
- Converted burger control from static `View` to `Pressable`.
- Added a native menu modal with working actions:
  - Create photo -> Studio
  - Examples -> Examples tab
  - Pricing -> Pricing tab
  - Close
- Added touch feedback to the top Home buttons.
- Cleaned Home platform label to ASCII separators:
  `WB / Ozon / Yandex / Avito`.
- Updated Settings copy so app assets are no longer described as placeholders.

Branding pass:

- Regenerated native raster assets:
  - `domstudio-mobile/assets/icon.png`
  - `domstudio-mobile/assets/adaptive-icon.png`
  - `domstudio-mobile/assets/splash-icon.png`
- Updated `app.json` splash/adaptive icon background to dark DomStudio brand
  color `#1b1322`.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
npx expo config --type public
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed, Expo config resolved, and the iOS Metro bundle request
returned HTTP 200.

---

## June 21, 2026 - Mobile Home Screen Matched To Web Energy

User shared an iPhone Safari screenshot of the web mobile home screen and noted
that it feels attractive and alive. The key gap was that native mobile opened
like a tool shell, while web opens with a real first-impression Home surface.

Implemented in `domstudio-mobile/App.tsx`:

- Added a `Home` tab as the initial logged-in tab.
- Built a native Home screen inspired by the web screenshot:
  - white rounded top nav shell with DS mark, RU pill, and menu glyph
  - dark hero with subtle grid lines/glow
  - "Content that sells" headline with orange highlight
  - orange "Create first photo" CTA that routes to Studio
  - mini studio proof card with Before / After / Video slots
  - product photo upload panel that routes to Studio
  - token/status teaser below the proof card
- Updated the bottom tab bar to feel more app-like:
  - floating rounded white shell
  - warm active-tab background
  - added Home tab glyph
- Aligned visible native tabs with the web mobile screenshot:
  - Home
  - Studio
  - Examples
  - Pricing
- Added lightweight native Examples and Pricing screens so the app no longer
  opens as an internal utility shell.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed. Expo Metro bundle request returned HTTP 200.

---

## June 21, 2026 - Mobile Visual Parity Pass 1

User asked to do point 1 from the five-point audit: native visual parity.

Implemented in `domstudio-mobile/`:

- Copied selected web proof assets into `domstudio-mobile/assets/visual/`:
  - landing before/after wine assets
  - six mode before/after assets for Catalog, Product, Creative, Lifestyle,
    Fitting, and Stories
- Expanded mobile theme tokens with web brand colors:
  - `gold`
  - `night`
  - `nightPanel`
  - `violet`
- Reworked mobile auth intro:
  - stronger product-focused subtitle
  - native before/after proof showcase using the web landing assets
- Reworked mobile Studio:
  - added dark branded Studio hero with token badge and preview rail
  - replaced plain text-only mode tiles with image-led before/after mode cards
  - added mode tags and ratio pills
  - added sample prompt chips for faster seller workflow
  - added selected-mode setup header above prompt controls
- Replaced bottom-tab letter placeholders with simple native-drawn glyphs using
  `View` shapes, avoiding a new icon dependency for this pass.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed. Expo Metro bundle request returned HTTP 200.

Remaining visual work after this pass:

- Real final app icon/splash direction.
- Native examples/gallery screen using the web example sets.
- Better generated-video preview/playback UI once video output handling is
  expanded.
- Real-device visual QA in Expo Go on iPhone 8 Plus and Android.

---

## June 21, 2026 - Mobile/Web Gap Audit

User asked to check the archive and current state because the React Native
mobile version does not feel as attractive as the web version.

Current state:

- Web frontend build passes.
- Mobile React Native typecheck passes.
- Mobile `.env.local` points Expo Go at the live Amvera backend:
  `https://domstudio1-nate.amvera.io`.
- Mobile has the functional V1 shell: auth, OTP, secure tokens, Studio,
  image generation, 3s local video queueing, jobs refresh, local history,
  share/save, account usage cards, settings, offline states.

Why mobile feels weaker than web:

- Web has real product proof assets: before/after images, example galleries,
  landing media, and video previews.
- Mobile uses mostly plain React Native cards, text tabs, and utility screens.
- Mobile tab icons are placeholder letters.
- Mobile does not yet expose pricing/top-ups or native payment handoff.
- Mobile video flow queues a local 3s job only; it does not expose premium
  provider, duration choice, playback, output preview, or share/save video.
- Mobile has no native onboarding/home proof screen, example gallery, before/
  after mode cards, or sample prompts.
- App icon/splash are placeholders.

Recommended next pass:

1. Native visual parity pass: import/reuse web example assets, add branded
   onboarding/home, before/after mode cards, stronger Studio header/result
   reveal, real icons, and final splash/icon direction.
2. Feature parity pass: pricing/plans/top-ups, premium video provider and
   duration selector, video playback/share/save, payment history.
3. Real-device QA: iPhone Expo Go auth/generation/history/settings, then
   Android Expo Go, then one authenticated premium video job against live
   backend.
4. Store-readiness later: EAS build config, privacy/compliance copy, app store
   screenshots, final native payment strategy.

Validation run:

```bash
cd domstudio-mobile && npm run typecheck
cd domstudio-frontend && npm run build
```

Both passed.

---

## June 21, 2026 - Mobile Env Config + Web Login Resolved

### `.env.local` created for mobile

Created `domstudio-mobile/.env.local` (not committed — local only):

```
EXPO_PUBLIC_API_URL=https://domstudio1-nate.amvera.io
```

This points the Expo Go dev build at the live Amvera backend so physical iPhone
auth and generation calls work without needing a LAN backend running.

Web login that appeared broken was resolved — user signed in successfully.
The backend was fine; the issue was account credentials.

Result: confirmed working. iPhone Expo Go rescanned QR, user signed in
successfully against the live Amvera backend. Auth flow end-to-end verified
on physical device.

---

## June 21, 2026 - Expo Go Overlay Fix + Web Login Diagnosis

### Expo Go overlay fix (commits d89366f, b0ccbfe)

Two issues were blocking iPhone Expo Go testing:

1. Service worker registered in dev mode, interfering with Metro hot reload.
   Fix: auto-unregister SW and clear caches in `registerServiceWorker()` when
   `import.meta.env.DEV` is true.

2. Expo dev warning overlay was dimming the screen and eating touches.
   Fix:
   - Replaced deprecated RN `SafeAreaView` with `react-native-safe-area-context`
     `SafeAreaView` + `SafeAreaProvider`.
   - Removed startup `expo-media-library` import that triggered the Android
     permission warning on startup.
   - Added `LogBox.ignoreAllLogs(true)` in dev to suppress overlay.
   - Removed `KeyboardAvoidingView` from auth screen.
   - Set auth `ScrollView` to `keyboardShouldPersistTaps="always"`.

Validation: `npm run typecheck` + `npx expo install --check` + iOS bundle 200.

After these fixes: force-close Expo Go, rescan QR, overlay should be gone.

### Web login issue (open, unresolved)

User reported "login failed" on `domstudio.vercel.app`.

Diagnosis run:

- `GET /health` → 200, backend is alive.
- `GET /version` → Amvera running commit `e4d2174`, `GENERATION_PROVIDER=comfy`.
- CORS preflight for `domstudio.vercel.app` → 200, headers correct.
- `POST /auth/login/email` with wrong credentials → 401 `Invalid credentials`.
  Route itself works.

Root cause is account-specific — either wrong password, unverified account,
or the account was registered with phone not email.

**Resolution path:** use "Забыли пароль?" / "Forgot password?" on the web
login form to reset via email OTP. If that also fails, the account may be
phone-only — try the phone login tab.

---

## June 21, 2026 - Mobile V1 Pass + iPhone 8 Plus Expo Go Compatibility

User asked to build the next mobile pieces that do not require AutoDL. AutoDL is
not needed for mobile app development; it is only needed later for real
generation/video quality tests.

What was built in `domstudio-mobile/`:

- Reworked the starter Expo shell into native bottom-tab navigation:
  - Studio
  - History
  - Account
  - Settings
- Added auth polish against existing backend routes:
  - email login via `/auth/login/email`
  - email registration via `/auth/register/email`
  - email OTP verification via `/auth/verify/email`
  - phone OTP login via `/auth/login/phone`
  - phone OTP verification via `/auth/verify/phone`
  - forgot password via `/auth/forgot-password`
  - reset password via `/auth/reset-password`
  - refresh-token rotation on app boot via `/auth/refresh`
  - logout via `/auth/logout`
- Added camera capture and gallery picker via `expo-image-picker`.
- Added persistent local generated-image history in
  `domstudio-mobile/src/storage.ts`.
- Added native share and save-to-gallery for generated results.
- Added offline/network state using `@react-native-community/netinfo`.
- Added loading, empty, and error states around auth, generation, video jobs,
  history, account refresh, and network transitions.
- Added account usage cards for tokens, plan, photos, videos, and premium video
  quotas from `/users/me/full`.
- Added Settings screen with API URL/device setup guidance.
- Added video job queueing through `/generation/video` and job refresh through
  `/generation/jobs`. This is UI/API-ready, but real video output still depends
  on a backend generation worker.
- Added placeholder app assets:

```text
domstudio-mobile/assets/icon.png
domstudio-mobile/assets/adaptive-icon.png
domstudio-mobile/assets/splash-icon.png
```

Expo/iPhone compatibility:

- Initial mobile scaffold used Expo SDK 56.
- iPhone 8 Plus running App Store Expo Go rejected SDK 56 with:

```text
Project is incompatible with this version of Expo Go.
The project you requested requires a newer version of Expo Go.
```

- Checked current Expo status: App Store Expo Go is effectively on the SDK 54
  line, while SDK 56 Expo Go is not available through the normal iOS App Store
  path.
- Downgraded `domstudio-mobile` to Expo SDK 54 for iPhone 8 Plus / Expo Go
  testing:

```text
expo@~54.0.0
react@19.1.0
react-native@0.81.5
typescript@~5.9.2
```

- Aligned Expo native packages to SDK 54 with `npx expo install --check`.
- Added README note explaining the SDK 54 pin.

Validation:

```text
cd domstudio-mobile
npx expo install --check
npm run typecheck
npx expo config --type public
```

Outcome:

- Dependency check passes.
- TypeScript passes.
- Expo config resolves with `sdkVersion: 54.0.0`.
- Test Metro start with cache clear succeeded on port `8087`.

Metro/Windows note:

- During the SDK downgrade, Metro briefly crashed with:

```text
ENOENT: no such file or directory, watch
node_modules\@react-native\.gradle-plugin-...\react-native-gradle-plugin\src\test\kotlin...
```

- Cause: Windows Metro file watcher tried to watch a transient React Native
  Gradle plugin folder while `node_modules` was changing during install.
- After dependency install settled, `expo start --lan --port 8087 --clear`
  started successfully.
- Machine currently reports `node v24.15.0`. If Expo/Metro shows more odd
  Windows watcher or ESM loader behavior, switch to Node 20 LTS before deeper
  debugging.

Recommended phone test command:

```bash
cd domstudio-mobile
npm run start:lan -- --clear
```

What still needs real-device/backend testing:

- Scan QR on iPhone 8 Plus in Expo Go after SDK 54 downgrade.
- Set `EXPO_PUBLIC_API_URL` to a LAN-reachable backend URL for physical phone
  auth/API testing.
- Login/register/OTP/password reset against a running backend.
- Camera/gallery permissions on the physical phone.
- Save/share result behavior on iOS.
- Real image/video generation only after a generation worker/provider is
  available again.

## June 20, 2026 - React Native Mobile Scaffold Started

User asked whether to create a mobile folder and start React Native after PWA
Phase 1.

What was done:

- Created `domstudio-mobile/` as a separate Expo/React Native app.
- Started from current npm package versions, then aligned to Expo SDK 56's
  compatibility set:
  - `expo@56.0.12`
  - `react-native@0.85.3`
  - `react@19.2.3`
  - `typescript@~6.0.3`
- Added native project files:

```text
domstudio-mobile/App.tsx
domstudio-mobile/src/api.ts
domstudio-mobile/src/theme.ts
domstudio-mobile/app.json
domstudio-mobile/package.json
domstudio-mobile/tsconfig.json
domstudio-mobile/babel.config.js
domstudio-mobile/.env.example
domstudio-mobile/README.md
```

Current mobile scope:

- Email login via existing backend `/auth/login/email`.
- Secure token storage via `expo-secure-store`.
- Account load via `/users/me/full`.
- Product image picker via `expo-image-picker`.
- Photo generation via `/generation/generate`.
- Result preview and native sharing via `expo-sharing`.
- In-session history tab.
- Account tab with token/plan view and sign out.

Validation:

```text
cd domstudio-mobile
npm install
npx expo install --check
npm run typecheck
Dependencies are up to date
tsc --noEmit passed
```

Notes:

- `npx create-expo-app@latest` timed out before creating files, so the Expo
  scaffold was created manually.
- `npm install` completed and created `package-lock.json`.
- npm reported 11 moderate dependency vulnerabilities from the fresh Expo/RN
  dependency tree; no app code vulnerability was identified in this pass.
- The app currently uses `EXPO_PUBLIC_API_URL`; physical phones need a LAN URL,
  Android emulator usually needs `http://10.0.2.2:8000`.
- Final checkpoint before commit:
  - `npm run typecheck` passed.
  - `npx expo install --check` passed.
  - Metro was listening on `http://localhost:8082`.
  - Native result sharing was cleaned up to preserve the returned image format
    instead of always writing a `.jpg`.
- Next pass: registration/OTP, video jobs, persistent native history, payments,
  and real-device smoke testing.

## June 20, 2026 - PWA Phase 1 Completion + 6 Formats Copy Fix

User asked to finish Phase 1 PWA before starting React Native.

What was done:

- Confirmed the frontend already had PWA foundations:
  - `domstudio-frontend/public/manifest.json`
  - `domstudio-frontend/public/sw.js`
  - app icons
  - mobile web app meta tags
  - production-only service worker registration
- Added a product-facing PWA install banner around the browser
  `beforeinstallprompt` event.
- Added install/dismiss handling with local persistence:
  - `PWA_INSTALL_DISMISSED_KEY=domstudio_pwa_install_dismissed`
  - install prompt hidden after install or dismissal
- Added online/offline state tracking:
  - offline banner
  - online/offline toasts
  - API requests fail early with a clear offline message
  - generate buttons disabled while offline
- Improved mobile result sharing:
  - image results use native file share when available
  - image fallback copies to clipboard or downloads
  - video results now get a share button too
  - video share uses native file share where supported, else downloads
- Added download success feedback for manual image export.
- Bumped service worker shell cache:

```text
domstudio-shell-v2 -> domstudio-shell-v3
```

- Fixed homepage proof stat copy:

```text
3 formats -> 6 formats
3 формата -> 6 форматов
```

Files changed:

```text
domstudio-frontend/src/app.js
domstudio-frontend/src/styles.css
domstudio-frontend/src/i18n.js
domstudio-frontend/public/sw.js
```

Validation:

```text
cd domstudio-frontend
npm run build
vite build passed
```

Production preview was started locally and verified:

```text
http://127.0.0.1:4174/
/manifest.json -> 200
/sw.js -> 200
sw.js includes domstudio-shell-v3
```

Current note:

- These changes are implemented and verified locally.
- They are not yet committed at this archive point.
- Next sensible step after deploying this PWA polish is real-device testing:
  Android Chrome install, iPhone Safari Add to Home Screen, upload/camera,
  share/download, offline banner, and installed-app launch.

## June 20, 2026 - Archive Read + Current Continuation Point

User asked twice:

```text
continue,read archive
```

What was done:

- Read `DOMSTUDIO_ARCHIVE.md`, `DOMSTUDIO_TOMORROW.md`, and
  `DOMSTUDIO_COMFY_HANDOFF.md`.
- Checked the repository status and recent commits before continuing.
- Confirmed the local tree has no product-code diffs at this checkpoint.
- The older archive note saying video quota work was uncommitted is now stale:
  that work is committed as:

```text
c9c4b93 Enforce video plan quotas
```

Recent committed state:

```text
d89366f Bypass service worker in dev mode
0590b17 Fix service worker media caching
9af9ee1 Polish PWA install metadata
8afbd3f Polish mobile result flow
889828f Match mobile nav bar dimensions
4b67ce6 Start mobile PWA shell
011ad64 Archive Wan motion samples
d536481 Add Wan live sample preview
a185111 Shorten video provider copy
c9c4b93 Enforce video plan quotas
```

Current continuation point:

1. Frontend mobile/PWA shell and service-worker fixes are committed.
2. Backend video plan quota enforcement is committed.
3. Local Wan video works technically but still drifts product composition and
   should remain experimental, not marketed as reliable marketplace video.
4. Premium ByteDance video is the higher-quality paid path and should be tested
   separately when `COMFYUI_ALLOW_PAID_PARTNER_NODES=true`.
5. Production still needs deployed database migration:

```text
python migrate.py
```

6. Live Amvera env still needs operational verification for the current tunnel:

```env
COMFYUI_URL=https://aaron-firm-meeting-cattle.trycloudflare.com
```

Recommended next work:

- If continuing product/code locally: verify backend tests and frontend build,
  then improve the Wan workflow conservatively before spending more samples.
- If continuing deployment: update/verify Amvera env, run `python migrate.py`
  on the deployed backend DB, then run live `/version`, image, premium video,
  and quota smoke checks.

Validation after reading archive:

```text
cd domstudio-backend
python -m unittest discover -s tests -v
Ran 44 tests
OK

cd domstudio-frontend
npm.cmd run build
vite build passed
```

Note:

- `npm run build` through PowerShell hit local script policy on `npm.ps1`.
- `npm.cmd run build` in the sandbox initially hit a parent-directory read
  boundary while esbuild resolved `vite.config.js`.
- Running the same `npm.cmd run build` with normal filesystem access passed.

## June 20, 2026 - Amvera Deploy Verification + Migration Start Command

User said:

```text
next
```

Deployment verification performed:

- Checked live Amvera `/health`: service was healthy.
- Checked live Amvera `/version` before deploy:
  - commit: `3bb8b51ead17`
  - branch: `master`
  - `COMFYUI_URL` host: `ballot-ide-shakira-vienna.trycloudflare.com`
- Checked old Comfy tunnel:
  - `ballot-ide-shakira-vienna.trycloudflare.com` no longer resolved.
- Checked archived new Comfy tunnel:
  - `aaron-firm-meeting-cattle.trycloudflare.com/system_stats` returned HTTP
    200.
  - GPU: RTX 4080 SUPER.
- Confirmed Amvera `master` was 15 commits behind local/GitHub `main`.
- Pushed local `main` to Amvera deploy branch:

```text
git push amvera main:master
3bb8b51..d89366f  main -> master
```

After Amvera restarted, live `/version` reported:

```text
commit=d89366f2ad86
branch=master
COMFYUI_URL host=aaron-firm-meeting-cattle.trycloudflare.com
COMFYUI_ACCOUNT_API_KEY present=true
COMFYUI_ALLOW_PAID_PARTNER_NODES=false
COMFYUI_VIDEO_WORKFLOW=product_video_wan_local.json
COMFYUI_PREMIUM_VIDEO_WORKFLOW=product_video.json
```

Public plan check after deploy:

```text
GET /subscriptions/plans
```

now returns video limits:

```text
Free: videos=5, premium_videos=0
Basic: videos=30, premium_videos=10
Pro: videos=50, premium_videos=33
Business: videos=100, premium_videos=99
```

Migration smoke:

- Tried throwaway email registration:

```text
POST /auth/register/email
email=domstudio-smoke-20260620200412@example.com
```

- Result:

```text
HTTP 500 Internal Server Error
```

Interpretation:

- Since the new code creates a `Subscription` with `videos_used`,
  `videos_limit`, `premium_videos_used`, and `premium_videos_limit`, this 500 is
  consistent with migration `005` not having been applied yet.
- No local Amvera CLI or production `DATABASE_URL` was available, so the
  migration could not be run manually from this machine.

Code/deploy fix made:

- Updated `amvera.yml` so Amvera runs the idempotent migration runner before
  starting Uvicorn:

```text
python domstudio-backend/migrate.py && python -m uvicorn --app-dir domstudio-backend main:app --host 0.0.0.0 --port 80
```

Files changed:

```text
amvera.yml
DOMSTUDIO_ARCHIVE.md
```

Validation:

```text
python -m py_compile domstudio-backend/migrate.py
cd domstudio-backend
python -m unittest discover -s tests -v
Ran 44 tests
OK
```

Remaining live configuration note:

- Premium ByteDance video will still be blocked until Amvera env has:

```env
COMFYUI_ALLOW_PAID_PARTNER_NODES=true
```

- The Comfy account API key is present, and the premium workflow file exists.

Follow-up after committing and pushing the migration start command:

```text
commit=582ca69 Run migrations before Amvera startup
git push origin main
git push amvera main:master
```

Amvera restart verification:

```text
GET /version
commit=582ca696f620
branch=master
COMFYUI_URL host=aaron-firm-meeting-cattle.trycloudflare.com
```

The app returned to healthy status after several temporary `503 Service
Unavailable` responses during the rebuild/restart window.

Production migration verification:

```text
POST /auth/register/email
email=domstudio-smoke-20260620200732@example.com
HTTP 201
message=Verification code sent to email
user_id=abf9c5e8-7f12-4fca-830f-175ba6a047ad
```

Conclusion:

- Migration `005` was applied successfully in the deployed Amvera environment.
- New user creation now works with the video quota subscription columns.
- Public plans expose video and premium video limits.
- Remaining blocker for premium ByteDance video is only the env flag:
  `COMFYUI_ALLOW_PAID_PARTNER_NODES=true`.

## June 20, 2026 - Premium Partner Node Flag Verified Live

User reported:

```text
done : COMFYUI_ALLOW_PAID_PARTNER_NODES=true
```

Verification:

- Polled live Amvera `/version`.
- The running app initially still reported:

```text
allow_paid_partner_nodes=false
commit=3f5abaf90bd3
```

- Since the env change had not restarted the app, created an empty operational
  commit to trigger Amvera redeploy:

```text
bd9b1a4 Restart Amvera for premium video env
```

- Pushed to GitHub `main` and Amvera `master`.
- After temporary `503 Service Unavailable` responses during restart, live
  `/version` reported:

```text
commit=bd9b1a44ff0d
COMFYUI_URL host=aaron-firm-meeting-cattle.trycloudflare.com
COMFYUI_ACCOUNT_API_KEY present=true
allow_paid_partner_nodes=true
premium_video_workflow=product_video.json
premium_video_workflow exists=true
```

Conclusion:

- Premium ByteDance/Comfy Partner node execution is now enabled on the live
  Amvera backend.
- The remaining validation step is to run one authenticated premium video job
  through `/generation/video` with `video_provider=premium`.

## June 20, 2026 - Standing Archive Rule + Mobile Version Question

User asked:

```text
can we build mobile version now ? btw always take note, always archive our convo and cchanges
```

Standing instruction going forward:

- Always keep notes in this archive for meaningful conversation decisions,
  operational findings, and code/product changes.
- When code changes are made, archive what changed, why it changed, files
  touched, validation run, and any remaining risks.
- Preserve important deployment URLs, env requirements, live smoke results,
  blockers, and next steps.

Mobile direction at this point:

- Yes, a mobile version can be started now.
- The recommended first mobile version is still the mobile-web/PWA product flow
  unless the user explicitly wants native iOS/Android/RuStore first.
- Reason: DomStudio already has a Vite frontend and FastAPI backend, real
  generation routes, pricing, auth, and PWA basics. The fastest useful mobile
  milestone is to make the existing seller workflow feel app-native on phones:
  upload photo, choose marketplace/mode, generate image or video, export.
- Native app can follow after the mobile web flow is polished and the paid
  workflow is stable.

Implementation started in the same session:

- Added a mobile-only bottom tab bar to make the PWA feel more like an app.
  Logged-in users see Home, Studio, History, Account. Logged-out users see
  Home, Studio, Examples, Pricing.
- Added a compact mobile creation step strip in Studio:
  `Setup -> Upload -> Result`.
- Added a mobile-only sticky generate bar above the bottom tabs so the main
  create action stays reachable while scrolling the form.
- Kept the desktop layout unchanged by hiding the new app shell controls above
  640px.
- Improved mobile Studio spacing: tighter workspace padding, larger input tap
  targets, result panel padding, sticky Photo/Video toggle, and safe-area
  spacing for iPhone home indicators.
- Added a lightweight PWA service worker:
  - caches the app shell, manifest, and icons
  - caches same-origin static assets after first load
  - uses a network-first strategy for page navigations with cached shell
    fallback
  - avoids caching auth, generation, and payment routes

Files changed:

```text
domstudio-frontend/src/app.js
domstudio-frontend/src/styles.css
domstudio-frontend/public/sw.js
DOMSTUDIO_ARCHIVE.md
```

Validation:

```text
cd domstudio-frontend
npm run build
```

Result:

```text
vite build passed
dist/sw.js present
```

Local dev server started for review:

```text
http://127.0.0.1:5173/
```

Follow-up QA/fix:

- User requested that the upper mobile nav and footer/bottom nav be identical
  in size.
- Adjusted mobile CSS so the top nav shell and bottom tab shell both use the
  same 64px visual height.
- Follow-up clarification: user said height and length must both be the same.
- Adjusted the top mobile nav side padding from 10px to 8px so both visible
  shells use the same viewport width:
  - top nav visible shell: `left/right 8px`
  - bottom nav visible shell: `left 8px`, `width: calc(100vw - 16px)`
- Increased mobile top nav controls from 38px to 42px to match the bottom tab
  proportions.
- Forced fixed mobile bars to use explicit viewport widths to avoid screenshot
  or layout clipping.
- Reduced mobile heading scale and added safer word wrapping after QA showed
  Russian headings and body text could clip at 390px width.

Validation:

```text
cd domstudio-frontend
npm run build
npx -y playwright@latest screenshot --channel chrome --block-service-workers --viewport-size=390,844 http://127.0.0.1:5173/ temp-preview\mobile-pwa-home-nav-match.png
npx -y playwright@latest screenshot --channel chrome --block-service-workers --viewport-size=390,844 http://127.0.0.1:5173/ temp-preview\mobile-pwa-nav-size-equal.png
```

Result:

- Build passed.
- Playwright screenshot showed matching top and bottom mobile nav shells in
  both height and width.

Next mobile Studio polish:

- Added mobile-only result reveal behavior after generation completes.
- When a photo generation succeeds on a phone viewport, the app now scrolls the
  result panel into view automatically.
- When a video job completes with output on a phone viewport, the app also
  scrolls to the result panel.
- This keeps the long mobile Studio form from feeling stuck at the submit area
  after generation finishes.

Files changed:

```text
domstudio-frontend/src/app.js
DOMSTUDIO_ARCHIVE.md
```

Validation:

```text
cd domstudio-frontend
npm run build
```

Result:

```text
vite build passed
```

PWA install metadata polish:

- Updated `domstudio-frontend/public/manifest.json` with:
  - `id`
  - `scope`
  - `orientation: portrait`
  - app shortcuts for Studio and Pricing
- This makes the mobile-web install metadata more complete for Chrome/Android
  and standalone PWA launches.

Files changed:

```text
domstudio-frontend/public/manifest.json
DOMSTUDIO_ARCHIVE.md
```

Validation:

```text
node -e "JSON.parse(require('fs').readFileSync('domstudio-frontend/public/manifest.json','utf8')); console.log('manifest ok')"
cd domstudio-frontend
npm run build
```

Result:

```text
manifest ok
vite build passed
```

Service worker media cache error fix:

User reported browser console errors:

```text
Failed to execute 'put' on 'Cache': Partial response (status code 206) is unsupported
GET .../perfume-product-5s.mp4 net::ERR_FAILED
GET .../wine-product-5s.mp4 net::ERR_FAILED
GET .../fashion-fitting-5s.mp4 net::ERR_FAILED
```

Cause:

- The service worker tried to cache MP4 requests.
- Browsers request video files with `Range` headers.
- Range responses return HTTP `206 Partial Content`.
- Cache Storage does not allow `cache.put()` for partial `206` responses.

Fix:

- Bumped service worker cache version to `domstudio-shell-v2`.
- Bypassed service-worker handling for requests with a `Range` header.
- Bypassed service-worker handling for media file extensions:
  `.mp4`, `.mov`, `.webm`, `.mkv`, `.mp3`, `.m4a`, `.wav`, `.ogg`.
- Limited cache writes to full `200` responses only.
- Added `.catch(() => {})` around async cache writes so a cache write failure
  cannot break the fetch response.

Files changed:

```text
domstudio-frontend/public/sw.js
DOMSTUDIO_ARCHIVE.md
```

Validation:

```text
node --check domstudio-frontend/public/sw.js
cd domstudio-frontend
npm run build
```

Result:

```text
service worker syntax OK
vite build passed
```

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

## June 17, 2026 - Six-Mode Real Generation Comparison

User asked to actually generate one image in each of the six modes from the
same product and compare outputs.

Input:

- Shared source image:
  `domstudio-frontend/src/assets/mode-product-before.webp`
- Comfy tunnel used:
  `https://weapon-steven-norman-importance.trycloudflare.com`
- Local output folder:
  `six-mode-comparison/`

Results:

- `catalog` succeeded: clean white-background product cutout, 960x599.
- `product` succeeded: square 1024x1024, premium marble/candle product scene.
- `creative` succeeded: square 1024x1024, bold social campaign look with
  stronger color/lighting.
- `image` succeeded: square 1024x1024, warmer lifestyle desk/interior scene.
- `fitting` succeeded: square 1024x1024, hand/model scale cue.
- `mobile` succeeded but exposed a bug: it was still square 1024x1024 because
  the Comfy workflow latent size was hardcoded.

Fix after comparison:

- Added per-mode generation dimensions in `services/comfy_client.py`.
- `mobile` now uses vertical story dimensions: 768x1344.
- `product_image_img2img.json` now uses `{{width}}` and `{{height}}`
  placeholders instead of hardcoded 1024x1024.
- Added tests for mobile vertical dimensions and workflow rendering.
- Bumped health marker to:

```json
{"status":"ok","service":"domstudio-api","v":6,"prompt_version":"six-mode-objectives-vertical-mobile-2026-06-16"}
```

Verification:

- Backend tests passed: 27 tests.
- Frontend production build passed.
- Regenerated `mobile-vertical.png`; output was 768x1344.

Remaining quality note:

- The first vertical mobile sample was correctly vertical and story-safe, but
  too plain and did not show the requested candles/marble strongly enough.
- Tightened the mobile prompt directive so requested props should appear in the
  lower third or side areas instead of being dropped for empty safe space.
- Next visual check should regenerate mobile once more after deploy and inspect
  whether candles/marble survive in the vertical frame.

## June 17, 2026 - New AutoDL GPU Instance + Cloudflare Tunnel Rebuilt

User changed the AutoDL GPU instance and provided new SSH access.

New instance:

- Host: `connect.westc.seetacloud.com`
- SSH port: `38677`
- Container hostname: `autodl-container-7ed8449195-caf9a9eb`
- GPU: NVIDIA GeForce RTX 4080 SUPER, 32760 MiB VRAM
- ComfyUI path: `/root/autodl-tmp/ComfyUI`
- ComfyUI runs on port `6006`
- Prepared Python environment: `/root/miniconda3/bin/python`

Checks/fixes:

- Confirmed Miniconda environment has the needed libraries:
  torch, torchvision, torchaudio, nunchaku, diffusers, transformers,
  safetensors, Pillow, OpenCV, numpy.
- Found Nunchaku custom node present but disabled. Re-enabled it by copying:

```text
/root/autodl-tmp/ComfyUI/custom_nodes/.disabled/ComfyUI-nunchaku@1_0_0
```

to:

```text
/root/autodl-tmp/ComfyUI/custom_nodes/ComfyUI-nunchaku
```

- Confirmed Comfy `/object_info` sees:
  - `NunchakuQwenImageDiTLoader`
  - `CLIPLoader`
  - `VAELoader`
  - `TextEncodeQwenImageEdit`
  - `AutoDownloadBiRefNetModel`
- Confirmed required Qwen files are visible:
  - `svdq-int4_r128-qwen-image-edit-2509-lightning-4steps-251115.safetensors`
  - `qwen_2.5_vl_7b_fp8_scaled.safetensors`
  - `qwen_image_vae.safetensors`
- Moved unrelated `z_image_turbo_bf16.safetensors` off
  `/root/autodl-tmp` to free the data disk.

Cloudflare:

- Local `cloudflared-linux-amd64` binary was uploaded to the instance.
- Because the first upload left `/usr/local/bin/cloudflared` temporarily busy,
  a fresh copy was used at:

```text
/usr/local/bin/cloudflared-domstudio
```

- New public tunnel:

```text
https://jpeg-acts-development-jefferson.trycloudflare.com
```

Verification:

- Public tunnel `/system_stats` returned 200 and reported ComfyUI 0.3.75,
  Python 3.12.3, PyTorch 2.5.1+cu124, RTX 4080 SUPER.
- Real DomStudio smoke outputs were generated locally in
  `new-autodl-smoke/`:
  - `catalog.png`
  - `product.png`
- Product/Qwen smoke result preserved the product and showed marble/candles.

Catalog issue found and fixed:

- First catalog smoke failed because AutoDL had a broken partial
  `General-HR.safetensors` BiRefNet file (~61MB).
- The instance already had a complete `General.safetensors`.
- Patched `domstudio-backend/workflows/catalog_birefnet.json` to use
  `General` instead of `General-HR` so catalog mode does not depend on the
  corrupted HR auto-download.

Production action needed:

- Amvera backend variable `COMFYUI_URL` must be set to:

```text
https://jpeg-acts-development-jefferson.trycloudflare.com
```

- Then restart/redeploy Amvera so the backend uses the new tunnel.

## June 18, 2026 - Same AutoDL Instance Cloudflare Restored

User kept the same AutoDL instance:

```text
ssh -p 38677 root@connect.westc.seetacloud.com
autodl-container-7ed8449195-caf9a9eb
```

Status verified:

- ComfyUI is still running on port `6006`.
- Public Cloudflare tunnel is running via `/usr/local/bin/cloudflared-domstudio`.
- Public tunnel URL:

```text
https://jpeg-acts-development-jefferson.trycloudflare.com
```

Verification:

- Public `/system_stats` returned HTTP 200 and showed RTX 4080 SUPER.
- Public `/object_info` confirmed:
  - `qwen_2.5_vl_7b_fp8_scaled.safetensors`
  - `qwen_image_vae.safetensors`
  - `svdq-int4_r128-qwen-image-edit-2509-lightning-4steps-251115.safetensors`

Local helper script `generate_card_images.py` now points at:

```text
COMFYUI_URL=https://jpeg-acts-development-jefferson.trycloudflare.com
```

Next step: set the same URL as `COMFYUI_URL` in Amvera and test one real
generation through the live backend/frontend.

## June 18, 2026 - WIP Video Generation + UI Fix Handoff

Current git state at pause:

- Last pushed commit before this WIP: `6fc80c0 Add video generation workflow support`.
- The following WIP files are modified locally and not yet committed:
  - `domstudio-backend/.env.example`
  - `domstudio-backend/routers/generation.py`
  - `domstudio-backend/services/comfy_client.py`
  - `domstudio-frontend/src/app.js`
  - `domstudio-frontend/src/i18n.js`
  - `domstudio-frontend/src/styles.css`
  - new file: `domstudio-backend/workflows/product_video.json`

UI fix completed:

- Fixed recent-results overflow in the Studio panel.
- Cause: `.history-item b` had ellipsis, but the grid child did not have
  `min-width: 0`, so long prompts forced the whole card wider.
- Added:

```css
.history-item > div { min-width: 0; overflow: hidden; }
.history-item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

Video duration decision:

- User changed v1 duration range from `3-5 sec` to `3-12 sec`.
- Backend `VideoRequest.duration_s` is now:

```python
duration_s: int = Field(default=3, ge=3, le=12)
```

- Frontend now generates duration options from `3` through `12`:

```js
const VIDEO_DURATIONS = Array.from({ length: 10 }, (_, index) => index + 3);
```

- Frontend clamps manual values to `3-12`.
- RU/EN UI note now says video is a `3-12 second` job.

Video workflow work:

- Inspected available ComfyUI video nodes from `/object_info`.
- Native/local video model path is not usable yet:
  - no SVD checkpoint installed
  - no Wan diffusion model/VAE installed for local Wan video
- Installed API video nodes include several providers.
- ByteDance image-to-video node is the best match for the user’s `3-12 sec`
  requirement because it supports:
  - `duration` integer min `3`, max `12`
  - `resolution`: `480p`, `720p`, `1080p`
  - `aspect_ratio`: `adaptive`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `21:9`

Added WIP workflow:

```text
domstudio-backend/workflows/product_video.json
```

It uses:

- `LoadImage`
- `ByteDanceImageToVideoNode`
- `SaveVideo`

Current workflow settings:

- model: `seedance-1-0-lite-i2v-250428`
- resolution placeholder: `{{video_resolution}}`
- aspect ratio placeholder: `{{video_aspect_ratio}}`
- duration placeholder: `{{duration_s}}`
- output: `mp4`, `h264`
- watermark: `false`

Backend Comfy helper changes:

- Added `{{video_resolution}}`, defaulting to env:

```text
COMFYUI_VIDEO_RESOLUTION=720p
```

- Added `video_aspect_ratio(mode)`:
  - `mobile` -> `9:16`
  - all other modes -> `1:1`

- `.env.example` now includes:

```text
COMFYUI_VIDEO_WORKFLOW=product_video.json
COMFYUI_VIDEO_RESOLUTION=720p
```

Backend route change:

- `/generation/video` now requires an uploaded product photo:

```python
if not req.image:
    raise HTTPException(400, "Product photo is required for video generation")
```

Reason: the selected workflow is image-to-video; allowing no image would fail
later and feel broken.

Validation already run:

- Frontend build passed:

```text
npm run build
```

- Backend compile passed:

```text
.\venv\Scripts\python.exe -m py_compile main.py routers/generation.py services/comfy_client.py database.py migrate.py
```

- Static workflow input check passed against the node schema captured from
  ComfyUI earlier.
- Local render test for `product_video.json` passed:
  - image placeholder became `upload_test.jpg`
  - duration rendered as integer `12`
  - resolution rendered as `720p`
  - mobile aspect ratio rendered as `9:16`
  - output format rendered as `mp4 h264`

Known blocker / next check:

- The Comfy URL that worked earlier stopped resolving during the final live
  schema validation attempt (`getaddrinfo failed`).
- Tomorrow first step: confirm the Cloudflare/Comfy URL is alive, then run one
  actual video generation through Comfy using `product_video.json`.

Tomorrow plan:

1. Restore/check Comfy Cloudflare tunnel and `/object_info`.
2. Run one direct backend/Comfy smoke test for `/generation/video`.
3. If ByteDance node requires provider credentials, capture the exact error and
   decide whether to configure that provider or switch to another installed API
   node.
4. Confirm output MP4 downloads through `/generation/jobs/{job_id}`.
5. Commit and push the WIP changes only after one real video smoke succeeds or
   after we intentionally decide to ship the UI with a provider-config warning.
6. After video works, decide together which video examples to show on the
   Examples page.

## June 18, 2026 - New AutoDL Instance + Cloudflare URL Updated

User provided a new AutoDL instance:

```text
ssh -p 31079 root@connect.westd.seetacloud.com
```

Instance status:

- Hostname: `autodl-container-233rvqugpm-c59b3946`
- GPU: NVIDIA GeForce RTX 4080 SUPER, 32760 MiB VRAM
- ComfyUI path: `/root/autodl-tmp/ComfyUI`
- ComfyUI is running on port `6006`
- `cloudflared` binary is installed at:

```text
/usr/local/bin/cloudflared-domstudio
```

New public ComfyUI tunnel:

```text
https://path-preparation-emerald-answered.trycloudflare.com
```

Set Amvera backend variable:

```text
COMFYUI_URL=https://path-preparation-emerald-answered.trycloudflare.com
```

Amvera backend URL to remember:

```text
https://domstudio1-nate.amvera.io/
```

Important note:

The user said Codex can access Amvera too. Use the Amvera backend above for
live backend checks when validating deployed generation.

Verification already completed:

- Public `/system_stats` returned HTTP 200.
- GPU reported as RTX 4080 SUPER.
- Public `/object_info` confirmed required nodes:
  - `NunchakuQwenImageDiTLoader`
  - `AutoDownloadBiRefNetModel`
  - `ByteDanceImageToVideoNode`

Next step:

After Amvera env var is updated/restarted, run a live backend generation check
against `https://domstudio1-nate.amvera.io/`.

## June 18, 2026 - Live Amvera Smoke Started, Blocked On Backend Env Restart

User asked to proceed one by one.

Step 1: Amvera health check passed:

```text
GET https://domstudio1-nate.amvera.io/health
HTTP 200
{"status":"ok","service":"domstudio-api","v":8,"prompt_version":"preserve-label-image-edit-2026-06-17"}
```

Step 2: First live catalog generation smoke reached the Amvera backend, but
generation failed before reaching Comfy:

```text
POST https://domstudio1-nate.amvera.io/generation/generate
mode=catalog
HTTP 502
{"detail":"Generation failed: [Errno -2] Name or service not known"}
```

Interpretation:

- Auth/login worked.
- The live backend is running.
- The failure is DNS resolution from the Amvera backend process, almost
  certainly because `COMFYUI_URL` is still the old/dead trycloudflare hostname
  or the backend was not restarted after updating the env var.
- The new Comfy tunnel itself was verified live:

```text
COMFYUI_URL=https://path-preparation-emerald-answered.trycloudflare.com
```

Required next action in Amvera:

```text
GENERATION_PROVIDER=comfy
COMFYUI_URL=https://path-preparation-emerald-answered.trycloudflare.com
```

Then restart/redeploy the Amvera backend and rerun the catalog smoke before
moving to product or video.

## June 18, 2026 - Live Catalog/Product Passed, Video Provider Blocked

After Amvera picked up the new Cloudflare URL, the live image smoke tests
passed through the deployed backend:

```text
COMFYUI_URL=https://path-preparation-emerald-answered.trycloudflare.com
```

Catalog smoke:

```text
POST https://domstudio1-nate.amvera.io/generation/generate
mode=catalog
HTTP 200
status=success
size=960x599
output=live-smoke/catalog-live.png
```

Visual check:

- Clean white-background bottle cutout.
- Output was a real generated PNG, not a blank/broken response.

Product smoke:

```text
POST https://domstudio1-nate.amvera.io/generation/generate
mode=product
HTTP 200
status=success
size=1024x1024
output=live-smoke/product-live.png
```

Video smoke through Amvera:

```text
POST https://domstudio1-nate.amvera.io/generation/video
HTTP 200
job_id=e9e2b8af-a80a-4ca8-a72b-ad62c387e27e
status=queued -> processing -> done
```

But the completed job had no downloadable media:

```text
output_url=None
output_format=None
output_data_len=0
error=None
```

Direct Comfy video workflow test against the new tunnel gave the real provider
blocker:

```text
ComfyUI job failed: ByteDanceImageToVideoNode: Unauthorized: Please login first to use this node.
```

Interpretation:

- Image generation is live again on Amvera.
- The ByteDance video node is installed and the workflow queues.
- Video generation cannot produce MP4 until the ByteDance/Comfy API node is
  authenticated on the AutoDL ComfyUI instance, or DomStudio switches to a
  different installed video provider/model.
- The deployed Amvera video endpoint also needs a stricter failure check so a
  provider/no-output result cannot be marked as `done` without `output_data` or
  `output_url`.

Next step:

Authenticate the ByteDance video node in ComfyUI, then rerun the same direct
Comfy smoke before relying on the deployed `/generation/video` endpoint.

## June 18, 2026 - Video Auth Path Identified + Backend Patched

Question:

Use another video node, or how to fix:

```text
ByteDanceImageToVideoNode: Unauthorized: Please login first to use this node.
```

Findings:

- The error comes from ComfyUI's built-in `comfy_api_nodes`, not from
  DomStudio's workflow.
- ByteDance, Kling, Luma, Runway, Vidu, Wan API, LTXV API, etc. are Comfy
  Partner/API nodes and use the same Comfy.org account auth mechanism.
- The AutoDL box does not currently have a real local video model installed:
  - SVD checkpoint list is empty.
  - Wan model loader only sees the Qwen image models and `z_image_turbo`.
  - No Wan/SVD/LTXV/Hunyuan video weights were found in model folders.
- Therefore switching to another serious video node does not avoid auth unless
  we first download/install a full local video model workflow.

Official Comfy headless API-node solution:

Create a ComfyUI Account API Key at:

```text
https://platform.comfy.org/login
```

The Comfy account must have enough credits. For headless workflows, the key is
sent in the `/prompt` payload as:

```json
{
  "extra_data": {
    "api_key_comfy_org": "comfyui-..."
  }
}
```

Code change made:

- Added backend env var:

```text
COMFYUI_ACCOUNT_API_KEY=
```

- `domstudio-backend/services/comfy_client.py` now includes
  `extra_data.api_key_comfy_org` when queueing Comfy prompts if
  `COMFYUI_ACCOUNT_API_KEY` is set.
- `.env.example` documents the new variable.
- Added unit coverage to verify the queued `/prompt` JSON includes the Comfy
  account API key.

Validation:

```text
python -m unittest tests.test_comfy_client tests.test_generation
22 tests OK
```

Next operational step:

Set in Amvera:

```text
COMFYUI_ACCOUNT_API_KEY=<ComfyUI Account API key with credits>
```

Then redeploy/restart Amvera and rerun the direct video smoke. If the account
has credits, the existing ByteDance workflow should authenticate. If it fails
with `402 Payment Required`, add credits on Comfy.org.

## June 18, 2026 - ByteDance Video Auth Confirmed, MP4 Generated

After the user added the Comfy account API key locally and in Amvera, direct
Comfy testing showed:

1. Auth key was passed correctly. The previous `Unauthorized: Please login
   first` error disappeared.
2. `seedance-1-0-lite-i2v-250428` failed with:

```text
The model or endpoint seedance-1-0-lite-i2v-250428 does not exist or you do not have access to it.
```

3. Switched `product_video.json` to:

```text
seedance-1-0-pro-250528
```

4. The ByteDance node requires `seed` even though the schema marks it optional.
   DomStudio's random `{{seed}}` can exceed the node max of `2147483647`, so
   the video workflow now uses a fixed safe seed:

```json
"seed": 0
```

5. Direct Comfy video generation succeeded. Comfy log showed:

```text
ByteDanceImageToVideoNode: 170.90s
SaveVideo: 0.04s
Prompt executed in 170.96 seconds
```

6. MP4 downloaded successfully:

```text
live-smoke/video-direct-comfy-auth.mp4
size=1,962,019 bytes
content-type=video/mp4
```

Important backend fix:

Comfy `SaveVideo` reported the MP4 under the `images` history key:

```text
images: product_00001_.mp4
```

The backend media extractor now treats video file extensions (`.mp4`, `.mov`,
`.webm`, `.mkv`) as `videos` even if Comfy reports them under `images`.

Validation:

```text
python -m unittest tests.test_comfy_client tests.test_generation
23 tests OK
```

Next step:

Deploy/push the backend patch to Amvera, then rerun
`POST /generation/video`. Expected result after deploy: job should finish with
`output_data` populated as a base64 MP4 and `output_format=MP4`.

## June 18, 2026 - Live Amvera Video Generation Passed

After Amvera picked up commit:

```text
1d92d07 Enable Comfy partner video auth
```

Ran a fresh live video job against:

```text
https://domstudio1-nate.amvera.io/generation/video
```

Result:

```text
job_id=adaaf0c7-fbff-40e6-a95a-29ea6d7b2e4e
status=queued -> processing -> done
output_format=MP4
output_data_len=2970236
```

Downloaded decoded MP4 locally:

```text
live-smoke/video-live-amvera-final.mp4
size=2,227,677 bytes
```

Conclusion:

- Live Amvera backend can now run ByteDance/Comfy Partner video generation.
- The Comfy account API key is being passed correctly.
- The backend MP4 extractor fix works.
- `/generation/jobs/{job_id}` returns `output_data` and `output_format=MP4`.

## June 18, 2026 - Amvera Observability Endpoint Added

Problem:

Amvera's Web IDE shell is not the same as the running app container, so runtime
checks from the IDE can be misleading. Earlier this caused confusion around
missing Python packages and whether the deployed code had actually restarted.

Fix:

Added public, secret-safe endpoint:

```text
GET /version
```

It returns:

- short git commit and branch when discoverable
- Python version and current working directory
- `GENERATION_PROVIDER`
- `GENERATION_API_URL` host only
- `COMFYUI_URL` host only
- Comfy port, video resolution, poll timeout
- booleans for whether sensitive keys are present:
  - `COMFYUI_API_KEY`
  - `COMFYUI_ACCOUNT_API_KEY`
  - `DATABASE_URL`
  - `DEEPSEEK_API_KEY`
  - `RESEND_API_KEY`
  - `SMS_API_KEY`
- configured image/video workflow filenames and whether the files exist

No secrets or full database URLs are returned.

Validation:

```text
python -m unittest tests.test_runtime_info tests.test_comfy_client tests.test_generation tests.test_config tests.test_tokens tests.test_payments
35 tests OK
```

After deploy, use:

```text
https://domstudio1-nate.amvera.io/version
```

to verify whether Amvera is running the expected commit and env configuration.

## June 18, 2026 - Frontend Examples With 3 Product Videos

Scope was reduced to exactly three total videos:

- perfume product video, 5 seconds
- wine bottle product video, 5 seconds
- fashion fitting video, 5 seconds

Generated through the live Amvera backend:

```text
https://domstudio1-nate.amvera.io/generation/video
```

Saved frontend assets:

```text
domstudio-frontend/src/assets/examples/videos/perfume-product-5s.mp4
domstudio-frontend/src/assets/examples/videos/wine-product-5s.mp4
domstudio-frontend/src/assets/examples/videos/fashion-fitting-5s.mp4
```

Live job IDs:

```text
perfume: 53aee59a-ad61-4e11-8037-fb093067464e
wine:    53d61f5a-d025-4296-b086-7067617e305d
fashion: da6dd036-c49a-49f0-82da-458d5f436970
```

Frontend update:

- `domstudio-frontend/src/app.js` imports the three MP4s.
- Only the three selected examples render video media pairs.
- `domstudio-frontend/src/styles.css` keeps image and video panes equal size in
  one card, including mobile.

Validation:

```text
cd domstudio-frontend
npm run build
```

Build passed and bundled all three MP4 assets.

Follow-up landing page update:

- Homepage hero mini-studio preview now shows still image + video in one card.
- Homepage proof section now shows still image + video in one card.
- Both media panes use the same responsive dimensions on mobile.

Playback follow-up:

- Demo videos are explicitly initialized after each frontend render.
- The frontend sets muted/defaultMuted/autoplay/loop/playsInline/preload before
  calling `video.play()`.
- If mobile autoplay is blocked, the first pointer/touch/key interaction retries
  playback.

## June 18, 2026 - Homepage Bottle Proof Replacement

Visible homepage UI was changed from the perfume/serum proof to a wine-bottle
story:

- before: original phone photo from `9439B3EC-2AF7-4260-91CB-95E7DB240904.jpeg`
- after: generated product image from `domstudio-autodl-smoke.png`
- video: new 5-second MP4 generated from the after image

Frontend assets:

```text
domstudio-frontend/src/assets/landing/wine-before-original.jpeg
domstudio-frontend/src/assets/landing/wine-after-smoke.png
domstudio-frontend/src/assets/landing/wine-after-smoke-5s.mp4
```

Live video job:

```text
job_id=4bed557f-e2c1-4afe-9977-d3f9a1a28f95
status=done
output_format=MP4
```

Homepage updates:

- hero mini-studio card now has three equal panes: before, after, video
- proof section now has the same three-pane bottle story
- mobile keeps the three panes equal-width/equal-height inside the card

## June 19, 2026 - Mobile UI, Pricing Video Limits, And Video Quota Enforcement

Committed and pushed state:

```text
fa37346 Refine hero mobile language UI
2421f4e Show video limits in pricing plans
5cabcc6 Fix mobile language toggle
```

Frontend/UI changes now on `origin/main`:

- Mobile portrait navbar shows the language control correctly.
- Outside Russian-market timezones, first visit defaults to English.
- Outside Russian-market timezones, the top `RU/EN` language pill is hidden and
  language switching is available inside the burger menu.
- Russia-market visitors still get the top language pill.
- Hero autoplay video previews no longer show a permanent play-arrow overlay.
- The floating orange `AI` card was removed because it blocked the video preview.
- Desktop hero preview card was enlarged from the old 560px cap to a responsive
  600-760px width.

Pricing now displays explicit plan video allowances:

```text
Free:    5 photos + 5 videos
Starter: 30 photos + 30 videos + 10 premium videos
Seller:  100 photos + 50 videos + 33 premium videos
Growth:  300+ photos + 100 videos + 99 premium videos
```

Backend plan config and `/subscriptions/plans` expose:

```text
videos
premium_videos
```

Current uncommitted backend work in the local tree:

```text
domstudio-backend/database.py
domstudio-backend/migrate.py
domstudio-backend/routers/auth.py
domstudio-backend/routers/generation.py
domstudio-backend/routers/payments.py
domstudio-backend/routers/subscriptions.py
domstudio-backend/routers/users.py
domstudio-backend/tests/test_generation.py
```

Purpose of the uncommitted backend work:

- Add real monthly video quota counters to `subscriptions`:
  - `videos_used`
  - `videos_limit`
  - `premium_videos_used`
  - `premium_videos_limit`
- Add migration `005` to create the new columns and backfill limits by plan.
- New users receive the Free plan video counters.
- Paid plan activation resets video counters and applies the correct limits.
- `/subscriptions/me` and `/users/me/full` return video used/limit counters.
- `/generation/video` atomically reserves either local or premium video quota
  before queueing the job.
- Local video quota exhaustion returns `402 Video quota exceeded`.
- Premium video quota exhaustion returns `402 Premium video quota exceeded`.
- If premium token charging fails, the reserved premium video quota is released.
- If the queued video job fails, reserved video quota is released and any charged
  premium tokens are refunded.

Validation run for the uncommitted backend quota work:

```text
cd domstudio-backend
python -m unittest discover -s tests -v

Ran 44 tests
OK

cd domstudio-frontend
npm run build

build passed
```

Important deployment note:

```text
python migrate.py
```

must be run on the deployed backend database before relying on video quota
enforcement in production.

Live AutoDL sample status:

- A new live sample was requested but not started.
- The user then asked to archive the changes instead, so no new AutoDL generation
  was run in this step.

## June 20, 2026 - AutoDL Persistent Storage, Cloudflare Tunnel, And Wan Live Samples

Remote box:

```text
ssh -p 16715 root@connect.westd.seetacloud.com
hostname: autodl-container-66u5p3yxk3-4614f861
GPU: NVIDIA GeForce RTX 4080 SUPER, 32760 MiB VRAM
ComfyUI: 0.3.75 on port 6006
```

New Cloudflare quick tunnel for Amvera:

```text
https://aaron-firm-meeting-cattle.trycloudflare.com
```

Amvera must update:

```env
COMFYUI_URL=https://aaron-firm-meeting-cattle.trycloudflare.com
```

Current Amvera `/version` before this update still pointed at:

```text
ballot-ide-shakira-vienna.trycloudflare.com
```

Persistent storage work:

- `/root/autodl-fs` is mounted and persists across compatible west-B instances.
- Comfy `output` and `temp` were moved to `/root/autodl-fs/ComfyUI`.
- Existing model files were moved from `/root/autodl-tmp/models` to
  `/root/autodl-fs/models` with symlinks left behind.
- To reduce paid file-storage use, non-production extras were moved back to
  `/root/autodl-tmp`:
  - `z_image_turbo_bf16.safetensors`
  - `qwen_3_4b.safetensors`
  - `ae.safetensors`
  - `sdxl_vae_fp16_fix.safetensors`

Disk state after cleanup:

```text
/root/autodl-fs: 50GB used, 151GB free
/root/autodl-tmp: 27GB used, 24GB free
```

Wan production files downloaded into `/root/autodl-fs/models`:

```text
diffusion_models/WanVideo/Wan2_1-I2V-14B-480P_fp8_e4m3fn.safetensors
text_encoders/umt5-xxl-enc-bf16.safetensors
vae/wanvideo/Wan2_1_VAE_bf16.safetensors
clip_vision/clip_vision_h.safetensors
loras/WanVideo/Lightx2v/lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors
```

Comfy visibility was verified for all Wan files:

```text
WanVideoModelLoader.model: OK
LoadWanVideoT5TextEncoder.model_name: OK
WanVideoVAELoader.model_name: OK
CLIPVisionLoader.clip_name: OK
WanVideoLoraSelect.lora: OK
```

Premium ByteDance route:

- `ByteDanceImageToVideoNode` is installed and visible.
- `SaveVideo` is installed and visible.
- Amvera `/version` reports `COMFYUI_ACCOUNT_API_KEY` present.
- Premium still requires:

```env
COMFYUI_PREMIUM_VIDEO_WORKFLOW=product_video.json
COMFYUI_ALLOW_PAID_PARTNER_NODES=true
COMFYUI_VIDEO_RESOLUTION=720p
```

Live local Wan sample 1:

```text
prompt_id=9760d02d-f4b0-43d4-b2df-5c48da39f20e
remote=/root/autodl-tmp/ComfyUI/output/domstudio/video/product-live-sample_00001.mp4
local=temp-preview/wan-live-sample-1781954113-product-live-sample_00001.mp4
frame=temp-preview/wan-live-sample-frame.jpg
duration=3.0625s
size=832x480
fps=16
```

Committed sample artifact:

```text
d536481 Add Wan live sample preview
```

Outcome:

- The pipeline works and generated a real MP4.
- It is not production-ready for marketplace use.
- The model changed the clean product setup into a candle/lifestyle scene.
- Label text drifted and should not be considered preserved.

Live local Wan sample 2 with stricter marketplace prompt:

```text
prompt_id=8f666123-0100-4f78-ae12-af2c5d226d38
remote=/root/autodl-tmp/ComfyUI/output/domstudio/video/marketplace-live-sample_00001.mp4
local=temp-preview/wan-marketplace-sample-1781955113-marketplace-live-sample_00001.mp4
frame=temp-preview/wan-marketplace-sample-frame.jpg
duration=3.0625s
size=832x480
fps=16
```

Outcome:

- Technically successful MP4.
- The stricter prompt still produced the same candle/lifestyle drift.
- Current `product_video_wan_local.json` should not be marketed as reliable
  marketplace/product-preserving video yet.

Next steps:

1. Update Amvera `COMFYUI_URL` to the new Cloudflare URL above.
2. Keep local Wan as preview/experimental until product preservation is solved.
3. Try workflow-level fixes before more sample spending:
   - remove or reduce the LightX2V LoRA if it causes lifestyle drift
   - lower `noise_aug_strength`
   - test locked-background prompts with a clean white input
   - consider fewer/more conservative motion instructions
4. Premium ByteDance route is available as the higher-quality paid path, but it
   should be tested separately with `COMFYUI_ALLOW_PAID_PARTNER_NODES=true`.

Follow-up Wan motion tests:

```text
static_9s_prompt_id=4dd7fb14-d27c-4c97-9890-602331f4a294
static_9s_local=temp-preview/wan-9s-live-1781955669-wine-product-9s-live_00001.mp4
static_9s_duration=9.0625s
static_9s_size=832x480
```

Outcome:

- The file was the requested 9 seconds, but motion was too weak.
- The result behaved like a nearly static image held for 9 seconds.

```text
motion_3s_prompt_id=5d8283d8-03bd-4c8d-978f-b323c2bb45e9
motion_3s_local=temp-preview/wan-motion-test-1781956431-wine-motion-test_00001.mp4
motion_3s_duration=3.0625s
motion_3s_size=832x480

motion_9s_prompt_id=38cc56b7-0af2-433e-bb2a-b3bf4f461361
motion_9s_local=temp-preview/wan-motion-9s-live-1781957319-wine-motion-9s-live_00001.mp4
motion_9s_duration=9.0625s
motion_9s_size=832x480
motion_9s_fps=16
```

Outcome:

- Stronger Wan settings produced visible motion/aliveness:
  - `noise_aug_strength=0.12`
  - `steps=6`
  - `cfg=2.0`
  - `shift=6.0`
- The 9-second version has camera/orbit movement, candle flicker, and moving
  reflections.
- Tradeoff: it adds a wine glass and changes the composition, so it is alive but
  still not strict product-preserving marketplace video.
