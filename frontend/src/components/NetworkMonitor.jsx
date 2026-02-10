import { Network, Maximize2, ArrowDown, ArrowUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

function NetworkMonitor({ network, onExpand }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (network?.downloadSpeed !== undefined) {
      setHistory(prev => {
        const newHistory = [...prev, { 
          time: new Date().toLocaleTimeString(), 
          download: network.downloadSpeed,
          upload: network.uploadSpeed,
          timestamp: Date.now()
        }];
        return newHistory.slice(-60);
      });
    }
  }, [network?.downloadSpeed]);

  if (!network) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Network className="w-5 h-5 text-orange-500" />
          Network Monitor
        </h2>
        <button 
          onClick={onExpand}
          className="p-2 hover:bg-dark-cardHover rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-dark-cardHover p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="w-4 h-4 text-green-500" />
            <p className="text-xs text-dark-textSecondary">Download</p>
          </div>
          <p className="text-2xl font-bold text-dark-text">
            {network.downloadSpeed.toFixed(2)}
          </p>
          <p className="text-xs text-dark-textSecondary">MB/s</p>
        </div>
        
        <div className="bg-dark-cardHover p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-dark-textSecondary">Upload</p>
          </div>
          <p className="text-2xl font-bold text-dark-text">
            {network.uploadSpeed.toFixed(2)}
          </p>
          <p className="text-xs text-dark-textSecondary">MB/s</p>
        </div>
      </div>

      {/* Real-time chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis 
              dataKey="time" 
              stroke="#a0a0a0" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#a0a0a0" tick={{ fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#121212', 
                border: '1px solid #2a2a2a',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="download" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Download (MB/s)"
            />
            <Line 
              type="monotone" 
              dataKey="upload" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Upload (MB/s)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <MetricBox label="Total Down" value={`${network.totalDownload.toFixed(2)} GB`} />
        <MetricBox label="Total Up" value={`${network.totalUpload.toFixed(2)} GB`} />
      </div>
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="bg-dark-cardHover p-3 rounded-lg">
      <p className="text-xs text-dark-textSecondary mb-1">{label}</p>
      <p className="text-sm font-bold text-dark-text">{value}</p>
    </div>
  );
}

export default NetworkMonitor;
