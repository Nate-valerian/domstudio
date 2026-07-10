# DomStudio Archive

## July 10, 2026 - AutoDL West-C Tunnel Connected To Amvera

Connected the fresh AutoDL west-C container to the existing west-B persistent
storage and restored the production ComfyUI tunnel without redownloading the
56 GB model store.

AutoDL state:

- SSH endpoint: `connect.westc.seetacloud.com:39913`.
- Container: `autodl-container-8a8a4e88b3-33e17579`.
- GPU: `NVIDIA vGPU-32GB`.
- Persistent west-B storage is mounted at `/root/autodl-fs` with roughly
  51 GB of models under `/root/autodl-fs/models`.
- The fresh container ComfyUI runtime at `/root/ComfyUI` is linked into the
  expected `/root/autodl-tmp/ComfyUI` path and reads the persistent models via
  `extra_model_paths.yaml`.
- ComfyUI `0.3.75` is running on port `6006`.

Current tunnel:

```text
https://assistance-edward-egg-oklahoma.trycloudflare.com
```

Amvera recovery:

- Amvera's `COMFYUI_URL` environment variable was updated, but the backend
  continued using the tracked `domstudio-backend/comfy_url.txt` because file
  precedence is intentional in the current client.
- Updated `domstudio-backend/comfy_url.txt` to the current tunnel so the normal
  `main -> Amvera master` deployment path can restore generation.
- The AutoDL password was used only for the connection and was not archived.

## July 9, 2026 - Premium Landing Before/After/Video Assets Committed

Added the three user-provided source images as landing "before" assets and
connected their generated "after" images plus real 5-second videos to the
landing showcase.

Source images:

- `domstudio-frontend/src/assets/landing/user-sources/mens-accessories-before.jpg`
- `domstudio-frontend/src/assets/landing/user-sources/formal-outfit-before.jpg`
- `domstudio-frontend/src/assets/landing/user-sources/jewelry-close-before.jpg`

Generated assets:

- `premium-mens-accessories-after.png`
- `premium-mens-accessories-after-5s.mp4`
- `premium-formal-outfit-after.png`
- `premium-formal-outfit-after-5s.mp4`
- `premium-jewelry-close-after.png`
- `premium-jewelry-close-after-5s.mp4`

Frontend wiring:

- Added the three scenarios to `LOOK_SCENARIOS`, so they appear in the
  "Before, AI result, and video" landing block.
- Added the three clips to `VIDEO_SHOWCASE_ITEMS`, so they appear in the
  photo-then-video sequence.
- Added the three after-images to the category proof rail.
- Added RU/EN i18n copy for scenario labels, prompts, video labels, and
  category cards.

Validation:

- The local copies match the user's supplied files from
  `C:\Users\nate-\Downloads\BackGround\1.jpg`, `2.jpg`, and `3.jpg` by SHA256.
- Each mp4 is a real 5.04 second, 24 fps clip with 121 frames, not a pan/zoom
  still-image mockup.
- The mp4 metadata shows the `ByteDanceImageToVideoNode` workflow.
- Visual check: formal outfit and jewelry close-up are strong; men's accessories
  is polished but less strict about preserving every accessory from the flat lay,
  so a later targeted regeneration could improve that specific example.
- `npm.cmd run build` passed in `domstudio-frontend`.

AutoDL status checked during this pass:

- SSH key login works for
  `ssh -i $HOME\.ssh\autodl_key -p 27850 root@connect.westb.seetacloud.com`.
- Current container: `autodl-container-a3db44bd3d-247df867`.
- ComfyUI is running on port `6006`.
- A Cloudflare tunnel process is running.

## July 9, 2026 - Amvera Comfy URL Deployment Verified

Pushed the restored Comfy connection commit to the Amvera `master` branch
because Amvera was still deploying commit `93c2a33` from `master` while the fix
was local on `main`.

Deployment result:

- Pushed `main` to Amvera `master`:
  `git push amvera main:master`.
- Amvera `/version` switched to commit `a95cb2c422e6`.
- Amvera `/version` now reports:
  - `generation.provider`: `comfy`
  - `comfy.url_host`: `magic-illinois-ins-accidents.trycloudflare.com`
  - `comfy.env_url_host`: `magic-illinois-ins-accidents.trycloudflare.com`
  - `comfy.url_source`: `file`
- Amvera `/health` returns `{"status":"ok","service":"domstudio-api"}`.
- CORS preflight for `https://domstudio.site` to `/generation/generate`
  returns `200 OK`.
- CORS preflight for `https://domstudio.space` is still blocked with
  `Disallowed CORS origin`; add that domain to Amvera `FRONTEND_URL` /
  `CORS_ORIGINS` if the live frontend uses `.space`.

## July 9, 2026 - AutoDL West-B Comfy Connection Restored

Restored the current SeetaCloud/AutoDL west-B ComfyUI connection for DomStudio.
The password was used only for recovery and was not written to this archive.

Connection result:

- Installed the local `autodl_key` public key on the new remote instance so
  future access works with key-based SSH:
  `ssh -i $HOME\.ssh\autodl_key -p 27850 root@connect.westb.seetacloud.com`.
- Verified the remote container as `autodl-container-a3db44bd3d-247df867`.
- Verified ComfyUI is already running from `/root/autodl-tmp/ComfyUI` on
  port `6006`.
- Verified `/system_stats` returns ComfyUI `0.3.75`, PyTorch `2.5.1+cu124`,
  and `NVIDIA vGPU-32GB`.
- Verified west-B persistent storage at `/root/autodl-fs` with roughly `145G`
  free, and current working disk `/root/autodl-tmp` with roughly `2.8G` free.
- Verified production models are present under `/root/autodl-fs/models`,
  including Qwen image edit, Wan video, Qwen VAE, Wan VAE, UMT5, and RMBG
  model files.

Tunnel recovery:

- ngrok binary exists on the persistent disk, but ngrok cannot start because
  the remote machine has no authenticated ngrok account/token configured.
- Repaired `/root/autodl-fs/start_domstudio.sh` so it reuses or starts ComfyUI
  on `127.0.0.1:6006`, removes stale DomStudio Cloudflare tunnel processes,
  starts one fresh Cloudflare quick tunnel, and prints `COMFYUI_URL=...`.
- Current live ComfyUI tunnel:
  `https://magic-illinois-ins-accidents.trycloudflare.com`.
- Updated `domstudio-backend/comfy_url.txt` to the live tunnel URL.

Validation:

- External curl from the local workstation to
  `https://magic-illinois-ins-accidents.trycloudflare.com/system_stats`
  succeeded.
- Remote process check shows one ComfyUI process and one `cloudflared tunnel`
  process.

## July 9, 2026 - AutoDL West-B Connection Notes Read

User provided a new SeetaCloud/AutoDL west-B SSH endpoint and pointed to the
AutoDL file-store page for the west-B persistent disk. The password was not
written to this archive.

Current endpoint to use when needed:

```text
ssh -p 27850 root@connect.westb.seetacloud.com
```

Previous AutoDL notes reviewed:

- Before any AutoDL/Comfy/image/video work, follow `DOMSTUDIO_TOMORROW.md`
  rules: narrow test plan, preserve product identity, do not spend GPU on broad
  experiments, and do not present fake still-image motion as real video.
- Preferred Comfy path from prior working instances:
  `/root/autodl-tmp/ComfyUI`.
- Comfy should run locally on port `6006`:
  `python main.py --listen 0.0.0.0 --port 6006`.
- west-B persistent storage has previously mounted as `/root/autodl-fs` and
  maps to AutoDL file-store disk `west-B`.
- Production models were previously organized under `/root/autodl-fs/models`
  with symlinks from `/root/autodl-tmp/models`.
- Current local backend fallback tunnel file is
  `domstudio-backend/comfy_url.txt`, but the URL may be stale after any AutoDL
  restart.

Connection check:

- Tried passwordless/key-only SSH to the new endpoint.
- Result: key auth failed, so this new instance currently needs password login
  or the local `autodl_key` must be added again to `/root/.ssh/authorized_keys`.

## July 9, 2026 - App-Wide Fast / Advanced Mode

User asked to expand `Fast / Advanced` beyond the Studio section and to commit
and archive notes at each step.

Step 1 completed:

- Promoted the former Studio-only detail mode into a global app mode stored in
  `localStorage` as `domstudio_app_mode`.
- Added an app-wide Fast / Advanced switch in the main navigation on desktop and
  inside the opened mobile menu on tablet/mobile.
- Updated Studio to read the global app mode instead of keeping its own
  separate mode state.
- Kept the Studio explanation card, but it now describes the global app mode.
- Added RU/EN labels and hints for the global mode switch.

Files changed:

- `domstudio-frontend/src/app.js`
- `domstudio-frontend/src/i18n.js`
- `domstudio-frontend/src/styles.css`

Validation:

- `npm.cmd run build` passed in `domstudio-frontend`.

Next step:

- Apply the global mode to AdPilot AI so Fast mode starts with the guided
  seller flow and Advanced mode exposes the full field/profile controls more
  directly.

Step 2 completed:

- Connected AdPilot AI copy generation to the global app mode.
- Fast mode now uses the guided wizard path and hides the business profile block
  to reduce first-use friction.
- Advanced mode now opens the full field form and business profile controls
  directly.
- The old local `data-wizard-mode` branch was removed so `All fields` and
  `Quick mode` switch the global app mode instead of creating a second mode
  system.
- Added a small wizard-field sync helper so the current Fast-mode answer is
  preserved when switching to Advanced.

Files changed:

- `domstudio-frontend/src/app.js`

Validation:

- `npm.cmd run build` passed in `domstudio-frontend`.

Next step:

- Apply the global mode to Quick Tools so Fast mode presents common seller
  fixes first and Advanced mode exposes the full tool/workflow set.

Step 3 completed:

- Connected the Quick Tools page to the global app mode.
- Fast mode now focuses the tools page on the common seller utilities:
  background removal, marketplace resize, image checker, and compressor.
- Advanced mode reveals the creative/extra tools: collage, watermark, and
  promo badge.
- Added a Fast-mode note with a `Show all` button that switches the app into
  Advanced mode.
- Hid `Send to` chips for hidden Advanced-only tools while the tools page is in
  Fast mode, so users are not routed to invisible tool cards.

Files changed:

- `domstudio-frontend/src/app.js`
- `domstudio-frontend/src/i18n.js`
- `domstudio-frontend/src/styles.css`

Validation:

- `npm.cmd run build` passed in `domstudio-frontend`.

Next step:

- Apply the global mode to pricing/account/history so Fast mode keeps the
  seller path compact while Advanced mode shows deeper account/history detail.

Step 4 completed:

- Connected Pricing, Account, and History pages to the global app mode.
- Pricing Fast mode keeps the plan grid visible and hides token top-up packs
  behind an Advanced-mode note.
- Account Fast mode keeps plan/tokens/usage and the main creation/upgrade path
  visible, while recent history and brand summaries move to Advanced mode.
- History Fast mode shows the most recent six browser results without filters;
  Advanced mode restores full history filtering and the full list.
- Added RU/EN note copy and responsive note styling shared with the tools mode
  notes.

Files changed:

- `domstudio-frontend/src/app.js`
- `domstudio-frontend/src/i18n.js`
- `domstudio-frontend/src/styles.css`

Validation:

- `npm.cmd run build` passed in `domstudio-frontend`.

Next step:

- Run a final full check of app-mode behavior, archive the final status, and
  commit any final polish/fixes if needed.

Final check completed:

- Confirmed no stale `studioDetailMode`, `data-studio-detail-mode`,
  `setStudioDetailMode`, or `data-wizard-mode` hooks remain in
  `domstudio-frontend/src`.
- Confirmed the latest commits are the four app-mode implementation chunks.
- Final `npm.cmd run build` passed in `domstudio-frontend`.
- Working tree has no modified tracked files after the implementation commits;
  the remaining untracked items are the pre-existing generated artifacts and
  local scripts listed by `git status`.

Commits created for this app-mode pass:

- `5f103a5` - `Add global app mode switch`
- `8d313d0` - `Apply app mode to AdPilot`
- `c596164` - `Apply app mode to tools`
- `9e1685f` - `Apply app mode to account views`

Correction after user feedback:

- User clarified that Quick Tools must be the same in Fast and Advanced mode
  because the tools are free.
- Removed the Tools-specific Fast/Advanced split.
- Tools now always show the full free tool set in both modes: background
  removal, collage, watermark, promo badge, resizer, checker, and compressor.
- Removed the unused Tools Fast-mode note/copy and CSS that hid advanced tool
  cards/send targets.

Validation:

- `npm.cmd run build` passed in `domstudio-frontend`.

AdPilot visual cleanup:

- User asked to remove the image/video on the AdPilot AI landing page because it
  did not look nice.
- Removed the AdPilot landing media block and its unused video/poster imports.
- Removed the dead `.adpilot-visual` CSS and the old video selector reference.

Validation:

- `npm.cmd run build` passed in `domstudio-frontend`.

## July 8, 2026 - Aidentika Comparison And Pass 1 Plan

Compared Aidentika (`https://aidentika.com/en`) with DomStudio
(`http://domstudio.site/#home`).

Direction chosen:

- Do not copy Aidentika as a generic AI product-photo studio.
- Position DomStudio as the practical seller cockpit for WB/Ozon/Avito:
  product photos, marketplace formats, quick tools, and AdPilot copy in one
  place.
- Keep DomStudio's orange identity, but calm the cream/yellow surfaces so the
  page feels cleaner and more commercial.
- Add a Studio mode split later:
  - Simple/Fast mode: upload, choose marketplace/format, choose style, generate.
  - Complex/Advanced mode: expose all detailed controls.

Pass 1 landing changes planned as committed chunks:

1. Palette refinement and mobile hero overflow/H1 fix.
2. Clear "3 steps" section near the top.
3. Category proof expansion beyond the single bottle/tea-house proof.
4. Photographer vs DomStudio comparison block.
5. Honest video/support/FAQ additions.

Commit rule from user:

- After each new change chunk, commit it.
- Ask the user to push before continuing to the next change chunk.

Pass 1 progress:

- Chunk 1 committed/pushed: palette refinement and mobile hero/H1 fit.
- Chunk 2 completed: moved the "3 steps" seller flow directly under the hero
  and made it light, compact, and easy to scan.
- Chunk 3 completed: expanded proof beyond one hero example with six category
  cards using real generated/curated assets. Electronics is intentionally not
  claimed until a real electronics proof image exists.
- Chunk 4 completed: added direct "photographer/studio vs DomStudio" comparison
  block with conservative traditional-shoot cost language and the real 270 ₽
  DomStudio entry price.
- Chunk 5 completed: added honest video wording plus FAQ/support CTA. Support
  opens the existing contact flow because no verified public Telegram handle
  exists in the repo yet.

Pass 2 Studio mode split:

- Chunk 1 completed: added a Studio `Fast / Advanced` switch. Fast mode keeps
  the main seller flow visible (upload, marketplace, style, brief, generate),
  while Advanced exposes brand settings, prompt helper, exact export, variations,
  comparison, and history.

Pass 3 landing "alive" visuals:

- Chunk 1 completed: upgraded the top "3 steps" section from text cards into a
  visual seller workflow with source-photo cards, marketplace/format presets,
  a final result card, and an autoplay video tile using existing real assets.
- Chunk 2 completed: added large "live scenario" showcase blocks inspired by
  the Aidentika references, but positioned for DomStudio: fashion/try-on looks,
  honest short AI video, and a wider horizontal category rail.

## June 29, 2026 - AdPilot AI chat, tiered limits, mobile polish, agent brainstorm

Commits:
- `7782c77` - `Add AdPilot AI chat`
- `e09a599` - `Move AdPilot AI chat button to top`
- `70b1f3f` - `Teach AdPilot AI DomStudio capabilities`
- `cdb5dde` - `Tighten mobile AdPilot chat layout`
- `eea6e18` - `Reduce mobile AdPilot context spacing`
- `b90d247` - `Show AdPilot chat first on mobile`

### AdPilot AI chat

AdPilot was renamed in visible navigation/copy to `AdPilot AI`.

New chat flow:
- The quick-action area has an `AI Chat` / `AI-чат` button.
- On mobile, `AI Chat` is the first quick-action button.
- Clicking it opens the AdPilot AI chat view.
- Chat page includes a product/service context field, prompt chips, chat messages, textarea, and send button.
- Mobile layout now shows the chat card first, then the product/context card below.
- Large empty mobile chat space was removed; chat log uses a simple divider line above the input.

Frontend files:
- `domstudio-frontend/src/app.js`
  - Added AdPilot chat state.
  - Added `adPilotChatPage()`.
  - Added `openAdPilotChat()` and `submitAdPilotChat()`.
  - Sends chat messages to `POST /ad-chat`.
- `domstudio-frontend/src/i18n.js`
  - Added RU/EN copy for AdPilot AI chat.
  - Updated AdPilot labels/title to `AdPilot AI`.
