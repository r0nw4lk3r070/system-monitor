import { HardDriveDownload, Maximize2 } from 'lucide-react';

function DiskMonitor({ disk, onExpand }) {
  if (!disk?.disks) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HardDriveDownload className="w-5 h-5 text-cyan-500" />
          Disk Monitor
        </h2>
        <button 
          onClick={onExpand}
          className="p-2 hover:bg-dark-cardHover rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {disk.disks.map((d, index) => (
          <div key={index} className="bg-dark-cardHover p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-dark-text">{d.name}</p>
                <p className="text-xs text-dark-textSecondary">{d.mount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-dark-text">{d.usage.toFixed(1)}%</p>
                <p className="text-xs text-dark-textSecondary">
                  {d.used.toFixed(1)} / {d.total.toFixed(1)} GB
                </p>
              </div>
            </div>
            <div className="h-2 bg-dark-card rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  d.usage > 90 ? 'bg-red-500' :
                  d.usage > 70 ? 'bg-yellow-500' :
                  'bg-cyan-500'
                }`}
                style={{ width: `${d.usage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {disk.io && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <MetricBox label="Read Speed" value={`${disk.io.readSpeed.toFixed(2)} MB/s`} />
          <MetricBox label="Write Speed" value={`${disk.io.writeSpeed.toFixed(2)} MB/s`} />
        </div>
      )}
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

export default DiskMonitor;
