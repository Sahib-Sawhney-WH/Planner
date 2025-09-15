-- Clients table
CREATE TABLE clients (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]', -- JSON array
    contacts TEXT DEFAULT '[]', -- JSON array
    links TEXT DEFAULT '[]', -- JSON array
    nextStep TEXT,
    nextStepDue TEXT, -- ISO 8601
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_clients_nextStepDue ON clients(nextStepDue);
CREATE INDEX idx_clients_tags ON clients(tags);

-- Opportunities table
CREATE TABLE opportunities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    clientId TEXT REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage TEXT CHECK(stage IN ('Discovery', 'Scoping', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost')) DEFAULT 'Discovery',
    amount REAL,
    probability REAL DEFAULT 0.5,
    nextStep TEXT,
    nextStepDue TEXT,
    notes TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_opportunities_clientId ON opportunities(clientId);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_nextStepDue ON opportunities(nextStepDue);

-- Projects table
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    clientId TEXT REFERENCES clients(id) ON DELETE SET NULL,
    kind TEXT CHECK(kind IN ('Active', 'Planned')) DEFAULT 'Planned',
    type TEXT,
    status TEXT DEFAULT 'Not Started',
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT DEFAULT '[]', -- JSON array
    nextStep TEXT,
    nextStepDue TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_clientId ON projects(clientId);
CREATE INDEX idx_projects_kind ON projects(kind);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_nextStepDue ON projects(nextStepDue);

-- Milestones table
CREATE TABLE milestones (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    projectId TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due TEXT,
    status TEXT CHECK(status IN ('Planned', 'In Progress', 'Done', 'At Risk')) DEFAULT 'Planned',
    notes TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_milestones_projectId ON milestones(projectId);
CREATE INDEX idx_milestones_due ON milestones(due);
CREATE INDEX idx_milestones_status ON milestones(status);

-- Tasks table
CREATE TABLE tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    projectId TEXT REFERENCES projects(id) ON DELETE SET NULL,
    clientId TEXT REFERENCES clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('Inbox', 'Todo', 'Doing', 'Blocked', 'Done')) DEFAULT 'Inbox',
    due TEXT,
    priority INTEGER DEFAULT 3,
    effort REAL DEFAULT 2.5,
    impact INTEGER DEFAULT 3,
    confidence REAL DEFAULT 0.7,
    rrule TEXT, -- RFC 5545 recurrence rule
    isNextStep INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]', -- JSON array
    links TEXT DEFAULT '[]', -- JSON array
    score REAL GENERATED ALWAYS AS ((impact * confidence) / effort) STORED,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_tasks_projectId ON tasks(projectId);
CREATE INDEX idx_tasks_clientId ON tasks(clientId);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due);
CREATE INDEX idx_tasks_score ON tasks(score DESC);
CREATE INDEX idx_tasks_isNextStep ON tasks(isNextStep);

-- Notes table
CREATE TABLE notes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    bodyMarkdownPath TEXT, -- File path to markdown file
    clientId TEXT REFERENCES clients(id) ON DELETE SET NULL,
    projectId TEXT REFERENCES projects(id) ON DELETE SET NULL,
    tags TEXT DEFAULT '[]', -- JSON array
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_notes_clientId ON notes(clientId);
CREATE INDEX idx_notes_projectId ON notes(projectId);

-- Stakeholders table
CREATE TABLE stakeholders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    clientId TEXT REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    influence INTEGER DEFAULT 3 CHECK(influence >= 1 AND influence <= 5),
    preferredComms TEXT CHECK(preferredComms IN ('email', 'phone', 'teams', 'other')) DEFAULT 'email',
    notes TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_stakeholders_clientId ON stakeholders(clientId);
CREATE INDEX idx_stakeholders_influence ON stakeholders(influence DESC);

