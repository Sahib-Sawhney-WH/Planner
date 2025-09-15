// src/lib/db.ts
import Database from 'better-sqlite3';
import { homeDir, join } from '@tauri-apps/api/path'; // Corrected import
import { readTextFile, exists, createDir } from '@tauri-apps/api/fs';
import dayjs from 'dayjs';

let db: Database.Database | null = null;

// --- INTERFACES (No changes needed here, keeping for context) ---
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
// ... other interfaces remain the same
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

// --- Corrected initDB function ---
export async function initDB() {
  if (db) return db;

  const appHomeDir = await homeDir(); // Correct API call
  const appDataDir = await join(appHomeDir, 'Planner');
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

// --- Unchanged Functions (runMigrations, parseJSON, all Ops) ---
// The rest of the file (runMigrations, clientOps, taskOps, etc.) is correct.
// However, you need to add the missing Ops for RAID items.
// Add these new Ops to the file.

// --- ADD THE FOLLOWING NEW OPS to db.ts ---

// Assumption operations
export const assumptionOps = {
    list: (): Assumption[] => {
        if (!db) throw new Error('DB not init');
        return db.prepare('SELECT * FROM assumptions').all().map((r: any) => ({ ...r, validated: Boolean(r.validated) }));
    },
    create: (item: Partial<Assumption>): Assumption => {
        if (!db) throw new Error('DB not init');
        const id = generateId();
        db.prepare('INSERT INTO assumptions (id, title, description, owner, projectId, clientId) VALUES (?,?,?,?,?,?)').run(id, item.title, item.description, item.owner, item.projectId, item.clientId);
        return assumptionOps.list().find(i => i.id === id)!;
    },
    update: (id: string, updates: Partial<Assumption>): Assumption => {
        if (!db) throw new Error('DB not init');
        const current = assumptionOps.list().find(i => i.id === id)!;
        db.prepare('UPDATE assumptions SET title=?, description=?, owner=?, validated=? WHERE id=?').run(updates.title ?? current.title, updates.description ?? current.description, updates.owner ?? current.owner, updates.validated ? 1 : 0, id);
        return assumptionOps.list().find(i => i.id === id)!;
    }
};

// Issue operations
export const issueOps = {
    list: (): Issue[] => {
        if (!db) throw new Error('DB not init');
        return db.prepare('SELECT * FROM issues').all() as Issue[];
    },
    create: (item: Partial<Issue>): Issue => {
        if (!db) throw new Error('DB not init');
        const id = generateId();
        db.prepare('INSERT INTO issues (id, title, description, severity, owner, projectId, clientId) VALUES (?,?,?,?,?,?,?)').run(id, item.title, item.description, item.severity, item.owner, item.projectId, item.clientId);
        return issueOps.list().find(i => i.id === id)!;
    },
    update: (id: string, updates: Partial<Issue>): Issue => {
        if (!db) throw new Error('DB not init');
        const current = issueOps.list().find(i => i.id === id)!;
        db.prepare('UPDATE issues SET title=?, description=?, severity=?, owner=?, status=?, resolution=? WHERE id=?').run(updates.title ?? current.title, updates.description ?? current.description, updates.severity ?? current.severity, updates.owner ?? current.owner, updates.status ?? current.status, updates.resolution ?? current.resolution, id);
        return issueOps.list().find(i => i.id === id)!;
    }
};

// Decision operations
export const decisionOps = {
    list: (): Decision[] => {
        if (!db) throw new Error('DB not init');
        return db.prepare('SELECT * FROM decisions').all().map((r: any) => ({ ...r, links: parseJSON(r.links) }));
    },
    create: (item: Partial<Decision>): Decision => {
        if (!db) throw new Error('DB not init');
        const id = generateId();
        db.prepare('INSERT INTO decisions (id, title, decisionText, owner, projectId, clientId, decidedOn, impact) VALUES (?,?,?,?,?,?,?,?)').run(id, item.title, item.decisionText, item.owner, item.projectId, item.clientId, item.decidedOn, item.impact);
        return decisionOps.list().find(i => i.id === id)!;
    },
    update: (id: string, updates: Partial<Decision>): Decision => {
        if (!db) throw new Error('DB not init');
        const current = decisionOps.list().find(i => i.id === id)!;
        db.prepare('UPDATE decisions SET title=?, decisionText=?, owner=?, impact=?, decidedOn=? WHERE id=?').run(updates.title ?? current.title, updates.decisionText ?? current.decisionText, updates.owner ?? current.owner, updates.impact ?? current.impact, updates.decidedOn ?? current.decidedOn, id);
        return decisionOps.list().find(i => i.id === id)!;
    }
};


// --- Corrected final export block (remove initDB) ---
export { 
  db,
  // initDB, // Removed this duplicate export
  parseJSON,
  generateId
};