import { useState } from 'react';
import { X, Edit3, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  type: 'task' | 'project' | 'client' | 'note' | 'opportunity' | 'risk' | 'issue';
}

export default function Drawer({ isOpen, onClose, content, type }: DrawerProps) {
  const {
    clients,
    projects,
    updateTask,
    updateProject,
    updateClient,
    updateOpportunity,
    updateRisk,
    updateIssue,
    deleteTask,
    deleteProject,
    deleteClient
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(content);

  if (!isOpen || !content) return null;

  const handleSave = () => {
    switch (type) {
      case 'task':
        updateTask(content.id, editData);
        break;
      case 'project':
        updateProject(content.id, editData);
        break;
      case 'client':
        updateClient(content.id, editData);
        break;
      case 'opportunity':
        updateOpportunity(content.id, editData);
        break;
      case 'risk':
        updateRisk(content.id, editData);
        break;
      case 'issue':
        updateIssue(content.id, editData);
        break;
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete this ${type}?`)) {
      switch (type) {
        case 'task':
          deleteTask(content.id);
          break;
        case 'project':
          deleteProject(content.id);
          break;
        case 'client':
          deleteClient(content.id);
          break;
      }
      onClose();
    }
  };

  const renderTaskDetails = () => {
    const client = clients.find(c => c.id === content.clientId);
    const project = projects.find(p => p.id === content.projectId);

    return (
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="label">Title</label>
          {isEditing ? (
            <input
              type="text"
              className="input"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
          ) : (
            <h2 className="text-xl font-semibold">{content.title}</h2>
          )}
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            {isEditing ? (
              <select
                className="input"
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <option value="Inbox">Inbox</option>
                <option value="Todo">Todo</option>
                <option value="Doing">Doing</option>
                <option value="Blocked">Blocked</option>
                <option value="Done">Done</option>
              </select>
            ) : (
              <span className={`tag ${
                content.status === 'Done' ? 'bg-[var(--success)] text-white' :
                content.status === 'Doing' ? 'bg-[var(--doing)] text-white' :
                content.status === 'Blocked' ? 'bg-[var(--blocked)] text-white' :
                content.status === 'Todo' ? 'bg-[var(--todo)] text-white' :
                'bg-[var(--ring)]'
              }`}>
                {content.status}
              </span>
            )}
          </div>

          <div>
            <label className="label">Priority</label>
            {isEditing ? (
              <input
                type="number"
                className="input"
                min="1"
                max="5"
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) })}
              />
            ) : (
              <span className="font-medium">{content.priority}/5</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          {isEditing ? (
            <textarea
              className="input h-24"
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Add description..."
            />
          ) : (
            <p className="text-muted">{content.description || 'No description'}</p>
          )}
        </div>

        {/* Client and Project */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Client</label>
            <p className="text-sm">{client?.name || 'No client'}</p>
          </div>
          <div>
            <label className="label">Project</label>
            <p className="text-sm">{project?.title || 'No project'}</p>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="label">Due Date</label>
          {isEditing ? (
            <input
              type="date"
              className="input"
              value={editData.due ? dayjs(editData.due).format('YYYY-MM-DD') : ''}
              onChange={(e) => setEditData({ ...editData, due: e.target.value })}
            />
          ) : (
            <p className="text-sm">
              {content.due ? dayjs(content.due).format('MMM D, YYYY') : 'No due date'}
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          <div className="flex flex-wrap gap-1">
            {content.tags?.map((tag: string) => (
              <span key={tag} className="tag text-xs">{tag}</span>
            ))}
          </div>
        </div>

        {/* ICE Score */}
        <div>
          <label className="label">ICE Score</label>
          <div className="text-lg font-semibold text-[var(--accent)]">
            {content.score?.toFixed(1) || '0.0'}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'task':
        return renderTaskDetails();
      default:
        return <div>Details for {type}</div>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-elevated border-l border-default shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-default">
        <h3 className="font-semibold capitalize">{type} Details</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-[var(--danger)]"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {renderContent()}
      </div>

      {/* Footer */}
      {isEditing && (
        <div className="p-4 border-t border-default">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="btn flex-1"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

