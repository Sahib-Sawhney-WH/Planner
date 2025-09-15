import Database from 'better-sqlite3';
import { app } from '@tauri-apps/api';
import { join } from '@tauri-apps/api/path';
import { readTextFile, exists, createDir } from '@tauri-apps/api/fs';
import dayjs from 'dayjs';

let db: Database.Database | null = null;

export interface Client {
  id: string;
  name: string;
  tags: string[];
  contacts: any[];
  links: string[];
  nextStep?: string;
  nextStepDue?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId?: string;
  clientId?: string;
  title: string;
  description?: string;
  status: 'Inbox' | 'Todo' | 'Doing' | 'Blocked' | 'Done';
  due?: string;
  priority: number;
  effort: number;
  impact: number;
  confidence: number;
  rrule?: string;
  isNextStep: boolean;
  tags: string[];
  links: string[];
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId?: string;
  kind: 'Active' | 'Planned';
  type?: string;
  status: string;
  title: string;
  description?: string;
  tags: string[];
  nextStep?: string;
  nextStepDue?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  bodyMarkdownPath?: string;
  clientId?: string;
  projectId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  body?: string; // Loaded from file
}

export interface Opportunity {
  id: string;
  clientId: string;
  name: string;
  stage: 'Discovery' | 'Scoping' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  amount?: number;
  probability: number;
  nextStep?: string;
  nextStepDue?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stakeholder {
  id: string;
  clientId: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  timezone: string;
  influence: number;
  preferredComms: 'email' | 'phone' | 'teams' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: string;
  projectId?: string;
  clientId?: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High';
  likelihood: 'Low' | 'Medium' | 'High';
  mitigation?: string;
  owner?: string;
  due?: string;
  status: 'Open' | 'Monitoring' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  billable: boolean;
  clientId?: string;
  projectId?: string;
  taskId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  sourceType: 'howto' | 'article' | 'docs' | 'github' | 'video' | 'other';
  createdAt: string;
  lastAccessedAt: string;
}

export async function initDB() {
  if (db) return db;

  const appDataDir = await join(await app.getPath('home'), 'Planner');
  const dbPath = await join(appDataDir, 'planner.db');
  
  // Ensure directory exists
  if (!(await exists(appDataDir))) {
    await createDir(appDataDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run migrations
  await runMigrations();
  
  return db;
}

async function runMigrations() {
  if (!db) throw new Error('Database not initialized');

  // Create migrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Check and apply migrations
  const migrations = [
    { id: 1, name: '001_initial.sql', path: 'migrations/001_initial.sql' },
    { id: 2, name: '002_fts.sql', path: 'migrations/002_fts.sql' }
  ];

  for (const migration of migrations) {
    const applied = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(migration.name);
    
    if (!applied) {
      try {
        const sql = await readTextFile(migration.path);
        db.exec(sql);
        db.prepare('INSERT INTO migrations (id, name) VALUES (?, ?)').run(migration.id, migration.name);
        console.log(`Applied migration: ${migration.name}`);
      } catch (error) {
        console.error(`Failed to apply migration ${migration.name}:`, error);
      }
    }
  }
}

// Helper to parse JSON fields
function parseJSON(str: string | null, defaultValue: any = []): any {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

// Client operations
export const clientOps = {
  list: (): Client[] => {
    if (!db) throw new Error('Database not initialized');
    const rows = db.prepare('SELECT * FROM clients ORDER BY updatedAt DESC').all();
    return rows.map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags),
      contacts: parseJSON(r.contacts),
      links: parseJSON(r.links)
    }));
  },

