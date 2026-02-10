import { Wifi, Smartphone, Laptop, MonitorSmartphone, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

function NetworkInfo() {
  const [networkUrls, setNetworkUrls] = useState([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const port = window.location.port || '9801';
    const protocol = window.location.protocol;
    
    setCurrentUrl(`${protocol}//${hostname}:${port}`);
    
    // Fetch network interfaces from backend
    fetch(`${protocol}//${hostname}:9800/api/network-info`)
      .then(res => res.json())
      .then(data => {
        if (data.addresses) {
          setNetworkUrls(data.addresses.map(addr => `${protocol}//${addr}:${port}`));
        }
      })
      .catch(() => {
        // Fallback to showing current URL only
        setNetworkUrls([currentUrl]);
      });
  }, []);

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Wifi className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-300 mb-1">
              🌐 Access from Other Devices
            </h3>
            <p className="text-xs text-blue-200/80 mb-3">
              To view this dashboard on your tablet, phone, or another computer on the same network, 
              check the terminal where you started the servers. Network URLs are displayed there.
            </p>
            <div className="flex gap-2 text-xs">
              <div className="bg-blue-500/20 px-2 py-1 rounded flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                <span>Tablets</span>
              </div>
              <div className="bg-blue-500/20 px-2 py-1 rounded flex items-center gap-1">
                <MonitorSmartphone className="w-3 h-3" />
                <span>Phones</span>
              </div>
              <div className="bg-blue-500/20 px-2 py-1 rounded flex items-center gap-1">
                <Laptop className="w-3 h-3" />
                <span>Other PCs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Wifi className="w-5 h-5 text-green-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-green-300 mb-1">
            ✅ Connected via Network
          </h3>
          <p className="text-xs text-green-200/80 mb-2">
            You're accessing this dashboard remotely. Current URL:
          </p>
          <div className="flex items-center gap-2 mb-2">
            <code className="text-xs bg-dark-card px-2 py-1 rounded text-green-300 flex-1">
              {currentUrl}
            </code>
            <button
              onClick={() => copyUrl(currentUrl)}
              className="p-1.5 hover:bg-green-500/20 rounded transition-colors"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-green-300" />
              )}
            </button>
          </div>
          {networkUrls.length > 0 && (
            <details className="text-xs text-green-200/70 cursor-pointer">
              <summary className="hover:text-green-300 transition-colors">
                Show all network addresses
              </summary>
              <div className="mt-2 space-y-1 pl-4">
                {networkUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-mono flex-1">{url}</span>
                    <button
                      onClick={() => copyUrl(url)}
                      className="p-1 hover:bg-green-500/20 rounded transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default NetworkInfo;
