import React, { useState } from 'react';
import {
  FileText, Plus, Search, Tag, Calendar, Link2,
  Edit3, Trash2, Download, Upload, Hash
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';

export default function NoteList() {
  const {
    notes,
    clients,
    projects,
    createNote,
    updateNote,
    deleteNote,
    openDrawer
  } = useStore();

  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    body: '',
    tags: [] as string[],
    clientId: '',
    projectId: ''
  });

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.body?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || note.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const handleCreateNote = async () => {
    if (newNote.title.trim()) {
      // In real app, would save markdown to file
      const noteId = await createNote({
        ...newNote,
        bodyMarkdownPath: `notes/${Date.now()}.md`
      });
      
      setNewNote({
        title: '',
        body: '',
        tags: [],
        clientId: '',
        projectId: ''
      });
      setShowNewNote(false);
    }
  };

  const handleSaveEdit = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, {
        body: editContent
      });
      setSelectedNote({ ...selectedNote, body: editContent });
      setIsEditing(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Delete this note?')) {
      deleteNote(noteId);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    }
  };

  const renderNoteList = () => (
    <div className="w-80 border-r border-default h-full overflow-auto">
      {/* Search and filters */}
      <div className="p-4 border-b border-default">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            className="input pl-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="input text-sm w-full"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Notes list */}
      <div className="p-2">
        {filteredNotes.map(note => {
          const client = clients.find(c => c.id === note.clientId);
          const project = projects.find(p => p.id === note.projectId);
          
          return (
            <div
              key={note.id}
              onClick={() => {
                setSelectedNote(note);
                setEditContent(note.body || '');
                setIsEditing(false);
              }}
              className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                selectedNote?.id === note.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'hover:bg-elevated'
              }`}
            >
              <h4 className="font-medium text-sm mb-1">{note.title}</h4>
              
              <div className="text-xs opacity-75 mb-2">
                {dayjs(note.updatedAt).format('MMM D, YYYY')}
              </div>
              
              {(client || project) && (
                <div className="text-xs opacity-75 mb-2">
                  {client && <span className="sensitive">{client.name}</span>}
                  {client && project && ' • '}
                  {project && <span>{project.title}</span>}
                </div>
              )}
              
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      selectedNote?.id === note.id
                        ? 'bg-white/20'
                        : 'bg-[var(--ring)]'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-xs opacity-75">+{note.tags.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
        
        {filteredNotes.length === 0 && (
          <div className="text-center py-8 text-muted text-sm">
            {searchQuery || filterTag ? 'No notes match filters' : 'No notes yet'}
          </div>
        )}
      </div>
    </div>
  );

  const renderNoteEditor = () => {
    if (!selectedNote) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted">
          <div className="text-center">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>Select a note to view</p>
          </div>
        </div>
      );
    }

    const client = clients.find(c => c.id === selectedNote.clientId);
    const project = projects.find(p => p.id === selectedNote.projectId);

    return (
      <div className="flex-1 flex flex-col">
        {/* Note header */}
        <div className="px-6 py-4 border-b border-default">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">{selectedNote.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted">
                {client && (
                  <span className="flex items-center gap-1">
                    <Link2 size={14} />
                    <span className="sensitive">{client.name}</span>
                  </span>
                )}
                {project && (
                  <span className="flex items-center gap-1">
                    <Link2 size={14} />
                    {project.title}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {dayjs(selectedNote.updatedAt).format('MMM D, YYYY h:mm A')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {selectedNote.tags.map((tag: string) => (
                  <span key={tag} className="tag text-xs">
                    <Hash size={10} className="inline mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="btn btn-ghost text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(selectedNote.body || '');
                    }}
                    className="btn btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-elevated rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="p-2 hover:bg-elevated rounded-lg transition-colors text-[var(--danger)]"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Note content */}
        <div className="flex-1 overflow-auto p-6">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full p-4 bg-elevated rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Write your note in Markdown..."
            />
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>
                {selectedNote.body || '*No content*'}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-default">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FileText size={24} />
            Notes
            <span className="text-sm text-muted ml-2">({notes.length})</span>
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewNote(true)}
              className="btn flex items-center gap-2"
            >
              <Plus size={16} />
              New Note
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {renderNoteList()}
        {renderNoteEditor()}
      </div>

      {/* New note modal */}
      {showNewNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="card w-[600px] p-6 animate-slideDown max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Create New Note</h2>
            
            <div className="mb-4">
              <label className="label">Title</label>
              <input
                type="text"
                className="input"
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Link to Client</label>
                <select
                  className="input"
                  value={newNote.clientId}
                  onChange={(e) => setNewNote({ ...newNote, clientId: e.target.value })}
                >
                  <option value="">None</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">Link to Project</label>
                <select
                  className="input"
                  value={newNote.projectId}
                  onChange={(e) => setNewNote({ ...newNote, projectId: e.target.value })}
                >
                  <option value="">None</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Tags</label>
              <input
                type="text"
                className="input"
                placeholder="meeting, decisions, requirements (comma-separated)"
                value={newNote.tags.join(', ')}
                onChange={(e) => setNewNote({ 
                  ...newNote, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
              />
            </div>

            <div className="mb-4">
              <label className="label">Content (Markdown)</label>
              <textarea
                className="input min-h-[200px] font-mono text-sm"
                placeholder="# Meeting Notes&#10;&#10;## Attendees&#10;- John Smith&#10;&#10;## Discussion Points&#10;..."
                value={newNote.body}
                onChange={(e) => setNewNote({ ...newNote, body: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewNote(false);
                  setNewNote({
                    title: '',
                    body: '',
                    tags: [],
                    clientId: '',
                    projectId: ''
                  });
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                className="btn"
                disabled={!newNote.title.trim()}
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}