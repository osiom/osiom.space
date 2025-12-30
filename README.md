# osiom.space

> Interactive glitch art experience with customizable colors and pixel effects

## ✨ Features
- Fluid glitch animation with smooth color transitions
- 4-color customizable palette (color pickers)
- Adjustable pixelation (slider)
- Color randomization button
- Custom favicon with 3D axes design (representing "osiom" - to the axes in Polish)
- Responsive design for desktop, tablet, and mobile
- Dynamic dropdown menus for Events and Web
- Social links (Mastodon, GitHub, Codeberg, Substack)
- No dependencies, pure HTML/CSS/JS

## 🚀 Quick Start
Open `index.html` in your browser. No build or install required.

### File Structure
```
osiom.space/
├── index.html
├── decision-tree.html
├── discovery.html
├── menu.html
├── css/
│   └── styles.css
├── js/
│   ├── index.js
│   ├── menu-loader.js
│   ├── categories.js
│   └── ...
├── data/
│   └── data-storage.js
├── img/
└── README.md
```

## 🖥️ Hosting Architecture
- **Device:** Raspberry Pi 5 (16GB RAM)
- **Web server:** nginx (reverse proxy)
- **Static files:** Served from `/var/www/osiom.space`
- **Tunnel:** Cloudflared (Cloudflare Tunnel) on port 8080
- **nginx:** Listens on 8080 (Cloudflared) and proxies to 8081 (static site)
- **Python web server:** (optional) can serve on 8081 for dynamic content
- **Scalable:** Add more services on new ports (e.g., 8082, 8083)

### Example nginx config
```
# /etc/nginx/sites-available/osiom.space
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
# Note: No HTTPS config is needed in nginx. Cloudflare terminates SSL and forwards HTTP to your server.
```

### Cloudflared config
```
ingress:
  - hostname: osiom.space
    service: http://localhost:8080
  - service: http_status:404
```

## 📡 Deployment

### Deploy to Server via SSH
Deploy via CLI:

```bash
scp -r /Users/matteoosio/Documents/osiom.space/* mos@192.168.1.78:/var/www/osiom.space
```

Or use `rsync` for efficient sync:
```bash
rsync -avz --delete /Users/matteoosio/Documents/osiom.space/ mos@192.168.1.78:/var/www/osiom.space/
```

- This will copy the whole folder to the correct path on your remote server via SSH.
- Requires `rsync` and SSH access.

## 🛠️ Verifying the Setup
- Check nginx: `sudo systemctl status nginx`
- Test static site: `curl http://localhost:8081`
- Test proxy: `curl http://localhost:8080`
- Check logs: `sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log`
- Check Cloudflared: `cloudflared tunnel list` and `sudo journalctl -u cloudflared -f`

## 📄 License
MIT License

---
Made with ✨ by osiom

# Knowledge: nginx & Cloudflare Tunnel

- Cloudflare Tunnel (cloudflared) forwards HTTPS traffic from osiom.space to your Pi on port 8080.
- nginx on 8080 acts as a reverse proxy, forwarding to 8081.
- nginx on 8081 serves the static files from /var/www/osiom.space.
- All HTTP/HTTPS handling is done by Cloudflare; your nginx only sees HTTP.
- If Cloudflare's "Always Use HTTPS" is enabled, all HTTP requests are redirected to HTTPS before reaching your server (expect HTTP 301 for plain HTTP requests).
