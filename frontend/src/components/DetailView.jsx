import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, Activity } from 'lucide-react';

const TIME_RANGES = [
  { label: '1 Min', value: 60000 },
  { label: '5 Min', value: 300000 },
  { label: '15 Min', value: 900000 },
  { label: '30 Min', value: 1800000 },
  { label: '1 Hour', value: 3600000 },
  { label: '6 Hours', value: 21600000 },
  { label: '24 Hours', value: 86400000 }
];

function DetailView({ type, metrics, socket }) {
  const [timeRange, setTimeRange] = useState(3600000); // Default 1 hour
  const [historyData, setHistoryData] = useState([]);
  const [realtimeData, setRealtimeData] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.emit('request-history', { timeRange });
      
      socket.on('history-data', (data) => {
        if (data[type]) {
          const formatted = formatHistoryData(data[type], type);
          setHistoryData(formatted);
        }
      });

      return () => {
        socket.off('history-data');
      };
    }
  }, [socket, timeRange, type]);

  useEffect(() => {
    if (metrics) {
      const newData = createRealtimeDataPoint(metrics, type);
      if (newData) {
        setRealtimeData(prev => {
          const updated = [...prev, newData];
          return updated.slice(-120); // Keep last 2 minutes for real-time view
        });
      }
    }
  }, [metrics, type]);

  const renderContent = () => {
    switch (type) {
      case 'cpu':
        return <CPUDetailView metrics={metrics} historyData={historyData} realtimeData={realtimeData} />;
      case 'gpu':
        return <GPUDetailView metrics={metrics} historyData={historyData} realtimeData={realtimeData} />;
      case 'memory':
        return <MemoryDetailView metrics={metrics} historyData={historyData} realtimeData={realtimeData} />;
      case 'disk':
        return <DiskDetailView metrics={metrics} />;
      case 'network':
        return <NetworkDetailView metrics={metrics} historyData={historyData} realtimeData={realtimeData} />;
      default:
        return <div>Unknown type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-dark-text">Historical Time Range</span>
          </div>
          <div className="flex gap-2">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  timeRange === range.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-dark-cardHover text-dark-text hover:bg-dark-border'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

function CPUDetailView({ metrics, historyData, realtimeData }) {
  const cpu = metrics?.cpu;
  if (!cpu) return null;

  return (
    <div className="space-y-6">
      {/* CPU Info Card */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">CPU Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard label="Manufacturer" value={cpu.info?.manufacturer} />
          <InfoCard label="Brand" value={cpu.info?.brand} />
          <InfoCard label="Physical Cores" value={cpu.info?.physicalCores} />
          <InfoCard label="Logical Cores" value={cpu.info?.cores} />
          <InfoCard label="Base Speed" value={`${cpu.info?.speed} GHz`} />
          <InfoCard label="Current Speed" value={`${cpu.frequency?.toFixed(0)} MHz`} />
          <InfoCard label="Temperature" value={cpu.temperature ? `${cpu.temperature.toFixed(1)}°C` : 'N/A'} />
          <InfoCard label="Usage" value={`${cpu.overall.toFixed(1)}%`} />
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Real-time CPU Usage (Last 2 minutes)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={realtimeData}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="time" stroke="#a0a0a0" />
              <YAxis stroke="#a0a0a0" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#121212', 
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="usage" 
                stroke="#3b82f6" 
                fillOpacity={1}
                fill="url(#cpuGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Chart */}
      {historyData.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Historical CPU Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="time" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="usage" stroke="#3b82f6" name="CPU %" dot={false} />
                {historyData[0]?.temperature && (
                  <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Temp °C" dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-Core Usage */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Per-Core Usage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cpu.cores?.map((core) => (
            <div key={core.core} className="bg-dark-cardHover p-4 rounded-lg">
              <p className="text-sm text-dark-textSecondary mb-2">Core {core.core}</p>
              <p className="text-2xl font-bold text-dark-text mb-2">{core.usage.toFixed(1)}%</p>
              <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${core.usage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Processes */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Top CPU Processes</h3>
        <div className="space-y-2">
          {metrics?.processes?.slice(0, 20).map((proc) => (
            <div key={proc.pid} className="flex items-center justify-between p-3 bg-dark-cardHover rounded-lg hover:bg-dark-border transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-text truncate">{proc.name}</p>
                <p className="text-xs text-dark-textSecondary">PID: {proc.pid}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-semibold text-dark-text">{proc.cpu.toFixed(1)}% CPU</p>
                <p className="text-xs text-dark-textSecondary">{proc.memMB} MB RAM</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GPUDetailView({ metrics, historyData, realtimeData }) {
  const gpu = metrics?.gpu;
  if (!gpu?.primary) {
    return <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <p className="text-dark-textSecondary">No GPU detected</p>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* GPU Info */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">GPU Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard label="Vendor" value={gpu.primary.vendor} />
          <InfoCard label="Model" value={gpu.primary.model} />
          <InfoCard label="VRAM Total" value={`${gpu.primary.memoryTotal} MB`} />
          <InfoCard label="VRAM Used" value={`${gpu.primary.memoryUsed} MB`} />
          <InfoCard label="Usage" value={`${gpu.primary.usage.toFixed(1)}%`} />
          <InfoCard label="Temperature" value={gpu.primary.temperature ? `${gpu.primary.temperature.toFixed(1)}°C` : 'N/A'} />
          <InfoCard label="Memory Usage" value={`${gpu.primary.memoryUsage.toFixed(1)}%`} />
          {gpu.primary.fanSpeed && <InfoCard label="Fan Speed" value={`${gpu.primary.fanSpeed}%`} />}
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Real-time GPU Metrics (Last 2 minutes)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="time" stroke="#a0a0a0" />
              <YAxis stroke="#a0a0a0" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#121212', 
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#a855f7" name="GPU %" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="memory" stroke="#ec4899" name="VRAM %" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Chart */}
      {historyData.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Historical GPU Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="time" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="usage" stroke="#a855f7" name="GPU %" dot={false} />
                {historyData[0]?.temperature && (
                  <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Temp °C" dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function MemoryDetailView({ metrics, historyData, realtimeData }) {
  const memory = metrics?.memory;
  if (!memory) return null;

  return (
    <div className="space-y-6">
      {/* Memory Info */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Memory Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard label="Total RAM" value={`${memory.total.toFixed(1)} GB`} />
          <InfoCard label="Used RAM" value={`${memory.used.toFixed(1)} GB`} />
          <InfoCard label="Free RAM" value={`${memory.free.toFixed(1)} GB`} />
          <InfoCard label="Usage" value={`${memory.usage.toFixed(1)}%`} />
          <InfoCard label="Active" value={`${memory.active.toFixed(1)} GB`} />
          <InfoCard label="Available" value={`${memory.available.toFixed(1)} GB`} />
          {memory.swap.total > 0 && (
            <>
              <InfoCard label="Swap Total" value={`${memory.swap.total.toFixed(1)} GB`} />
              <InfoCard label="Swap Used" value={`${memory.swap.used.toFixed(1)} GB`} />
            </>
          )}
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Real-time Memory Usage (Last 2 minutes)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={realtimeData}>
              <defs>
                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="time" stroke="#a0a0a0" />
              <YAxis stroke="#a0a0a0" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#121212', 
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="usage" 
                stroke="#22c55e" 
                fillOpacity={1}
                fill="url(#memGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Chart */}
      {historyData.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Historical Memory Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="time" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="usage" stroke="#22c55e" name="RAM %" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Memory Modules */}
      {memory.layout && memory.layout.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Memory Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memory.layout.map((module, index) => (
              <div key={index} className="bg-dark-cardHover p-4 rounded-lg">
                <p className="text-sm text-dark-textSecondary">Module {index + 1}</p>
                <p className="text-lg font-semibold text-dark-text">{module.size} GB</p>
                <p className="text-sm text-dark-textSecondary">{module.type} @ {module.clockSpeed} MHz</p>
                <p className="text-xs text-dark-textSecondary">{module.manufacturer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DiskDetailView({ metrics }) {
  const disk = metrics?.disk;
  if (!disk) return null;

  return (
    <div className="space-y-6">
      {/* Disk I/O */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Disk I/O Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard label="Read Speed" value={`${disk.io?.readSpeed?.toFixed(2)} MB/s`} />
          <InfoCard label="Write Speed" value={`${disk.io?.writeSpeed?.toFixed(2)} MB/s`} />
          <InfoCard label="Read Operations" value={disk.io?.read?.toLocaleString()} />
          <InfoCard label="Write Operations" value={disk.io?.write?.toLocaleString()} />
        </div>
      </div>

      {/* All Disks */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">All Disks</h3>
        <div className="grid grid-cols-1 gap-4">
          {disk.disks?.map((d, index) => (
            <div key={index} className="bg-dark-cardHover p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-dark-text">{d.name}</p>
                  <p className="text-sm text-dark-textSecondary">{d.mount} • {d.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-dark-text">{d.usage.toFixed(1)}%</p>
                  <p className="text-sm text-dark-textSecondary">
                    {d.used.toFixed(1)} / {d.total.toFixed(1)} GB
                  </p>
                </div>
              </div>
              <div className="h-3 bg-dark-card rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    d.usage > 90 ? 'bg-red-500' :
                    d.usage > 70 ? 'bg-yellow-500' :
                    'bg-cyan-500'
                  }`}
                  style={{ width: `${d.usage}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-dark-textSecondary">Free</p>
                  <p className="font-semibold text-dark-text">{d.free.toFixed(1)} GB</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Block Devices */}
      {disk.devices && disk.devices.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Block Devices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disk.devices.map((device, index) => (
              <div key={index} className="bg-dark-cardHover p-4 rounded-lg">
                <p className="text-lg font-semibold text-dark-text">{device.name}</p>
                <p className="text-sm text-dark-textSecondary">{device.type}</p>
                <p className="text-sm text-dark-text">{device.size.toFixed(1)} GB</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NetworkDetailView({ metrics, historyData, realtimeData }) {
  const network = metrics?.network;
  if (!network) return null;

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Network Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard label="Download Speed" value={`${network.downloadSpeed.toFixed(2)} MB/s`} />
          <InfoCard label="Upload Speed" value={`${network.uploadSpeed.toFixed(2)} MB/s`} />
          <InfoCard label="Total Downloaded" value={`${network.totalDownload.toFixed(2)} GB`} />
          <InfoCard label="Total Uploaded" value={`${network.totalUpload.toFixed(2)} GB`} />
          <InfoCard label="Active Connections" value={network.activeConnections} />
        </div>
      </div>

      {/* Real-time Chart */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Real-time Network Speed (Last 2 minutes)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="time" stroke="#a0a0a0" />
              <YAxis stroke="#a0a0a0" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#121212', 
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="download" stroke="#22c55e" name="Download (MB/s)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="upload" stroke="#3b82f6" name="Upload (MB/s)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Chart */}
      {historyData.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Historical Network Speed</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="time" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121212', 
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="download_speed" stroke="#22c55e" name="Download (MB/s)" dot={false} />
                <Line type="monotone" dataKey="upload_speed" stroke="#3b82f6" name="Upload (MB/s)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Network Interfaces */}
      {network.interfaces && network.interfaces.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Network Interfaces</h3>
          <div className="space-y-4">
            {network.interfaces.map((iface, index) => (
              <div key={index} className="bg-dark-cardHover p-4 rounded-lg">
                <p className="text-lg font-semibold text-dark-text mb-2">{iface.name}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-dark-textSecondary">IPv4</p>
                    <p className="text-dark-text font-medium">{iface.ip4 || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-dark-textSecondary">MAC Address</p>
                    <p className="text-dark-text font-medium">{iface.mac}</p>
                  </div>
                  <div>
                    <p className="text-dark-textSecondary">Type</p>
                    <p className="text-dark-text font-medium">{iface.type}</p>
                  </div>
                  <div>
                    <p className="text-dark-textSecondary">Speed</p>
                    <p className="text-dark-text font-medium">{iface.speed ? `${iface.speed} Mbps` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-dark-textSecondary">Status</p>
                    <p className="text-dark-text font-medium">{iface.operstate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-dark-cardHover p-4 rounded-lg">
      <p className="text-xs text-dark-textSecondary mb-1">{label}</p>
      <p className="text-lg font-bold text-dark-text">{value || 'N/A'}</p>
    </div>
  );
}

// Helper functions
function formatHistoryData(data, type) {
  return data.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString()
  }));
}

function createRealtimeDataPoint(metrics, type) {
  const time = new Date().toLocaleTimeString();
  
  switch (type) {
    case 'cpu':
      return metrics.cpu ? { 
        time, 
        usage: metrics.cpu.overall,
        temperature: metrics.cpu.temperature
      } : null;
    case 'gpu':
      return metrics.gpu?.primary ? { 
        time, 
        usage: metrics.gpu.primary.usage,
        memory: metrics.gpu.primary.memoryUsage,
        temperature: metrics.gpu.primary.temperature
      } : null;
    case 'memory':
      return metrics.memory ? { 
        time, 
        usage: metrics.memory.usage,
        swap: metrics.memory.swap?.usage || 0
      } : null;
    case 'network':
      return metrics.network ? { 
        time, 
        download: metrics.network.downloadSpeed,
        upload: metrics.network.uploadSpeed
      } : null;
    default:
      return null;
  }
}

export default DetailView;
