// src/lib/db.ts
import Database from 'better-sqlite3';
import { homeDir, join } from '@tauri-apps/api/path';
import { readTextFile, exists, createDir } from '@tauri-apps/api/fs';
import dayjs from 'dayjs';

let db: Database.Database | null = null;

// --- UTILITY FUNCTIONS ---
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function parseJSON(str: string | null): any {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

// --- INTERFACES ---
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
  body?: string;
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

export interface Assumption {
  id: string;
  projectId?: string;
  clientId?: string;
  title: string;
  description?: string;
  validated: boolean;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  projectId?: string;
  clientId?: string;
  title: string;
  description?: string;
  severity: 'Low' | 'Medium' | 'High';
  resolution?: string;
  owner?: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  projectId?: string;
  clientId?: string;
  title: string;
  decisionText: string;
  decidedOn?: string;
  owner?: string;
  impact?: string;
  links: string[];
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

// --- DATABASE INITIALIZATION ---
export async function initDB() {
  if (db) return db;

  const appHomeDir = await homeDir();
  const appDataDir = await join(appHomeDir, 'Planner');
  const dbPath = await join(appDataDir, 'planner.db');
  
  if (!(await exists(appDataDir))) {
    await createDir(appDataDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  await runMigrations();
  
  return db;
}

async function runMigrations() {
  // Implementation would read migration files and execute them
  // For now, assume migrations are handled elsewhere
}

// --- DATABASE OPERATIONS ---
export const clientOps = {
  list: (): Client[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM clients').all().map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags),
      contacts: parseJSON(r.contacts),
      links: parseJSON(r.links)
    }));
  },
  create: (item: Partial<Client>): Client => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO clients (id, name, tags, contacts, links, nextStep, nextStepDue, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.name, JSON.stringify(item.tags || []), JSON.stringify(item.contacts || []),
      JSON.stringify(item.links || []), item.nextStep, item.nextStepDue, now, now
    );
    return clientOps.list().find(c => c.id === id)!;
  },
  update: (id: string, updates: Partial<Client>): Client => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = clientOps.list().find(c => c.id === id)!;
    db.prepare(`
      UPDATE clients SET name=?, tags=?, contacts=?, links=?, nextStep=?, nextStepDue=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.name ?? current.name,
      JSON.stringify(updates.tags ?? current.tags),
      JSON.stringify(updates.contacts ?? current.contacts),
      JSON.stringify(updates.links ?? current.links),
      updates.nextStep ?? current.nextStep,
      updates.nextStepDue ?? current.nextStepDue,
      now, id
    );
    return clientOps.list().find(c => c.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM clients WHERE id=?').run(id);
  }
};

export const taskOps = {
  list: (filters?: any): Task[] => {
    if (!db) throw new Error('DB not initialized');
    let query = 'SELECT * FROM tasks';
    const params: any[] = [];
    
    if (filters) {
      const conditions: string[] = [];
      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      if (filters.clientId) {
        conditions.push('clientId = ?');
        params.push(filters.clientId);
      }
      if (filters.projectId) {
        conditions.push('projectId = ?');
        params.push(filters.projectId);
      }
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }
    
    return db.prepare(query).all(...params).map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags),
      links: parseJSON(r.links),
      isNextStep: Boolean(r.isNextStep)
    }));
  },
  create: (item: Partial<Task>): Task => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    const score = (item.priority || 1) * (item.effort || 1) * (item.impact || 1) * (item.confidence || 1);
    
    db.prepare(`
      INSERT INTO tasks (id, projectId, clientId, title, description, status, due, priority, effort, impact, confidence, rrule, isNextStep, tags, links, score, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.projectId, item.clientId, item.title, item.description,
      item.status || 'Inbox', item.due, item.priority || 1, item.effort || 1,
      item.impact || 1, item.confidence || 1, item.rrule, item.isNextStep ? 1 : 0,
      JSON.stringify(item.tags || []), JSON.stringify(item.links || []),
      score, now, now
    );
    return taskOps.list().find(t => t.id === id)!;
  },
  update: (id: string, updates: Partial<Task>): Task => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = taskOps.list().find(t => t.id === id)!;
    const priority = updates.priority ?? current.priority;
    const effort = updates.effort ?? current.effort;
    const impact = updates.impact ?? current.impact;
    const confidence = updates.confidence ?? current.confidence;
    const score = priority * effort * impact * confidence;
    
    db.prepare(`
      UPDATE tasks SET projectId=?, clientId=?, title=?, description=?, status=?, due=?, priority=?, effort=?, impact=?, confidence=?, rrule=?, isNextStep=?, tags=?, links=?, score=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.projectId ?? current.projectId,
      updates.clientId ?? current.clientId,
      updates.title ?? current.title,
      updates.description ?? current.description,
      updates.status ?? current.status,
      updates.due ?? current.due,
      priority, effort, impact, confidence,
      updates.rrule ?? current.rrule,
      (updates.isNextStep ?? current.isNextStep) ? 1 : 0,
      JSON.stringify(updates.tags ?? current.tags),
      JSON.stringify(updates.links ?? current.links),
      score, now, id
    );
    return taskOps.list().find(t => t.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM tasks WHERE id=?').run(id);
  },
  getToday: (): Task[] => {
    if (!db) throw new Error('DB not initialized');
    const today = dayjs().format('YYYY-MM-DD');
    return taskOps.list().filter(t => t.due === today);
  },
  getOverdue: (): Task[] => {
    if (!db) throw new Error('DB not initialized');
    const today = dayjs().format('YYYY-MM-DD');
    return taskOps.list().filter(t => t.due && t.due < today && t.status !== 'Done');
  }
};

export const projectOps = {
  list: (kind?: 'Active' | 'Planned'): Project[] => {
    if (!db) throw new Error('DB not initialized');
    let query = 'SELECT * FROM projects';
    const params: any[] = [];
    
    if (kind) {
      query += ' WHERE kind = ?';
      params.push(kind);
    }
    
    return db.prepare(query).all(...params).map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags)
    }));
  },
  create: (item: Partial<Project>): Project => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO projects (id, clientId, kind, type, status, title, description, tags, nextStep, nextStepDue, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.clientId, item.kind || 'Active', item.type, item.status || 'Planning',
      item.title, item.description, JSON.stringify(item.tags || []),
      item.nextStep, item.nextStepDue, now, now
    );
    return projectOps.list().find(p => p.id === id)!;
  },
  update: (id: string, updates: Partial<Project>): Project => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = projectOps.list().find(p => p.id === id)!;
    
    db.prepare(`
      UPDATE projects SET clientId=?, kind=?, type=?, status=?, title=?, description=?, tags=?, nextStep=?, nextStepDue=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.clientId ?? current.clientId,
      updates.kind ?? current.kind,
      updates.type ?? current.type,
      updates.status ?? current.status,
      updates.title ?? current.title,
      updates.description ?? current.description,
      JSON.stringify(updates.tags ?? current.tags),
      updates.nextStep ?? current.nextStep,
      updates.nextStepDue ?? current.nextStepDue,
      now, id
    );
    return projectOps.list().find(p => p.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM projects WHERE id=?').run(id);
  }
};

