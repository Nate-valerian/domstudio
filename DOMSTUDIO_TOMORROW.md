# DomStudio Active Handoff

Updated: July 23, 2026

This file contains only durable project rules, the current verified state, and
work that is still open. Completed session notes belong in
`DOMSTUDIO_ARCHIVE.md`.

## Required Change Workflow

For every project change:

1. Record what changed in `DOMSTUDIO_ARCHIVE.md` or the relevant handoff note.
2. Validate the change in proportion to its risk.
3. Commit the intended files locally with a clear commit message.
4. Do not push automatically. Ask the user to approve or run the push after the
   commit is ready.

## Durable Product Rules

- DomStudio is a Russian marketplace-first AI product-content studio for
  Wildberries, Ozon, Yandex Market, Avito, VK, and Telegram sellers.
- Prove the seller workflow on the website/PWA before expanding the native
  mobile app.
- Keep the approved orange/cream visual direction. Make focused improvements;
  do not restart a broad redesign.
- Avoid features with high storage or bandwidth costs when a browser-side,
  metadata, prompt, or short-lived alternative is sufficient.
- Each generation mode must demonstrate its own real capability. Do not apply
  one generic treatment to Catalog, Product, Creative, Lifestyle, Fitting,
  Stories, and Video.
- Before/after examples must preserve the same product or person unless the
  user explicitly asks for identity changes.
- Never present pan, zoom, or shake applied to a still image as generated
  video. Video proof must come from a real image-to-video or video workflow.
- Use a narrow test plan for paid GPU work. If two attempts fail in the same
  direction, stop and change the workflow.
- Be explicit when a result, integration, deployment, or production behavior
  has not been verified.

## Current Verified State

- `origin/main` is at `ecd11ba` (`Compact mobile product workspaces`),
  including the complete AdPilot/Tools rollout, backend provider chain, and
  compact mobile Studio, AdPilot, Tools catalog, and opened Tool workspaces.
- The complete July 23 AdPilot and Tools sequence is committed and pushed.
- AdPilot has the product-first campaign desk, optional product photo, Groq
  Qwen 3.6 Vision analysis, all 19 detailed copy generators, and the unified
  cream-input/dark-result workspace.
- AdPilot text generation, AI Chat, and marketplace action drafts now share a
  backend provider chain: Groq first, DeepSeek V4 Flash second, optional custom
  OpenAI-compatible backend third. Generated-copy endpoints retain the local
  template as their final no-charge fallback.
- Tools has 16 implemented cards, 16 available-now cards, and no Coming-soon
  placeholders. Image results can transfer between compatible Tools, Studio,
  and AdPilot.
- The latest frontend source uses PWA cache `domstudio-shell-v41`; its
  production build and 16 focused frontend tests pass. Compact mobile layouts
  now cover Studio, the AdPilot landing/generators/chat, the Tools catalog, and
  every opened Tool workspace. Mobile Tool results use one horizontal transfer
  row and hide the obstructive bottom tab bar. Home and Examples remain
  unchanged.
- The backend suite passed with 78 tests, 11 subtests, and one existing
  Starlette/httpx deprecation warning.
- The currently verified live SpaceWeb frontend is still release v19. Do not
  describe the v41 AdPilot/Tools source as live until it is packaged, uploaded,
  and checked on the custom domain.
- The canonical HTTPS/`www` `.htaccess` change is committed and locally
  validated, but its production upload and redirect matrix have not been
  recorded as complete.
- Existing untracked preview media, temporary output, deployment ZIPs, and
  unrelated helper scripts are intentional and must remain untouched unless
  the user explicitly scopes them into a task.

## Open Release Tasks

### 1. Verify canonical hosting

If the prepared one-file redirect package has not yet been uploaded:

1. Upload `tmp/domstudio-spaceweb-https-canonical-2026-07-23.zip` into
   `domstudio_site/public_html` and replace only `.htaccess`.
2. Confirm HTTP apex, HTTP `www`, and HTTPS `www` redirect in one hop to the
   HTTPS apex while preserving paths and query strings.
3. Recheck the HTTPS apex SPA fallback, PWA shell, and API connectivity.

Do not mark this complete from the local Apache test alone; production behavior
must be verified.

### 2. Release the v41 frontend and backend v10 AI provider chain

1. Rebuild the current frontend with `VITE_IMGLY_PUBLIC_PATH=cdn`.
2. Prepare a new versioned SpaceWeb package; do not reuse the verified v19 ZIP.
3. Confirm the production backend has both `GROQ_API_KEY` and
   `DEEPSEEK_API_KEY`, plus the documented vision/text environment values. The
   ignored local `.env` does not configure the remote host.
4. Upload the approved frontend package without deleting preserved SpaceWeb
   host files.
5. Verify `https://domstudio.site` in a fresh browser context:
   - service worker cache `domstudio-shell-v41`;
   - all 16 Tools workspaces;
   - compact mobile Tools catalog rows, filters, and quick workflow at common
     360 px, 390 px, and 430 px viewport widths;
   - compact mobile Studio controls/canvas, AdPilot landing/generators/chat,
     and opened Tool editor/result stages at the same viewport widths;
   - one-row swipe transfer navigation on finished Tool results and no bottom
     tab bar obscuring the open workspace;
   - AdPilot photo analysis and all key generator transitions;
   - `/vision/health` and one real `/vision/analyze` request;
   - `/content/text-ai/health` reports provider order `groq`, `deepseek`, then
     `text-ai`, with both Groq and DeepSeek reachable;
   - Tools-to-Tools, Tools-to-Studio, and Tools-to-AdPilot transfers;
   - mobile/desktop layout, SPA fallback, and PWA offline shell.
6. Record exact deployed asset fingerprints and production results in
   `DOMSTUDIO_ARCHIVE.md`.

The final mobile Tool result cleanup is implemented and validated locally but
not pushed. Packaging, hosting changes, remote environment configuration, and
production deployment still require the user's explicit approval or direct
participation.
