import { Cpu, HardDrive, Activity, Network, Thermometer, HardDriveDownload, Zap, Clock, Monitor, Package } from 'lucide-react';
import CPUMonitor from './CPUMonitor';
import GPUMonitor from './GPUMonitor';
import MemoryMonitor from './MemoryMonitor';
import DiskMonitor from './DiskMonitor';
import NetworkMonitor from './NetworkMonitor';

function Dashboard({ metrics, onSelectView }) {
  if (!metrics) return null;

  const { cpu, gpu, memory, disk, network, system, processes } = metrics;

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          icon={<Cpu className="w-6 h-6" />}
          title="CPU Usage"
          value={`${cpu?.overall?.toFixed(1) || 0}%`}
          subtitle={cpu?.temperature ? `${cpu.temperature.toFixed(1)}°C` : 'N/A'}
          color="blue"
          onClick={() => onSelectView('cpu')}
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="GPU Usage"
          value={`${gpu?.primary?.usage?.toFixed(1) || 0}%`}
          subtitle={gpu?.primary?.temperature ? `${gpu.primary.temperature.toFixed(1)}°C` : 'N/A'}
          color="purple"
          onClick={() => onSelectView('gpu')}
        />
        <StatCard
          icon={<HardDrive className="w-6 h-6" />}
          title="Memory"
          value={`${memory?.usage?.toFixed(1) || 0}%`}
          subtitle={memory ? `${memory.used.toFixed(1)} / ${memory.total.toFixed(1)} GB` : 'N/A'}
          color="green"
          onClick={() => onSelectView('memory')}
        />
        <StatCard
          icon={<Network className="w-6 h-6" />}
          title="Network"
          value={`${network?.downloadSpeed?.toFixed(2) || 0} MB/s`}
          subtitle={`↑ ${network?.uploadSpeed?.toFixed(2) || 0} MB/s`}
          color="orange"
          onClick={() => onSelectView('network')}
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="Uptime"
          value={system?.uptime?.formatted || 'N/A'}
          subtitle="System Uptime"
          color="blue"
        />
        <StatCard
          icon={<Monitor className="w-6 h-6" />}
          title="Hostname"
          value={system?.info?.os?.hostname || 'N/A'}
          subtitle="System Name"
          color="green"
        />
        <StatCard
          icon={<Package className="w-6 h-6" />}
          title="OS"
          value={system?.info?.os?.distro?.split(' ').slice(0, 2).join(' ') || 'N/A'}
          subtitle={system?.info?.os?.distro ? 'Windows' : 'N/A'}
          color="purple"
        />
      </div>

      {/* Main Monitors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CPUMonitor cpu={cpu} onExpand={() => onSelectView('cpu')} />
        <GPUMonitor gpu={gpu} onExpand={() => onSelectView('gpu')} />
        <MemoryMonitor memory={memory} onExpand={() => onSelectView('memory')} />
        <NetworkMonitor network={network} onExpand={() => onSelectView('network')} />
      </div>

      {/* Disk and Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiskMonitor disk={disk} onExpand={() => onSelectView('disk')} />
        
        {/* Top Processes */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Top Processes
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {processes?.slice(0, 10).map((proc, index) => (
              <div key={proc.pid} className="flex items-center justify-between p-2 bg-dark-cardHover rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{proc.name}</p>
                  <p className="text-xs text-dark-textSecondary">PID: {proc.pid}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium">{proc.cpu.toFixed(1)}% CPU</p>
                  <p className="text-xs text-dark-textSecondary">{proc.memMB} MB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color, onClick }) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-dark-card border border-dark-border rounded-lg p-6 hover:bg-dark-cardHover transition-all ${onClick ? 'cursor-pointer hover:border-white/10' : ''}`}
    >
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-sm text-dark-textSecondary mb-1">{title}</h3>
      <p className="text-3xl font-bold text-dark-text mb-1">{value}</p>
      <p className="text-sm text-dark-textSecondary">{subtitle}</p>
    </div>
  );
}

export default Dashboard;
