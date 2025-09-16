import { useState } from 'react';
import {
  FileText, Plus, Search, Calendar, Link2,
  Edit3, Trash2, Hash
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from '../../lib/dayjs-config';

export default function NoteList() {
  const {
    notes,
    clients,
    projects,
    createNote,
    deleteNote,
    openDrawer
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || note.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const handleAddNote = async () => {
    if (newNoteTitle.trim()) {
      await createNote({
        title: newNoteTitle,
        content: newNoteContent,
        tags: []
      });
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowAddModal(false);
    }
  };

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-default">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="text-[var(--accent)]" size={28} />
            Notes
          </h1>
          <span className="text-muted">
            {filteredNotes.length} of {notes.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>

          {/* Tag filter */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="input w-40"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Add note */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn"
          >
            <Plus size={16} />
            Add Note
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="card p-6 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => openDrawer(note, 'note')}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg line-clamp-2">{note.title}</h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit note
                    }}
                    className="p-1 hover:bg-elevated rounded"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this note?')) {
                        deleteNote(note.id);
                      }
                    }}
                    className="p-1 hover:bg-elevated rounded text-[var(--danger)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Content preview */}
              <p className="text-sm text-muted mb-4 line-clamp-3">
                {note.content || 'No content'}
              </p>

              {/* Metadata */}
              <div className="space-y-2 mb-4">
                {note.clientId && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>Client:</span>
                    <span className="sensitive">
                      {clients.find(c => c.id === note.clientId)?.name}
                    </span>
                  </div>
                )}
                {note.projectId && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>Project:</span>
                    <span>
                      {projects.find(p => p.id === note.projectId)?.title}
                    </span>
                  </div>
                )}
                {note.linkedTasks && note.linkedTasks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Link2 size={12} />
                    <span>{note.linkedTasks.length} linked tasks</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.map(tag => (
                    <span key={tag} className="tag text-xs">
                      <Hash size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-2">
                  <Calendar size={12} />
                  <span>{dayjs(note.createdAt).format('MMM D, YYYY')}</span>
                </div>
                {note.updatedAt && note.updatedAt !== note.createdAt && (
                  <span>Updated {dayjs(note.updatedAt).fromNow()}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center text-muted py-12">
            {searchQuery || filterTag ? 'No notes match your filters' : 'No notes yet'}
          </div>
        )}
      </div>

      {/* Add note modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-[600px] p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Note</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Note title..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="input w-full"
                autoFocus
              />
              
              <textarea
                placeholder="Note content..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="input w-full h-32 resize-none"
              />
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="btn"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

