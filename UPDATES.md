# Software Update Guide

## Etherpad

To update Etherpad to the latest version:

```bash
cd ~/mos-erver/etherpad
# Pull the latest Etherpad and PostgreSQL images
docker compose pull
# Restart containers with new images
docker compose up -d
# Verify containers are running
docker compose ps
```

**Note**: The Etherpad configuration and data are stored in Docker volumes, so your settings and pads will be preserved during updates.

## Pi-hole + WireGuard

To update Pi-hole and WireGuard to the latest versions:

```bash
cd ~/mos-erver/pihole-wireguard
# Pull the latest Pi-hole and WireGuard images
docker compose pull
# Restart containers with new images
docker compose up -d
# Verify containers are running
docker compose ps
```

**Note**: 
- Your Pi-hole configuration is stored in `./pihole/etc-pihole` and `./pihole/etc-dnsmasq.d` directories
- WireGuard configuration is stored in `./wireguard/config` directory
- All configurations and data will be preserved during updates
