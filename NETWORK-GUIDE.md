# 🚀 Quick Start Guide - Hardware Monitor

## How It Works

The Hardware Monitor is designed to be **portable** and **network-ready**:

1. **Auto-Detection**: It automatically monitors whatever computer it's running on
2. **Network Access**: Can be accessed from any device on the same network
3. **Zero Configuration**: Just run `start.bat` and everything works!

## 📱 Usage Scenarios

### Scenario 1: Monitor Your Desktop from a Tablet
```
1. Run start.bat on your desktop PC
2. Look for the Network Access URL in the terminal (e.g., http://192.168.1.100:9801)
3. Open that URL on your tablet's browser
4. Your tablet now shows real-time stats from your desktop!
```

**Perfect for:**
- Having a dedicated monitoring display while gaming
- Keeping your PC stats visible without alt-tabbing
- Monitoring your workstation from across the room

### Scenario 2: Monitor Your Laptop
```
1. Copy the hardware-monitor folder to your laptop
2. Run start.bat
3. The dashboard automatically monitors THE LAPTOP (not the desktop!)
4. Access from laptop or any other device on the network
```

**How it auto-detects:**
- The `systeminformation` library queries the OS directly
- It always monitors the machine where the backend is running
- Each instance is independent - run on multiple machines for multiple monitors!

### Scenario 3: Dedicated Monitoring Setup
```
Desktop PC (192.168.1.100): Running hardware-monitor → monitors desktop
Laptop (192.168.1.101): Running hardware-monitor → monitors laptop
Tablet: Open both URLs side-by-side to monitor both machines!
```

## 🌐 Network Access Explained

### What the URLs Mean

- **http://localhost:9801** - Only works on the same computer
- **http://192.168.1.100:9801** - Works from any device on your network
  - `192.168.1.100` = Your computer's IP address on the local network
  - `9801` = The frontend port
  - Change the IP to match different computers

### Finding Your IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter

**Or just check the terminal where you ran start.bat!**  
It automatically displays all network URLs.

## 🔒 Security Note

- **Local Network Only**: By default, only accessible on your home/office network
- **No Authentication**: Anyone on your network can access it
- **No Internet**: Not exposed to the internet (unless you configure port forwarding)

**This is safe for:**
- Home networks
- Trusted office networks
- Personal use

**Add firewall rules if:**
- Using on public WiFi
- Want to restrict access to specific devices

## 🎯 Common Questions

### Q: Can I monitor my desktop from my phone while traveling?
**A:** Not by default. You'd need to set up VPN or port forwarding (advanced). 
The monitor is designed for local network use.

### Q: Can one instance monitor multiple computers?
**A:** No. Each instance monitors the computer it's running on. 
Run separate instances on each computer you want to monitor.

### Q: Does it work on Mac/Linux?
**A:** The code is cross-platform (Node.js), but start.bat is Windows-only. 
You'd need to adapt the startup script for Mac/Linux.

### Q: My tablet shows "Disconnected"
**Check:**
1. Both devices are on the same WiFi network
2. Firewall isn't blocking ports 9800 and 9801
3. You're using the correct IP address (from the terminal output)
4. The backend server is still running

### Q: Can I change the ports?
**A:** Yes! See Configuration section in README.md

## 💡 Pro Tips

1. **Bookmark the URL** on your tablet for quick access
2. **Run as admin** if you need elevated permissions
3. **Pin to taskbar**: Create a shortcut to start.bat for easy launching
4. **Use a static IP** on your PC to avoid the URL changing
5. **Add to startup**: Put start.bat in your Startup folder for automatic launch

## 📊 What Gets Monitored

The system automatically detects and monitors:
- ✅ CPU (usage, per-core, frequency)
- ✅ GPU (if available - usage, VRAM, temp)
- ✅ RAM (usage, available, swap)
- ✅ Disks (all drives, I/O speeds)
- ✅ Network (upload/download speeds, interfaces)
- ✅ Processes (top 20 by CPU/RAM)
- ✅ System info (OS, hostname, uptime, battery)

## 🎮 Gaming Setup Example

1. Start hardware-monitor on your gaming PC
2. Open dashboard on tablet/second monitor
3. Keep it visible while gaming
4. Monitor temps, FPS impact, RAM usage in real-time!

## 📞 Support

Check the main README.md for:
- Installation instructions
- Configuration options
- Troubleshooting
- API documentation

---

**Enjoy monitoring your hardware! 🚀**
