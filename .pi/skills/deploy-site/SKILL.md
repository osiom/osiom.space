---
name: deploy-site
description: Deploy the osiom.space static site to the Raspberry Pi (rsync to /var/www/osiom.space) and verify nginx + the Cloudflare Tunnel. Use when shipping site changes.
---

# Deploy osiom.space

Read `SETUP.md` for the full architecture: nginx `:8081` static files, nginx `:8080`
proxy for the Cloudflare Tunnel, TLS terminated at Cloudflare.

## Sync
The Pi is on Tailscale as `raspberrypi`. Dry-run first, then drop `-n`:
```bash
rsync -avzn --delete \
  --exclude='.git/' --exclude='.pi/' --exclude='.gitignore' --exclude='.DS_Store' \
  --exclude='AGENTS.md' --exclude='SETUP.md' \
  ./ mos@raspberrypi:/var/www/osiom.space/
```
`--delete` mirrors the folder — **confirm the target host and path with me first**, since
a wrong path could remove files. The excludes keep `.git/` and the runbook off the webroot.

If CSS/JS changed, bump the `?v=` on their links in `index.html` first: Cloudflare caches
them for ~1h and would otherwise serve stale CSS/JS with the new HTML.

## Verify (on the Pi)
```bash
sudo systemctl status nginx
curl http://localhost:8081        # static site
curl http://localhost:8080        # Cloudflare Tunnel entrypoint
cloudflared tunnel list
sudo journalctl -u cloudflared -f
```

## Rules
- No HTTPS in nginx — Cloudflare terminates SSL.
- Don't hardcode credentials; take the host from `SETUP.md` / the environment.
