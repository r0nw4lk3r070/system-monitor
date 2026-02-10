import { Activity, Maximize2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

function GPUMonitor({ gpu, onExpand }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (gpu?.primary?.usage !== undefined) {
      setHistory(prev => {
        const newHistory = [...prev, { 
          time: new Date().toLocaleTimeString(), 
          usage: gpu.primary.usage,
          memory: gpu.primary.memoryUsage || 0,
          timestamp: Date.now()
        }];
        return newHistory.slice(-60);
      });
    }
  }, [gpu?.primary?.usage]);

  if (!gpu?.primary) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-500" />
          GPU Monitor
        </h2>
        <p className="text-dark-textSecondary">No GPU detected</p>
      </div>
    );
  }

  const { primary } = gpu;

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" />
          GPU Monitor
        </h2>
        <button 
          onClick={onExpand}
          className="p-2 hover:bg-dark-cardHover rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-dark-textSecondary mb-1">{primary.vendor}</p>
        <p className="text-lg font-semibold text-dark-text truncate">{primary.model}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <MetricBox label="GPU Usage" value={`${primary.usage.toFixed(1)}%`} />
        <MetricBox label="Temperature" value={primary.temperature ? `${primary.temperature.toFixed(1)}°C` : 'N/A'} />
        <MetricBox 
          label="VRAM Used" 
          value={`${primary.memoryUsed} MB`} 
        />
        <MetricBox 
          label="VRAM Total" 
          value={`${primary.memoryTotal} MB`} 
        />
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
            <YAxis stroke="#a0a0a0" tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#121212', 
                border: '1px solid #2a2a2a',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="usage" 
              stroke="#a855f7" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="GPU %"
            />
            <Line 
              type="monotone" 
              dataKey="memory" 
              stroke="#ec4899" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="VRAM %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* VRAM usage bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-textSecondary">VRAM Usage</span>
          <span className="text-sm text-dark-text font-semibold">
            {primary.memoryUsage.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-dark-cardHover rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${primary.memoryUsage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="bg-dark-cardHover p-3 rounded-lg">
      <p className="text-xs text-dark-textSecondary mb-1">{label}</p>
      <p className="text-lg font-bold text-dark-text">{value}</p>
    </div>
  );
}

export default GPUMonitor;
