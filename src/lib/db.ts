// src/lib/db.ts
import Database from 'better-sqlite3';
import { exists, createDir } from '@tauri-apps/api/fs';
import { appDataDir } from '@tauri-apps/api/path';

// Fixed: Use proper type annotation for better-sqlite3
let db: Database.Database | null = null;

export async function initDB() {
  try {
    // Ensure app data directory exists
    const appDir = await appDataDir();
    if (!(await exists(appDir))) {
      await createDir(appDir, { recursive: true });
    }

    // Fixed: Use correct better-sqlite3 constructor
    const dbPath = `${appDir}/planner.db`;
    db = new Database(dbPath);
    
    // Run migrations
    await runMigrations();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function getDB(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

async function runMigrations() {
  if (!db) throw new Error('Database not initialized');

  // Check if migrations table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration 001: Initial schema
  const migration001 = `
    -- Clients table
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT,
      website TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      isKeyAccount BOOLEAN DEFAULT FALSE,
      tags TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      clientId TEXT,
      kind TEXT DEFAULT 'Active',
      dueDate DATETIME,
      tags TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientId) REFERENCES clients(id)
    );

    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Inbox',
      priority INTEGER DEFAULT 3,
      impact INTEGER DEFAULT 3,
      confidence INTEGER DEFAULT 3,
      ease INTEGER DEFAULT 3,
      score REAL DEFAULT 3.0,
      due DATETIME,
      clientId TEXT,
      projectId TEXT,
      isNextStep BOOLEAN DEFAULT FALSE,
      tags TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientId) REFERENCES clients(id),
      FOREIGN KEY (projectId) REFERENCES projects(id)
    );

    -- Notes table
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      clientId TEXT,
      projectId TEXT,
      linkedTasks TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientId) REFERENCES clients(id),
      FOREIGN KEY (projectId) REFERENCES projects(id)
    );

    -- Opportunities table
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      clientId TEXT,
      projectId TEXT,
      stage TEXT DEFAULT 'Lead',
      value REAL DEFAULT 0,
      probability INTEGER DEFAULT 50,
      expectedCloseDate DATETIME,
      tags TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientId) REFERENCES clients(id),
      FOREIGN KEY (projectId) REFERENCES projects(id)
    );

    -- Stakeholders table
    CREATE TABLE IF NOT EXISTS stakeholders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      phone TEXT,
      clientId TEXT,
      influence TEXT DEFAULT 'Medium',
      attitude TEXT DEFAULT 'Neutral',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clientId) REFERENCES clients(id)
    );

    -- Time entries table
    CREATE TABLE IF NOT EXISTS timeEntries (
      id TEXT PRIMARY KEY,
      taskId TEXT,
      duration INTEGER NOT NULL,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (taskId) REFERENCES tasks(id)
    );

    -- RAID tables
    CREATE TABLE IF NOT EXISTS risks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      impact TEXT DEFAULT 'Medium',
      probability TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Open',
      owner TEXT,
      dueDate DATETIME,
      mitigation TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Open',
      owner TEXT,
      dueDate DATETIME,
      resolution TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assumptions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Open',
      owner TEXT,
      dueDate DATETIME,
      validation TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dependencies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Open',
      owner TEXT,
      dueDate DATETIME,
      resolution TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Knowledge repository table
    CREATE TABLE IF NOT EXISTS knowledge (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT,
      tags TEXT DEFAULT '[]',
      isPublic BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastAccessedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Check if migration 001 has been run
  const migration001Exists = db.prepare('SELECT * FROM migrations WHERE name = ?').all('001_initial');

  if (migration001Exists.length === 0) {
    // Execute the migration
    db.exec(migration001);
    
    db.prepare('INSERT INTO migrations (name) VALUES (?)').run('001_initial');
    console.log('Migration 001_initial completed');
  }
}

// Helper function to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

