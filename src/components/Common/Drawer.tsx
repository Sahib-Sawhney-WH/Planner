import React, { useState } from 'react';
import {
  X, Edit3, Trash2, Calendar, Clock, Tag, Link2,
  User, AlertTriangle, Target, CheckCircle, MessageSquare
} from 'lucide-react';
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
    tasks,
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
              className="input min-h-[100px]"
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            />
          ) : (
            <p className="text-sm text-muted">
              {content.description || 'No description'}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Client</label>
            {isEditing ? (
              <select
                className="input"
                value={editData.clientId || ''}
                onChange={(e) => setEditData({ ...editData, clientId: e.target.value })}
              >
                <option value="">None</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm sensitive">
                {client?.name || 'None'}
              </span>
            )}
          </div>

          <div>
            <label className="label">Project</label>
            {isEditing ? (
              <select
                className="input"
                value={editData.projectId || ''}
                onChange={(e) => setEditData({ ...editData, projectId: e.target.value })}
              >
                <option value="">None</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm">
                {project?.title || 'None'}
              </span>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="label">Due Date</label>
          {isEditing ? (
            <input
              type="date"
              className="input"
              value={editData.due || ''}
              onChange={(e) => setEditData({ ...editData, due: e.target.value })}
            />
          ) : (
            <span className="text-sm">
              {content.due ? dayjs(content.due).format('MMMM D, YYYY') : 'No due date'}
            </span>
          )}
        </div>

        {/* ICE Score */}
        <div>
          <label className="label">ICE Score Calculation</label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted">Impact (1-5)</label>
              {isEditing ? (
                <input
                  type="number"
                  className="input"
                  min="1"
                  max="5"
                  value={editData.impact}
                  onChange={(e) => setEditData({ ...editData, impact: parseInt(e.target.value) })}
                />
              ) : (
                <div className="text-lg font-medium">{content.impact}</div>
              )}
            </div>
            <div>
              <label className="text-xs text-muted">Confidence (0.5-1)</label>
              {isEditing ? (
                <input
                  type="number"
                  className="input"
                  min="0.5"
                  max="1"
                  step="0.1"
                  value={editData.confidence}
                  onChange={(e) => setEditData({ ...editData, confidence: parseFloat(e.target.value) })}
                />
              ) : (
                <div className="text-lg font-medium">{content.confidence}</div>
              )}
            </div>
            <div>
              <label className="text-xs text-muted">Effort (0.5-5)</label>
              {isEditing ? (
                <input
                  type="number"
                  className="input"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={editData.effort}
                  onChange={(e) => setEditData({ ...editData, effort: parseFloat(e.target.value) })}
                />
              ) : (
                <div className="text-lg font-medium">{content.effort}</div>
              )}
            </div>
          </div>
          <div className="mt-3 p-3 bg-elevated rounded-lg">
            <div className="text-xs text-muted mb-1">Final Score</div>
            <div className="text-2xl font-bold text-[var(--accent)]">
              {((editData.impact * editData.confidence) / editData.effort).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          {isEditing ? (
            <input
              type="text"
              className="input"
              placeholder="tag1, tag2, tag3"
              value={editData.tags?.join(', ') || ''}
              onChange={(e) => setEditData({ 
                ...editData, 
                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
              })}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {content.tags?.map((tag: string) => (
                <span key={tag} className="tag text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Next Step */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editData.isNextStep}
              onChange={(e) => setEditData({ ...editData, isNextStep: e.target.checked })}
              disabled={!isEditing}
              className="rounded"
            />
            <span>Mark as Next Step</span>
          </label>
          <p className="text-xs text-muted mt-1">
            Next steps appear prominently on the dashboard
          </p>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-default text-xs text-muted space-y-1">
          <div>Created: {dayjs(content.createdAt).format('MMM D, YYYY h:mm A')}</div>
          <div>Updated: {dayjs(content.updatedAt).format('MMM D, YYYY h:mm A')}</div>
          <div>ID: {content.id}</div>
        </div>
      </div>
    );
  };

  const renderProjectDetails = () => {
    const client = clients.find(c => c.id === content.clientId);
    const projectTasks = tasks.filter(t => t.projectId === content.id);
    const completedTasks = projectTasks.filter(t => t.status === 'Done');
    const progress = projectTasks.length > 0 
      ? Math.round((completedTasks.length / projectTasks.length) * 100)
      : 0;

    return (
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="label">Project Title</label>
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

        {/* Client and Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Client</label>
            {isEditing ? (
              <select
                className="input"
                value={editData.clientId || ''}
                onChange={(e) => setEditData({ ...editData, clientId: e.target.value })}
              >
                <option value="">Personal/Internal</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm sensitive">
                {client?.name || 'Personal/Internal'}
              </span>
            )}
          </div>

          <div>
            <label className="label">Type</label>
            {isEditing ? (
              <select
                className="input"
                value={editData.kind}
                onChange={(e) => setEditData({ ...editData, kind: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Planned">Planned</option>
              </select>
            ) : (
              <span className={`tag ${
                content.kind === 'Active' 
                  ? 'bg-[var(--success)] text-white' 
                  : 'bg-[var(--ring)]'
              }`}>
                {content.kind}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="label">Status</label>
          {isEditing ? (
            <select
              className="input"
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="At Risk">At Risk</option>
            </select>
          ) : (
            <span className="font-medium">{content.status}</span>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          {isEditing ? (
            <textarea
              className="input min-h-[100px]"
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            />
          ) : (
            <p className="text-sm text-muted">
              {content.description || 'No description'}
            </p>
          )}
        </div>

        {/* Progress */}
        <div>
          <label className="label">Progress</label>
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>{completedTasks.length} of {projectTasks.length} tasks completed</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--accent)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Next Step */}
        <div>
          <label className="label">Next Step</label>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                className="input"
                placeholder="What needs to happen next?"
                value={editData.nextStep || ''}
                onChange={(e) => setEditData({ ...editData, nextStep: e.target.value })}
              />
              <input
                type="date"
                className="input"
                value={editData.nextStepDue || ''}
                onChange={(e) => setEditData({ ...editData, nextStepDue: e.target.value })}
              />
            </div>
          ) : (
            <div>
              <p className="text-sm">{content.nextStep || 'No next step defined'}</p>
              {content.nextStepDue && (
                <p className="text-xs text-muted mt-1">
                  Due {dayjs(content.nextStepDue).format('MMM D, YYYY')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Related Tasks */}
        <div>
          <label className="label">Related Tasks ({projectTasks.length})</label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {projectTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-default">
                <span className="text-sm">{task.title}</span>
                <span className={`tag text-xs ${
                  task.status === 'Done' ? 'bg-[var(--success)] text-white' : ''
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
            {projectTasks.length > 5 && (
              <p className="text-xs text-muted">+{projectTasks.length - 5} more tasks</p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-default text-xs text-muted space-y-1">
          <div>Created: {dayjs(content.createdAt).format('MMM D, YYYY h:mm A')}</div>
          <div>Updated: {dayjs(content.updatedAt).format('MMM D, YYYY h:mm A')}</div>
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'task': return 'Task Details';
      case 'project': return 'Project Details';
      case 'client': return 'Client Details';
      case 'note': return 'Note Details';
      case 'opportunity': return 'Opportunity Details';
      case 'risk': return 'Risk Details';
      case 'issue': return 'Issue Details';
      default: return 'Details';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`drawer open`}>
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-6 border-b border-default">
          <h2 className="font-semibold">{getTitle()}</h2>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="btn btn-ghost text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(content);
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
                  onClick={handleDelete}
                  className="p-2 hover:bg-elevated rounded-lg transition-colors text-[var(--danger)]"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-elevated rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto h-[calc(100%-3.5rem)]">
          {type === 'task' && renderTaskDetails()}
          {type === 'project' && renderProjectDetails()}
          {/* Add other type renderers as needed */}
        </div>
      </div>
    </>
  );
}