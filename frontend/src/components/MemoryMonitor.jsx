import { HardDrive, Maximize2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

function MemoryMonitor({ memory, onExpand }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (memory?.usage !== undefined) {
      setHistory(prev => {
        const newHistory = [...prev, { 
          time: new Date().toLocaleTimeString(), 
          usage: memory.usage,
          swap: memory.swap?.usage || 0,
          timestamp: Date.now()
        }];
        return newHistory.slice(-60);
      });
    }
  }, [memory?.usage]);

  if (!memory) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-green-500" />
          Memory Monitor
        </h2>
        <button 
          onClick={onExpand}
          className="p-2 hover:bg-dark-cardHover rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <MetricBox label="Usage" value={`${(memory.usage || 0).toFixed(1)}%`} />
        <MetricBox label="Used" value={`${(memory.used || 0).toFixed(1)} GB`} />
        <MetricBox label="Free" value={`${(memory.free || 0).toFixed(1)} GB`} />
        <MetricBox label="Total" value={`${(memory.total || 0).toFixed(1)} GB`} />
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
              stroke="#22c55e" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="RAM %"
            />
            {memory.swap?.total > 0 && (
              <Line 
                type="monotone" 
                dataKey="swap" 
                stroke="#eab308" 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="Swap %"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Memory usage bar */}
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-textSecondary">RAM</span>
            <span className="text-sm text-dark-text font-semibold">
              {(memory.used || 0).toFixed(1)} / {(memory.total || 0).toFixed(1)} GB ({(memory.usage || 0).toFixed(1)}%)
            </span>
          </div>
          <div className="h-3 bg-dark-cardHover rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${memory.usage || 0}%` }}
            />
          </div>
        </div>

        {memory.swap?.total > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-textSecondary">Swap</span>
              <span className="text-sm text-dark-text font-semibold">
                {(memory.swap.used || 0).toFixed(1)} / {(memory.swap.total || 0).toFixed(1)} GB ({(memory.swap.usage || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 bg-dark-cardHover rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${memory.swap.usage || 0}%` }}
              />
            </div>
          </div>
        )}
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

export default MemoryMonitor;
