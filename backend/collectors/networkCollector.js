import si from 'systeminformation';

let previousStats = null;

export async function collectNetworkData() {
  try {
    const [networkStats, networkInterfaces, networkConnections] = await Promise.all([
      si.networkStats(),
      si.networkInterfaces(),
      si.networkConnections()
    ]);

    const interfaces = networkInterfaces
      .filter(iface => !iface.internal && iface.operstate === 'up')
      .map(iface => ({
        name: iface.iface,
        ip4: iface.ip4,
        ip6: iface.ip6,
        mac: iface.mac,
        speed: iface.speed,
        type: iface.type,
        operstate: iface.operstate
      }));

    const primaryInterface = networkStats[0] || {};
    
    const downloadSpeed = Math.round((primaryInterface.rx_sec || 0) / 1024 / 1024 * 100) / 100; // MB/s
    const uploadSpeed = Math.round((primaryInterface.tx_sec || 0) / 1024 / 1024 * 100) / 100; // MB/s

    const totalDownload = Math.round((primaryInterface.rx_bytes || 0) / 1024 / 1024 / 1024 * 100) / 100; // GB
    const totalUpload = Math.round((primaryInterface.tx_bytes || 0) / 1024 / 1024 / 1024 * 100) / 100; // GB

    const activeConnections = networkConnections.filter(conn => conn.state === 'ESTABLISHED').length;

    return {
      downloadSpeed,
      uploadSpeed,
      totalDownload,
      totalUpload,
      interfaces,
      activeConnections,
      allStats: networkStats.map(stat => ({
        iface: stat.iface,
        rx_sec: Math.round((stat.rx_sec || 0) / 1024 / 1024 * 100) / 100,
        tx_sec: Math.round((stat.tx_sec || 0) / 1024 / 1024 * 100) / 100
      }))
    };
  } catch (error) {
    console.error('Network collection error:', error);
    return null;
  }
}
