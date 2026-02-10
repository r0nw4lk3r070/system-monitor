import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import DetailView from './components/DetailView';
import Settings from './components/Settings';
import { Activity } from 'lucide-react';

// Auto-detect backend URL based on current hostname
// This allows the app to work on any machine and be accessed from LAN
const getBackendURL = () => {
  const hostname = window.location.hostname;
  // If accessing via IP or network name, use that. Otherwise use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:9800';
  }
  return `http://${hostname}:9800`;
};

const SOCKET_URL = getBackendURL();

// Default settings: CPU, GPU, Memory always on. Others optional.
const DEFAULT_SETTINGS = {
  networkEnabled: false,
  diskEnabled: false,
  processesEnabled: false,
  systemEnabled: false
};

function App() {
  const [socket, setSocket] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [connected, setConnected] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('monitorSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      // Send settings to backend on connect
      newSocket.emit('update-settings', settings);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('metrics', (data) => {
      setMetrics(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Handle settings changes
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('monitorSettings', JSON.stringify(newSettings));
    if (socket) {
      socket.emit('update-settings', newSettings);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-dark-text">Hardware Monitor</h1>
              <p className="text-sm text-dark-textSecondary">
                {metrics?.system?.info?.os?.hostname || 'Real-time System Monitoring'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {selectedView && (
              <button
                onClick={() => setSelectedView(null)}
                className="px-4 py-2 bg-dark-cardHover hover:bg-dark-border rounded-lg text-sm transition-colors"
              >
                ← Back to Dashboard
              </button>
            )}
            <Settings settings={settings} onSettingsChange={handleSettingsChange} />
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-dark-textSecondary">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {metrics?.system?.info?.os?.hostname && (
              <div className="text-xs text-dark-textSecondary bg-dark-cardHover px-3 py-1 rounded">
                Monitoring: {metrics.system.info.os.hostname}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!metrics ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <Activity className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
              <p className="text-xl text-dark-textSecondary">Loading metrics...</p>
            </div>
          </div>
        ) : selectedView ? (
          <DetailView 
            type={selectedView} 
            metrics={metrics} 
            socket={socket}
          />
        ) : (
          <Dashboard 
            metrics={metrics} 
            onSelectView={setSelectedView}
            settings={settings}
          />
        )}
      </main>
    </div>
  );
}

export default App;
