import { Monitor } from 'lucide-react';

function SystemMonitor({ system }) {
  if (!system) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <Monitor className="w-5 h-5 text-indigo-500" />
        System Information
      </h2>
      
      <div className="space-y-4">
        <InfoSection title="System">
          <InfoRow label="Manufacturer" value={system.info?.manufacturer} />
          <InfoRow label="Model" value={system.info?.model} />
          <InfoRow label="Uptime" value={system.uptime?.formatted} />
        </InfoSection>

        <InfoSection title="Operating System">
          <InfoRow label="Platform" value={system.info?.os?.platform} />
          <InfoRow label="Distribution" value={system.info?.os?.distro} />
          <InfoRow label="Release" value={system.info?.os?.release} />
          <InfoRow label="Architecture" value={system.info?.os?.arch} />
        </InfoSection>

        <InfoSection title="Motherboard">
          <InfoRow label="Manufacturer" value={system.info?.motherboard?.manufacturer} />
          <InfoRow label="Model" value={system.info?.motherboard?.model} />
        </InfoSection>

        {system.battery?.hasBattery && (
          <InfoSection title="Battery">
            <InfoRow label="Level" value={`${system.battery.percent}%`} />
            <InfoRow label="Charging" value={system.battery.isCharging ? 'Yes' : 'No'} />
            <InfoRow label="AC Connected" value={system.battery.acConnected ? 'Yes' : 'No'} />
          </InfoSection>
        )}
      </div>
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-dark-text mb-2">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-dark-textSecondary">{label}</span>
      <span className="text-sm text-dark-text font-medium">{value || 'N/A'}</span>
    </div>
  );
}

export default SystemMonitor;
