# 🖥️ Hardware Monitor

A real-time hardware and system monitoring dashboard with beautiful dark mode UI, WebSocket updates, and historical data tracking.

![Hardware Monitor](https://img.shields.io/badge/Made%20with-React%20%2B%20Node.js-blue)

## ✨ Features

### Monitoring Capabilities
- **CPU Monitoring**: Real-time usage, per-core statistics, temperature, frequency
- **GPU Monitoring**: Usage, VRAM, temperature, fan speed (NVIDIA/AMD/Intel)
- **Memory Monitoring**: RAM/Swap usage, available memory, per-module info
- **Disk Monitoring**: Storage usage, read/write speeds, I/O operations
- **Network Monitoring**: Upload/download speeds, active connections, interfaces
- **System Info**: Uptime, OS details, motherboard, battery status
- **Process Monitoring**: Top 20 processes by CPU/memory usage

### Technical Features
- ⚡ **Real-time Updates**: WebSocket-based instant metrics (1-second intervals)
- 📊 **Interactive Charts**: Recharts with real-time and historical data
- 🌙 **Dark Mode**: Sleek dark interface (optimized for long monitoring sessions)
- 💾 **Historical Data**: SQLite storage with configurable time ranges (1min - 24hrs)
- 🎯 **Detail Views**: Click any metric for expanded view with more insights
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔌 **Auto-reconnect**: Resilient WebSocket connection handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install root dependencies**
```bash
npm install
```

2. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

### Running the Application

**Option 1: Run everything at once (recommended)**
```bash
npm run dev
```

**Option 2: Run individually**

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
```

### Access the Dashboard
- **Local**: http://localhost:9801
- **Network**: Check terminal output for your IP address (e.g., http://192.168.1.100:9801)
- **Auto-detection**: Works on any device - monitors whatever system it's running on!

### 🌐 LAN Access (Access from Tablets, Phones, Other Computers)

The Hardware Monitor automatically supports network access! 

**To access from another device on your network:**
1. Start the servers using `start.bat`
2. Look for the **Network Access** URLs in the terminal output
3. Open that URL on any device connected to the same WiFi/network
4. Example: `http://192.168.1.100:9801`

**The dashboard will automatically:**
- Connect to the correct backend server
- Show which computer is being monitored (hostname in the header)
- Display connection status

**Perfect for:**
- 📱 Using a tablet as a dedicated monitoring display
- 💻 Monitoring your desktop from a laptop
- 🖥️ Remote monitoring from anywhere on your network
- 🎮 Keeping an eye on system resources while gaming (second screen)

## 📁 Project Structure

```
hardware-monitor/
├── backend/
│   ├── server.js                 # Main server with WebSocket
│   ├── database.js               # SQLite setup and queries
│   ├── collectors/
│   │   ├── cpuCollector.js      # CPU metrics
│   │   ├── gpuCollector.js      # GPU metrics
│   │   ├── memoryCollector.js   # Memory metrics
│   │   ├── diskCollector.js     # Disk metrics
│   │   ├── networkCollector.js  # Network metrics
│   │   └── systemCollector.js   # System info
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main application
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    # Overview dashboard
│   │   │   ├── CPUMonitor.jsx   # CPU widget
│   │   │   ├── GPUMonitor.jsx   # GPU widget
│   │   │   ├── MemoryMonitor.jsx  # Memory widget
│   │   │   ├── DiskMonitor.jsx    # Disk widget
│   │   │   ├── NetworkMonitor.jsx # Network widget
│   │   │   └── DetailView.jsx     # Detailed metric views
│   │   └── main.jsx
│   └── package.json
└── package.json                  # Root scripts
```

## 🎨 UI Components

### Dashboard (Overview)
- Quick stats cards (CPU, GPU, Memory, Network)
- System information panel
- Real-time monitoring widgets
- Top processes list
- Click any card to expand

### Detail Views
- Time range selector (1min, 5min, 15min, 30min, 1hr, 6hr, 24hr)
- Real-time charts (last 2 minutes with smooth animations)
- Historical charts (selected time range)
- Detailed component information
- Per-core/device breakdowns

## 🔧 Configuration

### Multi-Device & Network Access

**The Hardware Monitor is network-ready by default!**

- **Auto-detection**: Automatically detects and monitors whatever system it's running on
- **Network binding**: Backend binds to `0.0.0.0` (all network interfaces)
- **Smart URL detection**: Frontend automatically connects to the correct backend
- **Portable**: Copy the entire folder to any Windows computer and run `start.bat`

**Deploy scenarios:**
1. **Desktop monitoring**: Run on your main PC, access from anywhere
2. **Laptop monitoring**: Install on laptop, monitors that laptop's hardware
3. **Server monitoring**: Deploy on a server, access dashboard remotely
4. **Multi-system**: Run separate instances on each machine you want to monitor

### Port Configuration
Ports are configured in the 9800-9999 range as requested:
- Backend: `9800` (configured in `backend/server.js`)
- Frontend: `9801` (configured in `frontend/vite.config.js` and `frontend/package.json`)

To change ports:
1. Update `PORT` in `backend/server.js`
2. Update `SOCKET_URL` in `frontend/src/App.jsx`
3. Update `vite.config.js` server port

### Data Retention
Historical data is kept for 24 hours by default. To change:
Edit the cleanup interval in `backend/database.js`:
```javascript
const cutoff = Date.now() - 24 * 60 * 60 * 1000; // Change 24 to desired hours
```

### Update Frequency
Metrics are collected every 1 second. To adjust:
Edit the interval in `backend/server.js`:
```javascript
setInterval(async () => {
  const data = await collectAllMetrics();
  io.emit('metrics', data);
}, 1000); // Change 1000 to desired milliseconds
```

## 📡 API Endpoints

### REST API

- `GET /api/metrics` - Get current metrics
- `GET /api/history/:type?range=<ms>` - Get historical data
  - Types: `cpu`, `gpu`, `memory`, `network`, `disk`
  - Range: milliseconds (default: 3600000 = 1 hour)
- `GET /api/system-info` - Get system information, USB, audio devices

### WebSocket Events

**Client → Server:**
- `request-history` - Request historical data
  ```javascript
  socket.emit('request-history', { timeRange: 3600000 });
  ```

**Server → Client:**
- `metrics` - Real-time metrics (every 1 second)
- `history-data` - Historical data response
- `history-error` - Error fetching history

## 📊 Metrics Tracked

### CPU
- Overall usage percentage
- Per-core usage
- Temperature (if available)
- Current frequency
- Top processes by CPU usage

### GPU
- GPU usage percentage
- VRAM usage (MB and %)
- Temperature
- Fan speed (if available)
- Power draw (if available)

### Memory
- Total/used/free RAM
- Active memory
- Swap usage
- Per-module information (size, type, speed)

### Disk
- Per-disk usage (GB and %)
- Read/write speeds (MB/s)
- I/O operations count
- Block devices

### Network
- Download/upload speeds (MB/s)
- Total transferred data (GB)
- Active connections
- Network interfaces (IP, MAC, type)

### System
- Uptime
- OS information
- Hardware details (motherboard, BIOS)
- Battery status (if laptop)
- USB devices
- Audio devices

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.io** - WebSocket server
- **systeminformation** - System metrics collection
- **better-sqlite3** - Database for historical data
- **node-os-utils** - Additional OS utilities

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Socket.io-client** - WebSocket client
- **Recharts** - Charting library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🐛 Troubleshooting

### Backend won't start
- Ensure port 9800 is available
- Check Node.js version (18+ required)
- Verify all dependencies are installed: `cd backend && npm install`

### Frontend won't connect
- Verify backend is running on port 9800
- Check `SOCKET_URL` in `App.jsx` matches backend port
- Clear browser cache

### No GPU detected
- Normal for systems without dedicated GPU
- Integrated graphics may not report all metrics
- Some metrics require specific drivers (NVIDIA/AMD)

### Metrics not updating
- Check WebSocket connection status (indicator in header)
- Verify firewall isn't blocking ports
- Check browser console for errors

## 📈 Performance

- **Memory Usage**: ~50-100MB backend, ~100-150MB frontend
- **CPU Usage**: <2% on modern systems
- **Data Collection**: Every 1 second
- **Database Size**: ~10MB per day (with 24hr retention)

## 🔐 Security Notes

- This application runs **locally** only by default
- No authentication implemented (not needed for local use)
- If exposing to network, add authentication middleware
- Consider firewall rules if running on server

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 🎯 Future Enhancements

- [ ] Alert/threshold notifications
- [ ] Export data to CSV/JSON
- [ ] Custom dashboard layouts
- [ ] Multi-system monitoring
- [ ] Email/Discord notifications
- [ ] Performance comparison over time
- [ ] System stability score

---

**Enjoy monitoring your hardware! 🚀**
