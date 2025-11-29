# Osiom.space - Setup Guide

This document describes the current setup for the osiom.space website on a Raspberry Pi 5, serving a static site behind Cloudflare Tunnel with nginx as a reverse proxy. All HTTPS is handled by Cloudflare; nginx only serves HTTP internally. This architecture is designed to be future-proof for hosting multiple services.

---

## 1. Current Architecture

Internet
   ↓
Cloudflare Tunnel (osiom.space)
   ↓
nginx :8080      ← main entrypoint
   ↓
nginx :8081      ← static website
   ↓
/var/www/osiom.space

Notes:
- Static site files are located at /var/www/osiom.space.
- nginx listens on port 8080 for the Cloudflare Tunnel, and proxies to port 8081 for the static site.
- All HTTPS/SSL is handled by Cloudflare; nginx only serves HTTP on local ports.
- If Cloudflare's "Always Use HTTPS" is enabled, all HTTP requests are redirected to HTTPS before reaching your server (expect HTTP 301 for plain HTTP requests).
- Future services can be added on additional ports, e.g., 8082, 8083, etc.

---

## 2. Folder Structure

/var/www/osiom.space/
├── index.html
├── style.css
├── script.js
└── assets/ (images or other static files)

---

## 3. nginx Configuration

### a) Combined nginx config (/etc/nginx/sites-available/osiom.space)

server {
  listen 8081;
  server_name osiom.space;

  root /var/www/osiom.space;
  index index.html;

  location / {
    try_files $uri $uri/ =404;
  }
}

server {
  listen 8080;
  server_name osiom.space;

  location / {
    proxy_pass http://localhost:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# Note: No HTTPS configuration is needed in nginx. Cloudflare terminates SSL and forwards HTTP to your server.

### b) Enable site

sudo ln -sf /etc/nginx/sites-available/osiom.space /etc/nginx/sites-enabled/osiom.space
sudo nginx -t
sudo systemctl restart nginx

---

## 4. Cloudflare Tunnel Configuration

~/.cloudflared/config.yml:
ingress:
  - hostname: osiom.space
    service: http://localhost:8080
  - service: http_status:404

Restart the tunnel after edits:
sudo systemctl restart cloudflared

---

## 5. Verifying the Setup

1. Check nginx status:
sudo systemctl status nginx

2. Test static site directly on 8081:
curl http://localhost:8081

3. Test proxy on 8080 (Cloudflare Tunnel entrypoint):
curl http://localhost:8080

4. Verify logs:
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log

5. Verify Cloudflare Tunnel:
cloudflared tunnel list
sudo journalctl -u cloudflared -f

---

## 6. Adding Future Services

To add new services:
1. Assign an internal port (e.g., 8082, 8083).
2. Create a new nginx site block for the service.
3. Configure subdomains if needed.
4. Update Cloudflare Tunnel if exposing new domains or paths.

Example future service:
dashboard.osiom.space → nginx:8082 → your app

---

## 7. Notes

- Static files should always be served by nginx for stability and performance.
- The current architecture ensures future scalability, logging, and reverse proxy functionality.
- Cloudflare Tunnel keeps the Pi secure and avoids exposing ports directly to the internet.
- All HTTPS/SSL is handled by Cloudflare. Your nginx config only needs to serve HTTP on local ports (8080, 8081, etc.).
- If you see HTTP 301 responses when testing with curl or a browser, this is likely due to Cloudflare's "Always Use HTTPS" setting, which is recommended for security.

---

End of Setup
