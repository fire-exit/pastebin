import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../data/pastebin.db');

// Initialize database connection
const db = new Database(dbPath, { verbose: console.log });

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create snippets table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS snippets (
    id TEXT PRIMARY KEY,
    language TEXT NOT NULL,
    title TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    file_size INTEGER NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    file_path TEXT NOT NULL
  )
`;

db.exec(createTableQuery);

// Create index on expires_at for faster cleanup queries
db.exec('CREATE INDEX IF NOT EXISTS idx_expires_at ON snippets(expires_at)');

console.log('SQLite database initialized');

export default db;
