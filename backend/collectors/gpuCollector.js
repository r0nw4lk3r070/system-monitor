import si from 'systeminformation';

let gpuInfo = null;

async function getGPUInfo() {
  if (!gpuInfo) {
    const graphics = await si.graphics();
    gpuInfo = graphics.controllers.map(gpu => ({
      model: gpu.model,
      vendor: gpu.vendor,
      vram: gpu.vram,
      vramDynamic: gpu.vramDynamic
    }));
  }
  return gpuInfo;
}

export async function collectGPUData() {
  try {
    const [graphics, info] = await Promise.all([
      si.graphics(),
      getGPUInfo()
    ]);

    const gpus = graphics.controllers.map((gpu, index) => ({
      index,
      model: gpu.model,
      vendor: gpu.vendor,
      usage: gpu.utilizationGpu || 0,
      temperature: gpu.temperatureGpu || null,
      memoryUsed: gpu.memoryUsed || 0,
      memoryTotal: gpu.vram || 0,
      memoryUsage: gpu.vram ? Math.round((gpu.memoryUsed / gpu.vram) * 100 * 10) / 10 : 0,
      fanSpeed: gpu.fanSpeed || null,
      powerDraw: gpu.powerDraw || null
    }));

    return {
      gpus,
      primary: gpus[0] || null,
      info
    };
  } catch (error) {
    console.error('GPU collection error:', error);
    return { gpus: [], primary: null, info: [] };
  }
}
