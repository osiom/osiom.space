# osiom.space — agent context

Interactive glitch-art site: pure HTML/CSS/JS, no dependencies, no build step. Hosted on
a Raspberry Pi 5 — nginx `:8081` serves the static files, nginx `:8080` fronts it for a
Cloudflare Tunnel (Cloudflare terminates TLS). Full runbook in `SETUP.md`.

## Always-on constraints
- Pure static HTML/CSS/JS — no dependencies, no build step.
- Content menus are data-driven: `data/events.json`, `data/tools.json`, `data/web.json`.
  Edit data, not hardcoded HTML, when adding entries.
- Deployment is by `rsync`/`scp` to `/var/www/osiom.space` on the Pi — **not** a git push.
- nginx serves HTTP only internally; do **not** add HTTPS config (Cloudflare handles TLS).

## Where to look (read on demand)
- `README.md` — features, file structure, hosting architecture, deploy/verify.
- `SETUP.md` — the full server runbook (nginx, Cloudflare Tunnel, future services).
- `index.html` + `js/index.js` — the experience; `css/styles.css`; `data/*.json` — content.
- `events/` — event PDFs; `.htaccess` — Apache fallback rules.

## Workflows
- Ship changes to the Pi → `deploy-site` skill, or `/deploy`.

## Conventions
- Preview: open `index.html` in a browser, or `python3 -m http.server`.
