# MOS-ERVER

> **Personal Server Infrastructure & Services**  
> A comprehensive server setup hosting multiple services and applications

## 🏗️ **Server Architecture**

**Host**: `user@your-server.local`  
**Service**: `mos-erver.service` (systemd)  
**Base Directory**: `/home/user/mos-erver/`

## 📦 **Available Services**

### 🌐 [Website](./website/)
Interactive decision-tree website for sustainable technology recommendations
- **Tech Stack**: HTML5, CSS3, JavaScript, Three.js
- **Features**: Responsive design, particle system, decision trees
- **URL**: Main website interface

### 🛡️ [Pi-hole + WireGuard](./pihole-wireguard/)
Network-wide ad blocking with secure VPN access
- **Pi-hole**: DNS sinkhole for ad/tracker blocking
- **WireGuard**: Modern VPN for secure remote access
- **Integration**: Seamless ad-blocking through VPN

### 🤝 [Co-Create](./co-create/)
Collaborative platform for project development
- **Purpose**: Team collaboration and project management
- **Features**: Real-time collaboration tools

### 🔒 [CryptPad](./cryptpad/)
End-to-end encrypted collaboration suite
- **Purpose**: Secure document editing and collaboration
- **Features**: Real-time editing, encrypted storage
- **URL**: `pad.mos-erver.dev`
- **Deployment**: Docker Compose

## 📁 **Project Structure**

```
mos-erver/
├── website/                 # Main website application
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript modules
│   ├── data/               # Decision tree data
│   └── *.html              # Page templates
├── pihole-wireguard/       # Network security stack
├── co-create/              # Collaboration platform
├── cryptpad/               # CryptPad collaboration suite
├── .gitignore              # Git ignore rules
├── README.md               # This file
└── UPDATES.md              # Software update guide
```

## 🔧 **Development**

### Prerequisites
- SSH access to your server
- Basic knowledge of Docker and Docker Compose
- Understanding of the deployed services

### Contributing
1. Make changes locally
2. Test thoroughly
3. Deploy using provided scripts
4. Monitor service logs for issues

## 📊 **Service Status**

- ✅ **Website**: Active and responsive
- ✅ **Pi-hole**: Network-wide ad blocking
- ✅ **WireGuard**: Secure VPN access
- ✅ **Co-Create**: Collaboration platform
- ✅ **CryptPad**: Encrypted collaboration suite

## 🛠️ **Maintenance**

### Regular Tasks
- Monitor service logs
- Update dependencies
- Backup configurations
- Security updates

### Software Updates
See [UPDATES.md](./UPDATES.md) for detailed instructions on updating:
- CryptPad
- Cloudflare Tunnel (cloudflared)
- Co-Create
- Pi-hole + WireGuard
- Website

### Troubleshooting
- Check service status first
- Review logs for errors
- Verify file permissions
- Test network connectivity

## 📝 **Documentation**

Each service has its own detailed README:
- [Website Documentation](./website/README.md)
- [Pi-hole + WireGuard Setup](./pihole-wireguard/README.md)
- [Co-Create Guide](./co-create/README.md)
- [Software Update Guide](./UPDATES.md)

---

**Last Updated**: October 2025  
**Maintainer**: MOS  
**Server**: mos-erver.dev
