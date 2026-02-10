import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import { statements } from './database.js';
import { collectCPUData, getProcesses } from './collectors/cpuCollector.js';
import { collectGPUData } from './collectors/gpuCollector.js';
import { collectMemoryData } from './collectors/memoryCollector.js';
import { collectDiskData } from './collectors/diskCollector.js';
import { collectNetworkData } from './collectors/networkCollector.js';
import { collectSystemData, getUSBDevices, getAudioDevices } from './collectors/systemCollector.js';

const PORT = 9800;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Store latest data for quick access
let latestData = {
  cpu: null,
  gpu: null,
  memory: null,
  disk: null,
  network: null,
  system: null,
  processes: [],
  usb: [],
  audio: []
};

// Collect all metrics
async function collectAllMetrics() {
  try {
    const [cpu, gpu, memory, disk, network, system, processes] = await Promise.all([
      collectCPUData(),
      collectGPUData(),
      collectMemoryData(),
      collectDiskData(),
      collectNetworkData(),
      collectSystemData(),
      getProcesses()
    ]);

    latestData = {
      cpu,
      gpu,
      memory,
      disk,
      network,
      system,
      processes,
      usb: latestData.usb, // Update these less frequently
      audio: latestData.audio,
      timestamp: Date.now()
    };

    // Save to database
    const timestamp = Date.now();
    
    if (cpu) {
      statements.insertCPU.run(timestamp, cpu.overall, cpu.temperature, cpu.frequency);
    }
    
    if (gpu?.primary) {
      statements.insertGPU.run(
        timestamp,
        gpu.primary.usage,
        gpu.primary.temperature,
        gpu.primary.memoryUsed,
        gpu.primary.memoryTotal
      );
    }
    
    if (memory) {
      statements.insertMemory.run(timestamp, memory.used, memory.total, memory.usage);
    }
    
    if (network) {
      statements.insertNetwork.run(timestamp, network.downloadSpeed, network.uploadSpeed);
    }
    
    if (disk?.disks) {
      disk.disks.forEach(d => {
        statements.insertDisk.run(timestamp, d.name, d.used, d.total, d.usage);
      });
    }

    return latestData;
  } catch (error) {
    console.error('Error collecting metrics:', error);
    return latestData;
  }
}

// Update USB and audio devices less frequently (every 10 seconds)
async function updatePeripherals() {
  try {
    const [usb, audio] = await Promise.all([
      getUSBDevices(),
      getAudioDevices()
    ]);
    
    latestData.usb = usb;
    latestData.audio = audio;
  } catch (error) {
    console.error('Error updating peripherals:', error);
  }
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial data immediately
  socket.emit('metrics', latestData);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('request-history', async (params) => {
    try {
      const timeRange = params.timeRange || 3600000; // Default 1 hour
      const cutoff = Date.now() - timeRange;
      
      const history = {
        cpu: statements.getCPUHistory.all(cutoff),
        gpu: statements.getGPUHistory.all(cutoff),
        memory: statements.getMemoryHistory.all(cutoff),
        network: statements.getNetworkHistory.all(cutoff)
      };
      
      socket.emit('history-data', history);
    } catch (error) {
      console.error('Error fetching history:', error);
      socket.emit('history-error', { message: error.message });
    }
  });
});

// REST API endpoints
app.get('/api/metrics', (req, res) => {
  res.json(latestData);
});

app.get('/api/history/:type', (req, res) => {
  try {
    const { type } = req.params;
    const timeRange = parseInt(req.query.range) || 3600000; // Default 1 hour
    const cutoff = Date.now() - timeRange;
    
    let data;
    switch (type) {
      case 'cpu':
        data = statements.getCPUHistory.all(cutoff);
        break;
      case 'gpu':
        data = statements.getGPUHistory.all(cutoff);
        break;
      case 'memory':
        data = statements.getMemoryHistory.all(cutoff);
        break;
      case 'network':
        data = statements.getNetworkHistory.all(cutoff);
        break;
      case 'disk':
        const diskName = req.query.name;
        if (!diskName) {
          return res.status(400).json({ error: 'Disk name required' });
        }
        data = statements.getDiskHistory.all(cutoff, diskName);
        break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/system-info', async (req, res) => {
  try {
    const [usb, audio] = await Promise.all([
      getUSBDevices(),
      getAudioDevices()
    ]);
    
    res.json({
      system: latestData.system,
      usb,
      audio
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/network-info', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];
  
  // Get all network addresses
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  res.json({
    addresses,
    hostname: os.hostname(),
    platform: os.platform()
  });
});

// Start metrics collection
console.log('Starting metrics collection...');

// Collect metrics every 1 second for real-time updates
setInterval(async () => {
  const data = await collectAllMetrics();
  io.emit('metrics', data);
}, 1000);

// Update peripherals every 10 seconds
setInterval(updatePeripherals, 10000);

// Start server
httpServer.listen(PORT, '0.0.0.0', async () => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];
  
  // Get all network addresses
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  console.log('========================================');
  console.log('✅ Hardware Monitor Backend running');
  console.log('========================================');
  console.log(`📍 Local:    http://localhost:${PORT}`);
  
  if (addresses.length > 0) {
    console.log('\n🌐 Network Access (use these on other devices):');
    addresses.forEach(addr => {
      console.log(`   http://${addr}:${PORT}`);
    });
  }
  
  console.log('\n🔌 WebSocket server ready');
  console.log('📊 Real-time monitoring active');
  console.log('========================================\n');
  
  // Initial collection after server starts
  try {
    await collectAllMetrics();
    await updatePeripherals();
    console.log('✅ Initial data collection complete\n');
  } catch (error) {
    console.error('❌ Error during initial collection:', error);
  }
});