export const noteOps = {
  list: (): Note[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM notes').all().map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags)
    }));
  },
  create: (item: Partial<Note>): Note => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO notes (id, title, bodyMarkdownPath, clientId, projectId, tags, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.title, item.bodyMarkdownPath, item.clientId, item.projectId,
      JSON.stringify(item.tags || []), now, now
    );
    return noteOps.list().find(n => n.id === id)!;
  },
  update: (id: string, updates: Partial<Note>): Note => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = noteOps.list().find(n => n.id === id)!;
    
    db.prepare(`
      UPDATE notes SET title=?, bodyMarkdownPath=?, clientId=?, projectId=?, tags=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.title ?? current.title,
      updates.bodyMarkdownPath ?? current.bodyMarkdownPath,
      updates.clientId ?? current.clientId,
      updates.projectId ?? current.projectId,
      JSON.stringify(updates.tags ?? current.tags),
      now, id
    );
    return noteOps.list().find(n => n.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM notes WHERE id=?').run(id);
  }
};

export const opportunityOps = {
  list: (): Opportunity[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM opportunities').all() as Opportunity[];
  },
  create: (item: Partial<Opportunity>): Opportunity => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO opportunities (id, clientId, name, stage, amount, probability, nextStep, nextStepDue, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.clientId, item.name, item.stage || 'Discovery', item.amount,
      item.probability || 0, item.nextStep, item.nextStepDue, item.notes, now, now
    );
    return opportunityOps.list().find(o => o.id === id)!;
  },
  update: (id: string, updates: Partial<Opportunity>): Opportunity => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = opportunityOps.list().find(o => o.id === id)!;
    
    db.prepare(`
      UPDATE opportunities SET clientId=?, name=?, stage=?, amount=?, probability=?, nextStep=?, nextStepDue=?, notes=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.clientId ?? current.clientId,
      updates.name ?? current.name,
      updates.stage ?? current.stage,
      updates.amount ?? current.amount,
      updates.probability ?? current.probability,
      updates.nextStep ?? current.nextStep,
      updates.nextStepDue ?? current.nextStepDue,
      updates.notes ?? current.notes,
      now, id
    );
    return opportunityOps.list().find(o => o.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM opportunities WHERE id=?').run(id);
  }
};