-- Risks table
CREATE TABLE risks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    projectId TEXT REFERENCES projects(id) ON DELETE CASCADE,
    clientId TEXT REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    likelihood TEXT CHECK(likelihood IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    mitigation TEXT,
    owner TEXT,
    due TEXT,
    status TEXT CHECK(status IN ('Open', 'Monitoring', 'Closed')) DEFAULT 'Open',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_risks_projectId ON risks(projectId);
CREATE INDEX idx_risks_clientId ON risks(clientId);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_severity ON risks(severity);

-- Assumptions table
CREATE TABLE assumptions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    projectId TEXT REFERENCES projects(id) ON DELETE CASCADE,
    clientId TEXT REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    validated INTEGER DEFAULT 0,
    owner TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- Issues table  
CREATE TABLE issues (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    projectId TEXT REFERENCES projects(id) ON DELETE CASCADE,
    clientId TEXT REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT CHECK(severity IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    resolution TEXT,
    owner TEXT,
    status TEXT CHECK(status IN ('Open', 'In Progress', 'Resolved')) DEFAULT 'Open',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_issues_projectId ON issues(projectId);
CREATE INDEX idx_issues_clientId ON issues(clientId);
CREATE INDEX idx_issues_status ON issues(status);

-- Decisions table
CREATE TABLE decisions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    projectId TEXT REFERENCES projects(id) ON DELETE CASCADE,
    clientId TEXT REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    decisionText TEXT NOT NULL,
    decidedOn TEXT,
    owner TEXT,
    impact TEXT,
    links TEXT DEFAULT '[]', -- JSON array
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_decisions_projectId ON decisions(projectId);
CREATE INDEX idx_decisions_clientId ON decisions(clientId);
CREATE INDEX idx_decisions_decidedOn ON decisions(decidedOn);

-- Time entries table
CREATE TABLE timeEntries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    date TEXT NOT NULL,
    hours REAL NOT NULL,
    billable INTEGER DEFAULT 1,
    clientId TEXT REFERENCES clients(id) ON DELETE SET NULL,
    projectId TEXT REFERENCES projects(id) ON DELETE SET NULL,
    taskId TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    notes TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_timeEntries_date ON timeEntries(date DESC);
CREATE INDEX idx_timeEntries_clientId ON timeEntries(clientId);
CREATE INDEX idx_timeEntries_projectId ON timeEntries(projectId);
CREATE INDEX idx_timeEntries_taskId ON timeEntries(taskId);
CREATE INDEX idx_timeEntries_billable ON timeEntries(billable);

-- Knowledge repository table
CREATE TABLE knowledgeItems (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    tags TEXT DEFAULT '[]', -- JSON array
    sourceType TEXT CHECK(sourceType IN ('howto', 'article', 'docs', 'github', 'video', 'other')) DEFAULT 'other',
    createdAt TEXT DEFAULT (datetime('now')),
    lastAccessedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_knowledgeItems_sourceType ON knowledgeItems(sourceType);
CREATE INDEX idx_knowledgeItems_lastAccessedAt ON knowledgeItems(lastAccessedAt DESC);

-- Settings table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
    ('theme', '"dark"'),
    ('accentColor', '"#4DA3FF"'),
    ('density', '"comfortable"'),
    ('startOnBoot', 'false'),
    ('minimizeToTray', 'true'),
    ('presenterMode', 'false');

-- Update triggers for updatedAt
CREATE TRIGGER update_clients_timestamp AFTER UPDATE ON clients
BEGIN
    UPDATE clients SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_projects_timestamp AFTER UPDATE ON projects
BEGIN
    UPDATE projects SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_tasks_timestamp AFTER UPDATE ON tasks
BEGIN
    UPDATE tasks SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_notes_timestamp AFTER UPDATE ON notes
BEGIN
    UPDATE notes SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_opportunities_timestamp AFTER UPDATE ON opportunities
BEGIN
    UPDATE opportunities SET updatedAt = datetime('now') WHERE id = NEW.id;
END;