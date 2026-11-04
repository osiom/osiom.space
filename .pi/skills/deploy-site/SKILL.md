---
name: deploy-site
description: Deploy the osiom.space static site to the Raspberry Pi (rsync to /var/www/osiom.space) and verify nginx + the Cloudflare Tunnel. Use when shipping site changes.
---

# Deploy osiom.space

Read `SETUP.md` for the full architecture: nginx `:8081` static files, nginx `:8080`
proxy for the Cloudflare Tunnel, TLS terminated at Cloudflare.

## Sync
```bash
rsync -avz --delete ./ <user>@<pi-host>:/var/www/osiom.space/
```
`--delete` mirrors the folder — **confirm the target host and path with me first**, since
a wrong path could remove files.

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