export const stakeholderOps = {
  list: (): Stakeholder[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM stakeholders').all() as Stakeholder[];
  },
  create: (item: Partial<Stakeholder>): Stakeholder => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO stakeholders (id, clientId, name, role, email, phone, timezone, influence, preferredComms, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.clientId, item.name, item.role, item.email, item.phone,
      item.timezone || 'UTC', item.influence || 1, item.preferredComms || 'email',
      item.notes, now, now
    );
    return stakeholderOps.list().find(s => s.id === id)!;
  },
  update: (id: string, updates: Partial<Stakeholder>): Stakeholder => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = stakeholderOps.list().find(s => s.id === id)!;
    
    db.prepare(`
      UPDATE stakeholders SET clientId=?, name=?, role=?, email=?, phone=?, timezone=?, influence=?, preferredComms=?, notes=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.clientId ?? current.clientId,
      updates.name ?? current.name,
      updates.role ?? current.role,
      updates.email ?? current.email,
      updates.phone ?? current.phone,
      updates.timezone ?? current.timezone,
      updates.influence ?? current.influence,
      updates.preferredComms ?? current.preferredComms,
      updates.notes ?? current.notes,
      now, id
    );
    return stakeholderOps.list().find(s => s.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM stakeholders WHERE id=?').run(id);
  }
};

export const riskOps = {
  list: (): Risk[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM risks').all() as Risk[];
  },
  create: (item: Partial<Risk>): Risk => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO risks (id, projectId, clientId, title, severity, likelihood, mitigation, owner, due, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.projectId, item.clientId, item.title, item.severity || 'Medium',
      item.likelihood || 'Medium', item.mitigation, item.owner, item.due,
      item.status || 'Open', now, now
    );
    return riskOps.list().find(r => r.id === id)!;
  },
  update: (id: string, updates: Partial<Risk>): Risk => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = riskOps.list().find(r => r.id === id)!;
    
    db.prepare(`
      UPDATE risks SET projectId=?, clientId=?, title=?, severity=?, likelihood=?, mitigation=?, owner=?, due=?, status=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.projectId ?? current.projectId,
      updates.clientId ?? current.clientId,
      updates.title ?? current.title,
      updates.severity ?? current.severity,
      updates.likelihood ?? current.likelihood,
      updates.mitigation ?? current.mitigation,
      updates.owner ?? current.owner,
      updates.due ?? current.due,
      updates.status ?? current.status,
      now, id
    );
    return riskOps.list().find(r => r.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM risks WHERE id=?').run(id);
  }
};

export const assumptionOps = {
  list: (): Assumption[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM assumptions').all().map((r: any) => ({
      ...r,
      validated: Boolean(r.validated)
    }));
  },
  create: (item: Partial<Assumption>): Assumption => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO assumptions (id, projectId, clientId, title, description, validated, owner, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.projectId, item.clientId, item.title, item.description,
      item.validated ? 1 : 0, item.owner, now, now
    );
    return assumptionOps.list().find(a => a.id === id)!;
  },
  update: (id: string, updates: Partial<Assumption>): Assumption => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = assumptionOps.list().find(a => a.id === id)!;
    
    db.prepare(`
      UPDATE assumptions SET projectId=?, clientId=?, title=?, description=?, validated=?, owner=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.projectId ?? current.projectId,
      updates.clientId ?? current.clientId,
      updates.title ?? current.title,
      updates.description ?? current.description,
      (updates.validated ?? current.validated) ? 1 : 0,
      updates.owner ?? current.owner,
      now, id
    );
    return assumptionOps.list().find(a => a.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM assumptions WHERE id=?').run(id);
  }
};

export const issueOps = {
  list: (): Issue[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM issues').all() as Issue[];
  },
  create: (item: Partial<Issue>): Issue => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO issues (id, projectId, clientId, title, description, severity, resolution, owner, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.projectId, item.clientId, item.title, item.description,
      item.severity || 'Medium', item.resolution, item.owner,
      item.status || 'Open', now, now
    );
    return issueOps.list().find(i => i.id === id)!;
  },
  update: (id: string, updates: Partial<Issue>): Issue => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = issueOps.list().find(i => i.id === id)!;
    
    db.prepare(`
      UPDATE issues SET projectId=?, clientId=?, title=?, description=?, severity=?, resolution=?, owner=?, status=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.projectId ?? current.projectId,
      updates.clientId ?? current.clientId,
      updates.title ?? current.title,
      updates.description ?? current.description,
      updates.severity ?? current.severity,
      updates.resolution ?? current.resolution,
      updates.owner ?? current.owner,
      updates.status ?? current.status,
      now, id
    );
    return issueOps.list().find(i => i.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM issues WHERE id=?').run(id);
  }
};

