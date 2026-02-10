import si from 'systeminformation';

export async function collectDiskData() {
  try {
    const [fsSize, diskIO, blockDevices] = await Promise.all([
      si.fsSize(),
      si.disksIO(),
      si.blockDevices()
    ]);

    const disks = fsSize.map(disk => {
      const totalGB = Math.round((disk.size / 1024 / 1024 / 1024) * 100) / 100;
      const usedGB = Math.round((disk.used / 1024 / 1024 / 1024) * 100) / 100;
      const freeGB = Math.round((disk.available / 1024 / 1024 / 1024) * 100) / 100;

      return {
        name: disk.fs,
        mount: disk.mount,
        type: disk.type,
        total: totalGB,
        used: usedGB,
        free: freeGB,
        usage: Math.round(disk.use * 10) / 10
      };
    });

    return {
      disks,
      io: diskIO ? {
        read: Math.round(diskIO.rIO || 0),
        write: Math.round(diskIO.wIO || 0),
        readSpeed: Math.round((diskIO.rIO_sec || 0) / 1024 / 1024 * 100) / 100, // MB/s
        writeSpeed: Math.round((diskIO.wIO_sec || 0) / 1024 / 1024 * 100) / 100  // MB/s
      } : {
        read: 0,
        write: 0,
        readSpeed: 0,
        writeSpeed: 0
      },
      devices: blockDevices.map(dev => ({
        name: dev.name,
        type: dev.type,
        size: Math.round((dev.size / 1024 / 1024 / 1024) * 100) / 100,
        physical: dev.physical
      }))
    };
  } catch (error) {
    console.error('Disk collection error:', error);
    return null;
  }
}