- `domstudio-frontend/src/styles.css`
  - Added chat layout.
  - Added mobile-first ordering and spacing fixes.

Backend files:
- `domstudio-backend/routers/ad_chat.py`
  - New public/member-aware `POST /ad-chat`.
  - Uses existing OpenAI-compatible `TEXT_AI_*` config, intended for DeepSeek.
  - Keeps DeepSeek/API key on backend only.
  - Returns reply, provider, remaining limit, limit, and tier.
- `domstudio-backend/main.py`
  - Registers `ad_chat.router` at `/ad-chat`.
- `domstudio-backend/tests/test_ad_chat.py`
  - Covers valid payload, invalid empty messages, and DomStudio capability prompt.
- `domstudio-backend/.env.example`
  - Added tiered chat limits.

Production env:
```env
TEXT_AI_BASE_URL=https://api.deepseek.com/v1
TEXT_AI_API_KEY=<deepseek key>
TEXT_AI_MODEL=deepseek-chat
ADPILOT_CHAT_GUEST_DAILY_LIMIT=10
ADPILOT_CHAT_FREE_USER_DAILY_LIMIT=30
ADPILOT_CHAT_PAID_USER_DAILY_LIMIT=150
ADPILOT_CHAT_MAX_MESSAGES=10
ADPILOT_CHAT_MAX_TOKENS=900
```

Limit behavior:
- Guest users are limited by IP.
- Logged-in free members are limited by user id.
- Paid members get the higher paid-user limit by user id.

### DomStudio-aware AI behavior

AdPilot AI system prompt now knows the app's real capabilities and may suggest them when useful:
- Studio creates AI product photos from uploaded image or text prompt.
- Studio supports marketplace/product modes, lifestyle, catalog, creative, fitting, stories, and video previews.
- Marketplace presets cover WB, Ozon, Avito, Yandex, Stories, banners, and social posts.
- Quick Tools include background removal, collage, watermark, promo badge, resizing, compression, and checks.
- AdPilot AI writes/improves product cards, Avito listings, social posts, Yandex ads, product descriptions, buyer replies, review replies, landing copy, and similar business copy.
- Users can send generated images from Studio or Tools into AdPilot for matching text.
- Members get higher AdPilot AI chat limits than guests.
- Contact page is for site problems, billing, careers, or partnership requests.

Guardrail:
- AI may suggest a DomStudio feature only when it helps the current user need.
- AI should not over-promote DomStudio, invent unsupported capabilities, or promise human support inside chat.

### Agent brainstorm for tomorrow

Good direction: not one giant agent everywhere, but a contextual assistant that understands the user's selling goal and routes them to the right DomStudio action.

Potential agent concepts:
- `DomStudio Sales Agent`: asks 2-3 questions, recommends Studio/Tools/AdPilot flow, then prepares the next useful output.
- `Product Launch Agent`: creates a launch pack with title, description, social post, buyer replies, photo direction, and suggested next action.
- `Listing Doctor`: reviews existing listing/photo for title clarity, trust, buyer desire, missing details, weak photo, and platform fit.
- `Smart Tool Router`: interprets messy user requests and sends them to Studio, Quick Tools, AdPilot AI, or Contact.
- `Marketplace Coach`: adapts advice for Avito, WB/Ozon, socials, and Yandex Ads.
- `Campaign Agent`: builds 7-day promo/content plans, ad angles, and seasonal ideas.
- `Customer Reply Agent`: handles discount requests, negative reviews, delivery questions, objections, and hesitant buyers.

Best first agent idea:
- `AdPilot AI Agent: Launch Pack`
- Lives inside AdPilot AI chat first.
- User enters product/service.
- Agent asks a few questions.
- Agent returns practical output plus one suggested next action.
- Later can expose action buttons such as `Create Avito listing`, `Open Studio`, `Make social post`, `Resize for WB/Ozon`.

Architecture note:
- Agent backend can reuse DeepSeek through `TEXT_AI_*`.
- Suggested backend route: `domstudio-backend/routers/agent.py`, endpoint `POST /agent/chat`.
- Agent should return structured actions from a strict allowlist, for example:
```json
{
  "reply": "For sofas, start with Avito listing and clean product photo.",
  "actions": [
    { "label": "Create Avito listing", "route": "adpilot", "tool": "avito-ad" },
    { "label": "Open Studio", "route": "studio" },
    { "label": "Make social post", "route": "adpilot", "tool": "vk-post" }
  ]
}
```
- DeepSeek can reason and draft text, but backend should control limits, safety, allowed app actions, and routing.

### Validation

Passed during the session:
- `python -m py_compile main.py routers/ad_chat.py`
- `python -m py_compile routers/ad_chat.py main.py`
- `python -m unittest tests/test_ad_chat.py -v`
- `python -m unittest tests/test_ad_chat.py tests/test_contact.py -v`
- `npm.cmd run build`
- Mobile browser smoke checks:
  - AI Chat opens.
  - Input is visible.
  - Chat log/input gap is about 10px after spacing fix.
  - Mobile ordering puts chat panel above product/context panel.

### Deployment note

Current SpaceWeb frontend upload zip:
- `domstudio-spaceweb-dist.zip`

Latest build filenames at the end of the session:
- `domstudio-frontend/dist/index.html`
- `domstudio-frontend/dist/assets/index-Dgd6-ORX.css`
- `domstudio-frontend/dist/assets/index-C1vLDdNw.js`
- `domstudio-frontend/dist/assets/index-CqDKEHQy.js`

Backend deployment needs the AdPilot AI files from the commits above, especially:
- `domstudio-backend/main.py`
- `domstudio-backend/routers/ad_chat.py`

Working tree note before archive commit:
- Source changes were committed.
- Only generated `domstudio-spaceweb-dist.zip` and old `temp-preview/` screenshots were untracked.

---

## June 28, 2026 - Footer, Tech Dolphin mark, contact page, domain config

Commits:
- `60e341d` - `Update domain config and footer links`
- `abfae87` - `Add Tech Dolphin footer mark`
- `e1ca47e` - `Add contact page and form endpoint`

Push status before this archive note:
- Feature work had been pushed; `HEAD` and `origin/main` both pointed at `e1ca47e`.
- Working tree had only untracked temporary preview screenshots in `temp-preview/`; source changes were committed.

### Footer links and company mark

Footer now has four action cards at the end of pages:
- Help
- Contact us
- Careers
- Partnership

Top nav was intentionally left unchanged so product navigation stays focused.

Footer brand block now shows:
- `DomStudio`
- `AI-фотостудия для бизнеса · 2026` / `AI photo studio for business · 2026`
- Russian: `DomStudio — продукт [tiny dolphin logo] Tech Dolphin`
- English: `DomStudio is a product of [tiny dolphin logo] Tech Dolphin`

Tech Dolphin logo asset:
- `domstudio-frontend/src/assets/tech-dolphin-logo.png`
- Rendered as a tiny circular mark in the footer line, not as a full parent-brand takeover.

### Contact page flow

Footer cards no longer open `mailto:`. They route inside the app:
- `Help` -> `#contact?reason=help`
- `Contact us` -> `#contact?reason=contact`
- `Careers` -> `#contact?reason=careers`
- `Partnership` -> `#contact?reason=partners`

New contact page includes:
- Email input
- Reason dropdown preselected from clicked footer card
- Message textarea
- Send button
- Success/error notice

Frontend files:
- `domstudio-frontend/src/app.js`
  - Added `CONTACT_REASONS`
  - Added `routeFromHash()` and `contactReasonFromHash()` so `#contact?reason=...` works
  - Added contact-page state fields
  - Added `contactPage()`
  - Footer cards now use `data-contact-reason`
  - Added `openContact()` and `submitContact()`
- `domstudio-frontend/src/i18n.js`
  - Added RU/EN contact-page copy
  - Added `title.contact`
  - Added RU/EN Tech Dolphin product-line prefix
- `domstudio-frontend/src/styles.css`
  - Added contact-page layout
  - Styled footer cards as buttons
  - Mobile contact page fits above bottom tab bar

Backend files:
- `domstudio-backend/routers/contact.py`
  - New public `POST /contact`
  - Accepts `email`, `reason`, `message`
  - Valid reasons: `help`, `contact`, `careers`, `partners`
  - Sends through Resend when `RESEND_API_KEY` is configured
  - Logs to console if Resend key is missing, matching existing OTP fallback behavior
- `domstudio-backend/main.py`
  - Registers contact router at `/contact`
- `domstudio-backend/.env.example`
  - Added `CONTACT_TO_EMAIL=hello@domstudio.site`
- `domstudio-backend/tests/test_contact.py`
  - Covers valid payload and short-message rejection

Validation:
- `npm.cmd run build` passed.
- `python -m py_compile routers/contact.py main.py` passed from `domstudio-backend`.
- `python -m unittest tests/test_contact.py -v` passed.
- Browser smoke: clicking footer `Partnership` on mobile landed at `#contact?reason=partners`, heading rendered, dropdown value was `partners`.

Preview screenshots generated during QA, intentionally untracked:
- `temp-preview/contact-page-desktop.png`
- `temp-preview/contact-page-mobile.png`
- footer preview screenshots from Tech Dolphin footer iterations

Operational note:
- In production Amvera, set `CONTACT_TO_EMAIL` if messages should go somewhere other than `hello@domstudio.site`.
- Existing Resend sender config (`RESEND_API_KEY`, `EMAIL_FROM`) is reused.

---

## June 28, 2026 - Custom domain CORS / Amvera URL check

User noticed Amvera env/info still pointed at Vercel while the site is live at `http://domstudio.site/#home`.

Findings:
- CORS origin for `http://domstudio.site/#home` is `http://domstudio.site` (hash/path are not included in browser Origin).
- Live API host is `https://domstudio1-nate.amvera.io`; `https://domstudio1.amvera.ru` does not resolve in DNS.
- Live `/version` before fix showed `cors.env_origins=["https://domstudio.vercel.app"]`, which was misleading because backend default origins also allowed `https://domstudio.site`.
- Live preflight passed for `Origin: https://domstudio.site`.
- Live preflight failed for `Origin: http://domstudio.site` with `Disallowed CORS origin`.

Code update:
- Added shared `domstudio-backend/cors_config.py`.
- `main.py` now uses `effective_cors_origins()` for middleware.
- `runtime_info.py` now reports both raw `env_origins` and `effective_origins` in `/version`.
- Effective defaults include both `http` and `https` for `domstudio.site` and `www.domstudio.site`.
- `.env.example` updated to include both custom-domain schemes.

Amvera env recommendation:
- `API_URL=https://domstudio1-nate.amvera.io`
- `FRONTEND_URL=http://domstudio.site` while the site is served over HTTP; switch to `https://domstudio.site` after SSL is active.
- `CORS_ORIGINS=https://domstudio.vercel.app,http://domstudio.site,https://domstudio.site,http://www.domstudio.site,https://www.domstudio.site`

Validation:
- `python -m unittest tests/test_runtime_info.py -v` passed from `domstudio-backend`.
- `python -m py_compile domstudio-backend/cors_config.py domstudio-backend/main.py domstudio-backend/runtime_info.py` passed.
- Full backend suite still has unrelated pre-existing failures in generation/token/quota tests.

---

## June 26, 2026 - Session 7: Social before/after card assets

Files/folders:
- `domstudio-frontend/social/before-after-cards-v2/` - approved final card batch
- `domstudio-frontend/social/generated-source/` - generated source before/after images for rings, earrings, watches
- `domstudio-frontend/social/mode-cards/` and `before-after-cards/` - earlier drafts / superseded
- `domstudio-frontend/social/domstudio-card-before-after-*.png` - first card-style tests
- `domstudio-frontend/social/domstudio-instagram-*.png` - earlier Instagram concept tests

**Approved visual direction**
- User wanted cards like the in-app example: large "after" image as hero, small "before" inset overlay, orange after/Posle badge, slim bottom caption area.
- Final approved batch is `before-after-cards-v2`; user said "perfect".
- Use `before-after-cards-v2`, not the first `before-after-cards` batch.

**Final six card assets**
- `01-shoes-before-after-card-v2.png`
- `02-clothes-before-after-card-v2.png`
- `03-rings-before-after-card-v2.png`
- `04-earrings-before-after-card-v2.png`
- `05-watches-before-after-card-v2.png`
- `06-bag-before-after-card-v2.png`
- Preview sheet: `00-contact-sheet-v2.png`

**What changed in v2**
- Footer reduced and pushed lower; v1 footer was too tall/high and stole space from the real image.
- Before inset reduced and moved so it does not cover too much of the after image.
- Clothes card uses the real try-on/person image (`mode-fitting-real-v2.webp`), not a ghost mannequin/generated clothing image.
- Larger media area: approx. 79% image / 21% footer.

**Generated source pairings**
- Rings: source `06 -> 2` in `generated-source` contact sheet.
- Earrings: source `07 -> 3`.
- Watches: source `08 -> 4`.
- Existing app assets used for shoes, clothes, and bag.

---

## June 26, 2026 — Session 6: Warm redesign, nav overhaul, alignment fixes

Files: `domstudio-frontend/src/styles.css`, `domstudio-frontend/src/app.js`

**Warm color palette**
- Root vars: `--paper: #f8f2e3`, `--card: #fffaef`, `--warm-alt: #fef1d6`, `--gold: #c0870a`
- Hero changed from dark night background to warm cream with amber radial glow (light color scheme throughout)
- Proof section and free-tools section use `--warm-alt` background; tool cards use `--card` + gold border

**Full-width desktop nav**
- Removed floating pill: `border-radius: 999px`, outer padding, box-shadow all gone
- Full-width bar with bottom border `rgba(192,135,10,.18)` on warm cream background
- Each nav-link gets its own pill card (`border: 1px solid var(--line); border-radius: 999px`)
- Flex layout: `brand (flex: 0 0 auto) | nav-links (flex: 1, center) | nav-actions (flex: 0 0 auto)` — prevents Тарифы/Войти overlap
- Mobile (≤980px) restores original floating pill via media query

**Section content alignment**
- All sections use `max(clamp(20px, 6vw, 92px), calc((100vw - 1420px) / 2))` horizontal padding
- Aligns content with nav's 1420px frame at any viewport width

**Heading word-break fix**
- `overflow-wrap: break-word; word-break: normal` globally — prevents mid-character breaks like "Инструмен-ты"
- `.mini-head h1` reduced to `clamp(22px, 2.8vw, 40px)`; `.section-head h2` to `clamp(28px, 3.8vw, 52px)`
- Section-head description color darkened to `#3d3a34` for readability

**AdPilot — removed sidebar, centered on desktop**
- Removed `appSidebar("adpilot")` from landing and tool form pages
- Changed wrapper from `app-layout` to `page adpilot-page`; content centered with flex

**Hero top padding reduced**
- Was `clamp(60px, 9vw, 130px)` uniform — too much empty space at top on desktop
- Now `clamp(28px, 3.5vw, 52px)` top / `clamp(56px, 7vw, 100px)` bottom; min-height 760px → 680px

**Examples order fixed**
- Виртуальная примерка (beige suit, video) moved to position 1 only; all other 12 items remain in original order
- Original: perfume × 6 → bottle catalog → wine/bottle × 5 → beige suit last
- Fixed: beige suit first → perfume × 6 → bottle catalog → wine/bottle × 5

---

## June 26, 2026 — Session 5: AdPilot — wizard UX, markdown render, public access

### Changes committed: `7e0e22e`, `5a19435`, `553d1a0`, `e65bea8`

Files: `domstudio-frontend/src/app.js`, `domstudio-frontend/src/styles.css`, `domstudio-backend/routers/content.py`

**AdPilot quick-start (7e0e22e)**
- Product name field + 4 action buttons on landing (no form to fill)
- "AdPilot →" chip added to all 5 tool result rows (removebg, collage, watermark, badge, resizer)
- Studio → AdPilot and Tools → AdPilot context flows: passes image via `state.adpilotContextImage`

**Public anonymous access (5a19435)**
- Backend: `/content/generate/public` endpoint, in-memory IP rate limit 10/day (`ANON_ADPILOT_LIMIT` env var)
- Frontend: localStorage counter (`domstudio_adpilot_anon`), limit 5 client-side, upsell banner after limit
- Anonymous users call `/content/generate/public` (no token deduction); logged-in users use `/content/generate`

**Markdown rendering + Russian default (553d1a0)**
- Output language always defaults to Russian (was based on browser locale)
- `renderMarkdown()` function: `###` → bold heading, `**text**` → `<strong>`, `--` → `<hr>`; safe (escapeHtml first)
- Output panel changed from `<pre>` to `<div class="copy-output-rendered">` with CSS styles

**Wizard UX + empty form (e65bea8)**
- Form starts empty (no "Pilot Auto / brake pads" demo data)
- Wizard mode (default): 2 questions one at a time — "Что продаёте?" → "Главные преимущества?" → generate
- Single-step for reply tools (`reviewText`, `customerQuestion` as first field)
- "Все поля" toggles to full form; "Быстрый режим" returns to wizard
- Context image (from Studio/Tools): 44px → 88px desktop, 64px mobile

