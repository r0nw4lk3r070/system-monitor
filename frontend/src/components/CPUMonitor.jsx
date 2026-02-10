import { Cpu, Maximize2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

function CPUMonitor({ cpu, onExpand }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (cpu?.overall !== undefined) {
      setHistory(prev => {
        const newHistory = [...prev, { 
          time: new Date().toLocaleTimeString(), 
          usage: cpu.overall,
          timestamp: Date.now()
        }];
        return newHistory.slice(-60); // Keep last 60 seconds
      });
    }
  }, [cpu?.overall]);

  if (!cpu) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-500" />
          CPU Monitor
        </h2>
        <button 
          onClick={onExpand}
          className="p-2 hover:bg-dark-cardHover rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <MetricBox label="Usage" value={`${(cpu.overall || 0).toFixed(1)}%`} />
        <MetricBox 
          label="Temperature" 
          value={cpu.temperature ? `${cpu.temperature.toFixed(1)}°C` : 'Not Available'}
          tooltip={!cpu.temperature ? "Windows doesn't expose CPU temp on this system. Try HWiNFO or Core Temp." : undefined}
        />
        <MetricBox label="Frequency" value={cpu.frequency ? `${cpu.frequency.toFixed(0)} MHz` : 'N/A'} />
        <MetricBox label="Cores" value={`${cpu.cores?.length || 0}`} />
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
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Core usage bars */}
      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
        {cpu.cores?.slice(0, 8).map((core) => (
          <div key={core.core} className="flex items-center gap-2">
            <span className="text-xs text-dark-textSecondary w-12">Core {core.core}</span>
            <div className="flex-1 h-2 bg-dark-cardHover rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${core.usage}%` }}
              />
            </div>
            <span className="text-xs text-dark-textSecondary w-12 text-right">
              {core.usage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricBox({ label, value, tooltip }) {
  return (
    <div className="bg-dark-cardHover p-3 rounded-lg" title={tooltip}>
      <p className="text-xs text-dark-textSecondary mb-1">{label}</p>
      <p className="text-lg font-bold text-dark-text">{value}</p>
      {tooltip && <p className="text-[10px] text-dark-textSecondary mt-1 opacity-70">ⓘ Hover for info</p>}
    </div>
  );
}

export default CPUMonitor;