export const decisionOps = {
  list: (): Decision[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM decisions').all().map((r: any) => ({
      ...r,
      links: parseJSON(r.links)
    }));
  },
  create: (item: Partial<Decision>): Decision => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO decisions (id, projectId, clientId, title, decisionText, decidedOn, owner, impact, links, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.projectId, item.clientId, item.title, item.decisionText,
      item.decidedOn, item.owner, item.impact,
      JSON.stringify(item.links || []), now, now
    );
    return decisionOps.list().find(d => d.id === id)!;
  },
  update: (id: string, updates: Partial<Decision>): Decision => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = decisionOps.list().find(d => d.id === id)!;
    
    db.prepare(`
      UPDATE decisions SET projectId=?, clientId=?, title=?, decisionText=?, decidedOn=?, owner=?, impact=?, links=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.projectId ?? current.projectId,
      updates.clientId ?? current.clientId,
      updates.title ?? current.title,
      updates.decisionText ?? current.decisionText,
      updates.decidedOn ?? current.decidedOn,
      updates.owner ?? current.owner,
      updates.impact ?? current.impact,
      JSON.stringify(updates.links ?? current.links),
      now, id
    );
    return decisionOps.list().find(d => d.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM decisions WHERE id=?').run(id);
  }
};

export const timeEntryOps = {
  list: (): TimeEntry[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM time_entries').all().map((r: any) => ({
      ...r,
      billable: Boolean(r.billable)
    }));
  },
  create: (item: Partial<TimeEntry>): TimeEntry => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO time_entries (id, date, hours, billable, clientId, projectId, taskId, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.date, item.hours, item.billable ? 1 : 0, item.clientId,
      item.projectId, item.taskId, item.notes, now, now
    );
    return timeEntryOps.list().find(t => t.id === id)!;
  },
  update: (id: string, updates: Partial<TimeEntry>): TimeEntry => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = timeEntryOps.list().find(t => t.id === id)!;
    
    db.prepare(`
      UPDATE time_entries SET date=?, hours=?, billable=?, clientId=?, projectId=?, taskId=?, notes=?, updatedAt=?
      WHERE id=?
    `).run(
      updates.date ?? current.date,
      updates.hours ?? current.hours,
      (updates.billable ?? current.billable) ? 1 : 0,
      updates.clientId ?? current.clientId,
      updates.projectId ?? current.projectId,
      updates.taskId ?? current.taskId,
      updates.notes ?? current.notes,
      now, id
    );
    return timeEntryOps.list().find(t => t.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM time_entries WHERE id=?').run(id);
  }
};

export const knowledgeOps = {
  list: (): KnowledgeItem[] => {
    if (!db) throw new Error('DB not initialized');
    return db.prepare('SELECT * FROM knowledge_items').all().map((r: any) => ({
      ...r,
      tags: parseJSON(r.tags)
    }));
  },
  create: (item: Partial<KnowledgeItem>): KnowledgeItem => {
    if (!db) throw new Error('DB not initialized');
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO knowledge_items (id, title, url, description, tags, sourceType, createdAt, lastAccessedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.title, item.url, item.description,
      JSON.stringify(item.tags || []), item.sourceType || 'other', now, now
    );
    return knowledgeOps.list().find(k => k.id === id)!;
  },
  update: (id: string, updates: Partial<KnowledgeItem>): KnowledgeItem => {
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const current = knowledgeOps.list().find(k => k.id === id)!;
    
    db.prepare(`
      UPDATE knowledge_items SET title=?, url=?, description=?, tags=?, sourceType=?, lastAccessedAt=?
      WHERE id=?
    `).run(
      updates.title ?? current.title,
      updates.url ?? current.url,
      updates.description ?? current.description,
      JSON.stringify(updates.tags ?? current.tags),
      updates.sourceType ?? current.sourceType,
      now, id
    );
    return knowledgeOps.list().find(k => k.id === id)!;
  },
  delete: (id: string): void => {
    if (!db) throw new Error('DB not initialized');
    db.prepare('DELETE FROM knowledge_items WHERE id=?').run(id);
  }
};

export const searchOps = {
  searchAll: (query: string): any[] => {
    if (!db) throw new Error('DB not initialized');
    // Simplified search implementation
    const results: any[] = [];
    
    // Search tasks
    const tasks = taskOps.list().filter(t => 
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
    );
    results.push(...tasks.map(t => ({ ...t, type: 'task' })));
    
    // Search projects
    const projects = projectOps.list().filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
    );
    results.push(...projects.map(p => ({ ...p, type: 'project' })));
    
    // Search clients
    const clients = clientOps.list().filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    );
    results.push(...clients.map(c => ({ ...c, type: 'client' })));
    
    return results;
  }
};

// Export the database instance and utility functions
export { db };

