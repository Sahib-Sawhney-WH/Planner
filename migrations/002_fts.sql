-- Full-text search virtual tables using FTS5

-- Tasks FTS
CREATE VIRTUAL TABLE tasks_fts USING fts5(
    title, 
    description,
    content=tasks,
    content_rowid=rowid,
    tokenize='porter unicode61'
);

-- Populate tasks FTS
INSERT INTO tasks_fts (rowid, title, description) 
SELECT rowid, title, description FROM tasks;

-- Triggers to keep FTS in sync
CREATE TRIGGER tasks_fts_insert AFTER INSERT ON tasks
BEGIN
    INSERT INTO tasks_fts (rowid, title, description) 
    VALUES (NEW.rowid, NEW.title, NEW.description);
END;

CREATE TRIGGER tasks_fts_update AFTER UPDATE ON tasks
BEGIN
    UPDATE tasks_fts 
    SET title = NEW.title, description = NEW.description 
    WHERE rowid = NEW.rowid;
END;

CREATE TRIGGER tasks_fts_delete AFTER DELETE ON tasks
BEGIN
    DELETE FROM tasks_fts WHERE rowid = OLD.rowid;
END;

-- Notes FTS (note: body content will be loaded from files)
CREATE VIRTUAL TABLE notes_fts USING fts5(
    title,
    body,
    content=notes,
    content_rowid=rowid,
    tokenize='porter unicode61'
);

-- Populate notes FTS (body will be loaded from markdown files)
INSERT INTO notes_fts (rowid, title, body) 
SELECT rowid, title, '' FROM notes;

-- Triggers for notes
CREATE TRIGGER notes_fts_insert AFTER INSERT ON notes
BEGIN
    INSERT INTO notes_fts (rowid, title, body) 
    VALUES (NEW.rowid, NEW.title, '');
END;

CREATE TRIGGER notes_fts_update AFTER UPDATE ON notes
BEGIN
    UPDATE notes_fts 
    SET title = NEW.title 
    WHERE rowid = NEW.rowid;
END;

CREATE TRIGGER notes_fts_delete AFTER DELETE ON notes
BEGIN
    DELETE FROM notes_fts WHERE rowid = OLD.rowid;
END;

-- Knowledge items FTS
CREATE VIRTUAL TABLE knowledge_fts USING fts5(
    title,
    description,
    content=knowledgeItems,
    content_rowid=rowid,
    tokenize='porter unicode61'
);

-- Populate knowledge FTS
INSERT INTO knowledge_fts (rowid, title, description) 
SELECT rowid, title, description FROM knowledgeItems;

-- Triggers for knowledge
CREATE TRIGGER knowledge_fts_insert AFTER INSERT ON knowledgeItems
BEGIN
    INSERT INTO knowledge_fts (rowid, title, description) 
    VALUES (NEW.rowid, NEW.title, NEW.description);
END;

CREATE TRIGGER knowledge_fts_update AFTER UPDATE ON knowledgeItems
BEGIN
    UPDATE knowledge_fts 
    SET title = NEW.title, description = NEW.description 
    WHERE rowid = NEW.rowid;
END;

CREATE TRIGGER knowledge_fts_delete AFTER DELETE ON knowledgeItems
BEGIN
    DELETE FROM knowledge_fts WHERE rowid = OLD.rowid;
END;

-- Clients FTS
CREATE VIRTUAL TABLE clients_fts USING fts5(
    name,
    nextStep,
    content=clients,
    content_rowid=rowid,
    tokenize='porter unicode61'
);

INSERT INTO clients_fts (rowid, name, nextStep) 
SELECT rowid, name, nextStep FROM clients;

CREATE TRIGGER clients_fts_insert AFTER INSERT ON clients
BEGIN
    INSERT INTO clients_fts (rowid, name, nextStep) 
    VALUES (NEW.rowid, NEW.name, NEW.nextStep);
END;

CREATE TRIGGER clients_fts_update AFTER UPDATE ON clients
BEGIN
    UPDATE clients_fts 
    SET name = NEW.name, nextStep = NEW.nextStep 
    WHERE rowid = NEW.rowid;
END;

CREATE TRIGGER clients_fts_delete AFTER DELETE ON clients
BEGIN
    DELETE FROM clients_fts WHERE rowid = OLD.rowid;
END;

-- Projects FTS
CREATE VIRTUAL TABLE projects_fts USING fts5(
    title,
    description,
    nextStep,
    content=projects,
    content_rowid=rowid,
    tokenize='porter unicode61'
);

INSERT INTO projects_fts (rowid, title, description, nextStep) 
SELECT rowid, title, description, nextStep FROM projects;

CREATE TRIGGER projects_fts_insert AFTER INSERT ON projects
BEGIN
    INSERT INTO projects_fts (rowid, title, description, nextStep) 
    VALUES (NEW.rowid, NEW.title, NEW.description, NEW.nextStep);
END;

CREATE TRIGGER projects_fts_update AFTER UPDATE ON projects
BEGIN
    UPDATE projects_fts 
    SET title = NEW.title, description = NEW.description, nextStep = NEW.nextStep 
    WHERE rowid = NEW.rowid;
END;

CREATE TRIGGER projects_fts_delete AFTER DELETE ON projects
BEGIN
    DELETE FROM projects_fts WHERE rowid = OLD.rowid;
END;