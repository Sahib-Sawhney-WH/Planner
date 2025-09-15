import React, { useState } from 'react';
import {
  CheckSquare, Plus, Filter, Grid3x3, List, Calendar,
  ArrowUpDown, MoreVertical, Clock, Tag, Link,
  Trash2, Edit, Copy, Archive, ChevronDown, Target
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

export default function TaskList() {
  const {
    tasks,
    clients,
    projects,
    createTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    setTaskFilter,
    taskFilter,
    openDrawer
  } = useStore();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'score' | 'due' | 'priority'>('score');
  const [filterOpen, setFilterOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.score - a.score;
      case 'due':
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1;
        if (!b.due) return -1;
        return new Date(a.due).getTime() - new Date(b.due).getTime();
      case 'priority':
        return b.priority - a.priority;
      default:
        return 0;
    }
  });

  // Group tasks by status for kanban
  const tasksByStatus = {
    Inbox: sortedTasks.filter(t => t.status === 'Inbox'),
    Todo: sortedTasks.filter(t => t.status === 'Todo'),
    Doing: sortedTasks.filter(t => t.status === 'Doing'),
    Blocked: sortedTasks.filter(t => t.status === 'Blocked'),
    Done: sortedTasks.filter(t => t.status === 'Done')
  };

  const handleQuickAdd = () => {
    if (quickAddTitle.trim()) {
      createTask({
        title: quickAddTitle,
        status: 'Inbox'
      });
      setQuickAddTitle('');
      setQuickAddOpen(false);
    }
  };

  const handleBulkAction = (action: string) => {
    const ids = Array.from(selectedTasks);
    switch (action) {
      case 'done':
        bulkUpdateTasks(ids, { status: 'Done' });
        break;
      case 'todo':
        bulkUpdateTasks(ids, { status: 'Todo' });
        break;
      case 'delete':
        ids.forEach(id => deleteTask(id));
        break;
    }
    setSelectedTasks(new Set());
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return 'status-todo';
      case 'Doing': return 'status-doing';
      case 'Blocked': return 'status-blocked';
      case 'Done': return 'status-done';
      default: return 'bg-[var(--ring)]';
    }
  };

  const getDueDateChip = (due?: string) => {
    if (!due) return null;
    const dueDate = dayjs(due);
    const today = dayjs();
    
    if (dueDate.isBefore(today, 'day')) {
      return <span className="chip-overdue">{dueDate.format('MMM D')}</span>;
    } else if (dueDate.diff(today, 'day') <= 3) {
      return <span className="chip-soon">{dueDate.format('MMM D')}</span>;
    } else {
      return <span className="chip-date">{dueDate.format('MMM D')}</span>;
    }
  };

  const renderTaskRow = (task: any) => (
    <div
      key={task.id}
      className={`row group ${selectedTasks.has(task.id) ? 'selected' : ''}`}
    >
      <input
        type="checkbox"
        checked={selectedTasks.has(task.id)}
        onChange={() => toggleTaskSelection(task.id)}
        className="rounded"
      />
      
      <input
        type="checkbox"
        checked={task.status === 'Done'}
        onChange={() => updateTask(task.id, {
          status: task.status === 'Done' ? 'Todo' : 'Done'
        })}
        className="rounded"
      />

      <span className={`status-dot ${getStatusColor(task.status)}`} />

      <div 
        className="flex-1 cursor-pointer"
        onClick={() => openDrawer(task)}
      >
        <div className="flex items-center gap-2">
          <span className={task.status === 'Done' ? 'line-through opacity-50' : ''}>
            {task.title}
          </span>
          {task.isNextStep && (
            <Target size={14} className="text-[var(--accent)]" />
          )}
        </div>
        <div className="flex items-center gap-4 mt-1">
          {task.clientId && (
            <span className="text-xs text-muted sensitive">
              {clients.find(c => c.id === task.clientId)?.name}
            </span>
          )}
          {task.projectId && (
            <span className="text-xs text-muted">
              {projects.find(p => p.id === task.projectId)?.title}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {task.tags.map((tag: string) => (
          <span key={tag} className="tag text-xs">{tag}</span>
        ))}
        {getDueDateChip(task.due)}
        <span className="ice-score">{task.score.toFixed(1)}</span>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-elevated rounded">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderKanbanColumn = (status: string, tasks: any[]) => (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="font-medium flex items-center gap-2">
          <span className={`status-dot ${getStatusColor(status)}`} />
          {status}
        </h3>
        <span className="text-sm text-muted">{tasks.length}</span>
      </div>
      
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className="card p-3 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => openDrawer(task)}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium">{task.title}</span>
              {task.isNextStep && (
                <Target size={14} className="text-[var(--accent)] flex-shrink-0 ml-2" />
              )}
            </div>
            
            {(task.clientId || task.projectId) && (
              <div className="text-xs text-muted mb-2">
                {task.clientId && (
                  <span className="sensitive">
                    {clients.find(c => c.id === task.clientId)?.name}
                  </span>
                )}
                {task.clientId && task.projectId && ' • '}
                {task.projectId && (
                  <span>{projects.find(p => p.id === task.projectId)?.title}</span>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {task.tags.slice(0, 2).map((tag: string) => (
                  <span key={tag} className="tag text-xs">{tag}</span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-muted">+{task.tags.length - 2}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getDueDateChip(task.due)}
                <span className="text-xs font-medium text-[var(--accent)]">
                  {task.score.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-default">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <CheckSquare size={24} />
            Tasks
          </h1>
          
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-elevated rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-[var(--accent)] text-white' : ''
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'kanban' ? 'bg-[var(--accent)] text-white' : ''
                }`}
              >
                <Grid3x3 size={16} />
              </button>
            </div>

            {/* Sort */}
            <button
              onClick={() => {
                const nextSort = sortBy === 'score' ? 'due' : sortBy === 'due' ? 'priority' : 'score';
                setSortBy(nextSort);
              }}
              className="btn btn-ghost flex items-center gap-2"
            >
              <ArrowUpDown size={16} />
              Sort: {sortBy}
            </button>

            {/* Filter */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="btn btn-ghost flex items-center gap-2"
            >
              <Filter size={16} />
              Filter
              {(taskFilter.status || taskFilter.clientId || taskFilter.projectId) && (
                <span className="w-2 h-2 bg-[var(--accent)] rounded-full" />
              )}
            </button>

            {/* Quick add */}
            <button
              onClick={() => setQuickAddOpen(true)}
              className="btn flex items-center gap-2"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {/* Active filters */}
        {(taskFilter.status || taskFilter.clientId || taskFilter.projectId) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Active filters:</span>
            {taskFilter.status && (
              <span className="tag text-xs">
                Status: {taskFilter.status}
                <button
                  onClick={() => setTaskFilter({ ...taskFilter, status: undefined })}
                  className="ml-1"
                >
                  ×
                </button>
              </span>
            )}
            {taskFilter.clientId && (
              <span className="tag text-xs">
                Client: {clients.find(c => c.id === taskFilter.clientId)?.name}
                <button
                  onClick={() => setTaskFilter({ ...taskFilter, clientId: undefined })}
                  className="ml-1"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'list' ? (
          <div>
            {sortedTasks.map(renderTaskRow)}
          </div>
        ) : (
          <div className="flex gap-4 p-6 h-full">
            {Object.entries(tasksByStatus).map(([status, tasks]) => 
              renderKanbanColumn(status, tasks)
            )}
          </div>
        )}
      </div>

      {/* Bulk actions footer */}
      {selectedTasks.size > 0 && (
        <div className="h-14 px-6 border-t border-default flex items-center justify-between bg-elevated">
          <span className="text-sm text-muted">
            {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('done')}
              className="btn btn-ghost text-sm"
            >
              Mark Done
            </button>
            <button
              onClick={() => handleBulkAction('todo')}
              className="btn btn-ghost text-sm"
            >
              Mark Todo
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn btn-ghost text-sm text-[var(--danger)]"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedTasks(new Set())}
              className="btn btn-ghost text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quick add modal */}
      {quickAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="card w-[500px] p-6 animate-slideDown">
            <h2 className="text-lg font-semibold mb-4">Quick Add Task</h2>
            <input
              type="text"
              className="input mb-4"
              placeholder="Task title..."
              value={quickAddTitle}
              onChange={(e) => setQuickAddTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setQuickAddOpen(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickAdd}
                className="btn"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter dropdown */}
      {filterOpen && (
        <div className="absolute right-6 top-20 card w-[300px] p-4 z-30 animate-slideDown">
          <h3 className="font-medium mb-3">Filter Tasks</h3>
          
          <div className="mb-3">
            <label className="label">Status</label>
            <select
              className="input"
              value={taskFilter.status || ''}
              onChange={(e) => setTaskFilter({ ...taskFilter, status: e.target.value as any || undefined })}
            >
              <option value="">All</option>
              <option value="Inbox">Inbox</option>
              <option value="Todo">Todo</option>
              <option value="Doing">Doing</option>
              <option value="Blocked">Blocked</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="label">Client</label>
            <select
              className="input"
              value={taskFilter.clientId || ''}
              onChange={(e) => setTaskFilter({ ...taskFilter, clientId: e.target.value || undefined })}
            >
              <option value="">All</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="label">Project</label>
            <select
              className="input"
              value={taskFilter.projectId || ''}
              onChange={(e) => setTaskFilter({ ...taskFilter, projectId: e.target.value || undefined })}
            >
              <option value="">All</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setTaskFilter({});
              setFilterOpen(false);
            }}
            className="w-full btn btn-ghost text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}