**DeepSeek env vars needed in Amvera** (not yet deployed):
- `TEXT_AI_BASE_URL=https://api.deepseek.com/v1`
- `TEXT_AI_API_KEY=<key>`
- `TEXT_AI_MODEL=deepseek-chat`

---

## June 26, 2026 — Session 4: Full Russian localization of frontend

### Changes committed: `0719deb`

Files: `domstudio-frontend/src/app.js`, `domstudio-frontend/src/i18n.js`

- **STYLE_TEMPLATES** (app.js labels + i18n.js RU keys): Чистый каталог, Ювелирный, Косметика, С моделью, Минимал бежевый, Тёмная роскошь, Для соцсетей
- **VARIATIONS**: Чище, Премиальнее, Ярче, Другой фон, Ближе к товару, Реалистичнее
- **EXPORT_SIZES**: Оригинал, Квадрат 1080, Квадрат 2000, Пост 4:5, Портрет 3:4, Story 9:16, Story 9:16 кроп, Баннер 16:9, Баннер 16:9 кроп, Горизонталь 4:3
- **PACK_FORMATS**: VK пост, Telegram пост, Story, Story кроп, Баннер кроп, WebP квадрат (brand names Wildberries/Ozon/Yandex/Avito kept)
- **MARKETPLACE_PRESETS**: "Website Banner" → "Баннер для сайта"
- **EXAMPLE_IMAGES**: all mode/product/title fields translated; Lifestyle, Stories kept English as genre terms
- Words intentionally kept in English: Lifestyle, Stories, Story, AI, WebP, brand names (WB, Ozon, Yandex, Avito, VK, Telegram), aspect ratios

### i18n.js architecture note

- RU locale uses `T.ru` keys; EN locale uses `T.en`; app.js `.label` fields are fallbacks (shown only if `t()` returns falsy, which is rare)
- `CONTENT_TOOLS_FALLBACK` and `CONTENT_FIELD_LABELS` in app.js: fallbacks only — i18n.js handles display via `copy.tool.*` and `copy.field.*` keys
- `PAGE_TITLES` constant in app.js: dead code — browser tab title set via `t("title.${route}")`

---

## June 26, 2026 — Session 3: Catalog mode AI generation fix

### catalog_birefnet.json rewritten (12-node workflow)

Old: 3-node workflow — LoadImage → BiRefNetRMBG → SaveImage (no AI, near-identical output)
New: BiRefNet background removal → Qwen image generation pipeline

- Node 2 (BiRefNetRMBG) outputs clean white-bg cutout
- Node 7 (TextEncodeQwenImageEdit) receives the cutout as input image
- Prompt: hardcoded catalog directive in comfy_client.py (no user prompt expansion for catalog mode)
- Output: proper AI-generated catalog photo, not just a background-erased image

### comfy_client.py changes

- Added `"catalog"` to `MODE_PROMPT_DIRECTIVES`
- `generate_image_with_comfy()`: catalog+image → fixed catalog prompt, no `expand_prompt_for_qwen()`
- Removed `_composite_on_white` post-processing for catalog (Qwen outputs RGB)

---

## June 26, 2026 — Session 2: ngrok tunnel + BiRefNet fix, generation confirmed working

### Tunnel: switched from localhost.run to ngrok (stable)

- localhost.run was unreliable — URL changed on every reconnect and tunnels died after first use
- Cloudflare POST blocked on this Chinese server (confirmed)
- **Fix**: ngrok v3 installed at `/autodl-fs/data/bin/ngrok`, authtoken configured
- Startup: `setsid /autodl-fs/data/bin/ngrok http 8188 > /tmp/ngrok-out.txt 2>&1 < /dev/null &`
- Get current URL: `curl -s http://localhost:4040/api/tunnels | python3 -c 'import sys,json; d=json.load(sys.stdin); [print(t["public_url"]) for t in d["tunnels"] if t["public_url"].startswith("https")]'`
- Note: ngrok free URL changes on process restart — update Amvera `COMFYUI_URL` after each reboot

### ComfyUI actual path: /root/autodl-tmp/ComfyUI/ (not /root/ComfyUI/)

Session 1 archive had wrong path. Confirmed via `find /root -maxdepth 3 -name 'main.py'`. Custom nodes are in `/root/autodl-tmp/ComfyUI/custom_nodes/`.

### BiRefNet fix: installed ComfyUI-RMBG node

- Workflow uses `BiRefNetRMBG` node (from 1038lab/ComfyUI-RMBG)
- `ComfyUI_BiRefNet_ll` was already present but uses different node names — can't substitute
- Fixed: `git clone https://github.com/1038lab/ComfyUI-RMBG.git` in `/root/autodl-tmp/ComfyUI/custom_nodes/`
- Deps: `pip install -r requirements.txt` (timm, torchvision, etc.)
- Note: `AILab_BodySegment.py` in the same plugin throws `libcudart.so.13` error (benign, body segment node only)
- BiRefNet model downloaded via `hf-mirror.com` (HuggingFace mirror, accessible from China):
  ```python
  HF_ENDPOINT=https://hf-mirror.com python3 -c "
  from huggingface_hub import hf_hub_download
  hf_hub_download(repo_id='1038lab/BiRefNet', filename='BiRefNet-general.safetensors', local_dir='/root/autodl-tmp/ComfyUI/models/BiRefNet')
  "
  ```

### ComfyUI startup: use setsid not nohup

- `nohup ... &` in SSH: exits 255 if SSH drops before process properly detaches
- **Fix**: `setsid python3 main.py ... >> log 2>&1 < /dev/null &` — fully detaches from session
- Both ComfyUI and ngrok now started this way in `/autodl-fs/data/start_domstudio.sh`

### CORS: was transient

- CORS errors seen in browser were during Amvera restart (new COMFYUI_URL env var)
- Backend CORS config is correct: `access-control-allow-origin: https://domstudio.vercel.app` confirmed via preflight test
- No code fix needed

### AutoDL file store

- Browse persistent `/autodl-fs` without SSH: https://www.autodl.com/console/file-store?disk=west-B

---

## June 26, 2026 — Session 1: AutoDL setup on SeetaCloud vGPU-32GB (Ada Lovelace)

### New AutoDL instance

- SSH: `ssh -p 46594 root@connect.westc.seetacloud.com` (password: not archived)
- GPU: **NVIDIA vGPU-32GB, 32760 MiB, compute cap 8.9 (Ada Lovelace)** — nunchaku AWQ works ✅
- PyTorch: 2.5.1+cu124
- nunchaku: 1.0.1+torch2.5 — already installed ✅
- ComfyUI: at `/root/ComfyUI/` (not /autodl-fs), version 0.3.75

### SSH key set up (no more password dialogs)

- Key: `C:\Users\nate-\.ssh\autodl_key` (ed25519)
- Added to `/root/.ssh/authorized_keys` on server
- All future SSH: `ssh -i ~/.ssh/autodl_key -p 46594 root@connect.westc.seetacloud.com`

### Models — all already present on /autodl-fs/data/models/

| Model | Path | Size |
| --- | --- | --- |
| Qwen image edit (old v1) | `diffusion_models/svdq-int4_r128-qwen-image-edit-2509-lightning-4steps-251115.safetensors` | 12GB |
| Qwen CLIP | `clip/qwen_2.5_vl_7b_fp8_scaled.safetensors` | 8.8GB |
| Qwen VAE | `vae/qwen_image_vae.safetensors` | — |
| WanVideo I2V 14B | `diffusion_models/WanVideo/Wan2_1-I2V-14B-480P_fp8_e4m3fn.safetensors` | 16GB |
| WanVideo T5 encoder | `text_encoders/umt5-xxl-enc-bf16.safetensors` | 11GB |
| WanVideo VAE | `vae/wanvideo/Wan2_1_VAE_bf16.safetensors` | — |
| WanVideo lightx2v LoRA | `loras/WanVideo/Lightx2v/lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors` | — |
| CLIP vision | `clip_vision/clip_vision_h.safetensors` | 1.2GB |

### Custom nodes — all already installed in /root/ComfyUI/custom_nodes/

ComfyUI-nunchaku, ComfyUI-WanVideoWrapper, ComfyUI-VideoHelperSuite, ComfyUI-KJNodes, ComfyUI_BiRefNet_ll, ComfyUI-Manager, and many others.

### Symlinks created (paths workflow expects vs where files actually are)

```bash
# Qwen model: workflow expects lightningv2.0 filename, we have old v1 filename
ln -sf .../lightning-4steps-251115.safetensors .../lightningv2.0-4steps.safetensors

# T5 encoder: node looks in clip/, file is in text_encoders/
ln -sf .../text_encoders/umt5-xxl-enc-bf16.safetensors .../clip/umt5-xxl-enc-bf16.safetensors

# WanVideo VAE: workflow expects vae/ root, file is in vae/wanvideo/
ln -sf .../vae/wanvideo/Wan2_1_VAE_bf16.safetensors .../vae/Wan2_1_VAE_bf16.safetensors
```

### extra_model_paths.yaml written to /root/ComfyUI/

Points ComfyUI to `/autodl-fs/data/models/` for all model types.

### Tunnel: localhost.run (cloudflare blocked on this server)

- Cloudflare `api.trycloudflare.com` POST times out from this Chinese server (GET returns 405, but tunnel creation POST hangs)
- **Fix**: localhost.run SSH tunnel works: `ssh -R 80:localhost:8188 nokey@localhost.run`
- Current tunnel URL: `https://59bda6bae8f5b9.lhr.life` (changes on reconnect)
- Tunnel log: `/autodl-fs/data/tunnel.log`

### Startup script: /autodl-fs/data/start_domstudio.sh

After every reboot, run this script then read the new URL from tunnel.log and update Amvera:

```bash
bash /autodl-fs/data/start_domstudio.sh
grep lhr.life /autodl-fs/data/tunnel.log | tail -1
# copy URL → update COMFYUI_URL in Amvera dashboard
```

### ComfyUI started successfully

- Port 8188, `--disable-smart-memory`, 32GB VRAM free
- System stats confirmed: `curl http://localhost:8188/system_stats`

### Lesson learned: use JupyterLab terminal for AutoDL server work

Running SSH from the Bash tool caused: GUI password dialogs on user's screen, SSH rate-limiting after rapid parallel connections, dropped connections on any `sleep` in commands. **Going forward: tell user to use JupyterLab terminal (already running on every AutoDL instance) for interactive/long-running work. SSH with key is fine for short automation commands.**

### Next step

- Update `COMFYUI_URL=https://59bda6bae8f5b9.lhr.life` in Amvera dashboard
- Test image generation on domstudio.vercel.app

---

## June 25, 2026 — Session 3: WanVideo I2V setup + generation fixes

### Critical finding: Q RTX 8000 (Turing cc 7.5) incompatible with nunchaku Qwen image generation
- **Root cause**: nunchaku's AWQ W4A16 kernels (`awq_gemv_w4a16_cuda`) require Ampere (cc 8.0+). Quadro RTX 8000 is Turing (cc 7.5) → assertion failure → ComfyUI crash
- **Video worked** on Turing because WanVideo uses standard PyTorch, not nunchaku AWQ
- **Image generation never worked** on this GPU (earlier "success" was video or wrong test)
- **Fix**: need Ampere 48GB GPU — **RTX A6000** or **A40** (both cc 8.6, 48GB). Run `vast_setup.sh` on new instance

### ComfyUI model folder mapping (learned by trial and error)
All confirmed for ComfyUI-WanVideoWrapper + ComfyUI-nunchaku:

| Node | Folder |
|---|---|
| `NunchakuQwenImageDiTLoader` | `diffusion_models/` |
| `WanVideoModelLoader` | `diffusion_models/WanVideo/` |
| `WanVideoVAELoader` | `vae/` |
| `WanVideoLoraSelect` | `loras/WanVideo/Lightx2v/` |
| `LoadWanVideoT5TextEncoder` | `clip/` |
| `CLIPVisionLoader` | `clip_vision/` |
| `CLIPLoader` (Qwen CLIP) | `clip/` |
| `VAELoader` (Qwen VAE) | `vae/` |
| `BiRefNetRMBG` | auto-downloads to `BiRefNet/` |

### ComfyUI --disable-smart-memory fix
- vast.ai sets `COMFYUI_ARGS` env var, overrides default in `comfyui.sh`
- Fix: append unconditionally in script: `COMFYUI_ARGS="${COMFYUI_ARGS:---disable-auto-launch --port 18188 --enable-cors-header} --disable-smart-memory"`
- Confirms in log as: `Disabling smart memory management`
- Without it: `VRAM > 15GiB, disabling CPU offload` overrides all per-node offload settings

### WanVideo generation confirmed working on Q RTX 8000
- 4-step lightx2v LoRA: **241 seconds** (~4 min) for 81 frames at 832×480
- Block swap: 9 blocks on CPU (3.4GB), 31 on GPU (12GB) — fit within 48GB with Qwen offloaded
- VAE precision must be `fp16` (bf16 fails with cudnn_convolution on Turing)
- T5 encoder precision must be `bf16` (fp16 not accepted by node)
- lightx2v LoRA public source: `https://huggingface.co/Kijai/WanVideo_comfy/resolve/main/Lightx2v/lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors`

### Fixes from this session
- **nunchaku model path**: model must be in `diffusion_models/` (not `nunchaku/`) — `NunchakuQwenImageDiTLoader` registers models via `add_known_models("diffusion_models", ...)`
- **photo quota removed**: `/generate` endpoint now uses token balance only (no subscription quota gate)
- **nunchaku version**: PyPI 0.16.1 won't work — must install wheel from GitHub releases: `nunchaku-1.2.1+cu12.8torch2.10-cp312-cp312-linux_x86_64.whl`

### WanVideo I2V setup (image-to-video on vast.ai)
Custom nodes installed:
- `ComfyUI-WanVideoWrapper` (kijai) — WanVideo nodes
- `ComfyUI-VideoHelperSuite` (Kosinkadink) — VHS_VideoCombine
- `ComfyUI-KJNodes` (kijai) — ImageResizeKJv2

Models downloaded to `/workspace/ComfyUI/models/`:
- `WanVideo/Wan2_1-I2V-14B-480P_fp8_e4m3fn.safetensors` — main I2V model (16GB, from `Kijai/WanVideo_comfy`)
- `WanVideo/umt5-xxl-enc-bf16.safetensors` — T5 text encoder (11GB, from `Kijai/WanVideo_comfy`)
- `wanvideo/Wan2_1_VAE_bf16.safetensors` — VAE (243MB, from `Kijai/WanVideo_comfy`)
- `clip_vision/clip_vision_h.safetensors` — CLIP vision (from `Comfy-Org/Wan_2.1_ComfyUI_repackaged`)

**LoRA note**: lightx2v 4-step LoRA is gated on HuggingFace (401). Workflow updated to use 20 steps without LoRA instead (unipc scheduler, cfg=6). ~2-3 min per video on Q RTX 8000 vs ~30s with LoRA.

### Workflow update
`product_video_wan_local.json`: removed `WanVideoLoraSelect` node, changed steps 4→20, scheduler `dpm++_sde`→`unipc`, cfg 1→6, blocks_to_swap 10→20.

### vast_setup.sh updated
Now also installs WanVideoWrapper + VideoHelperSuite + KJNodes and downloads all 4 WanVideo models. Use `[ ! -s ]` check for files that may exist as 0-byte (failed downloads).

---

## June 25, 2026 — Session 2: Vast.ai GPU setup + UI fixes

### Vast.ai Q RTX 8000 — first working instance
- Switched GPU backend from AutoDL to vast.ai
- Instance ID: **42539729**, Machine ID: 52304, Host: 110043
- GPU: Q RTX 8000, 48GB VRAM, 5000 ports, $0.019/hr (best offer)
- Image: `vastai/aio-studio:2026-04-16` — ComfyUI pre-installed at `/workspace/ComfyUI`
- ComfyUI started via `supervisorctl start comfyui`, runs on port **18188**
- Tunnel: `https://trackbacks-seniors-athletic-formula.trycloudflare.com` (changes on reboot — use tunnel_manager API to refresh)
- SSH: direct `root@136.175.252.85:46863`, proxy `ssh9.vast.ai:19729`
- SSH key: `C:\Users\nate-\.ssh\vastai_key` (passwordless ed25519, registered as id 1016938)
- **Note**: Claude cannot SSH directly (no TTY in Bash tool) — user must SSH from their terminal

### Vast.ai tunnel refresh procedure (on reboot)
```bash
curl -s "http://localhost:11112/get-quick-tunnel/http://localhost:18188" | python3 -m json.tool
# Copy tunnel_url → update COMFYUI_URL in Amvera dashboard
```

### Vast.ai SSH key setup (for reference)
- Key generated: `ssh-keygen -t ed25519 -f C:\Users\nate-\.ssh\vastai_key` (press Enter for no passphrase)
- Registered: `vastai create ssh-key "ssh-ed25519 AAAA..."`
- Must register key BEFORE creating instance — attach to running instance doesn't propagate

