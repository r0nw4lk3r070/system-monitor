import si from 'systeminformation';

let previousLoad = null;
let cpuInfo = null;

// Cache CPU info since it doesn't change
async function getCPUInfo() {
  if (!cpuInfo) {
    cpuInfo = await si.cpu();
  }
  return cpuInfo;
}

export async function collectCPUData() {
  try {
    const [currentLoad, cpuTemp, cpuSpeed, info] = await Promise.all([
      si.currentLoad(),
      si.cpuTemperature(),
      si.cpuCurrentSpeed(),
      getCPUInfo()
    ]);

    const coresData = currentLoad.cpus.map((core, index) => ({
      core: index,
      usage: Math.round(core.load * 10) / 10,
      load: core.load
    }));

    // Try multiple temperature sources (Windows can be tricky)
    let temperature = null;
    if (cpuTemp.main !== null && cpuTemp.main !== -1 && cpuTemp.main > 0) {
      temperature = cpuTemp.main;
    } else if (cpuTemp.max !== null && cpuTemp.max !== -1 && cpuTemp.max > 0) {
      temperature = cpuTemp.max;
    } else if (cpuTemp.cores && cpuTemp.cores.length > 0) {
      // Average of core temperatures
      const validTemps = cpuTemp.cores.filter(t => t !== null && t !== -1 && t > 0);
      if (validTemps.length > 0) {
        temperature = validTemps.reduce((a, b) => a + b, 0) / validTemps.length;
      }
    }

    return {
      overall: Math.round(currentLoad.currentLoad * 10) / 10,
      cores: coresData,
      temperature: temperature,
      frequency: cpuSpeed.avg || cpuSpeed.cores?.[0] || null,
      info: {
        manufacturer: info.manufacturer,
        brand: info.brand,
        cores: info.cores,
        physicalCores: info.physicalCores,
        processors: info.processors,
        speed: info.speed
      }
    };
  } catch (error) {
    console.error('CPU collection error:', error);
    return null;
  }
}

export async function getProcesses() {
  try {
    const processes = await si.processes();
    return processes.list
      .filter(p => p.cpu > 0 || p.mem > 0)
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 20)
      .map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: Math.round(p.cpu * 10) / 10,
        mem: Math.round(p.mem * 10) / 10,
        memMB: Math.round(p.memRss / 1024 / 1024)
      }));
  } catch (error) {
    console.error('Process collection error:', error);
    return [];
  }
}
