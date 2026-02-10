import { Settings as SettingsIcon, X } from 'lucide-react';
import { useState } from 'react';

function Settings({ settings, onSettingsChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSetting = (key) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-dark-cardHover rounded-lg transition-colors"
        title="Settings"
      >
        <SettingsIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Monitor Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-dark-cardHover rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="pb-4 border-b border-dark-border">
                <h3 className="text-sm font-semibold text-dark-textSecondary mb-3">Essential (Always On)</h3>
                <ToggleItem 
                  label="CPU Monitor" 
                  enabled={true} 
                  disabled={true}
                  description="Core system monitoring"
                />
                <ToggleItem 
                  label="GPU Monitor" 
                  enabled={true} 
                  disabled={true}
                  description="Graphics and VRAM tracking"
                />
                <ToggleItem 
                  label="Memory Monitor" 
                  enabled={true} 
                  disabled={true}
                  description="RAM usage monitoring"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-dark-textSecondary mb-3">Optional Monitoring</h3>
                
                <ToggleItem 
                  label="Network Monitor" 
                  enabled={settings.networkEnabled}
                  onToggle={() => toggleSetting('networkEnabled')}
                  description="Upload/download speeds (5s refresh)"
                />
                
                <ToggleItem 
                  label="Disk Monitor" 
                  enabled={settings.diskEnabled}
                  onToggle={() => toggleSetting('diskEnabled')}
                  description="Storage and I/O (10s refresh)"
                />
                
                <ToggleItem 
                  label="Process List" 
                  enabled={settings.processesEnabled}
                  onToggle={() => toggleSetting('processesEnabled')}
                  description="Top CPU processes (5s refresh)"
                />
                
                <ToggleItem 
                  label="System Info" 
                  enabled={settings.systemEnabled}
                  onToggle={() => toggleSetting('systemEnabled')}
                  description="Peripherals & battery (10s refresh)"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dark-border">
              <p className="text-xs text-dark-textSecondary">
                💡 Disable unused monitors to reduce CPU usage
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ToggleItem({ label, enabled, onToggle, disabled, description }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <p className="text-sm font-medium text-dark-text">{label}</p>
        {description && (
          <p className="text-xs text-dark-textSecondary">{description}</p>
        )}
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-dark-cardHover'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default Settings;