  get: (id: string): Client | undefined => {
    if (!db) throw new Error('Database not initialized');
    const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!row) return undefined;
    return {
      ...row as any,
      tags: parseJSON((row as any).tags),
      contacts: parseJSON((row as any).contacts),
      links: parseJSON((row as any).links)
    };
  },

  create: (client: Partial<Client>): Client => {
    if (!db) throw new Error('Database not initialized');
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO clients (id, name, tags, contacts, links, nextStep, nextStepDue)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      client.name || 'New Client',
      JSON.stringify(client.tags || []),
      JSON.stringify(client.contacts || []),
      JSON.stringify(client.links || []),
      client.nextStep || null,
      client.nextStepDue || null
    );
    
    return clientOps.get(id)!;
  },

  update: (id: string, updates: Partial<Client>): Client => {
    if (!db) throw new Error('Database not initialized');
    const current = clientOps.get(id);
    if (!current) throw new Error('Client not found');

    const stmt = db.prepare(`
      UPDATE clients 
      SET name = ?, tags = ?, contacts = ?, links = ?, nextStep = ?, nextStepDue = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updates.name ?? current.name,
      JSON.stringify(updates.tags ?? current.tags),
      JSON.stringify(updates.contacts ?? current.contacts),
      JSON.stringify(updates.links ?? current.links),
      updates.nextStep ?? current.nextStep,
      updates.nextStepDue ?? current.nextStepDue,
      id
    );
    
    return clientOps.get(id)!;
  },

  delete: (id: string): void => {
    if (!db) throw new Error('Database not initialized');
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  }
};

// Task operations
export const taskOps = {
  list: (filters?: { status?: string; clientId?: string; projectId?: string }): Task[] => {
    if (!db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.clientId) {
      query += ' AND clientId = ?';
      params.push(filters.clientId);
    }
    if (filters?.projectId) {
      query += ' AND projectId = ?';
      params.push(filters.projectId);
    }
    
    query += ' ORDER BY score DESC, due ASC';
    
    const rows = db.prepare(query).all(...params);
    return rows.map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags),
      links: parseJSON(r.links),
      isNextStep: Boolean(r.isNextStep)
    }));
  },

  get: (id: string): Task | undefined => {
    if (!db) throw new Error('Database not initialized');
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!row) return undefined;
    return {
      ...row as any,
      tags: parseJSON((row as any).tags),
      links: parseJSON((row as any).links),
      isNextStep: Boolean((row as any).isNextStep)
    };
  },

  create: (task: Partial<Task>): Task => {
    if (!db) throw new Error('Database not initialized');
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, projectId, clientId, title, description, status, due, 
        priority, effort, impact, confidence, rrule, isNextStep, tags, links
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      task.projectId || null,
      task.clientId || null,
      task.title || 'New Task',
      task.description || null,
      task.status || 'Inbox',
      task.due || null,
      task.priority ?? 3,
      task.effort ?? 2.5,
      task.impact ?? 3,
      task.confidence ?? 0.7,
      task.rrule || null,
      task.isNextStep ? 1 : 0,
      JSON.stringify(task.tags || []),
      JSON.stringify(task.links || [])
    );
    
    return taskOps.get(id)!;
  },

  update: (id: string, updates: Partial<Task>): Task => {
    if (!db) throw new Error('Database not initialized');
    const current = taskOps.get(id);
    if (!current) throw new Error('Task not found');

    const stmt = db.prepare(`
      UPDATE tasks 
      SET projectId = ?, clientId = ?, title = ?, description = ?, status = ?, 
          due = ?, priority = ?, effort = ?, impact = ?, confidence = ?, 
          rrule = ?, isNextStep = ?, tags = ?, links = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updates.projectId ?? current.projectId,
      updates.clientId ?? current.clientId,
      updates.title ?? current.title,
      updates.description ?? current.description,
      updates.status ?? current.status,
      updates.due ?? current.due,
      updates.priority ?? current.priority,
      updates.effort ?? current.effort,
      updates.impact ?? current.impact,
      updates.confidence ?? current.confidence,
      updates.rrule ?? current.rrule,
      updates.isNextStep !== undefined ? (updates.isNextStep ? 1 : 0) : (current.isNextStep ? 1 : 0),
      JSON.stringify(updates.tags ?? current.tags),
      JSON.stringify(updates.links ?? current.links),
      id
    );
    
    return taskOps.get(id)!;
  },

  delete: (id: string): void => {
    if (!db) throw new Error('Database not initialized');
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  },

  getOverdue: (): Task[] => {
    if (!db) throw new Error('Database not initialized');
    const now = dayjs().toISOString();
    const rows = db.prepare(`
      SELECT * FROM tasks 
      WHERE due < ? AND status NOT IN ('Done', 'Blocked')
      ORDER BY due ASC
    `).all(now);
    
    return rows.map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags),
      links: parseJSON(r.links),
      isNextStep: Boolean(r.isNextStep)
    }));
  },

  getToday: (): Task[] => {
    if (!db) throw new Error('Database not initialized');
    const startOfDay = dayjs().startOf('day').toISOString();
    const endOfDay = dayjs().endOf('day').toISOString();
    
    const rows = db.prepare(`
      SELECT * FROM tasks 
      WHERE (due BETWEEN ? AND ?) OR status = 'Doing'
      ORDER BY isNextStep DESC, score DESC
    `).all(startOfDay, endOfDay);
    
    return rows.map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags),
      links: parseJSON(r.links),
      isNextStep: Boolean(r.isNextStep)
    }));
  }
};

