import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'monitoring.db'));

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS cpu_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    usage REAL NOT NULL,
    temperature REAL,
    frequency REAL
  );

  CREATE TABLE IF NOT EXISTS gpu_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    usage REAL NOT NULL,
    temperature REAL,
    memory_used REAL,
    memory_total REAL
  );

  CREATE TABLE IF NOT EXISTS memory_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    used REAL NOT NULL,
    total REAL NOT NULL,
    percentage REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS network_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    download_speed REAL NOT NULL,
    upload_speed REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS disk_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    disk_name TEXT NOT NULL,
    used REAL NOT NULL,
    total REAL NOT NULL,
    percentage REAL NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_cpu_timestamp ON cpu_history(timestamp);
  CREATE INDEX IF NOT EXISTS idx_gpu_timestamp ON gpu_history(timestamp);
  CREATE INDEX IF NOT EXISTS idx_memory_timestamp ON memory_history(timestamp);
  CREATE INDEX IF NOT EXISTS idx_network_timestamp ON network_history(timestamp);
  CREATE INDEX IF NOT EXISTS idx_disk_timestamp ON disk_history(timestamp);
`);

// Prepared statements for better performance
const statements = {
  insertCPU: db.prepare('INSERT INTO cpu_history (timestamp, usage, temperature, frequency) VALUES (?, ?, ?, ?)'),
  insertGPU: db.prepare('INSERT INTO gpu_history (timestamp, usage, temperature, memory_used, memory_total) VALUES (?, ?, ?, ?, ?)'),
  insertMemory: db.prepare('INSERT INTO memory_history (timestamp, used, total, percentage) VALUES (?, ?, ?, ?)'),
  insertNetwork: db.prepare('INSERT INTO network_history (timestamp, download_speed, upload_speed) VALUES (?, ?, ?)'),
  insertDisk: db.prepare('INSERT INTO disk_history (timestamp, disk_name, used, total, percentage) VALUES (?, ?, ?, ?, ?)'),
  
  getCPUHistory: db.prepare('SELECT * FROM cpu_history WHERE timestamp > ? ORDER BY timestamp ASC'),
  getGPUHistory: db.prepare('SELECT * FROM gpu_history WHERE timestamp > ? ORDER BY timestamp ASC'),
  getMemoryHistory: db.prepare('SELECT * FROM memory_history WHERE timestamp > ? ORDER BY timestamp ASC'),
  getNetworkHistory: db.prepare('SELECT * FROM network_history WHERE timestamp > ? ORDER BY timestamp ASC'),
  getDiskHistory: db.prepare('SELECT * FROM disk_history WHERE timestamp > ? AND disk_name = ? ORDER BY timestamp ASC'),
};

// Clean up old data (keep last 24 hours)
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const deletedCPU = db.prepare('DELETE FROM cpu_history WHERE timestamp < ?').run(cutoff);
  const deletedGPU = db.prepare('DELETE FROM gpu_history WHERE timestamp < ?').run(cutoff);
  const deletedMemory = db.prepare('DELETE FROM memory_history WHERE timestamp < ?').run(cutoff);
  const deletedNetwork = db.prepare('DELETE FROM network_history WHERE timestamp < ?').run(cutoff);
  const deletedDisk = db.prepare('DELETE FROM disk_history WHERE timestamp < ?').run(cutoff);
  
  const totalDeleted = deletedCPU.changes + deletedGPU.changes + deletedMemory.changes + 
                       deletedNetwork.changes + deletedDisk.changes;
  
  if (totalDeleted > 0) {
    console.log(`🗑️  Cleaned up ${totalDeleted} old records from database`);
    // Reclaim disk space
    db.prepare('VACUUM').run();
  }
}, 60 * 60 * 1000); // Run every hour

export { db, statements };
