// src/lib/db.ts
import Database from 'better-sqlite3';
import { exists, createDir } from '@tauri-apps/api/fs';
import { appDataDir } from '@tauri-apps/api/path';

let db: Database | null = null;

export async function initDB() {
  try {
    // Ensure app data directory exists
    const appDir = await appDataDir();
    if (!(await exists(appDir))) {
      await createDir(appDir, { recursive: true });
    }

    // Initialize database
    db = await Database.load('sqlite:planner.db');
    
    // Run migrations
    await runMigrations();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

async function runMigrations() {
  if (!db) throw new Error('Database not initialized');

  // Check if migrations table exists
  await db.execute(`
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
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Check if migration 001 has been run
  const migration001Exists = await db.select(
    'SELECT * FROM migrations WHERE name = ?',
    ['001_initial']
  );

  if (migration001Exists.length === 0) {
    await db.execute(migration001);
    await db.execute(
      'INSERT INTO migrations (name) VALUES (?)',
      ['001_initial']
    );
    console.log('Migration 001_initial completed');
  }

  // Migration 002: Full-text search
  const migration002 = `
    -- Create FTS tables for search
    CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
      id, title, description, content='tasks', content_rowid='rowid'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
      id, title, content, content='notes', content_rowid='rowid'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
      id, title, content, content='knowledge', content_rowid='rowid'
    );

    -- Triggers to keep FTS in sync
    CREATE TRIGGER IF NOT EXISTS tasks_fts_insert AFTER INSERT ON tasks BEGIN
      INSERT INTO tasks_fts(id, title, description) VALUES (new.id, new.title, new.description);
    END;

    CREATE TRIGGER IF NOT EXISTS tasks_fts_update AFTER UPDATE ON tasks BEGIN
      UPDATE tasks_fts SET title = new.title, description = new.description WHERE id = new.id;
    END;

    CREATE TRIGGER IF NOT EXISTS tasks_fts_delete AFTER DELETE ON tasks BEGIN
      DELETE FROM tasks_fts WHERE id = old.id;
    END;

    CREATE TRIGGER IF NOT EXISTS notes_fts_insert AFTER INSERT ON notes BEGIN
      INSERT INTO notes_fts(id, title, content) VALUES (new.id, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS notes_fts_update AFTER UPDATE ON notes BEGIN
      UPDATE notes_fts SET title = new.title, content = new.content WHERE id = new.id;
    END;

    CREATE TRIGGER IF NOT EXISTS notes_fts_delete AFTER DELETE ON notes BEGIN
      DELETE FROM notes_fts WHERE id = old.id;
    END;

    CREATE TRIGGER IF NOT EXISTS knowledge_fts_insert AFTER INSERT ON knowledge BEGIN
      INSERT INTO knowledge_fts(id, title, content) VALUES (new.id, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS knowledge_fts_update AFTER UPDATE ON knowledge BEGIN
      UPDATE knowledge_fts SET title = new.title, content = new.content WHERE id = new.id;
    END;

    CREATE TRIGGER IF NOT EXISTS knowledge_fts_delete AFTER DELETE ON knowledge BEGIN
      DELETE FROM knowledge_fts WHERE id = old.id;
    END;
  `;

  const migration002Exists = await db.select(
    'SELECT * FROM migrations WHERE name = ?',
    ['002_fts']
  );

  if (migration002Exists.length === 0) {
    await db.execute(migration002);
    await db.execute(
      'INSERT INTO migrations (name) VALUES (?)',
      ['002_fts']
    );
    console.log('Migration 002_fts completed');
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