// Project operations
export const projectOps = {
  list: (kind?: 'Active' | 'Planned'): Project[] => {
    if (!db) throw new Error('Database not initialized');
    let query = 'SELECT * FROM projects';
    const params: any[] = [];
    
    if (kind) {
      query += ' WHERE kind = ?';
      params.push(kind);
    }
    
    query += ' ORDER BY nextStepDue ASC, updatedAt DESC';
    
    const rows = db.prepare(query).all(...params);
    return rows.map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags)
    }));
  },

  get: (id: string): Project | undefined => {
    if (!db) throw new Error('Database not initialized');
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!row) return undefined;
    return {
      ...row as any,
      tags: parseJSON((row as any).tags)
    };
  },

  create: (project: Partial<Project>): Project => {
    if (!db) throw new Error('Database not initialized');
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO projects (
        id, clientId, kind, type, status, title, description, 
        tags, nextStep, nextStepDue
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      project.clientId || null,
      project.kind || 'Planned',
      project.type || null,
      project.status || 'Not Started',
      project.title || 'New Project',
      project.description || null,
      JSON.stringify(project.tags || []),
      project.nextStep || null,
      project.nextStepDue || null
    );
    
    return projectOps.get(id)!;
  },

  update: (id: string, updates: Partial<Project>): Project => {
    if (!db) throw new Error('Database not initialized');
    const current = projectOps.get(id);
    if (!current) throw new Error('Project not found');

    const stmt = db.prepare(`
      UPDATE projects 
      SET clientId = ?, kind = ?, type = ?, status = ?, title = ?, 
          description = ?, tags = ?, nextStep = ?, nextStepDue = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updates.clientId ?? current.clientId,
      updates.kind ?? current.kind,
      updates.type ?? current.type,
      updates.status ?? current.status,
      updates.title ?? current.title,
      updates.description ?? current.description,
      JSON.stringify(updates.tags ?? current.tags),
      updates.nextStep ?? current.nextStep,
      updates.nextStepDue ?? current.nextStepDue,
      id
    );
    
    return projectOps.get(id)!;
  },

  delete: (id: string): void => {
    if (!db) throw new Error('Database not initialized');
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }
};

// Search operations
export const searchOps = {
  searchAll: (query: string): any[] => {
    if (!db) throw new Error('Database not initialized');
    const results: any[] = [];
    
    // Search tasks
    const tasks = db.prepare(`
      SELECT t.*, 'task' as type 
      FROM tasks t
      JOIN tasks_fts ON tasks_fts.rowid = t.rowid
      WHERE tasks_fts MATCH ?
      ORDER BY rank
      LIMIT 10
    `).all(query);
    
    // Search notes
    const notes = db.prepare(`
      SELECT n.*, 'note' as type 
      FROM notes n
      JOIN notes_fts ON notes_fts.rowid = n.rowid
      WHERE notes_fts MATCH ?
      ORDER BY rank
      LIMIT 10
    `).all(query);
    
    // Search knowledge
    const knowledge = db.prepare(`
      SELECT k.*, 'knowledge' as type 
      FROM knowledgeItems k
      JOIN knowledge_fts ON knowledge_fts.rowid = k.rowid
      WHERE knowledge_fts MATCH ?
      ORDER BY rank
      LIMIT 10
    `).all(query);
    
    // Search clients
    const clients = db.prepare(`
      SELECT c.*, 'client' as type 
      FROM clients c
      JOIN clients_fts ON clients_fts.rowid = c.rowid
      WHERE clients_fts MATCH ?
      ORDER BY rank
      LIMIT 10
    `).all(query);
    
    // Search projects
    const projects = db.prepare(`
      SELECT p.*, 'project' as type 
      FROM projects p
      JOIN projects_fts ON projects_fts.rowid = p.rowid
      WHERE projects_fts MATCH ?
      ORDER BY rank
      LIMIT 10
    `).all(query);
    
    return [...tasks, ...notes, ...knowledge, ...clients, ...projects];
  }
};

// Helper function to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Note operations
export const noteOps = {
  list: (): Note[] => {
    if (!db) throw new Error('Database not initialized');
    const rows = db.prepare('SELECT * FROM notes ORDER BY updatedAt DESC').all();
    return rows.map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags),
      body: '' // Load from file in real app
    }));
  },

  get: (id: string): Note | undefined => {
    if (!db) throw new Error('Database not initialized');
    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!row) return undefined;
    return {
      ...row as any,
      tags: parseJSON((row as any).tags),
      body: '' // Load from file in real app
    };
  },

  create: (note: Partial<Note>): Note => {
    if (!db) throw new Error('Database not initialized');
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO notes (id, title, bodyMarkdownPath, clientId, projectId, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      note.title || 'New Note',
      note.bodyMarkdownPath || null,
      note.clientId || null,
      note.projectId || null,
      JSON.stringify(note.tags || [])
    );
    
    return noteOps.get(id)!;
  },

  update: (id: string, updates: Partial<Note>): Note => {
    if (!db) throw new Error('Database not initialized');
    const current = noteOps.get(id);
    if (!current) throw new Error('Note not found');

    const stmt = db.prepare(`
      UPDATE notes 
      SET title = ?, bodyMarkdownPath = ?, clientId = ?, projectId = ?, tags = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updates.title ?? current.title,
      updates.bodyMarkdownPath ?? current.bodyMarkdownPath,
      updates.clientId ?? current.clientId,
      updates.projectId ?? current.projectId,
      JSON.stringify(updates.tags ?? current.tags),
      id
    );
    
    return noteOps.get(id)!;
  },

  delete: (id: string): void => {
    if (!db) throw new Error('Database not initialized');
    db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  }
};

