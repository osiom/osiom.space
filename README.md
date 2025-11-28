# osiom.space

> Interactive glitch art experience with customizable colors and pixel effects

## ✨ Features
- Fluid glitch animation with smooth color transitions
- 4-color customizable palette (color pickers)
- Adjustable pixelation (slider)
- Color randomization button
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

## 🎨 Customization
- Click color pickers to set glitch colors (saved in localStorage)
- Use the slider to adjust pixel size (1-20px)
- Click the dice button to randomize colors

## 📱 Responsive Design
- Desktop: 380×520px container
- Tablet: 300×410px
- Mobile: 250×340px
- Small mobile: 220×300px

## 📡 Deployment

### Deploy to Server via SSH
Add a script named `deploy.sh` in this folder:

```bash
#!/bin/bash
REMOTE_USER="mos"
REMOTE_HOST="192.168.0.100"
REMOTE_PATH="$PWD"

rsync -avz --delete ./ "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

- This will copy the whole folder to the same path on your remote server via SSH.
- Requires `rsync` and SSH access.

## 📄 License
MIT License
