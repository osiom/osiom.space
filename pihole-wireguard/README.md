# Pi-hole + WireGuard

> **Network-wide ad blocking with secure VPN access**

## 🛡️ **Overview**

This setup combines Pi-hole's DNS-based ad blocking with WireGuard's modern VPN technology to provide:
- **Network-wide ad blocking** for all connected devices
- **Secure remote access** to your home network
- **Privacy protection** by routing traffic through your own server
- **Tracker blocking** and malware protection

## 🏗️ **Architecture**

```
Internet → WireGuard VPN → Pi-hole DNS → Clean Web Traffic
                      ↓
                 Ad/Tracker Blocking
```

### **Components**
- **Pi-hole**: DNS sinkhole that blocks ads at the network level
- **WireGuard**: Modern, fast, and secure VPN protocol
- **Integration**: VPN clients use Pi-hole as their DNS server

## ✨ **Features**

### 🚫 **Ad Blocking**
- **Network-level blocking** - works on all devices and apps
- **Custom blocklists** - curated lists of ad/tracker domains
- **Whitelist management** - allow specific domains when needed
- **Statistics dashboard** - see what's being blocked

### 🔒 **VPN Security**
- **Modern cryptography** - ChaCha20 encryption
- **Fast performance** - minimal overhead
- **Easy configuration** - simple key-based setup
- **Cross-platform** - works on all major platforms

### 📊 **Monitoring**
- **Real-time statistics** - blocked queries, top clients
- **Query logs** - detailed DNS request history
- **Performance metrics** - response times and uptime
- **Network insights** - device activity and patterns

## 🚀 **Installation**

### **Prerequisites**
- Ubuntu/Debian server with root access
- Static IP address configuration
- Router port forwarding (for external VPN access)
- Basic Linux command line knowledge

### **Quick Setup**
```bash
# Install Pi-hole
curl -sSL https://install.pi-hole.net | bash

# Install WireGuard
sudo apt update && sudo apt install wireguard

# Generate server keys
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey

# Configure WireGuard server
sudo nano /etc/wireguard/wg0.conf
```

## ⚙️ **Configuration**

### **Pi-hole Setup**
```bash
# Access web interface
http://your-server.local/admin

# Default settings:
# - Block ads and trackers
# - Use Cloudflare DNS (1.1.1.1)
# - Enable query logging
# - Set admin password
```

### **WireGuard Server Config**
```ini
[Interface]
PrivateKey = <server-private-key>
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
# Client configuration
PublicKey = <client-public-key>
AllowedIPs = 10.0.0.2/32
```

### **Client Configuration**
```ini
[Interface]
PrivateKey = <client-private-key>
Address = 10.0.0.2/24
DNS = <your-pihole-server-ip>  # Pi-hole server

[Peer]
PublicKey = <server-public-key>
Endpoint = <your-public-ip>:51820
AllowedIPs = 0.0.0.0/0  # Route all traffic through VPN
PersistentKeepalive = 25
```

## 🔧 **Management**

### **Pi-hole Commands**
```bash
# Restart Pi-hole
sudo systemctl restart pihole-FTL

# Update gravity (blocklists)
pihole -g

# Enable/disable blocking
pihole enable
pihole disable 5m  # Disable for 5 minutes

# View logs
tail -f /var/log/pihole.log
```

### **WireGuard Commands**
```bash
# Start VPN server
sudo wg-quick up wg0

# Stop VPN server
sudo wg-quick down wg0

# Check status
sudo wg show

# Enable at boot
sudo systemctl enable wg-quick@wg0
```

## 📱 **Client Setup**

### **Mobile Devices**
1. Install WireGuard app from app store
2. Scan QR code or import config file
3. Connect to VPN
4. Verify Pi-hole is working (ads should be blocked)

### **Desktop/Laptop**
1. Install WireGuard client
2. Import configuration file
3. Connect and test

### **Router-level (Advanced)**
- Configure WireGuard on router
- All devices automatically use VPN + Pi-hole
- Requires compatible router firmware

## 📊 **Monitoring & Analytics**

### **Pi-hole Dashboard**
- **Query Types Over Time**: DNS request patterns
- **Top Blocked Domains**: Most blocked ad/tracker domains
- **Top Clients**: Most active devices
- **Forward Destinations**: Upstream DNS servers used

### **WireGuard Monitoring**
```bash
# Check connected clients
sudo wg show

# Monitor traffic
sudo wg show wg0 transfer

# View connection logs
sudo journalctl -u wg-quick@wg0
```

## 🔒 **Security Best Practices**

### **Pi-hole Security**
- Change default admin password
- Enable HTTPS for web interface
- Regularly update Pi-hole and blocklists
- Monitor query logs for suspicious activity

### **WireGuard Security**
- Use strong private keys
- Limit client access with AllowedIPs
- Regular key rotation for clients
- Monitor connection logs

### **Network Security**
- Firewall rules to restrict access
- Regular security updates
- Monitor for unauthorized access
- Backup configurations

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Pi-hole Not Blocking**
```bash
# Check if Pi-hole is running
sudo systemctl status pihole-FTL

# Verify DNS settings
nslookup doubleclick.net <your-pihole-server-ip>

# Update blocklists
pihole -g
```

#### **VPN Connection Issues**
```bash
# Check WireGuard status
sudo wg show

# Verify port forwarding
sudo netstat -tulpn | grep 51820

# Check firewall rules
sudo iptables -L
```

#### **DNS Resolution Problems**
```bash
# Test DNS resolution
dig @<your-pihole-server-ip> google.com

# Check Pi-hole logs
tail -f /var/log/pihole.log

# Verify upstream DNS
pihole -q google.com
```

## 📈 **Performance Optimization**

### **Pi-hole Optimization**
- Use SSD storage for better I/O
- Increase query cache size
- Optimize blocklist selection
- Monitor memory usage

### **WireGuard Optimization**
- Use modern cryptography settings
- Optimize MTU size
- Enable UDP acceleration
- Monitor bandwidth usage

## 🔄 **Backup & Recovery**

### **Pi-hole Backup**
```bash
# Backup configuration
sudo tar -czf pihole-backup.tar.gz /etc/pihole/

# Backup custom lists
cp /etc/pihole/custom.list ~/pihole-custom-backup.txt
```

### **WireGuard Backup**
```bash
# Backup keys and config
sudo tar -czf wireguard-backup.tar.gz /etc/wireguard/
```

## 📋 **Maintenance Tasks**

### **Weekly**
- [ ] Check Pi-hole query logs
- [ ] Monitor VPN connection stability
- [ ] Review blocked domain statistics

### **Monthly**
- [ ] Update Pi-hole and WireGuard
- [ ] Rotate client keys (if needed)
- [ ] Review and update blocklists
- [ ] Check system resource usage

### **Quarterly**
- [ ] Full configuration backup
- [ ] Security audit
- [ ] Performance review
- [ ] Update documentation

## 🌐 **Integration Benefits**

- **Seamless Ad Blocking**: Works automatically when connected to VPN
- **Privacy Protection**: All DNS queries filtered locally
- **Performance**: Faster browsing with ads blocked
- **Security**: Malware and phishing protection
- **Flexibility**: Works on any device, anywhere

---

**Network**: <your-server-ip> (Pi-hole) + VPN Gateway  
**Ports**: 53 (DNS), 51820 (WireGuard)  
**Security**: WPA3, DNS-over-HTTPS, Modern VPN crypto  
**Performance**: Sub-10ms DNS response, 100+ Mbps VPN throughput