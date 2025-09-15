import { create } from 'zustand';
import { 
  Client, Task, Project, Note, Opportunity, 
  Stakeholder, Risk, TimeEntry, KnowledgeItem,
  clientOps, taskOps, projectOps, searchOps 
} from './db';

interface AppState {
  // Current view
  currentView: 'dashboard' | 'tasks' | 'projects' | 'clients' | 'notes' | 'opportunities' | 'raid' | 'knowledge' | 'time' | 'settings';
  setView: (view: AppState['currentView']) => void;

  // Selected items
  selectedClient: Client | null;
  selectedProject: Project | null;
  selectedTask: Task | null;
  selectedNote: Note | null;
  
  // Lists
  clients: Client[];
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  opportunities: Opportunity[];
  stakeholders: Stakeholder[];
  risks: Risk[];
  timeEntries: TimeEntry[];
  knowledgeItems: KnowledgeItem[];
  
  // Filters
  taskFilter: {
    status?: Task['status'];
    clientId?: string;
    projectId?: string;
    tag?: string;
  };
  projectFilter: {
    kind?: 'Active' | 'Planned';
    clientId?: string;
  };
  
  // Search
  searchQuery: string;
  searchResults: any[];
  isSearching: boolean;
  
  // UI State
  theme: 'dark' | 'light';
  accentColor: string;
  density: 'comfortable' | 'compact';
  presenterMode: boolean;
  drawerOpen: boolean;
  drawerContent: any;
  
  // Timer
  activeTimer: {
    taskId?: string;
    startTime: number;
    elapsed: number;
  } | null;
  
  // Actions
  loadClients: () => Promise<void>;
  loadTasks: (filters?: any) => Promise<void>;
  loadProjects: (kind?: 'Active' | 'Planned') => Promise<void>;
  
