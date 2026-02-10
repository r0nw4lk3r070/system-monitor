import si from 'systeminformation';

export async function collectMemoryData() {
  try {
    const [mem, memLayout] = await Promise.all([
      si.mem(),
      si.memLayout()
    ]);

    const totalGB = Math.round((mem.total / 1024 / 1024 / 1024) * 100) / 100;
    const usedGB = Math.round((mem.used / 1024 / 1024 / 1024) * 100) / 100;
    const freeGB = Math.round((mem.free / 1024 / 1024 / 1024) * 100) / 100;
    const activeGB = Math.round((mem.active / 1024 / 1024 / 1024) * 100) / 100;
    
    const swapTotalGB = Math.round((mem.swaptotal / 1024 / 1024 / 1024) * 100) / 100;
    const swapUsedGB = Math.round((mem.swapused / 1024 / 1024 / 1024) * 100) / 100;

    return {
      total: totalGB,
      used: usedGB,
      free: freeGB,
      active: activeGB,
      available: Math.round((mem.available / 1024 / 1024 / 1024) * 100) / 100,
      usage: Math.round((mem.used / mem.total) * 100 * 10) / 10,
      swap: {
        total: swapTotalGB,
        used: swapUsedGB,
        free: Math.round((mem.swapfree / 1024 / 1024 / 1024) * 100) / 100,
        usage: swapTotalGB > 0 ? Math.round((swapUsedGB / swapTotalGB) * 100 * 10) / 10 : 0
      },
      layout: memLayout.map(stick => ({
        size: Math.round((stick.size / 1024 / 1024 / 1024) * 100) / 100,
        type: stick.type,
        clockSpeed: stick.clockSpeed,
        manufacturer: stick.manufacturer
      }))
    };
  } catch (error) {
    console.error('Memory collection error:', error);
    return null;
  }
}
