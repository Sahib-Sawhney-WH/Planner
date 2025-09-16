// src/lib/store.ts
import { create } from 'zustand';
import { getDB, generateId } from './db';

// Types (keep all your existing type definitions - they remain the same)
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'Inbox' | 'Todo' | 'Doing' | 'Blocked' | 'Done';
  priority: number;
  impact: number;
  confidence: number;
  ease: number;
  score: number;
  due?: string;
  clientId?: string;
  projectId?: string;
  isNextStep: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  kind: 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  isKeyAccount: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  clientId?: string;
  projectId?: string;
  linkedTasks: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  projectId?: string;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  value: number;
  probability: number;
  expectedCloseDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Stakeholder {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  clientId: string;
  influence: 'High' | 'Medium' | 'Low';
  attitude: 'Champion' | 'Supporter' | 'Neutral' | 'Skeptic' | 'Blocker';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface TimeEntry {
  id: string;
  taskId?: string;
  duration: number;
  description?: string;
  date: string;
  createdAt: string;
}

interface Risk {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  probability: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  owner?: string;
  dueDate?: string;
  mitigation?: string;
  createdAt: string;
  updatedAt: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  owner?: string;
  dueDate?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

interface Assumption {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Validated' | 'Invalid' | 'Closed';
  owner?: string;
  dueDate?: string;
  validation?: string;
  createdAt: string;
  updatedAt: string;
}

interface Dependency {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  owner?: string;
  dueDate?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

interface Knowledge {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ActiveTimer {
  taskId?: string;
  startTime: number;
  elapsed: number;
}

interface Store {
  // State
  currentView: string;
  searchQuery: string;
  taskFilter: any;
  theme: 'dark' | 'light';
  accentColor: string;
  density: 'comfortable' | 'compact';
  presenterMode: boolean;
  
  // Data
  tasks: Task[];
  projects: Project[];
  clients: Client[];
  notes: Note[];
  opportunities: Opportunity[];
  stakeholders: Stakeholder[];
  timeEntries: TimeEntry[];
  risks: Risk[];
  issues: Issue[];
  assumptions: Assumption[];
  dependencies: Dependency[];
  knowledge: Knowledge[];
  
  // UI State
  drawerOpen: boolean;
  drawerContent: any;
  activeTimer: ActiveTimer | null;
  
  // Actions
  setView: (view: string) => void;
  search: (query: string) => void;
  clearSearch: () => void;
  loadData: () => Promise<void>;
  
  // Task actions
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  bulkUpdateTasks: (ids: string[], data: Partial<Task>) => Promise<void>;
  setTaskFilter: (filter: any) => void;
  
  // Project actions
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  // Client actions
  createClient: (data: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  
  // Note actions
  createNote: (data: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, data: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  
  // Opportunity actions
  createOpportunity: (data: Partial<Opportunity>) => Promise<Opportunity>;
  updateOpportunity: (id: string, data: Partial<Opportunity>) => Promise<Opportunity>;
  deleteOpportunity: (id: string) => Promise<void>;
  
  // RAID actions
  createRisk: (data: Partial<Risk>) => Promise<Risk>;
  updateRisk: (id: string, data: Partial<Risk>) => Promise<Risk>;
  deleteRisk: (id: string) => Promise<void>;
  
  createIssue: (data: Partial<Issue>) => Promise<Issue>;
  updateIssue: (id: string, data: Partial<Issue>) => Promise<Issue>;
  deleteIssue: (id: string) => Promise<void>;
  
  createAssumption: (data: Partial<Assumption>) => Promise<Assumption>;
  updateAssumption: (id: string, data: Partial<Assumption>) => Promise<Assumption>;
  deleteAssumption: (id: string) => Promise<void>;
  
  createDependency: (data: Partial<Dependency>) => Promise<Dependency>;
  updateDependency: (id: string, data: Partial<Dependency>) => Promise<Dependency>;
  deleteDependency: (id: string) => Promise<void>;
  
  // Knowledge actions
  createKnowledge: (data: Partial<Knowledge>) => Promise<Knowledge>;
  updateKnowledge: (id: string, data: Partial<Knowledge>) => Promise<Knowledge>;
  deleteKnowledge: (id: string) => Promise<void>;
  
  // Time tracking actions
  createTimeEntry: (data: Partial<TimeEntry>) => Promise<TimeEntry>;
  updateTimeEntry: (id: string, data: Partial<TimeEntry>) => Promise<TimeEntry>;
  deleteTimeEntry: (id: string) => Promise<void>;
  
  // UI actions
  setTheme: (theme: 'dark' | 'light') => void;
  setAccentColor: (color: string) => void;
  setDensity: (density: 'comfortable' | 'compact') => void;
  togglePresenterMode: () => void;
  
  openDrawer: (content: any, type: string) => void;
  closeDrawer: () => void;
  
  startTimer: (taskId?: string) => void;
  stopTimer: () => TimeEntry | null;
  updateTimer: () => void;
}

export const useStore = create<Store>((set, get) => ({
  // Initial state
  currentView: 'dashboard',
  searchQuery: '',
  taskFilter: {},
  theme: 'dark',
  accentColor: '#4DA3FF',
  density: 'comfortable',
  presenterMode: false,
  
  // Data
  tasks: [],
  projects: [],
  clients: [],
  notes: [],
  opportunities: [],
  stakeholders: [],
  timeEntries: [],
  risks: [],
  issues: [],
  assumptions: [],
  dependencies: [],
  knowledge: [],
  
  // UI State
  drawerOpen: false,
  drawerContent: null,
  activeTimer: null,
  
  // Actions
  setView: (view) => set({ currentView: view }),
  search: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: '' }),
  
  loadData: async () => {
    try {
      const db = getDB();
      
      // Use select method with proper SQL queries
      const tasks = await db.select<Task[]>('SELECT * FROM tasks ORDER BY createdAt DESC');
      const projects = await db.select<Project[]>('SELECT * FROM projects ORDER BY createdAt DESC');
      const clients = await db.select<Client[]>('SELECT * FROM clients ORDER BY name');
      const notes = await db.select<Note[]>('SELECT * FROM notes ORDER BY createdAt DESC');
      const opportunities = await db.select<Opportunity[]>('SELECT * FROM opportunities ORDER BY createdAt DESC');
      const stakeholders = await db.select<Stakeholder[]>('SELECT * FROM stakeholders ORDER BY name');
      const timeEntries = await db.select<TimeEntry[]>('SELECT * FROM timeEntries ORDER BY date DESC');
      const risks = await db.select<Risk[]>('SELECT * FROM risks ORDER BY createdAt DESC');
      const issues = await db.select<Issue[]>('SELECT * FROM issues ORDER BY createdAt DESC');
      const assumptions = await db.select<Assumption[]>('SELECT * FROM assumptions ORDER BY createdAt DESC');
      const dependencies = await db.select<Dependency[]>('SELECT * FROM dependencies ORDER BY createdAt DESC');
      const knowledge = await db.select<Knowledge[]>('SELECT * FROM knowledge ORDER BY createdAt DESC');
      
      // Parse JSON fields
      const parseJsonField = (items: any[], field: string) => 
        items.map(item => ({
          ...item,
          [field]: item[field] ? JSON.parse(item[field]) : []
        }));
      
      set({
        tasks: parseJsonField(tasks, 'tags'),
        projects: parseJsonField(projects, 'tags'),
        clients: parseJsonField(clients, 'tags'),
        notes: parseJsonField(notes, 'tags').map(note => ({
          ...note,
          linkedTasks: note.linkedTasks ? JSON.parse(note.linkedTasks) : []
        })),
        opportunities: parseJsonField(opportunities, 'tags'),
        stakeholders,
        timeEntries,
        risks,
        issues,
        assumptions,
        dependencies,
        knowledge: parseJsonField(knowledge, 'tags')
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty data if database fails
      set({
        tasks: [],
        projects: [],
        clients: [],
        notes: [],
        opportunities: [],
        stakeholders: [],
        timeEntries: [],
        risks: [],
        issues: [],
        assumptions: [],
        dependencies: [],
        knowledge: []
      });
    }
  },
  
  // Task actions
  createTask: async (data) => {
    const db = getDB();
    const task: Task = {
      id: generateId(),
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'Inbox',
      priority: data.priority || 3,
      impact: data.impact || 3,
      confidence: data.confidence || 3,
      ease: data.ease || 3,
      score: ((data.impact || 3) + (data.confidence || 3) + (data.ease || 3)) / 3,
      due: data.due,
      clientId: data.clientId,
      projectId: data.projectId,
      isNextStep: data.isNextStep || false,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO tasks (id, title, description, status, priority, impact, confidence, ease, score, due, clientId, projectId, isNextStep, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [task.id, task.title, task.description, task.status, task.priority, task.impact, task.confidence, task.ease, task.score, task.due, task.clientId, task.projectId, task.isNextStep ? 1 : 0, JSON.stringify(task.tags), task.createdAt, task.updatedAt]
    );
    
    await get().loadData();
    return task;
  },
  
  updateTask: async (id, data) => {
    const db = getDB();
    const current = get().tasks.find(t => t.id === id);
    if (!current) return current!;
    
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    if (data.impact || data.confidence || data.ease) {
      updates.score = ((data.impact || current.impact) + (data.confidence || current.confidence) + (data.ease || current.ease)) / 3;
    }
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      if (Array.isArray(value)) {
        values.push(JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    });
    
    values.push(id);
    await db.execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().tasks.find(t => t.id === id)!;
  },
  
  deleteTask: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    await get().loadData();
  },
  
  bulkUpdateTasks: async (ids, data) => {
    const db = getDB();
    const updates = { ...data, updatedAt: new Date().toISOString() };
    
    for (const id of ids) {
      const fields: string[] = [];
      const values: any[] = [];
      
      Object.entries(updates).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        if (Array.isArray(value)) {
          values.push(JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      });
      
      values.push(id);
      await db.execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    
    await get().loadData();
  },
  
  setTaskFilter: (filter) => set({ taskFilter: filter }),
  
  // Project actions
  createProject: async (data) => {
    const db = getDB();
    const project: Project = {
      id: generateId(),
      title: data.title || '',
      description: data.description || '',
      clientId: data.clientId,
      kind: data.kind || 'Active',
      dueDate: data.dueDate,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO projects (id, title, description, clientId, kind, dueDate, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [project.id, project.title, project.description, project.clientId, project.kind, project.dueDate, JSON.stringify(project.tags), project.createdAt, project.updatedAt]
    );
    
    await get().loadData();
    return project;
  },
  
  updateProject: async (id, data) => {
    const db = getDB();
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(Array.isArray(value) ? JSON.stringify(value) : value);
    });
    
    values.push(id);
    await db.execute(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().projects.find(p => p.id === id)!;
  },
  
  deleteProject: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM projects WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // Client actions
  createClient: async (data) => {
    const db = getDB();
    const client: Client = {
      id: generateId(),
      name: data.name || '',
      industry: data.industry,
      website: data.website,
      phone: data.phone,
      email: data.email,
      address: data.address,
      isKeyAccount: data.isKeyAccount || false,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO clients (id, name, industry, website, phone, email, address, isKeyAccount, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client.id, client.name, client.industry, client.website, client.phone, client.email, client.address, client.isKeyAccount ? 1 : 0, JSON.stringify(client.tags), client.createdAt, client.updatedAt]
    );
    
    await get().loadData();
    return client;
  },
  
  updateClient: async (id, data) => {
    const db = getDB();
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      if (Array.isArray(value)) {
        values.push(JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    });
    
    values.push(id);
    await db.execute(`UPDATE clients SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().clients.find(c => c.id === id)!;
  },
  
  deleteClient: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM clients WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // Note actions
  createNote: async (data) => {
    const db = getDB();
    const note: Note = {
      id: generateId(),
      title: data.title || '',
      content: data.content || '',
      clientId: data.clientId,
      projectId: data.projectId,
      linkedTasks: data.linkedTasks || [],
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO notes (id, title, content, clientId, projectId, linkedTasks, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [note.id, note.title, note.content, note.clientId, note.projectId, JSON.stringify(note.linkedTasks), JSON.stringify(note.tags), note.createdAt, note.updatedAt]
    );
    
    await get().loadData();
    return note;
  },
  
  updateNote: async (id, data) => {
    const db = getDB();
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(Array.isArray(value) ? JSON.stringify(value) : value);
    });
    
    values.push(id);
    await db.execute(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().notes.find(n => n.id === id)!;
  },
  
  deleteNote: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM notes WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // Opportunity actions (similar pattern - I'll show one more example)
  createOpportunity: async (data) => {
    const db = getDB();
    const opportunity: Opportunity = {
      id: generateId(),
      title: data.title || '',
      description: data.description || '',
      clientId: data.clientId,
      projectId: data.projectId,
      stage: data.stage || 'Lead',
      value: data.value || 0,
      probability: data.probability || 50,
      expectedCloseDate: data.expectedCloseDate,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO opportunities (id, title, description, clientId, projectId, stage, value, probability, expectedCloseDate, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [opportunity.id, opportunity.title, opportunity.description, opportunity.clientId, opportunity.projectId, opportunity.stage, opportunity.value, opportunity.probability, opportunity.expectedCloseDate, JSON.stringify(opportunity.tags), opportunity.createdAt, opportunity.updatedAt]
    );
    
    await get().loadData();
    return opportunity;
  },
  
  updateOpportunity: async (id, data) => {
    const db = getDB();
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(Array.isArray(value) ? JSON.stringify(value) : value);
    });
    
    values.push(id);
    await db.execute(`UPDATE opportunities SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().opportunities.find(o => o.id === id)!;
  },
  
  deleteOpportunity: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM opportunities WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // RAID actions - using same pattern
  createRisk: async (data) => {
    const db = getDB();
    const risk: Risk = {
      id: generateId(),
      title: data.title || '',
      description: data.description || '',
      impact: data.impact || 'Medium',
      probability: data.probability || 'Medium',
      status: data.status || 'Open',
      owner: data.owner,
      dueDate: data.dueDate,
      mitigation: data.mitigation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO risks (id, title, description, impact, probability, status, owner, dueDate, mitigation, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [risk.id, risk.title, risk.description, risk.impact, risk.probability, risk.status, risk.owner, risk.dueDate, risk.mitigation, risk.createdAt, risk.updatedAt]
    );
    
    await get().loadData();
    return risk;
  },
  
  updateRisk: async (id, data) => {
    const db = getDB();
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });
    
    values.push(id);
    await db.execute(`UPDATE risks SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().risks.find(r => r.id === id)!;
  },
  
  deleteRisk: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM risks WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // Issue actions
  createIssue: async (data) => {
    const db = getDB();
    const issue: Issue = {
      id: generateId(),
      title: data.title || '',
      description: data.description || '',
      priority: data.priority || 'Medium',
      status: data.status || 'Open',
      owner: data.owner,
      dueDate: data.dueDate,
      resolution: data.resolution,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO issues (id, title, description, priority, status, owner, dueDate, resolution, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [issue.id, issue.title, issue.description, issue.priority, issue.status, issue.owner, issue.dueDate, issue.resolution, issue.createdAt, issue.updatedAt]
    );
    
    await get().loadData();
    return issue;
  },
  
  updateIssue: async (id, data) => {
    const db = getDB();
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });
    
    values.push(id);
    await db.execute(`UPDATE issues SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().issues.find(i => i.id === id)!;
  },
  
  deleteIssue: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM issues WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // Assumption actions
  createAssumption: async (data) => {
    const db = getDB();
    const assumption: Assumption = {
      id: generateId(),
      title: data.title || '',
      description: data.description || '',
      priority: data.priority || 'Medium',
      status: data.status || 'Open',
      owner: data.owner,
      dueDate: data.dueDate,
      validation: data.validation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO assumptions (id, title, description, priority, status, owner, dueDate, validation, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [assumption.id, assumption.title, assumption.description, assumption.priority, assumption.status, assumption.owner, assumption.dueDate, assumption.validation, assumption.createdAt, assumption.updatedAt]
    );
    
    await get().loadData();
    return assumption;
  },
  
  updateAssumption: async (id, data) => {
    const db = getDB();
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });
    
    values.push(id);
    await db.execute(`UPDATE assumptions SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().assumptions.find(a => a.id === id)!;
  },
  
  deleteAssumption: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM assumptions WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // Dependency actions
  createDependency: async (data) => {
    const db = getDB();
    const dependency: Dependency = {
      id: generateId(),
      title: data.title || '',
      description: data.description || '',
      priority: data.priority || 'Medium',
      status: data.status || 'Open',
      owner: data.owner,
      dueDate: data.dueDate,
      resolution: data.resolution,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO dependencies (id, title, description, priority, status, owner, dueDate, resolution, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dependency.id, dependency.title, dependency.description, dependency.priority, dependency.status, dependency.owner, dependency.dueDate, dependency.resolution, dependency.createdAt, dependency.updatedAt]
    );
    
    await get().loadData();
    return dependency;
  },
  
  updateDependency: async (id, data) => {
    const db = getDB();
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });
    
    values.push(id);
    await db.execute(`UPDATE dependencies SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().dependencies.find(d => d.id === id)!;
  },
  
  deleteDependency: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM dependencies WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // Knowledge actions
  createKnowledge: async (data) => {
    const db = getDB();
    const knowledge: Knowledge = {
      id: generateId(),
      title: data.title || '',
      content: data.content || '',
      category: data.category,
      tags: data.tags || [],
      isPublic: data.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO knowledge (id, title, content, category, tags, isPublic, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [knowledge.id, knowledge.title, knowledge.content, knowledge.category, JSON.stringify(knowledge.tags), knowledge.isPublic ? 1 : 0, knowledge.createdAt, knowledge.updatedAt]
    );
    
    await get().loadData();
    return knowledge;
  },
  
  updateKnowledge: async (id, data) => {
    const db = getDB();
    const updates: any = { ...data, updatedAt: new Date().toISOString() };
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      if (Array.isArray(value)) {
        values.push(JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    });
    
    values.push(id);
    await db.execute(`UPDATE knowledge SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().knowledge.find(k => k.id === id)!;
  },
  
  deleteKnowledge: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM knowledge WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // Time tracking actions
  createTimeEntry: async (data) => {
    const db = getDB();
    const entry: TimeEntry = {
      id: generateId(),
      taskId: data.taskId,
      duration: data.duration || 0,
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await db.execute(
      `INSERT INTO timeEntries (id, taskId, duration, description, date, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entry.id, entry.taskId, entry.duration, entry.description, entry.date, entry.createdAt]
    );
    
    await get().loadData();
    return entry;
  },
  
  updateTimeEntry: async (id, data) => {
    const db = getDB();
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    values.push(id);
    await db.execute(`UPDATE timeEntries SET ${fields.join(', ')} WHERE id = ?`, values);
    await get().loadData();
    return get().timeEntries.find(e => e.id === id)!;
  },
  
  deleteTimeEntry: async (id) => {
    const db = getDB();
    await db.execute('DELETE FROM timeEntries WHERE id = ?', [id]);
    await get().loadData();
  },
  
  // UI actions (these remain the same)
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  
  setAccentColor: (color) => {
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem('accentColor', color);
    set({ accentColor: color });
  },
  
  setDensity: (density) => {
    document.documentElement.setAttribute('data-density', density);
    localStorage.setItem('density', density);
    set({ density });
  },
  
  togglePresenterMode: () => {
    const newMode = !get().presenterMode;
    document.documentElement.setAttribute('data-presenter', String(newMode));
    set({ presenterMode: newMode });
  },
  
  openDrawer: (content, type) => set({ drawerOpen: true, drawerContent: { content, type } }),
  closeDrawer: () => set({ drawerOpen: false, drawerContent: null }),
  
  startTimer: (taskId) => set({ activeTimer: { taskId, startTime: Date.now(), elapsed: 0 } }),
  
  stopTimer: () => {
    const timer = get().activeTimer;
    if (timer) {
      const duration = Math.floor((Date.now() - timer.startTime) / 60000); // Convert to minutes
      if (duration > 0) {
        get().createTimeEntry({
          taskId: timer.taskId,
          duration,
          date: new Date().toISOString()
        });
      }
      set({ activeTimer: null });
    }
    return null;
  },
  
  updateTimer: () => {
    const timer = get().activeTimer;
    if (timer) {
      set({
        activeTimer: {
          ...timer,
          elapsed: Date.now() - timer.startTime
        }
      });
    }
  },
}));