import si from 'systeminformation';
import os from 'os';

let systemInfo = null;

async function getSystemInfo() {
  if (!systemInfo) {
    const [system, bios, baseboard, chassis, osInfo] = await Promise.all([
      si.system(),
      si.bios(),
      si.baseboard(),
      si.chassis(),
      si.osInfo()
    ]);

    systemInfo = {
      manufacturer: system.manufacturer,
      model: system.model,
      version: system.version,
      serial: system.serial,
      uuid: system.uuid,
      bios: {
        vendor: bios.vendor,
        version: bios.version,
        releaseDate: bios.releaseDate
      },
      motherboard: {
        manufacturer: baseboard.manufacturer,
        model: baseboard.model,
        version: baseboard.version
      },
      chassis: {
        manufacturer: chassis.manufacturer,
        type: chassis.type,
        version: chassis.version
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname
      }
    };
  }
  return systemInfo;
}

export async function collectSystemData() {
  try {
    const [time, battery, info] = await Promise.all([
      si.time(),
      si.battery(),
      getSystemInfo()
    ]);

    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    return {
      uptime: {
        seconds: uptimeSeconds,
        formatted: `${days}d ${hours}h ${minutes}m`
      },
      timezone: time.timezone,
      timezoneName: time.timezoneName,
      battery: battery.hasBattery ? {
        hasBattery: true,
        percent: battery.percent,
        isCharging: battery.isCharging,
        timeRemaining: battery.timeRemaining,
        acConnected: battery.acConnected
      } : { hasBattery: false },
      info
    };
  } catch (error) {
    console.error('System collection error:', error);
    return null;
  }
}

export async function getUSBDevices() {
  try {
    const usb = await si.usb();
    return usb.map(device => ({
      id: device.id,
      name: device.name,
      type: device.type,
      manufacturer: device.manufacturer,
      serialNumber: device.serialNumber
    }));
  } catch (error) {
    console.error('USB collection error:', error);
    return [];
  }
}

export async function getAudioDevices() {
  try {
    const audio = await si.audio();
    return audio.map(device => ({
      name: device.name,
      manufacturer: device.manufacturer,
      type: device.type,
      status: device.status
    }));
  } catch (error) {
    console.error('Audio collection error:', error);
    return [];
  }
}
