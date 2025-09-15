import Database from 'better-sqlite3';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync } from 'fs';

// Initialize database
const appDataDir = join(homedir(), 'Planner');
if (!existsSync(appDataDir)) {
  mkdirSync(appDataDir, { recursive: true });
}

const dbPath = join(appDataDir, 'planner.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('🌱 Seeding database...');

// Clear existing data
db.exec(`
  DELETE FROM timeEntries;
  DELETE FROM knowledgeItems;
  DELETE FROM decisions;
  DELETE FROM issues;
  DELETE FROM assumptions;
  DELETE FROM risks;
  DELETE FROM stakeholders;
  DELETE FROM notes;
  DELETE FROM tasks;
  DELETE FROM milestones;
  DELETE FROM opportunities;
  DELETE FROM projects;
  DELETE FROM clients;
`);

// Seed Clients
const clients = [
  {
    id: 'client1',
    name: 'Acme Corporation',
    tags: JSON.stringify(['Signed', 'Enterprise']),
    contacts: JSON.stringify([
      { name: 'John Smith', email: 'john@acme.com', phone: '+1-555-0100' }
    ]),
    links: JSON.stringify(['https://acme.com', 'https://portal.acme.com']),
    nextStep: 'Review Q1 implementation roadmap',
    nextStepDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'client2',
    name: 'TechStart Inc',
    tags: JSON.stringify(['Pre-sales', 'SMB']),
    contacts: JSON.stringify([
      { name: 'Sarah Johnson', email: 'sarah@techstart.io', phone: '+1-555-0200' }
    ]),
    links: JSON.stringify(['https://techstart.io']),
    nextStep: 'Send proposal draft',
    nextStepDue: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'client3',
    name: 'Global Logistics Ltd',
    tags: JSON.stringify(['Sales pursuit', 'Enterprise']),
    contacts: JSON.stringify([]),
    links: JSON.stringify([]),
    nextStep: 'Schedule discovery call',
    nextStepDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

clients.forEach(client => {
  db.prepare(`
    INSERT INTO clients (id, name, tags, contacts, links, nextStep, nextStepDue)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(client.id, client.name, client.tags, client.contacts, client.links, client.nextStep, client.nextStepDue);
});

// Seed Opportunities
const opportunities = [
  {
    clientId: 'client2',
    name: 'TechStart Cloud Migration',
    stage: 'Proposal',
    amount: 125000,
    probability: 0.7,
    nextStep: 'Address security concerns in proposal',
    nextStepDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Decision maker: CTO. Budget approved for Q2.'
  },
  {
    clientId: 'client3',
    name: 'Supply Chain Optimization Platform',
    stage: 'Discovery',
    amount: 450000,
    probability: 0.3,
    nextStep: 'Technical deep dive session',
    nextStepDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Competing with incumbent vendor'
  }
];

opportunities.forEach(opp => {
  db.prepare(`
    INSERT INTO opportunities (clientId, name, stage, amount, probability, nextStep, nextStepDue, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(opp.clientId, opp.name, opp.stage, opp.amount, opp.probability, opp.nextStep, opp.nextStepDue, opp.notes);
});

// Seed Projects
const projects = [
  {
    id: 'proj1',
    clientId: 'client1',
    kind: 'Active',
    type: 'Implementation',
    status: 'In Progress',
    title: 'Acme ERP Integration',
    description: 'Integrate custom ERP with Dynamics 365 Finance & Operations',
    tags: JSON.stringify(['Phase 1', 'Critical']),
    nextStep: 'Complete data mapping document',
    nextStepDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'proj2',
    clientId: null,
    kind: 'Active',
    type: 'Personal R&D',
    status: 'In Progress',
    title: 'AI Assistant Demo',
    description: 'Build demonstration of AI-powered order processing',
    tags: JSON.stringify(['Demo', 'Innovation']),
    nextStep: 'Record demo video',
    nextStepDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'proj3',
    clientId: 'client1',
    kind: 'Planned',
    type: 'Implementation',
    status: 'Not Started',
    title: 'Acme Phase 2 - Warehouse Management',
    description: 'Extend integration to warehouse management system',
    tags: JSON.stringify(['Phase 2', 'Q2 2025']),
    nextStep: null,
    nextStepDue: null
  }
];

projects.forEach(project => {
  db.prepare(`
    INSERT INTO projects (id, clientId, kind, type, status, title, description, tags, nextStep, nextStepDue)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(project.id, project.clientId, project.kind, project.type, project.status, 
         project.title, project.description, project.tags, project.nextStep, project.nextStepDue);
});

// Seed Milestones
const milestones = [
  {
    projectId: 'proj1',
    title: 'Data Migration Complete',
    due: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'In Progress',
    notes: 'Customer data, product catalog, and pricing'
  },
  {
    projectId: 'proj1',
    title: 'UAT Sign-off',
    due: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Planned',
    notes: 'Requires 2 weeks of testing'
  },
  {
    projectId: 'proj1',
    title: 'Go-Live',
    due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Planned',
    notes: 'Weekend deployment window'
  }
];

milestones.forEach(milestone => {
  db.prepare(`
    INSERT INTO milestones (projectId, title, due, status, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(milestone.projectId, milestone.title, milestone.due, milestone.status, milestone.notes);
});

// Seed Tasks
const tasks = [
  // Today/Overdue tasks
  {
    projectId: 'proj1',
    clientId: 'client1',
    title: 'Review customer data mapping',
    description: 'Validate field mappings for customer entity with business team',
    status: 'Doing',
    due: new Date().toISOString(),
    priority: 5,
    effort: 2,
    impact: 4,
    confidence: 0.9,
    isNextStep: 1,
    tags: JSON.stringify(['urgent', 'data'])
  },
  {
    projectId: 'proj1',
    clientId: 'client1',
    title: 'Fix pricing sync issue',
    description: 'Prices not updating correctly from ERP',
    status: 'Todo',
    due: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
    priority: 5,
    effort: 3,
    impact: 5,
    confidence: 0.8,
    isNextStep: 0,
    tags: JSON.stringify(['bug', 'critical'])
  },
  // This week tasks
  {
    projectId: 'proj2',
    clientId: null,
    title: 'Implement order creation flow',
    description: 'Add AI suggestions for product recommendations',
    status: 'Todo',
    due: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 3,
    effort: 4,
    impact: 4,
    confidence: 0.7,
    isNextStep: 0,
    tags: JSON.stringify(['demo', 'ai'])
  },
  {
    projectId: null,
    clientId: 'client2',
    title: 'Prepare TechStart proposal',
    description: 'Include architecture diagram and timeline',
    status: 'Todo',
    due: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 4,
    effort: 3,
    impact: 5,
    confidence: 0.85,
    isNextStep: 1,
    tags: JSON.stringify(['presales'])
  },
  // Inbox items
  {
    projectId: null,
    clientId: null,
    title: 'Research new D365 features',
    description: null,
    status: 'Inbox',
    due: null,
    priority: 2,
    effort: 2,
    impact: 3,
    confidence: 0.6,
    isNextStep: 0,
    tags: JSON.stringify(['learning'])
  },
  {
    projectId: null,
    clientId: null,
    title: 'Update LinkedIn profile',
    description: 'Add recent project successes',
    status: 'Inbox',
    due: null,
    priority: 1,
    effort: 1,
    impact: 2,
    confidence: 1,
    isNextStep: 0,
    tags: JSON.stringify(['personal'])
  },
  // Blocked task
  {
    projectId: 'proj1',
    clientId: 'client1',
    title: 'Configure payment gateway',
    description: 'Waiting for API credentials from client',
    status: 'Blocked',
    due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 3,
    effort: 2,
    impact: 4,
    confidence: 0.9,
    isNextStep: 0,
    tags: JSON.stringify(['integration', 'blocked'])
  }
];

tasks.forEach(task => {
  db.prepare(`
    INSERT INTO tasks (
      projectId, clientId, title, description, status, due, 
      priority, effort, impact, confidence, isNextStep, tags
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    task.projectId, task.clientId, task.title, task.description, 
    task.status, task.due, task.priority, task.effort, 
    task.impact, task.confidence, task.isNextStep, task.tags
  );
});

// Seed Stakeholders
const stakeholders = [
  {
    clientId: 'client1',
    name: 'John Smith',
    role: 'IT Director',
    email: 'john.smith@acme.com',
    phone: '+1-555-0101',
    timezone: 'America/New_York',
    influence: 4,
    preferredComms: 'email',
    notes: 'Technical decision maker, prefers detailed documentation'
  },
  {
    clientId: 'client1',
    name: 'Mary Johnson',
    role: 'CFO',
    email: 'mary.johnson@acme.com',
    phone: '+1-555-0102',
    timezone: 'America/New_York',
    influence: 5,
    preferredComms: 'teams',
    notes: 'Budget holder, focused on ROI'
  },
  {
    clientId: 'client2',
    name: 'Sarah Davis',
    role: 'CTO',
    email: 'sarah@techstart.io',
    phone: '+1-555-0201',
    timezone: 'America/Los_Angeles',
    influence: 5,
    preferredComms: 'phone',
    notes: 'Hands-on technical leader, likes demos'
  }
];

stakeholders.forEach(stakeholder => {
  db.prepare(`
    INSERT INTO stakeholders (
      clientId, name, role, email, phone, timezone, 
      influence, preferredComms, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    stakeholder.clientId, stakeholder.name, stakeholder.role, 
    stakeholder.email, stakeholder.phone, stakeholder.timezone,
    stakeholder.influence, stakeholder.preferredComms, stakeholder.notes
  );
});

// Seed RAID items
// Risks
const risks = [
  {
    projectId: 'proj1',
    clientId: 'client1',
    title: 'Data migration complexity',
    severity: 'High',
    likelihood: 'Medium',
    mitigation: 'Incremental migration approach with validation checkpoints',
    owner: 'Tech Lead',
    due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Open'
  },
  {
    projectId: 'proj1',
    clientId: 'client1',
    title: 'Key stakeholder availability',
    severity: 'Medium',
    likelihood: 'High',
    mitigation: 'Document all decisions, async communication when needed',
    owner: 'PM',
    due: null,
    status: 'Monitoring'
  }
];

risks.forEach(risk => {
  db.prepare(`
    INSERT INTO risks (
      projectId, clientId, title, severity, likelihood, 
      mitigation, owner, due, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    risk.projectId, risk.clientId, risk.title, risk.severity, 
    risk.likelihood, risk.mitigation, risk.owner, risk.due, risk.status
  );
});

// Issues
const issues = [
  {
    projectId: 'proj1',
    clientId: 'client1',
    title: 'Test environment performance',
    description: 'Response times 3x slower than production target',
    severity: 'High',
    resolution: null,
    owner: 'Infrastructure Team',
    status: 'Open'
  }
];

issues.forEach(issue => {
  db.prepare(`
    INSERT INTO issues (
      projectId, clientId, title, description, severity, 
      resolution, owner, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    issue.projectId, issue.clientId, issue.title, issue.description,
    issue.severity, issue.resolution, issue.owner, issue.status
  );
});

// Decisions
const decisions = [
  {
    projectId: 'proj1',
    clientId: 'client1',
    title: 'Use incremental data migration',
    decisionText: 'Migrate data in phases rather than big-bang to reduce risk',
    decidedOn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    owner: 'John Smith',
    impact: 'Extends timeline by 1 week but reduces go-live risk',
    links: JSON.stringify(['https://docs.internal/migration-plan'])
  }
];

decisions.forEach(decision => {
  db.prepare(`
    INSERT INTO decisions (
      projectId, clientId, title, decisionText, decidedOn, 
      owner, impact, links
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    decision.projectId, decision.clientId, decision.title, 
    decision.decisionText, decision.decidedOn, decision.owner, 
    decision.impact, decision.links
  );
});

// Seed Time Entries
const timeEntries = [
  {
    date: new Date().toISOString(),
    hours: 2.5,
    billable: 1,
    clientId: 'client1',
    projectId: 'proj1',
    taskId: null,
    notes: 'Data mapping review session'
  },
  {
    date: new Date().toISOString(),
    hours: 1.5,
    billable: 1,
    clientId: 'client1',
    projectId: 'proj1',
    taskId: null,
    notes: 'Bug fix - pricing sync'
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    hours: 3,
    billable: 0,
    clientId: 'client2',
    projectId: null,
    taskId: null,
    notes: 'Proposal preparation'
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    hours: 2,
    billable: 0,
    clientId: null,
    projectId: 'proj2',
    taskId: null,
    notes: 'Demo development'
  }
];

timeEntries.forEach(entry => {
  db.prepare(`
    INSERT INTO timeEntries (
      date, hours, billable, clientId, projectId, taskId, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.date, entry.hours, entry.billable, entry.clientId,
    entry.projectId, entry.taskId, entry.notes
  );
});

// Seed Knowledge Items
const knowledgeItems = [
  {
    title: 'D365 F&O Data Entities Guide',
    url: 'https://learn.microsoft.com/dynamics365/fin-ops-core/dev-itpro/data-entities/data-entities',
    description: 'Complete reference for data entities and integration patterns',
    tags: JSON.stringify(['D365', 'integration', 'reference']),
    sourceType: 'docs'
  },
  {
    title: 'Power Platform ALM Strategy',
    url: 'https://learn.microsoft.com/power-platform/alm/overview-alm',
    description: 'Best practices for application lifecycle management',
    tags: JSON.stringify(['PowerPlatform', 'ALM', 'bestpractice']),
    sourceType: 'docs'
  },
  {
    title: 'Azure Integration Services Patterns',
    url: 'https://github.com/Azure/Integration-Services',
    description: 'Reference architectures and patterns for enterprise integration',
    tags: JSON.stringify(['Azure', 'integration', 'architecture']),
    sourceType: 'github'
  },
  {
    title: 'SQL Performance Tuning Checklist',
    url: 'https://internal.docs/sql-tuning',
    description: 'Internal checklist for database optimization',
    tags: JSON.stringify(['SQL', 'performance', 'checklist']),
    sourceType: 'howto'
  },
  {
    title: 'Customer Demo Recording Template',
    url: 'https://youtube.com/demo-best-practices',
    description: 'How to record effective customer demos',
    tags: JSON.stringify(['demo', 'sales', 'video']),
    sourceType: 'video'
  }
];

knowledgeItems.forEach(item => {
  db.prepare(`
    INSERT INTO knowledgeItems (title, url, description, tags, sourceType)
    VALUES (?, ?, ?, ?, ?)
  `).run(item.title, item.url, item.description, item.tags, item.sourceType);
});

// Seed Notes
const notes = [
  {
    title: 'Acme Integration Meeting - Jan 8',
    bodyMarkdownPath: 'notes/acme-meeting-jan8.md',
    clientId: 'client1',
    projectId: 'proj1',
    tags: JSON.stringify(['meeting', 'decisions'])
  },
  {
    title: 'TechStart Discovery Call Notes',
    bodyMarkdownPath: 'notes/techstart-discovery.md',
    clientId: 'client2',
    projectId: null,
    tags: JSON.stringify(['discovery', 'requirements'])
  },
  {
    title: 'AI Demo Ideas',
    bodyMarkdownPath: 'notes/ai-demo-ideas.md',
    clientId: null,
    projectId: 'proj2',
    tags: JSON.stringify(['ideas', 'demo'])
  },
  {
    title: 'Weekly Review - Week 2',
    bodyMarkdownPath: 'notes/weekly-review-w2.md',
    clientId: null,
    projectId: null,
    tags: JSON.stringify(['review', 'planning'])
  }
];

notes.forEach(note => {
  db.prepare(`
    INSERT INTO notes (title, bodyMarkdownPath, clientId, projectId, tags)
    VALUES (?, ?, ?, ?, ?)
  `).run(note.title, note.bodyMarkdownPath, note.clientId, note.projectId, note.tags);
});

console.log('✅ Database seeded successfully!');
console.log(`📁 Database location: ${dbPath}`);
console.log('\nSeeded data summary:');
console.log('  - 3 Clients');
console.log('  - 2 Opportunities');
console.log('  - 3 Projects');
console.log('  - 3 Milestones');
console.log('  - 7 Tasks');
console.log('  - 3 Stakeholders');
console.log('  - 2 Risks, 1 Issue, 1 Decision');
console.log('  - 4 Time Entries');
console.log('  - 5 Knowledge Items');
console.log('  - 4 Notes');

db.close();