### ComfyUI model setup on vast.ai
Custom nodes installed:
- `ComfyUI-nunchaku` (nunchaku-ai/ComfyUI-nunchaku) — Qwen Image DiT loader
- `ComfyUI-RMBG` (1038lab/ComfyUI-RMBG) — BiRefNet background removal

Models downloaded to `/workspace/ComfyUI/models/`:
- `nunchaku/svdq-int4_r128-qwen-image-edit-2509-lightningv2.0-4steps.safetensors` — Qwen img2img (4GB, from `nunchaku-tech/nunchaku-qwen-image-edit-2509`)
- `clip/qwen_2.5_vl_7b_fp8_scaled.safetensors` — text encoder (8GB, from `Comfy-Org/Qwen-Image_ComfyUI`)
- `vae/qwen_image_vae.safetensors` — VAE (300MB, from `Comfy-Org/Qwen-Image_ComfyUI`)
- `BiRefNet/General-HR.safetensors` — background removal (800MB, from `ZhengPeng7/BiRefNet` as `model.safetensors`)

Workflow updates (commits `934c04a`):
- `product_image.json` + `product_image_img2img.json`: updated model filename to `lightningv2.0-4steps` (was `lightning-4steps-251115`)
- `catalog_birefnet.json`: rewrote to use `BiRefNetRMBG` node (replaces `AutoDownloadBiRefNetModel`+`RembgByBiRefNet` which aren't in this plugin)

### Auto-setup script for new vast.ai instances
`domstudio-backend/vast_setup.sh` — one command to fully set up a fresh instance:
```bash
wget -q -O /workspace/vast_setup.sh "https://raw.githubusercontent.com/Nate-valerian/domstudio/main/domstudio-backend/vast_setup.sh" && chmod +x /workspace/vast_setup.sh && bash /workspace/vast_setup.sh
```
Script: installs nunchaku + RMBG nodes, downloads all 4 models (skips existing), starts ComfyUI, prints cloudflare tunnel URL.
After it finishes: copy the tunnel URL → update `COMFYUI_URL` in Amvera dashboard.
Takes ~30 min on first run (model downloads). Subsequent runs on same disk: ~10 seconds (all skips).

### UI fixes (commits pushed earlier in session)
- BG removal card: removed `——` line (changed `.eyebrow` to `.tool-card-badge`)
- Studio CTA: "For better results — use AI models in Studio →" as orange chip below description
- Tools page: added horizontal padding (`padding: 0 16px` mobile, `0 32px` desktop)
- Examples page: removed dead space above/below section (mobile specificity fix)
- Example card order: Creative first, Product second, Catalog third

---

## June 25, 2026 — Session wrap (BG removal + hosting prep, commits `bd020fd`→`7b8d10a`)

Full session focused on fixing BG removal for iOS Safari. Four commits, all pushed.

### What was done

**imgly CORS fix — 3 iterations:**
1. Vercel serverless function `api/imgly/[...path].js` was returning 400 (catch-all route never got `req.query.path`) → replaced with Vercel edge rewrite in `vercel.json`
2. Edge rewrite alone doesn't self-host — switched to download-during-build: `scripts/download-imgly.js` downloads all model chunks (~250MB) from staticimgly.com into `public/imgly/` before `npm run build`. Vite copies to `dist/imgly/`, served as static same-origin files. No CORS check, no CDN dependency.
3. `publicPath` in app.js: `${location.origin}/imgly/` on prod, CDN on localhost

**sweb.ru prep (future hosting):**
- `hosting/imgly-proxy.php` — PHP proxy fetches from staticimgly.com + adds CORS headers
- `hosting/.htaccess` — routes `/imgly/*` to proxy + SPA fallback to `index.html`
- Deploy: build locally (`npx vite build`, skip download script), upload `dist/` + proxy files. No 250MB upload.

**iPhone OOM error:**
- iPhone 8 Plus: WASM heap OOM during model session creation (hardware RAM limit)
- iPhone 11+: works fine
- Fix: detect "Out of memory" in catch block, show friendly RU/EN message instead of raw error
- Server-side BG removal (rembg) rejected — Amvera latency too high

### Commits
- `bd020fd` — Fix imgly proxy: edge rewrite instead of broken serverless fn
- `dfb8cec` — Self-host imgly models via Vercel build-time download
- `907eaa3` — PHP proxy + .htaccess for sweb.ru
- `7b8d10a` — Friendly OOM error message for old iPhones

### Deferred
- React Native sync (next session)
- Tinkoff payment live test
- sweb.ru actual deployment

## June 25, 2026 — iPhone BG removal OOM error: friendly message

**Error:** `RangeError: Out of memory` during WASM session creation on iPhone.
**Root cause:** iOS Safari limits WASM heap size. Even `isnet_quint8` (43MB file) needs ~200-400MB at runtime for tensor allocation — exceeds available WASM memory on many iPhones.
**Fix:** Detect "Out of memory" in the catch block, show localized message instead of raw error.
- RU: "iPhone не хватает памяти для запуска ИИ-модели. Откройте на компьютере — там работает."
- EN: "Not enough memory on iPhone to run the AI model. Open on a desktop — it works there."

**Long-term:** Server-side BG removal via backend (rembg Python lib) — not yet implemented.

### Files changed
- `domstudio-frontend/src/app.js` — OOM detection in `submitRemoveBg` catch block
- `domstudio-frontend/src/i18n.js` — `tools.removeBg.errorOom` key (RU + EN)

## June 25, 2026 — imgly self-hosting + sweb.ru PHP proxy prep

Two complementary solutions for iOS Safari BG removal CORS issue.

### Vercel: self-host model files during build
- `scripts/download-imgly.js` — downloads `resources.json` + all model chunk files from staticimgly.com into `public/imgly/` during Vercel build (runs before `npm run build`)
- `vercel.json` buildCommand: `node scripts/download-imgly.js && npm run build`
- Vite copies `public/imgly/` → `dist/imgly/`, served as static assets
- `publicPath` in app.js: `/imgly/` on production, CDN on localhost
- No CORS issue: browser requests same-origin `/imgly/resources.json`
- Model files are ~250MB total, NOT committed to git (`.gitignore` excludes `public/imgly/`)

### sweb.ru: PHP proxy (for future shared hosting deployment)
- `hosting/imgly-proxy.php` — PHP script that fetches from staticimgly.com and adds `Access-Control-Allow-Origin: *`
- `hosting/.htaccess` — routes `/imgly/*` to proxy, plus SPA fallback to `index.html`
- Deploy: build locally with `cd domstudio-frontend && npm run build` (skip download script), upload `dist/` contents + `imgly-proxy.php` + `.htaccess` to `public_html/`
- No 250MB upload needed — proxy fetches on demand from CDN with CORS headers added

### Files added/changed
- `domstudio-frontend/scripts/download-imgly.js` — Vercel build-time model downloader
- `domstudio-frontend/hosting/imgly-proxy.php` — sweb.ru PHP proxy
- `domstudio-frontend/hosting/.htaccess` — Apache routing for proxy + SPA
- `domstudio-frontend/vercel.json` — buildCommand updated
- `domstudio-frontend/src/app.js` — publicPath uses `/imgly/` on prod, CDN on localhost
- `.gitignore` — added `domstudio-frontend/public/imgly/`

## June 25, 2026 — imgly CDN proxy fix (vercel.json rewrite)

Replaced broken Vercel serverless function with a Vercel edge rewrite to proxy staticimgly.com CDN.

### Problem
`api/imgly/[...path].js` was returning 400 "Missing path" — `req.query.path` was `undefined` in the catch-all handler. Serverless functions in Vercel also take priority over rewrites, so the broken function blocked everything.

### Fix
- Deleted `domstudio-frontend/api/imgly/[...path].js`
- Added Vercel edge rewrite in `vercel.json`: `/api/imgly/:path*` → `https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/:path*`
- Edge rewrite makes the browser think it's a same-origin request (`domstudio.vercel.app`) — no CORS check needed
- `publicPath` in `app.js` stays as `` `${location.origin}/api/imgly/` ``

### Files changed
- `domstudio-frontend/vercel.json` — added imgly rewrite rule (before SPA catch-all)
- deleted `domstudio-frontend/api/imgly/[...path].js`

## June 25, 2026 — Bug fixes + Template Studio sprint (commits `f1a3a2b`→`68a759c`)

Frontend + backend. Post-AdPilot session.

### Template Studio (added then merged)
- Built "Marketplace photo" as a separate tool card — auto BG removal + 7 canvas-generated template backgrounds (White, Beige, Gray, Dark, Studio gradient, WB, Ozon)
- Realized it duplicated BG Removal — removed the standalone card, merged template picker into BG Removal result view
- Then removed the template picker entirely (user: "unnecessary") — existing color chips already cover it
- Net result: BG Removal card is cleaner, no redundant tool

### iPhone fixes (`f31646c`, `1f96a5f`)
- **Upload bug fixed:** `<label for="removebg-file">` already handles click natively; JS `.click()` handler was double-firing and being blocked by iOS Safari security policy → removed the duplicate handler
- **BG removal on mobile:** switched to `isnet_quint8` (quantized model, ~4× smaller) on iPhone/Android via `navigator.userAgent` check — less memory pressure on iOS
- **Upload hint updated:** "Фото без рук для лучшего результата" — AI keeps hands as foreground, user needs to know to photograph without hands
- **CDN issue:** `staticimgly.com` was temporarily down (`ERR_HTTP2_PROTOCOL_ERROR`). Tried jsDelivr — package not on npm, reverted. CDN dependency unavoidable without self-hosting ~150MB model files.

### Tinkoff payment fix (`40b3b78`) — backend
- `POST /payments/tinkoff/init` returning 500 for all plan purchases
- Root cause: Receipt block sent `"Email": ""` when user has no email — Tinkoff rejects empty string for fiscal receipt
- Fix: conditionally include Email/Phone only when non-empty using dict spread
- Error message improved to include Tinkoff error code for easier debugging
- **Deployed to Amvera** — backend pushed

### AdPilot orange back button (`47d4ed1`)
- "← Все категории" back button restyled from plain muted text to orange card matching app's `--acid: #ff9d2e` color

### Files changed
- `domstudio-frontend/src/app.js` — template tool (added/removed), BG removal iPhone fixes, CDN config
- `domstudio-frontend/src/i18n.js` — template keys, upload hint update
- `domstudio-frontend/src/styles.css` — orange back button, template grid CSS
- `domstudio-backend/routers/payments.py` — Receipt fix, better error message

## June 25, 2026 — AdPilot UX redesign (commits `8dcdcab`, `bf5d543`, `b7d48b4`, `e9b9361`)

Frontend-only. Full AdPilot page redesign across 5 steps.

### What changed
- **Category landing screen:** First view is now a 3-col category grid (emoji icon, name, desc, tool count). `contentToolSlug: null` on init shows landing instead of jumping into a tool.
- **Tool list → icon cards:** Left panel now has `.copy-tool-card` cards with name, intent, and token cost badge. Category group headers with emoji icons (💄 КРАСОТА, etc.). Back button "← Все категории" returns to landing.
- **Blurred example output:** Empty output panel shows a realistic per-category blurred example text behind a "Заполните форму и нажмите «Сгенерировать»" overlay. `TOOL_EXAMPLE_OUTPUT` map covers all 9 categories.
- **Better form header:** Replaced generic `mini-head` with structured header: category emoji + tool name + CATEGORY label + token cost badge + intent description + "Готово к использованию" green tag + Fill Example link.
- **Better output panel header:** Now mirrors form header — tool name + category icon + "Скопируйте в карточку..." hint + "✓ Готово" green badge when output is ready.

### Files changed
- `domstudio-frontend/src/app.js` — `CATEGORY_META`, `TOOL_EXAMPLE_OUTPUT`, landing HTML, tool panel aside, form header, output panel header
- `domstudio-frontend/src/i18n.js` — 9 category descs, `adpilot.backToCategories`, `copy.outputEmptyHint`, `copy.outputReady`
- `domstudio-frontend/src/styles.css` — all new AdPilot + output empty state + form/output header styles

## June 25, 2026 - Send to chip order fixed (commits `e3f10a7`, `2110ea1`)

Frontend-only. Consistent "Send to →" chip order across all tools.

### What changed
- **Old order (BG Removal):** Resizer, Watermark, Collage, Promo, Compressor — random, Collage buried
- **New order everywhere:** Collage → Watermark → Promo → Resizer → Compressor → Checker (source tool skipped)
- **Missing chips added:** BG Removal now includes Checker; Collage now includes Promo and Compressor; Promo now includes Collage, Compressor; Watermark now includes Checker
- **Files changed:** `domstudio-frontend/src/app.js` (all 5 send-to rows)

---

## June 25, 2026 - Watermark Tool UX Fixes (live preview + full flow)

All changes are frontend-only. Three commits: `757af90`, `99b71db`, `05259b2`.

### Problem 1: Text input lost focus on every keystroke
- **Root cause:** `applyWatermark()` was called on every `input` event → triggered `render()` → destroyed and recreated the DOM including the text field → focus lost after each character → impossible to type multi-word text
- **Fix:** Replaced the `<img>` preview with a `<canvas id="wm-preview-canvas">`. Added `drawWatermarkPreview()` which draws directly to the existing canvas element without calling `render()`. Text `input` handler now only calls `drawWatermarkPreview()` — no re-render, no focus loss.

### Problem 2: No proper Apply → result flow
- **Old behaviour:** Controls always visible, result overlaid on preview image — no clear moment of "done"
- **New flow:**
  1. Upload photo → shown on canvas, controls below
  2. Type text / pick position / opacity / color → watermark appears live on canvas
  3. **Apply** → canvas `.toDataURL()` saves the result → switches to result view
  4. Result view: **Download JPG** + **Edit** (clears result, returns to canvas with same photo and settings) + **Another photo** (full reset)
- Position/opacity/color buttons call `render()` to update active chip state, then immediately call `drawWatermarkPreview()` to redraw canvas

### Problem 3: No "Send to →" after watermark applied
- Result view was missing the cross-tool handoff row
- Added chips: Send to Collage, Promo Badge, Resizer, Compressor (`data-send-from="watermark"`)

### Files changed
- `domstudio-frontend/src/app.js` — `drawWatermarkPreview()` function, watermark card HTML (3 states: upload / canvas+controls / result), bind handlers
- `domstudio-frontend/src/i18n.js` — added `tools.watermark.edit` key (RU: "Редактировать", EN: "Edit")

---

## June 25, 2026 - Tools Page Full Sprint (7 tools, layout, UX fixes)

All changes are frontend-only (Canvas API, no backend). Tools page is now fully public — no login required.

### Tools page: no auth required (commit `4824f0f`)
- Removed auth gate from `toolsPage()` — all 7 tools are free and accessible without account
- Fixes: logged-out users saw "Create an account first" gate when clicking Tools tab

### Cross-tool image handoff — "Send to →" (commit `4824f0f`)
- After any tool produces a result, a "Отправить в → / Send to →" chip row appears
- Each chip sends the current result directly to another tool (pre-loads it, scrolls to it)
- `sendToTool(toolId, dataUrl)` dispatches to the correct state fields
- Each button has `data-send-from` so it knows which result to use (not always BG removal)
- Collage handoff appends to existing slots instead of resetting

### Collage Maker tool (commit `9447cb7`)
- 3 layouts: 2×1 (side by side), 1+2 (big+two small), 2×2 (4 photos)
- Upload slots shown per layout, each independently clickable
- Canvas compositing: scale-to-fill per slot with 6px gap, white background, 1080px output
- Remove individual slot with ✕ button; build button appears when all slots filled
- "Send to Collage" from BG Removal appends to next empty slot (enables multi-BG workflow)

### Promo Badge tool (commit `9447cb7`, refined `4dc16c1`)
- Circular badge with custom text (up to 8 chars), 5 color presets + custom color picker
- 4 corner positions (top-left, top-right, bottom-left, bottom-right)
- Live preview — badge updates instantly on every change, no Apply button
- Badge radius = 14% of shortest image dimension; font scales with badge size

### Image Compressor tool (commit `9447cb7`, refined `4dc16c1`)
- Quality slider 40–95% (step 5)
- Shows BEFORE / AFTER KB + % saved in a stat row
- "Edit quality" button returns to slider without losing the photo
- `canvas.toDataURL("image/jpeg", quality/100)` — pure client-side

### 7-card layout: BG Removal full-width + 2-column grid (commits `4a45342`, `1c5c210`, `314b678`)
- BG Removal card spans full width (`grid-column: 1 / -1`) — hero position
- Remaining 6 cards in 2-column CSS grid at ≥960px; single column on mobile
- `align-items: stretch` + flex column on cards — cards in same row share equal height
- Upload placeholders use `flex: 1` to fill remaining height

### Tool order (mobile top-to-bottom) (commit `7241807`)
```
1. Background Removal (full width)
2. Collage
3. Promo Badge
4. Watermark
5. Image Resizer
6. Image Checker
7. Compressor
```
Desktop grid pairs: Collage|Promo, Watermark|Resizer, Checker|Compressor

### Watermark: live preview (commit `0071619`)
- Removed two-state model (preview → apply → locked result)
- Controls always visible alongside the image preview
- Every change (text, position, opacity, color) immediately calls `applyWatermark()` and updates the displayed image
- Download JPG available as soon as text is entered; no Apply button

### Marketplace Checker CSS (commit `2922943`)
- `.checker-preview-row`, `.checker-thumb`, `.checker-meta`, `.checker-markets`, `.checker-market`, `.checker-market-name`, `.checker-row`, `.checker-value`, `.check-ok` (green), `.check-fail` (red)

### Bug fixes
- `send-to` always used BG removal result regardless of source card → fixed with `data-send-from` attribute per button (commit `0d3eaf2`)
- Collage/Promo/Compressor cards were outside `tools-grid` due to stray `</div>` → removed (commit `1c5c210`)
- Presets dropdown removed from navbar — redundant with Studio form (commit `3effa49`)

---

## June 25, 2026 - Quick Edits: Benefits + WB/Ozon Export + Brand Kit Logo

Continued the post-generation quick edits sprint and brand kit work. All frontend-only.

### Feature: Add 3 Benefits overlay (commit `f14d77b`)

- New chip "Добавить преимущества / Add benefits" in `quickEditsPanel()`
- Three text inputs appear in the overlay form when benefits mode is active
- Canvas draws gold checkmark pill chips vertically centered on the left side of the image
- `state.overlayBenefits: ["", "", ""]` tracks the three inputs; reset on new generation
- `drawOverlayOnCanvas("benefits", [...])` draws each non-empty benefit as a white rounded pill with a gold filled circle ✓ icon and dark bold text
- RU + EN i18n: `quickEdit.addBenefits`, `quickEdit.benefitPlaceholder`

### Feature: "Ready for WB/Ozon" quick export chip (commit `24021ac`)

- New chip "Готово для WB / Ready for WB" (or whichever marketplace is set as default in brand prefs) in `quickEditsPanel()`
- One click calls `exportForPack(marketplace_id)` — the same resizing + download path used by `contentPackTools()`
- No new canvas logic needed; reuses existing `PACK_FORMATS` and `renderToCanvas()`
- RU + EN i18n: `quickEdit.exportFor`

### Feature: Brand kit logo upload (commit `a474097`)

- `DEFAULT_BRAND_PREFS` now has `brand_logo: ""` field
- Brand section collapsible now shows a logo upload row with: current logo thumbnail (52×52, checkered BG), "Загрузить / Upload" file picker label, "Удалить / Remove" button
- `onBrandLogoSelect()`: reads file → draws to canvas at max 300×300px → saves as PNG data URL to `state.brandPrefs.brand_logo` via `saveBrandPrefs()`
- `clearBrandLogo()`: clears the field and re-renders
- Logo overlay: `drawOverlayOnCanvas("logo", ...)` draws the brand logo at 22% image width, bottom-right corner, 0.92 opacity
- RU + EN i18n: `studio.brandLogo*`, `quickEdit.addLogo`, `quickEdit.logoHint`
- CSS: `.brand-logo-row`, `.brand-logo-preview`, `.overlay-logo-hint`

---

## June 25, 2026 - Auth Gate Flash Fix + RemoveBg Persistence (commit `13cf0ea`)

Two bugs fixed after user reported losing tool state on refresh and seeing the register page briefly.

**Auth gate flash:**
- All auth-gated pages (`studioPage`, `accountPage`, `historyPage`, `copyStudioPage`, `toolsPage`) now check `state.authInitializing` before showing `gatePage()`
- `authInitializing: true` is set at startup if tokens exist in localStorage; set to `false` after `loadUser()` resolves
- While initializing: shows `<main class="page"></main>` (blank) instead of the register gate
- Prevents the register CTA from flashing for ~1s on every refresh for logged-in users

**RemoveBg result persistence:**
- `state.removeBgResult` was a `blob:` URL — dies on refresh
- Now converted to a data URL (via `FileReader.readAsDataURL`) before storing in state
- Saved to `sessionStorage` under `domstudio_removebg_result` — survives refresh within the same tab session
- `initialRemoveBgResult` read from sessionStorage at startup and used as the initial value
- `resetRemoveBg()` also clears `sessionStorage`

---

## June 25, 2026 - Background Removal Moved To Client-Side (commit `dc78dd8`)

**Problem:** Backend was crashing with OOM after `rembg` + `onnxruntime` loaded ~200-300MB into RAM on first call, exceeding the Amvera plan RAM limit.

**Solution:** Replaced backend rembg with `@imgly/background-removal` v1.7.0 — WASM-based ONNX inference running entirely in the user's browser.

Frontend changes:
- `npm install @imgly/background-removal`
- `submitRemoveBg()` now uses a dynamic `import("@imgly/background-removal")` — keeps the ONNX bundle (`ort.bundle.min`, ~395KB gzip 108KB) out of the initial JS load; only fetched when user opens the tool
- Model files (~10MB) download from img.ly CDN on first use, cached by browser; subsequent uses are instant
- `progress` callback updates `state.removeBgProgress` live: "Загружаем модель 45%" while downloading, "Удаляем фон 80%" while processing
- `.removebg-progress` CSS for the progress hint line
- RU + EN i18n: `tools.removeBg.progressDownload`, `tools.removeBg.progressRun`

Backend changes:
- `domstudio-backend/routers/tools.py` gutted to an empty router placeholder
- `rembg==2.0.57` and `onnxruntime==1.19.2` removed from `requirements.txt`
- Amvera backend build is now faster and uses significantly less RAM

---

## June 23, 2026 - AdPilot Mobile Screen (React Native)

Implemented full AdPilot screen in `domstudio-mobile/App.tsx` (commit `e149d6c`).

**What was added:**

- `expo-clipboard` installed and wired for Copy button
- New types in `src/api.ts`: `ContentTool`, `ContentGenerateResult`, `MarketplaceAction` + functions `listContentTools`, `generateCopy`, `listMarketplaceActions`
- New types/functions in `src/storage.ts`: `SavedCopyItem`, `loadSavedCopy`, `saveCopyItems` (persisted to device JSON file)
- `AdPilotScreen` component with all 5 features from the web version:
  1. Tool selector chips (Avito Ad, Ozon Listing, WB Listing, Buyer Reply, Review Reply with fallback list)
  2. Fill with example button (locale-aware example data)
  3. Generate with variations (last 3 kept, swappable via pill buttons)
  4. Character-limit badges (Avito ≤3000, Ozon/WB ≤5000) with green/red indicators
  5. Save to Drafts (device-persisted) + Copy via Clipboard
  6. Adjust / Refine instruction row under output
- Sub-tabs: Connection, Products, Tools (default), Create Draft, Drafts
  - Connection / Products / Create Draft show "available on web" banner
  - Drafts tab shows saved items with copy + delete
- EN + RU copy strings for all adpilot UI text
- `TabGlyph` updated with `"adpilot"` icon case
- `AdPilot` tab added to `MainTabs` between Studio and Examples

## June 23, 2026 - AdPilot Tools: Five UX Improvements

User asked to improve the AdPilot Tools view to reduce friction and
show more value to new users. Five features implemented in one commit
(`b8dfca3`):

1. **Fill with example** — a "Fill with example" link under the tool
   name resets all form fields to locale-aware sample data
   (`CONTENT_DEFAULTS[lang].draft`). Lets new users see AI output in
   seconds without typing anything.

2. **Variations** — `state.contentVariations` stores the last 3 outputs
   (newest first). After the second generation, tab pills appear in the
   output panel so users can switch between options without re-generating.

3. **Character limit badges** — after generation, a `.char-limits` row
   shows the total character count and green/red badges for Avito (3000),
   Ozon (5000), and WB (5000). Sellers see immediately if the copy fits
   platform limits.

4. **Save to drafts** — a "Save to drafts" button in the output panel
   header saves the text to `localStorage` (`domstudio_saved_outputs`,
   max 20). Saved copies appear at the top of the Drafts tab with copy
   and delete buttons. Works without any marketplace connection.

5. **Adjust** — a text input + Adjust button below the output lets users
   give a quick refinement instruction ("shorter", "more formal", "add
   CTA"). On submit, the instruction is passed as `adjust_instruction`
   and the previous output as `previous_output` in the API body alongside
   the normal generate call.

Also in this session — sidebar reorder and UX rationale:
User confirmed the sidebar order should reflect the onboarding flow.
New order: Connection → Products → Tools → Create draft → Drafts.
Removed "Marketplaces" overview tab from the sidebar. Users land on
Tools and can generate copy immediately without connecting anything.
Commit `4eb7889`.

---

## June 23, 2026 - AdPilot Page Structure And Action Form Fixes

User showed three problems on the AdPilot page:

1. PRODUCT dropdown was blank and disabled when no marketplace products had been
   imported — looked broken.
2. ACTION TYPE context textarea showed a generic placeholder regardless of which
   action type was selected (Buyer reply, Improve card, etc.).
3. The marketplace Drafts panel was rendering above the copy tools on the AdPilot
   page instead of being in its own separate view.
4. Token balance was displayed twice — once in the workspace header and once in
   the copy form hint.
5. The sidebar sub-items (Drafts, Create draft, Products, etc.) were decorative
   labels instead of clickable navigation buttons.
6. The copy tools section had no sidebar button of its own.

Changes made:

- Split AdPilot into two distinct views controlled by `state.adpilotView`:
  `"tools"` (default) and `"marketplace"`. Marketplace dashboard no longer
  renders above the copy tools.
- Added a "Tools" sidebar button (`data-adpilot-tools`) as a sub-tab under
  AdPilot. All sub-tabs are now clickable buttons that switch between views.
- Removed duplicate token balance from the AdPilot workspace header.
- `marketplaceActionPanel()`: PRODUCT field now shows a placeholder option
  ("Select a product") and a hint link to the Products tab when no products are
  imported. ACTION TYPE context textarea placeholder now adapts per action type
  (e.g. "Paste the buyer's question or complaint" for buyer_reply).
- Added i18n keys: `market.tab.tools`, `market.tab.toolsSub`,
  `market.noProductsOption`, `market.addProductsHint`, and
  `market.actionContext.*` per-action-type placeholders (RU + EN).
- Added Vite dev proxy in `vite.config.js` so local dev forwards all API paths
  to the Amvera backend without CORS errors.

Sidebar reorder (same session, follow-up):

User requested the sidebar order reflect a logical onboarding flow and confirmed
that users should be able to use Tools without connecting a marketplace first.

New sidebar order: Connection → Products → Tools → Create draft → Drafts.
Removed the "Marketplaces" (overview) tab from the sidebar.
The copy tools form uses free-text fields — no marketplace connection required.

Commits: `87c89a3` (page structure), `4eb7889` (sidebar reorder).

---

## June 23, 2026 - Localize AdPilot Defaults And Harden Amvera Startup

User showed AdPilot with Russian selected while field labels/default content still
appeared in English, then pasted console errors for `/auth/refresh` and
`/content/tools` where browser CORS preflight failed from
`https://domstudio.vercel.app` to `https://domstudio1-nate.amvera.io`.

Amvera build log:

- Container builder exited with code `0`.
- Application archive completed.
- Archive included the repo sources, `.git`, `DOMSTUDIO_ARCHIVE.md`,
  `domstudio-backend`, `domstudio-frontend`, `domstudio-mobile`, `amvera.yml`,
  and related root files.

Live check during the report:

- `https://domstudio1-nate.amvera.io/version` timed out from the terminal.
- `OPTIONS /content/tools` with origin `https://domstudio.vercel.app` also
  timed out.
- Because `/version` timed out, the browser CORS message was treated as a
  symptom of the backend not serving FastAPI responses, not as a missing origin
  in the configured CORS list.

Frontend localization fix:

- Added Russian and English field-label keys for AdPilot copy/profile fields.
- Localized AdPilot tool names, tool categories, and marketplace action types.
- Added Russian defaults for AdPilot draft/profile fields, marketplace
  connection name, and manual product import sample.
- Language toggle now translates only known default/sample values; typed custom
  user values are preserved.
- Russian default detection now uses both Russia time zones and browser locale
  signals, without asking for GPS/geolocation permission.

Backend/Amvera resilience fix:

- Added bounded asyncpg connect/command timeouts.
- Timeout env parsing is tolerant of empty or invalid values, falling back to
  defaults instead of crashing during import.
- Wrapped FastAPI startup database preparation with a timeout and exception log
  so the API can still start and answer `/version`, `/content/tools`, and CORS
  preflights if DB preparation is temporarily unavailable.
- Initially tried changing the Amvera run command so uvicorn would start after
  a failed migration, but live Amvera stayed at 503 after deploy. The command
  was restored to the previously working `migrate && uvicorn` shape while
  keeping the code-side timeout guards.

Validation:

```text
cd domstudio-frontend
npm.cmd run build

build passed

cd domstudio-backend
python -m py_compile main.py database.py migrate.py

compile passed

DB_CONNECT_TIMEOUT_SECONDS=""
DB_COMMAND_TIMEOUT_SECONDS=""
DB_STARTUP_TIMEOUT_SECONDS=""
python -c "import main"
python -c "import migrate"

imports passed
```

---

## June 23, 2026 - Improve Sign-In Recovery And Compact Drafts UI

User reported they could not sign in after the latest UI deploy, then provided
browser console errors where `POST /auth/login/email` was blocked by CORS with
no `Access-Control-Allow-Origin` header. They also showed the Drafts empty state
as too large on desktop and mobile/PWA.

Live checks:

- Amvera `/health` returned 200.
- Amvera `/version` showed commit `4d3e0c3`.
- CORS preflight for `POST /auth/login/email` from
  `https://domstudio.vercel.app` returned 200.
- A fake login returned the expected 401, so the login endpoint itself was
  reachable.

Frontend fix:

- Added `apiErrorMessage()` so FastAPI validation/detail payloads do not render
  as `[object Object]`.
- When email login returns 403 `Email not verified`, the frontend now:
  - calls `/auth/register/email` with the submitted email/password to resend a
    verification code for the existing unverified account
  - opens the verification-code screen
  - shows the normal code-sent toast.

Backend fix:

- Hardened `verify_password()` so invalid/legacy stored password hashes return
  `False` instead of raising a bcrypt exception. This prevents the real-login
  path from producing an unhandled 500, which browsers report as a CORS failure
  because no normal CORS response is produced.

Drafts UI fix:

- Reduced the marketplace Drafts dashboard max width.
- Reduced empty-state height, copy size, padding, and action button height.
- Added a mobile override so empty-state buttons do not become huge full-width
  blocks in the PWA.

Validation:

```text
cd domstudio-frontend
npm.cmd run build

build passed

cd domstudio-backend
python -m unittest tests.test_marketplaces -v

Ran 4 tests
OK

python auth_utils invalid-hash smoke

verify_password(...) returned False instead of raising
```

---

## June 23, 2026 - Make AdPilot Drafts The First Marketplace View

User clarified the marketplace overview should be another left-sidebar section,
not the default view, and that AdPilot should always open with Drafts first.

Implemented:

- Changed default `marketplaceTab` to `drafts`.
- Reordered AdPilot marketplace sidebar subtabs:
  - Drafts
  - Create draft
  - Products
  - Connection
  - Marketplaces
- Clicking the main AdPilot sidebar item now resets the marketplace view to
  Drafts.
- Renamed the old Overview tab to Marketplaces.
- Improved the empty Drafts state with direct next-step buttons for creating a
  draft, importing products, or opening connection setup.

Validation:

```text
cd domstudio-frontend
npm.cmd run build

build passed
```

---

## June 23, 2026 - Move Marketplace Tabs Into Workspace Sidebar

User clarified that the marketplace tabs should live in the existing left
workspace sidebar, under AdPilot, not inside the page content.

Implemented:

- Added AdPilot marketplace sub-tabs directly inside `appSidebar("adpilot")`.
- Removed the desktop in-page marketplace tab rail.
- The page content now shows only the currently selected marketplace panel.
- Kept a compact mobile-only tab row because the workspace sidebar is hidden on
  small screens.

Validation:

```text
cd domstudio-frontend
npm.cmd run build

build passed
```

---

## June 23, 2026 - Marketplace Dashboard Converted To Left Tabs

User showed the AdPilot marketplace dashboard as a messy wall of forms and asked
to move those sections into left-side tabs.

Implemented:

- Added `marketplaceTab` frontend state.
- Converted the marketplace dashboard from all panels visible at once into a
  tabbed workspace with left-side tabs:
  - Overview
  - Connection
  - Products
  - AdPilot action
  - Drafts
- Kept only one marketplace panel visible at a time.
- Added guided tab transitions:
  - saving a connection opens Products
  - importing products opens AdPilot action
  - creating a draft opens Drafts
- Added RU/EN tab labels.
- Updated responsive CSS so the tabs become a horizontal rail on tablet/mobile.

Validation:

```text
cd domstudio-frontend
npm.cmd run build

build passed
```

---

## June 23, 2026 - AdPilot Marketplace Frontend Dashboard Started

User asked to start building the UI that connects AdPilot to marketplaces after
the backend marketplace layer was added.

Implemented frontend marketplace workflow inside the existing AdPilot route:

- Added marketplace state and API loading for:
  - `/marketplaces/providers`
  - `/marketplaces/connections`
  - `/marketplaces/products`
  - `/marketplaces/actions`
  - `/marketplaces/rules`
- Added provider tabs for Wildberries, Ozon, and Avito with capability/status
  counters.
- Added a marketplace connection form:
  - provider
  - display name
  - draft/live mode
  - API token
  - Client ID
  - Avito user ID as provider extra config
- Added product import/sync panel:
  - manual product import
  - optional live fetch through provider API
  - recent imported product picker
- Added AdPilot marketplace action panel:
  - select imported product
  - choose action type
  - generate reviewable marketplace action draft
- Added action review list with approve and publish-preview buttons.
- Added RU/EN i18n strings and responsive CSS for the marketplace dashboard.

Validation:

```text
cd domstudio-frontend
npm.cmd run build

build passed

cd domstudio-backend
python -m unittest tests.test_marketplaces -v

Ran 4 tests
OK
```

Important behavior boundary:

- The frontend now talks to the marketplace backend.
- Live marketplace publishing is still intentionally conservative/dry-run until
  official seller API payloads are verified with real WB/Ozon/Avito accounts.
- Production still needs deployed DB migration and `MARKETPLACE_SECRET_KEY`.

---

## June 23, 2026 - Disable Legacy Render/Railway Backend Deploy Hooks

User asked to disable Render after confirming Render and Amvera were serving the
same backend role.

Repo-side cleanup:

- Removed `domstudio-backend/Procfile`, the old generic process file used by
  Render-style deploys.
- Removed `domstudio-backend/railway.toml`, the old Railway deploy config.
- Kept `amvera.yml` untouched; Amvera remains the active backend deploy path.
- Confirmed local mobile env points at:

```text
https://domstudio1-nate.amvera.io
```

Important external step:

- The actual Render service `https://domstudio.onrender.com` must still be
  suspended or deleted in the Render dashboard/API, because this repo does not
  contain a `render.yaml` blueprint and no Render connector/API token is
  available in this session.

---

## June 23, 2026 - AdPilot Marketplace Backend And Text Health Follow-Up

This work was committed after the previous AdPilot quality archive entry and
was missing from the archive until this follow-up note.

Commits:

```text
c3bfb37 Add AdPilot marketplace backend
17e73cb Fix text AI health path
```

Marketplace backend implemented in `c3bfb37`:

- Added database models/enums for marketplace connections, imported products,
  AdPilot actions, and AdPilot automation rules.
- Added migration `006` for the marketplace tables.
- Registered a new `/marketplaces` router in the backend.
- Added provider catalog support for Wildberries, Ozon, and Avito.
- Added authenticated routes for:
  - listing provider capabilities
  - creating marketplace connections
  - syncing/importing products
  - listing imported products
  - generating AdPilot action drafts
  - approving/publishing actions
  - creating/listing automation rules
  - evaluating rules against product/event data
- Added encrypted storage helpers for marketplace API credentials using
  `MARKETPLACE_SECRET_KEY`.
- Added marketplace integration helpers:
  - normalize product payloads from WB/Ozon/Avito-like data
  - fetch products from live provider APIs when credentials are supplied
  - keep publishing in dry-run/safe mode until exact provider write payloads
    are verified.
- Added `services/adpilot_engine.py` to turn marketplace/product context into
  seller-reviewable AdPilot drafts using the existing text AI path with local
  fallback.
- Added tests for provider catalog, product normalization, dry-run publishing,
  and local fallback draft generation.

Text AI health fix in `17e73cb`:

- `/content/text-ai/health` now checks `TEXT_AI_BASE_URL/health`.
- If `TEXT_AI_BASE_URL` ends with `/v1`, it also checks the parent
  `/health` endpoint.
- This matches OpenAI-compatible deployments where chat completions live under
  `/v1`, but operational health is exposed at the root path.

Deployment notes:

```text
cd domstudio-backend
python migrate.py
```

must be run on the deployed backend database before relying on marketplace
tables in production.

Set `MARKETPLACE_SECRET_KEY` in production before storing live marketplace
credentials. Live marketplace publishing remains intentionally conservative:
drafts and approvals exist, but provider write adapters should be verified
against official seller API contracts before enabling real publish behavior.

---

## June 23, 2026 - Make AdPilot Feel Like Real AI Work

User pointed out that AdPilot output felt flat and confusing:

- English inputs produced Russian reply text.
- The result panel said generic "Ready copy" without explaining the next action.
- The screenshot showed `Text AI backend request failed. Used local template
  fallback`, meaning the result was not real AI output.

Findings:

- Backend prompt was hard-coded to `Language: Russian`.
- Some local fallback templates were Russian-only.
- Live Amvera had `TEXT_AI_TIMEOUT_MS=6000`; the text tunnel answered
  `/v1/models`, but `/v1/chat/completions` did not complete within 90 seconds.
- Charging tokens for local fallback templates made the feature feel worse.

Implemented:

- Added `output_language` to `/content/generate`: `auto`, `english`, `russian`.
- Auto language detects Cyrillic and otherwise defaults to English.
- Local fallback replies now respect English/Russian instead of forcing Russian.
- Backend enforces a minimum 60-second text-AI timeout even if the env value is
  too low.
- If the AI backend fails, tokens are refunded and the response says no tokens
  were charged.
- AdPilot frontend now has language controls, per-tool intent labels, and
  output titles/actions like "Ready reply to paste" / "Copy reply".

Next quality lever:

- The current Qwen2.5-3B tunnel is too slow/unreliable for a "wow" experience.
  For production-grade AdPilot, use a reliable OpenAI-compatible hosted text
  model with low latency and stronger copy quality.

---

## June 23, 2026 - Force Frontend Off Stale Auth/Service Worker Cache

User still saw the previous `/users/me/full` startup failure in Chrome after the
CORS and token-refresh changes were deployed.

Findings:

- Live backend already returns `Access-Control-Allow-Origin` for both missing
  auth and invalid-token responses on `/users/me/full`.
- Live Vercel HTML points to the new JS bundle, so continued old console output
  can come from a stale tab/service-worker-controlled app.
- Tokens issued before the new frontend fix can still be present in
  localStorage, so an old/bad token can trigger one startup auth rejection.

Implemented:

- Bumped the frontend service worker cache from `domstudio-shell-v4` to
  `domstudio-shell-v5`.
- Added an auth storage version key so pre-fix stored tokens are cleared before
  any `/users/me/full` request. Users may need to log in once after this deploy.

---

## June 23, 2026 - Avoid Noisy Expired Auth 401 On Frontend Boot

After CORS was fixed, the browser showed:

- Chrome PWA install notice about `beforeinstallprompt.preventDefault()`.
- `GET /users/me/full 401 Unauthorized`.

Notes:

- The PWA message is expected because DomStudio stores the install prompt and
  shows its own install button.
- The `401` happened when an old `domstudio_access` token was still in
  localStorage. The backend correctly rejected it, but the console made it look
  like an API failure.

Implemented:

- Frontend now decodes stored JWT expiry before startup.
- Expired refresh tokens are cleared immediately.
- Expired access tokens are refreshed before calling `/users/me/full` when a
  refresh token exists.
- Bad access tokens without a usable refresh are removed after the failed user
  load.

---

## June 23, 2026 - Fix Vercel CORS For AdPilot/API

User reported browser console errors from `https://domstudio.vercel.app`:

- `/users/me/full` blocked by CORS preflight.
- `/content/tools` blocked by CORS preflight.

Cause:

- The live backend was accepting requests directly, but CORS did not include
  the Vercel frontend origin in the response headers.
- This made the browser block API calls even though the backend route existed.

Implemented:

- Updated `domstudio-backend/main.py` so production frontend origins are always
  allowed in addition to any `CORS_ORIGINS` env value:
  - `https://domstudio.vercel.app`
  - `https://domstudio.site`
  - `https://www.domstudio.site`
  - local dev origins
- Updated `domstudio-backend/.env.example` with the same CORS origin list.
- Updated `domstudio-backend/runtime_info.py` to expose safe runtime diagnostics:
  - configured CORS env origins
  - text AI host/model/presence info

Validation planned:

```bash
cd domstudio-backend
python -m unittest discover -s tests -v

cd domstudio-frontend
npm.cmd run build
```

Deploy note:

- Push to Amvera and verify an OPTIONS preflight from
  `https://domstudio.vercel.app` returns `Access-Control-Allow-Origin`.

---

## June 23, 2026 - AutoDL Text Backend Check For DomStudio AdPilot

Checked the provided AutoDL/SeetaCloud box for the AdPilot text backend.

Findings:

- The GPU box is reachable and has an RTX 4080 available.
- No process was listening on port `8000` during the check.
- No active `uvicorn`, `vllm`, or `cloudflared` process was running.
- Persistent AdPilot text-backend files exist under `/autodl-fs/data`:
  - `adpilot_llm_server.py`
  - Qwen2.5-3B-Instruct Hugging Face cache
  - `cloudflared`
  - old LLM/cloudflared logs and pid files
- Old logs show the text server previously worked with:
  - `/v1/models`
  - `/v1/chat/completions`
- Attempted to prepare a persistent Python environment for the text server, but
  the SSH connection dropped during dependency installation. Follow-up check
  showed FastAPI was still unavailable in that environment, so the text backend
  was not restarted in this pass.

Important:

- No SSH password or secret was written to this archive or committed.
- DomStudio AdPilot currently works through backend local-template fallback.
- To use the real text model on Amvera, finish restarting the AutoDL text
  server and Cloudflare tunnel, then set DomStudio/Amvera env vars:

```env
TEXT_AI_BASE_URL=https://<cloudflare-url>.trycloudflare.com/v1
TEXT_AI_MODEL=Qwen/Qwen2.5-3B-Instruct
TEXT_AI_API_KEY=
TEXT_AI_TIMEOUT_MS=60000
CONTENT_TOKEN_UNIT=10
```

Operational note:

- The standalone AdPilot Amvera app can be deleted after DomStudio/Amvera has
  these text env vars configured and an authenticated `/content/generate` smoke
  passes.

---

## June 23, 2026 - AdPilot Integration Step 2: Web AdPilot Workspace

Continued the AdPilot integration after the backend content route.

Implemented in `domstudio-frontend/src/app.js`:

- Added an `AdPilot` route to the main navigation.
- Route is `#adpilot`.
- Added AdPilot to the logged-in mobile tab bar.
- Added AdPilot to the authenticated workspace sidebar.
- Added frontend fallback metadata for the 10 AdPilot content tools so the
  page can render even if `/content/tools` is temporarily unavailable.
- Added `loadContentTools()` to fetch `/content/tools`.
- Added AdPilot text-workspace state:
  - selected tool
  - dynamic draft fields
  - reusable business profile
  - output text
  - provider/status metadata
  - generation loading state
- Added `copyStudioPage()`:
  - tool/category selector
  - dynamic form fields based on selected tool schema
  - business profile fields
  - output panel
  - copy-to-clipboard action
  - token cost hints
- Added `submitCopyGeneration()` wired to `POST /content/generate`.
- Refreshes `/users/me/full` after text generation so token balance updates.

Implemented in `domstudio-frontend/src/i18n.js`:

- Added RU/EN navigation, sidebar, page title, AdPilot labels, placeholders,
  and status/toast strings.

Implemented in `domstudio-frontend/src/styles.css`:

- Added a dense three-column AdPilot text workspace layout.
- Added responsive tablet/mobile collapse.
- Added output preformatted text panel and tool selector styling.

Validation:

```bash
cd domstudio-frontend
npm.cmd run build

cd domstudio-backend
python -m unittest discover -s tests -v
```

Results:

- Frontend production build passed.
- Backend test suite passed: 50 tests OK.

Current limitation:

- AdPilot uses the backend local-template fallback unless deployment/local
  env config sets `TEXT_AI_BASE_URL` and `TEXT_AI_MODEL`.
- The next useful step is an end-to-end smoke with a logged-in user against a
  running backend, then configuring the deployed Amvera text backend env.
- For DomStudio/Amvera, set `TEXT_AI_BASE_URL` to the AutoDL Cloudflare tunnel
  `/v1` URL and `TEXT_AI_MODEL` to the Qwen model id. The standalone AdPilot
  Amvera app can be deleted after DomStudio has those env vars configured.

---

## June 23, 2026 - AdPilot Integration Step 1: Backend Copy Tools

User asked to start incorporating AdPilot into DomStudio one step at a time.

Implemented the first backend slice:

- Added `domstudio-backend/services/content_tools.py` with the AdPilot/PromoPilot
  10-tool sales-copy catalog:
  - Avito Ad
  - Avito Reply
  - VK Post
  - Yandex Ads
  - Review Reply
  - Product Description
  - Ozon/WB Card
  - Landing Page
  - SMS Promo
  - Price Objection
- Added `domstudio-backend/routers/content.py`.
- Registered the router in `domstudio-backend/main.py` under `/content`.
- Added `GET /content/tools` for tool metadata.
- Added `POST /content/generate` for authenticated text/copy generation.
- Reused DomStudio's token ledger instead of AdPilot's localStorage demo
  credits.
- Stores generated copy as a `GenerationJob` with:
  - `mode=content:{tool_slug}`
  - `output_format=text`
  - `output_data={generated copy}`
- Supports an optional OpenAI-compatible text backend through:
  - `TEXT_AI_BASE_URL`
  - `TEXT_AI_API_KEY`
  - `TEXT_AI_MODEL`
  - `TEXT_AI_TIMEOUT_MS`
  - `CONTENT_TOKEN_UNIT`
- Falls back to local templates when no text backend is configured or when
  the text backend fails.
- Updated `domstudio-backend/.env.example` with the new text backend env vars.

Validation:

```bash
cd domstudio-backend
python -m py_compile routers\content.py services\content_tools.py main.py
python -m unittest discover -s tests -v
```

Results:

- Python compile check passed.
- Backend test suite passed: 50 tests OK.

Next integration step:

- Run an authenticated end-to-end smoke for AdPilot in DomStudio and then add
  proper DB tables for lead capture/business profiles instead of AdPilot's
  old file-based storage.

---

## June 23, 2026 - Archive Read and Project Health Check

User asked to read the archive and check the project.

What was checked:

- Read the newest archive entries and relevant continuation notes.
- Confirmed latest git history matches the archive summary:
  `2337bd2`, `05ce017`, `82aa25b`, `e12aaf6`.
- Verified the newest work is web frontend/PWA/mobile-web UI focused:
  creative offer text, marketplace hint clarification, visible register/logout
  actions, language toggle fixes, and iPhone PWA handling.

Small fix made during the check:

- Fixed one mojibake string in `domstudio-frontend/src/app.js` where the
  mobile primary language toggle could render `Русский` as corrupted text in
  Russian-market mode.

Validation:

```bash
cd domstudio-frontend
npm.cmd run build

cd domstudio-mobile
npm.cmd run typecheck

cd domstudio-backend
python -m unittest discover -s tests -v
```

Results:

- Frontend production build passed.
- Mobile TypeScript typecheck passed.
- Backend unit tests passed: 45 tests OK.
- Mojibake scan for `domstudio-frontend/src`, `domstudio-mobile/App.tsx`
  found no remaining corrupted text markers after the fix.

Current note:

- `DOMSTUDIO_ARCHIVE.md` was already modified before this check and now also
  includes this health-check note.
- No live deployment, DNS, payment, ComfyUI, or real-device iPhone smoke test
  was performed in this pass.

---

## June 23, 2026 - Mobile Nav, Creative Text Field, and Lang Toggle Fixes

Four commits across two sessions (2337bd2 → e12aaf6), all frontend-only.

### 1. Offer text field + marketplace hint clarification (2337bd2 → 82aa25b)

Added a new "offer text / creative text" field to the studio form so users can specify discount copy, slogans, or product features to be rendered on the image. This was previously impossible — the only way to add text was by manually typing it into the style hint.

**What changed:**

- `state.formDraft.offer_text` initialized to `""` so it persists across renders
- `marketplaceHintForMode()` now takes `hasOfferText` param — if offer text is present, the prompt instructs the model to "use only the requested creative text" and not invent extra text; if absent, keeps the original "do not add fake text" guard
- `composeGenerationPayload()` injects `"creative text/offer to place on the image: {offerText}"` into `styleParts` when offer text is set
- `buildPromptFromHelper()` also now writes `offer_text` into the form draft when using the prompt helper
- Studio form: marketplace field now shows an inline `<small>` hint (amber callout box) instead of a separate `.field-note` div — same for the offer text field
- i18n: marketplace hint and creative text label/placeholder/hint copy revised in both RU and EN to be clearer that "marketplace" = platform format rules, not image text
- CSS: `.marketplace-field` and `.offer-field` span full width in the 2-col grid; `.field small` styled with muted text; amber callout variant for those two fields

### 2. Visible account actions + register button on mobile (05ce017)

Previously, on mobile, a logged-out user had no visible Register button (only "Sign in" and the gold CTA). A logged-in user had no logout button on the account page without going through the sidebar.

**What changed:**

- Nav: added `.logged-in` / `.logged-out` class to `<nav>` based on auth state — allows CSS to target each state
- Added a secondary `.nav-register` button next to the login button in the logged-out nav; on mobile it shows inline with custom sizing (`max-width: 104px`, `font-size: 12px`)
- Account page: added `.account-actions` block with a logout button styled in danger red; only visible on the account page itself
- `nav.register` copy changed from "Создать бесплатно / Start free" to "Регистрация / Register" (shorter, fits the mobile button)
- Added `@media (max-width: 360px)` breakpoint: hides lang toggle on very small logged-out screens; shrinks register + CTA buttons to 92px / 11px so they fit

### 3. Lang toggle visibility fix on mobile (e12aaf6)

The language toggle was showing twice in some nav states — once in the primary nav links and once in the `nav-actions` bar.

**What changed:**

- Added a second `showPrimaryLangToggle` conditional rendering the toggle inside `.nav-links` (so it appears in the mobile slide-out menu)
- At `max-width: 360px`, the `.nav.logged-out .lang-toggle` in nav-actions is hidden to avoid overflow — the toggle in the hamburger menu still works

---

## June 22, 2026 - Add iPhone Safari Manual PWA Install Banner

User reported the web PWA still does not appear on iPhone, even though it shows
on desktop.

Important diagnosis:

- Desktop Chrome can show the PWA install UI through `beforeinstallprompt`.
- iPhone Safari does not support `beforeinstallprompt`, so the existing install
  banner path could show on desktop and never show on iPhone.
- From this environment, `https://domstudio.site` did not resolve in DNS
  (`NXDOMAIN`), so the actual deployed URL/domain still needs confirmation if
  iPhone is opening that domain.

Implemented in `domstudio-frontend/src/app.js`:

- Added `isIosSafari()` detection for iPhone/iPad Safari, including iPadOS
  desktop-mode detection.
- Updated `pwaInstallBanner()` so iPhone Safari gets a manual install banner
  even when `beforeinstallprompt` is unavailable.
- Kept desktop/Android install behavior using the real install prompt.
- Updated the install button fallback so tapping it on iPhone shows a toast with
  the manual Safari path.

Implemented in `domstudio-frontend/src/i18n.js`:

- Added English/Russian copy for the iPhone manual install banner:
  Safari Share -> Add to Home Screen.

Validation:

```bash
cd domstudio-frontend
npm.cmd run build
```

Frontend production build passed.

---

## June 22, 2026 - Harden Web PWA Reload On iPhone

User reported that the web PWA opens on desktop, but after reload on iPhone it
does not come back up.

Likely cause:

- iOS standalone PWAs can hold onto stale service-worker shell/cache state more
  aggressively than desktop browsers.
- The existing service worker used a cached app shell and cache-first static
  assets, which can leave the installed iPhone PWA stuck on stale resources
  after a deploy or reload.

Implemented in `domstudio-frontend/public/sw.js`:

- Bumped the shell cache from `domstudio-shell-v3` to `domstudio-shell-v4`.
- During service-worker install, shell files are requested with
  `{ cache: "reload" }` so the install path does not reuse stale browser cache.
- Added a `SKIP_WAITING` message handler so the page can activate an updated
  service worker immediately.
- Avoided optional chaining in raw `sw.js` because the public service worker is
  not transpiled by Vite.

Implemented in `domstudio-frontend/src/app.js`:

- Service-worker registration now detects a waiting or newly installed worker.
- Sends `SKIP_WAITING` to updated workers.
- Reloads the page once on `controllerchange` so an installed iPhone PWA moves
  onto the fresh worker/cache instead of staying on the stale shell.

Validation:

```bash
cd domstudio-frontend
npm.cmd run build
```

Frontend production build passed.

Operational note:

- After deploy, iPhone may still need one clean app restart or deletion/re-add
  from the Home Screen if Safari has already pinned a broken old standalone
  shell.

---

## June 22, 2026 - Soften Mobile Footer Navbar Color

User said the new dark footer navbar was too dark and asked to make it closer
to the upper navbar/app chrome color.

Implemented in `domstudio-mobile/App.tsx`:

- Changed the bottom tab bar from dark purple back to the light `colors.card`
  surface used throughout the app.
- Restored active/inactive tab text colors to `colors.ink` and `colors.muted`.
- Kept the newer compact dock shape, but widened it slightly and softened the
  shadow.
- Reduced the active glyph lift and made only the clicked/active tab use a dark
  premium fill with light icon strokes.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
```

Typecheck passed.

---

## June 22, 2026 - Apply Dark Studio Dock Bottom Tabs

User chose option `B. Dark Studio Dock` from the bottom tab bar preview.

Implemented in `domstudio-mobile/App.tsx`:

- Changed the shared native tab bar from a light floating pill to a dark dock.
- Added a warm orange border/shadow treatment to match the Studio hero.
- Made the active tab icon a raised orange badge.
- Kept active labels light while active icon strokes render dark for contrast.
- Applied the style to both authenticated and public tab navigators.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
```

Typecheck passed.

---

## June 22, 2026 - Remove Duplicate Studio Hero Token Badge

User pointed out that the orange `3000 токенов` pill was already shown in the
Studio screen header and did not need to appear a second time inside the hero,
where it overlapped the body copy.

Implemented in `domstudio-mobile/App.tsx`:

- Removed the token badge render from `StudioHero`.
- Removed the unused `tokens` prop from `StudioHero`.
- Removed now-unused `heroToken*` styles.
- Kept the top-right header token pill as the single visible balance indicator.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
```

Typecheck passed.

---

## June 22, 2026 - Fix Russian Pricing Copy Leaks

User shared an iPhone screenshot showing the mobile Pricing/Tariff screen in
Russian while several account usage strings still rendered in English:
`FREE`, `remaining`, `over plan limit`, and `No allowance on this plan`.

Implemented in `domstudio-mobile/App.tsx`:

- Moved usage helper text into the localized Pricing copy table.
- Made `usageStatus` language-aware for remaining quota, over-limit, and
  no-allowance states.
- Added `localizedPlanName` so live backend plan ids like `free` render as
  localized plan names in Russian.
- Applied localized plan names to both the account plan row and live plan cards.
- Localized token-pack row units from hard-coded `tokens` to the active Pricing
  token label.
- Localized Pricing ruble amounts and the Home proof entry price so Russian
  mode uses `₽` instead of hard-coded `RUB`.
- Removed duplicate Studio `camera`/`gallery` copy keys and widened the
  `styleHint` state type so TypeScript accepts all localized style chips.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
```

Typecheck passed.

---

## June 22, 2026 - Clean Mobile Tariff Page Layout

User flagged that the redesigned tariff page was messy.

Implemented in `domstudio-mobile/App.tsx`:

- Removed the busy Pricing hero media collage from the tariff page.
- Replaced it with a compact dark tariff header and three simple metric pills.
- Tightened plan card spacing, price sizing, and radius so cards scan cleaner.
- Kept the premium dark/gold visual language without overwhelming the mobile
  viewport.
- Localized the new tariff metric label in English and Russian.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8082/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200 on the fresh
Metro server running on port 8082.

---

## June 22, 2026 - Premium Mobile Pricing Redesign

User flagged that the mobile Pricing page looked boring compared with the web
product.

Implemented in `domstudio-mobile/App.tsx`:

- Reworked Pricing copy from utility wording to a stronger seller-content value
  proposition.
- Added a dark premium Pricing hero with web-style grid texture, product proof
  image, autoplay video proof, and compact business stats.
- Replaced the plain account card with a richer account balance panel showing
  plan and token state.
- Added a reusable `PricingPlanCard` with web-like hierarchy, best-value badge,
  check-style feature rows, and consistent CTA labels.
- Applied the same premium plan presentation to both authenticated Pricing and
  public Pricing preview.
- Localized new Pricing labels in English and Russian.
- Restyled top-up and payment-history sections as Pricing panels.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200.

---

## June 22, 2026 - Public Mobile Launch Before Sign-In

User flagged that the app opened directly on sign-in, so visitors could not
understand the product before creating an account.

Implemented in `domstudio-mobile/App.tsx`:

- Logged-out users now land in a public tab shell instead of the auth screen.
- Public Home uses the same web-like product story, examples, videos, menu, and
  language toggle.
- Public Examples remains browsable before sign-in.
- Added public Pricing preview with plan cards and a sign-in/start CTA.
- Studio remains the protected creation surface; tapping Create or Studio opens
  the sign-in/create-account flow.
- Authenticated users still enter the full Home/Studio/Examples/Pricing app.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200.

---

## June 22, 2026 - Persist Mobile Language and Localize Studio

Next implementation step after checkout return hardening: make the mobile
language toggle feel real across app reloads and key authenticated screens.

Implemented in `domstudio-mobile/src/storage.ts`:

- Added a small local settings file for the selected language.
- Added `loadLanguage()` and `saveLanguage()` helpers.

Implemented in `domstudio-mobile/App.tsx`:

- App boot now loads the saved language alongside tokens and local history.
- The language toggle now persists the selected language immediately.
- Added English/Russian copy for Studio and Account surfaces.
- Studio title, hero, offline banner, form labels/placeholders, upload actions,
  video job card, and result card now follow the selected language.
- Account status, plan labels, refresh, and sign-out copy now follow the selected
  language.

Validation:

```bash
cd domstudio-mobile
npm run typecheck
Invoke-WebRequest http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true&minify=false
```

Typecheck passed and the Expo iOS bundle request returned HTTP 200.

---

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

---

## June 23, 2026 - Product Growth Sprint: Verticals + Referral (Items 1–4 of 5)

User requested 5 product-growth additions one by one. Items 1–4 completed this session.

### Item 1 — Beauty vertical (commit `32f0600`)

Added 3 beauty-service copy tools to backend and frontend:
- `beauty-service-ad` — Avito/2GIS listing for a beauty procedure
- `master-bio` — short bio for a beauty specialist's profile
- `beauty-promo-post` — promo post for social media / Telegram

Added `masterName` and `duration` as new field types across:
- `FIELD_LABELS` + `FALLBACK_VALUES` in `content_tools.py`
- `CONTENT_FIELD_LABELS` + `CONTENT_DEFAULTS` in `app.js`
- `COPY_FIELD_LABELS` + `COPY_EXAMPLE` in `App.tsx`

Added i18n: `copy.category.beauty`, `copy.field.masterName/duration`, `copy.tool.*` for all 3 tools.

### Item 2 — Food/restaurant vertical (commit `f5fa5f6`)

Added 3 food-business copy tools:
- `food-delivery-ad` — Avito/2GIS ad for food delivery or café
- `yandex-maps-card` — description for Yandex Maps business card
- `food-promo-post` — promo post for a restaurant/café

Added i18n: `copy.category.food`, `copy.tool.*` for all 3 tools.

### Item 3 — Auto service vertical (commit `244792f`)

Added 3 auto-service copy tools:
- `auto-service-ad` — Avito/2GIS ad for an auto repair shop
- `auto-buyer-reply` — reply to a buyer's question about a car
- `auto-promo-post` — promotional post for an auto service

Added i18n: `copy.category.auto`, `copy.tool.*` for all 3 tools.

Total new tools: 9. All 3 verticals appear as grouped chips in the copy tool selectors (web + mobile). Mobile simplified to tools-only view (no sub-tab navigation).

### Item 4 — Referral link (commit `67c34e5`)

Full referral system end-to-end:

**Database (`database.py`):**
- `referral_code VARCHAR(16) UNIQUE` — auto-generated 8-char uppercase hex on user creation
- `referred_by_code VARCHAR(16)` — set at registration if user came from a referral link

**Migration 007 (`migrate.py`):**
- Adds both columns, creates unique partial index, backfills existing users with referral codes via `gen_random_uuid()`

**Auth (`routers/auth.py`):**
- `EmailRegisterRequest` + `PhoneRegisterRequest` accept optional `referral_code` field
- `create_user_with_defaults` accepts `referred_by_code`, generates `referral_code = uuid4().hex[:8].upper()`
- On first email/phone verify: `_award_referral` awards +500 tokens to both the new user and the referrer
- Bonus is idempotent — only fires if `not user.is_verified` before verify call

**Users router (`routers/users.py`):**
- `GET /users/referral` returns `{ code, link, referrals_count, tokens_per_referral, tokens_earned }`
- Link format: `https://domstudio.site/?ref=<CODE>`

**Frontend (`app.js`, `i18n.js`, `styles.css`):**
- `loadReferral()` called at startup if user logged in; stores result in `state.referral`
- Account page shows referral panel: shareable link input + copy button, stats row (invited count, tokens earned, +500 reward label)
- `checkReferralParam()` reads `?ref=` from URL on load, stores in `state.pendingReferralCode`, clears from URL
- Referral code injected into email and phone register API calls
- RU + EN i18n keys: `account.referralH3/Sub/Copy/Copied/Count/Earned/Reward`

**Mobile (`App.tsx`, `src/api.ts`):**
- `ReferralInfo` type + `loadReferralInfo()` added to `api.ts`
- `AccountScreen` gains `tokens` prop, fetches referral info via `useEffect`, shows referral card with Clipboard copy
- Account tab added to bottom nav (6th tab) — `MainTabParamList` updated, TabGlyph gets `"account"` icon case
- RU + EN inline copy for referral strings in AccountScreen

---

## June 23, 2026 - Telegram Bot (Item 5/5)

New `domstudio-telegram/` directory. Standalone async Python bot using `python-telegram-bot 21`, `aiohttp`, `aiosqlite`.

**Commands:**

- `/start` — welcome message; if linked, shows account email + command list
- `/link` — guided conversation: asks email then password, calls `/auth/login/email`, stores access_token in local SQLite
- `/tools` — full copy-generation flow: inline keyboard with all 14 tools grouped by category → field-by-field prompts → calls `/content/generate` → returns result with char count + Avito/Ozon/WB limit badges
- `/skip` — skip a field during the tools flow (leave it blank)
- `/cancel` — abort a tools session
- `/balance` — shows token count and plan from `/users/me/full`
- `/referral` — shows referral link + invited count + tokens earned from `/users/referral`
- `/lang` — inline keyboard to switch generated copy language (ru / en)
- `/unlink` — deletes stored account

**Auth:** Bot calls the DomStudio API on behalf of the user using their email+password on `/link`. The access_token is stored locally in SQLite (`bot_users.sqlite3`). Password message is deleted from chat immediately after receipt.

**Deployment:** `amvera.yml` configured with persistence mount at `/data` so the SQLite file survives restarts. Env vars: `TELEGRAM_TOKEN`, `DOMSTUDIO_API`, `BOT_DB`.

Commit: `34d330a`

---

## June 24, 2026 - AdPilot Context Image From Studio

User pointed out that clicking "Generate product copy →" in the Studio result panel jumped to AdPilot correctly but showed no image, losing visual context.

**What was added (commit `a84bbeb`):**

- `state.adpilotContextImage` — stores the generated image URL when `goToAdPilotWithContext()` is called
- `.copy-context-banner` — shown at the top of the AdPilot copy form when arriving from Studio: 56×56 thumbnail of the generated image, product name (truncated), and a "← Back to image" button that returns to Studio
- Gold border + warm background matches the Studio link panel so the two feel like one connected flow
- Banner only appears when the user arrived via the Studio link — opening AdPilot directly shows nothing extra
- i18n: `adpilotContext.label/back` in RU + EN

---

## June 24, 2026 - Mobile PWA Nav Cleanup

User shared a screenshot of the mobile PWA and flagged three issues.

**Changes (commit `ec6d920`):**

1. **Nav "Create photo" hidden for logged-in users on mobile** — when a user is signed in, the bottom tab bar already has a Studio tab, so the gold "Create photo" button in the top nav was redundant and made the nav crowded. Added `.nav.logged-in .nav-cta { display: none; }` inside the mobile breakpoint.

2. **Footer tab bar: History → Examples (logged-in)** — logged-in users saw Home / Studio / AdPilot / History. History is internal and not useful as a primary tab for new users. Swapped to Examples so both logged-in and logged-out users see the same four tabs: Home / Studio / AdPilot / Examples.

3. **Removed redundant "Create for free" button from mini-studio card** — the home hero had three equivalent CTAs: "Create first photo" (hero), "Upload" (mini-studio card), and "Create for free" (bottom of mini-studio card). Removed the third one — two is enough.

**Also fixed:** added `-webkit-backdrop-filter` prefix alongside `backdrop-filter` on `.media-toggle` sticky bar — previously broke blur on Safari/iOS PWA.

---

## June 24, 2026 - AdPilot + Studio Link

Added a "Write product copy" panel that appears in the Studio result area after an image is generated.

**What was added:**

- `adpilotLinkPanel()` render function — shown in the result panel after a successful image generation, below the content pack buttons. Hidden while generating and for video results.
- Displays the product subject text (truncated to 80 chars) so the seller knows what will be pre-filled.
- `goToAdPilotWithContext()` — reads `state.lastGenerationPayload.subject` and `state.formDraft.marketplace`, pre-fills `state.contentDraft.product`, auto-selects the best content tool for that marketplace, then navigates to the AdPilot tools view.
- Marketplace → tool mapping:
  - wildberries / ozon → `ozon-wb-card`
  - yandex → `product-description`
  - avito → `avito-ad`
  - instagram (VK/Telegram) → `vk-post`
  - story / banner → `product-description`
- RU + EN i18n keys: `adpilotLink.h3/sub/cta/toast`
- CSS: `.adpilot-link-panel` (gold border, warm background to stand out as a next-step prompt), `.adpilot-link-product` (muted truncated product line)

**Validation:**

```text
cd domstudio-frontend
npm.cmd run build

build passed — 252 kB JS, 53 kB CSS
```

Commit: `0a7ec17`

---

## June 24, 2026 - Amvera Startup Timeout Fix

Production backend on Amvera (Moscow) was throwing `asyncio.TimeoutError` at startup because the `prepare_database()` coroutine was wrapped with a 15-second timeout, which was too short for the Amvera→Supabase (Seoul) round-trip latency. The app continued to start (exception caught), but DB prep may not have completed on first boot.

**What changed (commit `6e0692f`):**

- `domstudio-backend/main.py`: Raised the default `DB_STARTUP_TIMEOUT_SECONDS` from `"15"` to `"60"`.
- Removed the `ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS ...` block from `lifespan()` — those columns have existed in production for months; running them on every boot added extra round trips and confusion. Schema changes belong in `migrate.py`.

---

## June 24, 2026 - AdPilot Context Banner + Language Toggle Fixes

Two bugs found in AdPilot after integrating Studio→AdPilot context flow.

### Bug 1: Context banner layout broken on mobile

The banner showed a gap where the product name should appear because `state.contentDraft.product` was empty (subject not passed correctly or user hadn't typed a product). Fixed by guarding the `<p>` tag so it only renders when product is non-empty. Also:

- Shortened back button text: "← Вернуться к фото" → "← Студия" / "← Back to image" → "← Studio" (prevents wrapping on narrow screens)
- Added `white-space: nowrap` + `overflow: hidden` to `.copy-context-info` so the "FROM STUDIO" eyebrow never wraps to two lines

### Bug 2: Copy language segment always followed app language toggle

The language selector (Russian / English) defaulted to `"auto"`, which auto-detected language from form content. Since the form defaults always match the app language toggle (via `toggleLang → replaceKnownDefaults`), the copy always came out in the app's current language regardless of what the user selected in the segment.

Fixes:

- `contentOutputLanguage` initial value changed from `"auto"` to `initialLang === "ru" ? "russian" : "english"` — defaults to the current app language explicitly
- Removed `"auto"` from the segment options; now shows only Russian / English
- `toggleLang()` now also updates `state.contentOutputLanguage` to match the new app language so the two controls stay in sync
- When user explicitly picks "Russian" while in English mode (or vice versa), that override is preserved and sent to the backend

---

## June 25, 2026 - Background Removal Tool (Quick Tools, Feature #1)

Added a new **Tools** section to the app with the first quick tool: background removal.

### What was built

**Backend (`domstudio-backend/`):**

- `routers/tools.py`: `POST /tools/remove-bg` endpoint — accepts image upload, removes background using `rembg` with the `u2netp` model (4.7 MB, CPU-only, no GPU required)
- Session is lazy-initialised once at first use (model auto-downloads to cache)
- Max file size: 10 MB; requires auth but costs 0 tokens
- Returns transparent PNG with `Content-Disposition: attachment; filename="no-bg.png"`
- Registered in `main.py` under `/tools` prefix
- Added `rembg==2.0.57` and `onnxruntime==1.19.2` to `requirements.txt`

**Frontend (`domstudio-frontend/src/`):**

- `toolsPage()` render function — upload zone → spinner → result with checkered transparency preview → Download PNG button
- `apiBinary()` helper for fetching binary (blob) responses from the API without JSON parsing
- `onRemoveBgFileSelect()`, `submitRemoveBg()`, `resetRemoveBg()` handlers
- New state fields: `removeBgFile`, `removeBgPreview`, `removeBgResult`, `removeBgLoading`, `removeBgError`
- Route `#tools` added to route switch and desktop nav (`nav.tools`)
- Full RU + EN i18n: `tools.*`, `tools.removeBg.*`, `title.tools`
- CSS: `.tool-card`, `.removebg-upload` (dashed drop zone), `.removebg-canvas` (checkered transparency background), `.removebg-result`, `.removebg-actions`

Commit: `60851c5`

---

## July 1, 2026 - Dom Chaya Image Variations And Curated Gallery Pause

User asked to replace wine/perfume examples with Dom Chaya / tea-house item
assets and to create 5-6 variations for each item across the six user-facing
functions.

### Live generation setup used

- AutoDL/SeetaCloud SSH key works on the current west-B instance.
- ComfyUI is live on the remote instance at local port `6006`.
- Public tunnel used by Amvera:

```text
https://solo-daisy-successful-zum.trycloudflare.com
```

- Amvera `/version` confirmed the backend uses:

```text
commit=25f2c60aa815
comfy.url_host=solo-daisy-successful-zum.trycloudflare.com
comfy.url_source=file
```

### Workflow fixes already deployed

- `domstudio-backend/comfy_url.txt` lets deployed Amvera use the current live
  tunnel even when the dashboard env still has the stale ngrok URL.
- `domstudio-backend/workflows/product_image.json` was changed from a text-only
  Qwen workflow into a real Qwen image-edit workflow that consumes the uploaded
  image through `LoadImage`.
- Web and mobile builds passed after the earlier image replacement.

### Generated material

Generated 48 preview images:

```text
8 items x 6 functions:
catalog, product, creative, lifestyle, scale/context, story
```

Preview folder:

```text
temp-preview/dom-chaya-variations/
```

Main sheets:

```text
temp-preview/dom-chaya-variations/all-items-contact-sheet.jpg
temp-preview/dom-chaya-variations/all-items-contact-sheet-v2.jpg
```

Items generated:

- porcelain vase
- gold display
- khachapuri
- tea ceremony
- iced tea
- storefront facade
- blue porcelain
- necklace from `IMG_4053.jpeg`

### Quality decision

The broad "every item through every mode" batch was not good enough. It was
technically correct but often looked generic or forced.

Rejected for main gallery:

- Khachapuri as a six-mode proof: better than v1 after retry, but still not
  premium enough for the main product gallery.
- Facade as a six-mode proof: storefront text/signage is too easy for AI to
  hallucinate; preservation-first crop/edit is safer, but it should not be a
  hero proof of all AI modes.

Better facade fallback:

```text
temp-preview/dom-chaya-variations/facade-v2-contact-sheet.jpg
```

Better khachapuri fallback:

```text
temp-preview/dom-chaya-variations/khachapuri-v2-contact-sheet.jpg
```

### Curated gallery direction

Instead of forcing all items through all modes, the app gallery should use the
best subject for each function:

- Catalog: porcelain / blue porcelain on clean background.
- Product: gold display / porcelain studio product shot.
- Creative: gold display / necklace.
- Lifestyle: blue porcelain / iced tea.
- Fitting or context: necklace on model and necklace display.
- Stories: iced tea and porcelain closeup.

Curated preview:

```text
temp-preview/dom-chaya-curated-gallery-v1.jpg
```

This curated direction is visually better than the raw 48-image grid.

### Files changed in working tree before pause

- Web example assets under `domstudio-frontend/src/assets/examples/`.
- Web landing stills under `domstudio-frontend/src/assets/landing/`.
- Mobile example assets under `domstudio-mobile/assets/visual/`.
- Web labels in `domstudio-frontend/src/app.js`.
- Mobile labels in `domstudio-mobile/App.tsx`.

Internal filenames still include legacy words like `wine` or `perfume` because
the import paths were reused to avoid a bigger refactor. Visible copy/assets are
now curated tea-house/porcelain/jewelry examples.

### Tomorrow

Continue from the curated set, not the 48-image raw matrix.

Status at pause:

- Curated assets have been copied into the web/mobile example asset slots.
- Web/mobile labels were changed to match the curated set.
- The full raw variation batch remains local in `temp-preview/` for review only.
- Khachapuri and facade should stay out of the main six-mode proof unless the
  user explicitly wants them as supporting social/content examples.

Next steps:

1. Review `temp-preview/dom-chaya-curated-gallery-v1.jpg`.
2. If accepted, deploy/push the committed curated gallery.
3. If not accepted, regenerate only weak curated slots, one at a time.
4. Consider renaming legacy asset filenames (`wine`, `perfume`, `bottle`) in a
   later pass.

---

## July 1, 2026 - Social Media / Influencer Affiliate Roadmap (planning only, no code)

User wants to run a two-tier influencer affiliate program: one coordinator
recruits/manages 10-30 people with social media followings; each gets a
personal discount code. Confirmed structure: coordinator 15% override on
her whole group's sales, influencers 15% direct on their own code's sales,
customer gets 15% off the first purchase for Phase 1.

Wrote `SOCIAL_MEDIA_ROADMAP.md` at repo root covering: roles, discount code
mechanics, content cadence template, payout logistics, and a phased
rollout (pilot with 3-5 influencers before the full 10-30).

Follow-up edit locked the money rules:

- Customer discount: 15% for Phase 1.
- Commission base: actual post-discount paid amount.
- Commission window: first paid purchase only.
- No stacking, no self-referral, and every code needs active/pause controls.
- Track funnel states per code: signup, checkout started, paid, refunded,
  commission pending/approved/paid.

Key finding: the existing referral system (`67c34e5`, live — flat +500
token bonus via `referral_code`/`referred_by_code`) is structurally close
but not reusable as-is. It has no percentage discount, no percentage
commission, and no two-level (coordinator → influencer) hierarchy. A real
`promo_code` table + commission ledger is new backend work for Phase 1,
not a copy of the existing system.

Added `tools/build_social_media_roadmap_pdf.py` so
`SOCIAL_MEDIA_ROADMAP.pdf` can be regenerated cleanly with ReportLab instead
of browser print footers. Rebuilt the PDF and visually checked the rendered
pages with PyMuPDF.

Next step: build the Phase 1 backend in this order: promo code storage,
checkout promo validation/discount, payment attribution, commission ledger,
then internal report/export.

### Backend implemented after commission correction

User corrected the commission split to influencer 15% + coordinator 15%.

Implemented Phase 1 affiliate backend:

- Added `PromoCode` and `CommissionLedger` models in
  `domstudio-backend/database.py`.
- Added payment attribution fields:
  `original_amount_rub`, `discount_amount_rub`, `promo_code`, and
  `promo_discount_percent`.
- Added migration `008` in `domstudio-backend/migrate.py`.
- `POST /payments/tinkoff/init`, `POST /payments/tinkoff/topup`, and
  `POST /payments/yandex/init` now accept optional `promo_code`.
- Promo validation enforces active/window checks, first-paid-purchase-only,
  no self-referral when `owner_user_id` is known, and 15% default discount.
- Tinkoff/Yandex confirmed-payment webhooks write commission rows only after
  payment success:
  - influencer row: 15% of actual post-discount paid amount
  - coordinator parent row: 15% of the same paid amount
- Added admin-token protected endpoints:
  - `POST /payments/affiliate/promo-codes`
  - `GET /payments/affiliate/report`
- Admin endpoints require `AFFILIATE_ADMIN_TOKEN` via
  `X-Affiliate-Admin-Token`.
- Updated `SOCIAL_MEDIA_ROADMAP.md` and regenerated
  `SOCIAL_MEDIA_ROADMAP.pdf`; stale old commission language was removed.

Verification:

- `python -m py_compile database.py routers/payments.py migrate.py`
- `python -m unittest tests.test_payments` passed.
- Full `python -m unittest discover -s tests` still has unrelated existing
  generation/Comfy failures; payment tests are green.

---

## July 9, 2026 - Landing Proof Refresh, Mobile Ordering, Vercel Deploy Fix

Goal: make the homepage feel like a premium before/AI-result/video studio for
marketplace sellers, using real-looking fashion, jewelry, home, food, tech, and
bag scenarios instead of weak or unrelated examples.

Committed landing changes:

- `cf0e988 Add premium landing try-on examples`
  - Added user source images under
    `domstudio-frontend/src/assets/landing/user-sources/`.
  - Added generated premium still/video assets under
    `domstudio-frontend/src/assets/landing/generated-premium/`.
  - Wired the new look scenarios into the homepage showcase.
- `baf2f28 Use formal try-on proof in hero`
- `b0227a1 Use women fashion proof in hero`
- `c2392de Improve hero proof card layout`
  - Larger first-look media, tighter card, less wasted whitespace.
- `2a66bb2 Align workflow visuals with fashion hero`
  - Replaced unrelated/pro-looking workflow imagery with a coherent fashion
    story.
- `6a71e1c Move look controls above details`
  - On the look showcase, category chips and `Create a look` now render before
    the paragraph and bullets in source order.
- `ba19a3f Move comparison block before tools`
  - Moved the full "Photo shoot or DomStudio?" comparison plus video/FAQ/support
    trust block directly before the Free tools section.
- `fd0af0a Bump shell cache for landing updates`
  - Service worker cache bumped from `domstudio-shell-v5` to `v6` after old PWA
    cache kept showing stale mobile layout.
- `687cbfd Remove gold flacon example card`
  - Removed the gold flacon/cosmetics display card from the Examples section.
- `9935502 Remove stale beauty category copy`
  - Removed unused `home.category.beauty.*` i18n keys after the same
    "Beauty / Cosmetics and displays" card text kept showing up in searches.
  - Verified no `Cosmetics and displays`, `example-bottle-creative`,
    `exampleBottleCreativeUrl`, or `home.category.beauty` references remain in
    `domstudio-frontend/src` or `domstudio-frontend/dist`.
- `9eee22d Align root Vercel build config`
  - Root `vercel.json` also existed and could be the active Vercel config when
    the Vercel project root is the repository root.
  - Updated root build command to:

```text
cd domstudio-frontend && npm ci && VITE_IMGLY_PUBLIC_PATH=cdn npm run build
```

  - Bumped service worker cache again from `domstudio-shell-v6` to
    `domstudio-shell-v7`.
  - Pushed `main` to GitHub after this commit so Vercel can see it.

Vercel deploy issue found:

```text
node scripts/download-imgly.js && npm run build
Downloading 64 chunks (~256 MB estimated)...
TypeError: fetch failed / ETIMEDOUT
```

Root cause: `domstudio-frontend/vercel.json` forced Vercel to download IMG.LY
background-removal model chunks during every build. The download is large and
network-fragile, so the deploy can fail before Vite starts.

Fix made after the error:

- Vercel build command now uses:

```text
VITE_IMGLY_PUBLIC_PATH=cdn npm run build
```

- `src/app.js` now chooses IMG.LY public path via `imglyPublicPath()`:
  - CDN when `VITE_IMGLY_PUBLIC_PATH=cdn`
  - CDN on localhost / `127.0.0.1` / `*.vercel.app`
  - same-origin `/imgly/` for non-Vercel hosting, preserving the existing
    SpaceWeb/PHP proxy path.
- `scripts/download-imgly.js` remains available for non-Vercel/manual static
  model hosting and now uses smaller batches plus retry/backoff.

Reasoning: avoid committing ~256 MB of model chunks and avoid build-time CDN
downloads on Vercel. Runtime background removal can still fetch from IMG.LY CDN
on Vercel, while SpaceWeb-style hosting can keep using the same-origin proxy.

### End-of-day handoff

Current Git state at handoff:

- `main` is aligned with `origin/main` at `9eee22d`.
- Tracked app/note changes are committed and pushed.
- Remaining untracked files are local preview artifacts, zip output, `tmp/`,
  and unrelated CV helper scripts. They were intentionally not committed.

If deployed UI still appears old tomorrow:

1. Confirm Vercel finished a deployment from commit `9eee22d` or newer.
2. Confirm whether Vercel project root is repo root or `domstudio-frontend`.
   Both configs now use the CDN build path, but this was the source of the
   previous confusion.
3. Hard refresh or open an incognito window because the app is a PWA and old
   service-worker shells can survive one load.
4. Search deployed JS for stale strings:

```text
Cosmetics and displays
example-bottle-creative
home.category.beauty
```

None should exist in the latest built app.