  createClient: (client: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => Promise<void>;
  
  createProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  setTheme: (theme: 'dark' | 'light') => void;
  setAccentColor: (color: string) => void;
  setDensity: (density: 'comfortable' | 'compact') => void;
  togglePresenterMode: () => void;
  
  openDrawer: (content: any) => void;
  closeDrawer: () => void;
  
  startTimer: (taskId?: string) => void;
  stopTimer: () => TimeEntry | null;
  updateTimer: () => void;
  
  setTaskFilter: (filter: AppState['taskFilter']) => void;
  setProjectFilter: (filter: AppState['projectFilter']) => void;
  
  // Dashboard data
  getTodayTasks: () => Task[];
  getWeekTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getClientTasks: (clientId: string) => Task[];
  getProjectTasks: (projectId: string) => Task[];
  getNextSteps: () => Array<Task | Client | Project>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentView: 'dashboard',
  selectedClient: null,
  selectedProject: null,
  selectedTask: null,
  selectedNote: null,
  
  clients: [],
  tasks: [],
  projects: [],
  notes: [],
  opportunities: [],
  stakeholders: [],
  risks: [],
  assumptions: [],
  issues: [],
  decisions: [],
  timeEntries: [],
  knowledgeItems: [],
  
  taskFilter: {},
  projectFilter: {},
  
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  
  theme: 'dark',
  accentColor: '#4DA3FF',
  density: 'comfortable',
  presenterMode: false,
  drawerOpen: false,
  drawerContent: null,
  
  activeTimer: null,
  
  // Actions
  setView: (view) => set({ currentView: view }),
  
  loadClients: async () => {
    const clients = clientOps.list();
    set({ clients });
  },
  
  loadTasks: async (filters) => {
    const tasks = taskOps.list(filters);
    set({ tasks });
  },
  
  loadProjects: async (kind) => {
    const projects = projectOps.list(kind);
    set({ projects });
  },
  
  createClient: async (client) => {
    const newClient = clientOps.create(client);
    const clients = clientOps.list();
    set({ clients });
    return newClient;
  },
  
  updateClient: async (id, updates) => {
    const updatedClient = clientOps.update(id, updates);
    const clients = clientOps.list();
    set({ clients });
    return updatedClient;
  },
  
  deleteClient: async (id) => {
    clientOps.delete(id);
    const clients = clientOps.list();
    set({ clients });
  },
  
  createTask: async (task) => {
    const newTask = taskOps.create(task);
    const tasks = taskOps.list(get().taskFilter);
    set({ tasks });
    return newTask;
  },
  
  updateTask: async (id, updates) => {
    const updatedTask = taskOps.update(id, updates);
    const tasks = taskOps.list(get().taskFilter);
    set({ tasks });
    return updatedTask;
  },
  
  deleteTask: async (id) => {
    taskOps.delete(id);
    const tasks = taskOps.list(get().taskFilter);
    set({ tasks });
  },
  
  bulkUpdateTasks: async (ids, updates) => {
    for (const id of ids) {
      taskOps.update(id, updates);
    }
    const tasks = taskOps.list(get().taskFilter);
    set({ tasks });
  },
  
  createProject: async (project) => {
    const newProject = projectOps.create(project);
    const projects = projectOps.list();
    set({ projects });
    return newProject;
  },
  
  updateProject: async (id, updates) => {
    const updatedProject = projectOps.update(id, updates);
    const projects = projectOps.list();
    set({ projects });
    return updatedProject;
  },
  
  deleteProject: async (id) => {
    projectOps.delete(id);
    const projects = projectOps.list();
    set({ projects });
  },
  
  search: async (query) => {
    set({ isSearching: true, searchQuery: query });
    const results = searchOps.searchAll(query);
    set({ searchResults: results, isSearching: false });
  },
  
  clearSearch: () => {
    set({ searchQuery: '', searchResults: [] });
  },
  
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
  
  openDrawer: (content) => {
    set({ drawerOpen: true, drawerContent: content });
  },
  
  closeDrawer: () => {
    set({ drawerOpen: false, drawerContent: null });
  },
  
  startTimer: (taskId) => {
    set({ 
      activeTimer: {
        taskId,
        startTime: Date.now(),
        elapsed: 0
      }
    });
  },
  
  stopTimer: () => {
    const timer = get().activeTimer;
    if (!timer) return null;
    
    const hours = timer.elapsed / 3600000;
    const entry: TimeEntry = {
      id: '',
      date: new Date().toISOString(),
      hours,
      billable: true,
      taskId: timer.taskId,
      clientId: undefined,
      projectId: undefined,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set({ activeTimer: null });
    return entry;
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
  
  setTaskFilter: (filter) => {
    set({ taskFilter: filter });
    get().loadTasks(filter);
  },
  
  setProjectFilter: (filter) => {
    set({ projectFilter: filter });
    get().loadProjects(filter.kind);
  },
  
  // Dashboard helpers
  getTodayTasks: () => {
    return taskOps.getToday();
  },
  
  getWeekTasks: () => {
    const tasks = get().tasks;
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return tasks.filter(t => {
      if (!t.due) return false;
      const dueDate = new Date(t.due);
      return dueDate <= weekEnd && t.status !== 'Done';
    });
  },
  
  getOverdueTasks: () => {
    return taskOps.getOverdue();
  },
  
  getClientTasks: (clientId) => {
    return get().tasks.filter(t => t.clientId === clientId);
  },
  
  getProjectTasks: (projectId) => {
    return get().tasks.filter(t => t.projectId === projectId);
  },
  
  getNextSteps: () => {
    const tasks = get().tasks.filter(t => t.isNextStep);
    const clients = get().clients.filter(c => c.nextStep);
    const projects = get().projects.filter(p => p.nextStep);
    
    return [...tasks, ...clients, ...projects].sort((a, b) => {
      const aDue = 'due' in a ? a.due : a.nextStepDue;
      const bDue = 'due' in b ? b.due : b.nextStepDue;
      
      if (!aDue && !bDue) return 0;
      if (!aDue) return 1;
      if (!bDue) return -1;
      
      return new Date(aDue).getTime() - new Date(bDue).getTime();
    });
  }
}));