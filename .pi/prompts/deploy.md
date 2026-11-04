---
description: Deploy osiom.space to the Pi and verify the server
---
Run the `deploy-site` skill for the current changes: rsync the site to the Pi's
`/var/www/osiom.space`, then verify nginx (`:8081` static, `:8080` proxy) and the
Cloudflare Tunnel. Confirm the host and path with me before any `--delete` sync.

$ARGUMENTS
