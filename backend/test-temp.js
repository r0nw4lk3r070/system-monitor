import si from 'systeminformation';

async function testTemp() {
  console.log('=== CPU Temperature Detection Test ===\n');
  
  try {
    const temp = await si.cpuTemperature();
    console.log('cpuTemperature() result:');
    console.log('  - main:', temp.main);
    console.log('  - max:', temp.max);
    console.log('  - cores:', temp.cores);
    console.log('  - socketMax:', temp.socketMax);
    console.log('Full object:', JSON.stringify(temp, null, 2));
  } catch (e) {
    console.log('cpuTemperature() error:', e.message);
  }
  
  console.log('\n---\n');
  
  try {
    const sensors = await si.sensors();
    console.log('sensors() result:');
    console.log('  - main:', sensors.main);
    console.log('  - max:', sensors.max);
    console.log('Full object:', JSON.stringify(sensors, null, 2));
  } catch (e) {
    console.log('sensors() error:', e.message);
  }
  
  console.log('\n=== Test Complete ===');
  process.exit(0);
}

testTemp();