// Opportunity operations
export const opportunityOps = {
  list: (): Opportunity[] => {
    if (!db) throw new Error('Database not initialized');
    const rows = db.prepare('SELECT * FROM opportunities ORDER BY updatedAt DESC').all();
    return rows as Opportunity[];
  },

  get: (id: string): Opportunity | undefined => {
    if (!db) throw new Error('Database not initialized');
    const row = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
    return row as Opportunity | undefined;
  },

  create: (opp: Partial<Opportunity>): Opportunity => {
    if (!db) throw new Error('Database not initialized');
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO opportunities (
        id, clientId, name, stage, amount, probability, 
        nextStep, nextStepDue, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      opp.clientId || null,
      opp.name || 'New Opportunity',
      opp.stage || 'Discovery',
      opp.amount || 0,
      opp.probability ?? 0.5,
      opp.nextStep || null,
      opp.nextStepDue || null,
      opp.notes || null
    );
    
    return opportunityOps.get(id)!;
  },

  update: (id: string, updates: Partial<Opportunity>): Opportunity => {
    if (!db) throw new Error('Database not initialized');
    const current = opportunityOps.get(id);
    if (!current) throw new Error('Opportunity not found');

    const stmt = db.prepare(`
      UPDATE opportunities 
      SET clientId = ?, name = ?, stage = ?, amount = ?, probability = ?,
          nextStep = ?, nextStepDue = ?, notes = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updates.clientId ?? current.clientId,
      updates.name ?? current.name,
      updates.stage ?? current.stage,
      updates.amount ?? current.amount,
      updates.probability ?? current.probability,
      updates.nextStep ?? current.nextStep,
      updates.nextStepDue ?? current.nextStepDue,
      updates.notes ?? current.notes,
      id
    );
    
    return opportunityOps.get(id)!;
  },

  delete: (id: string): void => {
    if (!db) throw new Error('Database not initialized');
    db.prepare('DELETE FROM opportunities WHERE id = ?').run(id);
  }
};

// Stakeholder operations
export const stakeholderOps = {
  list: (): Stakeholder[] => {
    if (!db) throw new Error('Database not initialized');
    const rows = db.prepare('SELECT * FROM stakeholders ORDER BY influence DESC').all();
    return rows as Stakeholder[];
  },

  getByClient: (clientId: string): Stakeholder[] => {
    if (!db) throw new Error('Database not initialized');
    const rows = db.prepare('SELECT * FROM stakeholders WHERE clientId = ? ORDER BY influence DESC').all(clientId);
    return rows as Stakeholder[];
  },

  create: (stakeholder: Partial<Stakeholder>): Stakeholder => {
    if (!db) throw new Error('Database not initialized');
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO stakeholders (
        id, clientId, name, role, email, phone, 
        timezone, influence, preferredComms, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      stakeholder.clientId || null,
      stakeholder.name || 'New Contact',
      stakeholder.role || null,
      stakeholder.email || null,
      stakeholder.phone || null,
      stakeholder.timezone || 'UTC',
      stakeholder.influence ?? 3,
      stakeholder.preferredComms || 'email',
      stakeholder.notes || null
    );
    
    return stakeholderOps.list().find(s => s.id === id)!;
  }
};

// Risk operations
export const riskOps = {
  list: (): Risk[] => {
    if (!db) throw new Error('Database not initialized');
    const rows = db.prepare('SELECT * FROM risks ORDER BY severity DESC, likelihood DESC').all();
    return rows as Risk[];
  },

  create: (risk: Partial<Risk>): Risk => {
    if (!db) throw new Error('Database not initialized');
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO risks (
        id, projectId, clientId, title, severity, likelihood,
        mitigation, owner, due, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      risk.projectId || null,
      risk.clientId || null,
      risk.title || 'New Risk',
      risk.severity || 'Medium',
      risk.likelihood || 'Medium',
      risk.mitigation || null,
      risk.owner || null,
      risk.due || null,
      risk.status || 'Open'
    );
    
    return riskOps.list().find(r => r.id === id)!;
  },

  update: (id: string, updates: Partial<Risk>): Risk => {
    if (!db) throw new Error('Database not initialized');
    const stmt = db.prepare(`
      UPDATE risks 
      SET title = ?, severity = ?, likelihood = ?, mitigation = ?,
          owner = ?, due = ?, status = ?
      WHERE id = ?
    `);
    
    const current = riskOps.list().find(r => r.id === id);
    if (!current) throw new Error('Risk not found');
    
    stmt.run(
      updates.title ?? current.title,
      updates.severity ?? current.severity,
      updates.likelihood ?? current.likelihood,
      updates.mitigation ?? current.mitigation,
      updates.owner ?? current.owner,
      updates.due ?? current.due,
      updates.status ?? current.status,
      id
    );
    
    return riskOps.list().find(r => r.id === id)!;
  }
};

// TimeEntry operations
export const timeEntryOps = {
  list: (): TimeEntry[] => {
    if (!db) throw new Error('Database not initialized');
    const rows = db.prepare('SELECT * FROM timeEntries ORDER BY date DESC').all();
    return rows.map((r: any) => ({
      ...r,
      billable: Boolean(r.billable)
    }));
  },

  create: (entry: Partial<TimeEntry>): TimeEntry => {
    if (!db) throw new Error('Database not initialized');
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO timeEntries (
        id, date, hours, billable, clientId, projectId, taskId, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      entry.date || new Date().toISOString(),
      entry.hours || 0,
      entry.billable ? 1 : 0,
      entry.clientId || null,
      entry.projectId || null,
      entry.taskId || null,
      entry.notes || null
    );
    
    return timeEntryOps.list().find(e => e.id === id)!;
  },

  delete: (id: string): void => {
    if (!db) throw new Error('Database not initialized');
    db.prepare('DELETE FROM timeEntries WHERE id = ?').run(id);
  }
};

// KnowledgeItem operations
export const knowledgeOps = {
  list: (): KnowledgeItem[] => {
    if (!db) throw new Error('Database not initialized');
    const rows = db.prepare('SELECT * FROM knowledgeItems ORDER BY lastAccessedAt DESC').all();
    return rows.map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags)
    }));
  },

  create: (item: Partial<KnowledgeItem>): KnowledgeItem => {
    if (!db) throw new Error('Database not initialized');
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO knowledgeItems (
        id, title, url, description, tags, sourceType
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      item.title || 'New Resource',
      item.url || '',
      item.description || null,
      JSON.stringify(item.tags || []),
      item.sourceType || 'other'
    );
    
    return knowledgeOps.list().find(k => k.id === id)!;
  },

  update: (id: string, updates: Partial<KnowledgeItem>): KnowledgeItem => {
    if (!db) throw new Error('Database not initialized');
    const current = knowledgeOps.list().find(k => k.id === id);
    if (!current) throw new Error('Knowledge item not found');

    if (updates.lastAccessedAt) {
      db.prepare('UPDATE knowledgeItems SET lastAccessedAt = ? WHERE id = ?')
        .run(updates.lastAccessedAt, id);
    }
    
    return knowledgeOps.list().find(k => k.id === id)!;
  },

  delete: (id: string): void => {
    if (!db) throw new Error('Database not initialized');
    db.prepare('DELETE FROM knowledgeItems WHERE id = ?').run(id);
  }
};

// Export operations for other entities
export { 
  db,
  initDB,
  parseJSON,
  generateId
};