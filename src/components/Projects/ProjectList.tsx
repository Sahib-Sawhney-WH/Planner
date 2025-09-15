import React, { useState } from 'react';
import {
  Briefcase, Plus, Calendar, Target, AlertCircle,
  Clock, Users, ChevronRight, Activity, Layers
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

export default function ProjectList() {
  const {
    projects,
    clients,
    tasks,
    createProject,
    updateProject,
    deleteProject,
    projectFilter,
    setProjectFilter,
    openDrawer
  } = useStore();

  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    clientId: '',
    kind: 'Planned' as 'Active' | 'Planned',
    description: ''
  });

  // Get project metrics
  const getProjectMetrics = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const completedTasks = projectTasks.filter(t => t.status === 'Done');
    const blockedTasks = projectTasks.filter(t => t.status === 'Blocked');
    
    return {
      total: projectTasks.length,
      completed: completedTasks.length,
      blocked: blockedTasks.length,
      progress: projectTasks.length > 0 
        ? Math.round((completedTasks.length / projectTasks.length) * 100)
        : 0
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'text-muted';
      case 'In Progress': return 'text-[var(--todo)]';
      case 'On Hold': return 'text-[var(--warn)]';
      case 'Completed': return 'text-[var(--done)]';
      case 'At Risk': return 'text-[var(--danger)]';
      default: return 'text-muted';
    }
  };

  const handleCreateProject = () => {
    if (newProject.title.trim()) {
      createProject(newProject);
      setNewProject({
        title: '',
        clientId: '',
        kind: 'Planned',
        description: ''
      });
      setShowAddModal(false);
    }
  };

  const renderProjectCard = (project: any) => {
    const metrics = getProjectMetrics(project.id);
    const client = clients.find(c => c.id === project.clientId);
    
    return (
      <div
        key={project.id}
        className="card hover:shadow-lg transition-all cursor-pointer"
        onClick={() => openDrawer(project)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{project.title}</h3>
            {client && (
              <span className="text-sm text-muted sensitive">{client.name}</span>
            )}
          </div>
          <span className={`text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.map((tag: string) => (
            <span key={tag} className="tag text-xs">{tag}</span>
          ))}
          <span className={`tag text-xs ${
            project.kind === 'Active' ? 'bg-[var(--success)]' : 'bg-[var(--ring)]'
          } text-white`}>
            {project.kind}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">Progress</span>
            <span className="text-xs font-medium">{metrics.progress}%</span>
          </div>
          <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${metrics.progress}%` }}
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-3 pb-3 border-b border-default">
          <div>
            <div className="text-xs text-muted">Tasks</div>
            <div className="font-semibold">{metrics.total}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Completed</div>
            <div className="font-semibold text-[var(--success)]">{metrics.completed}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Blocked</div>
            <div className="font-semibold text-[var(--danger)]">{metrics.blocked}</div>
          </div>
        </div>

        {/* Next step */}
        {project.nextStep && (
          <div className="p-2 bg-elevated rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-[var(--accent)]" />
              <span className="text-xs font-medium">Next Step</span>
            </div>
            <p className="text-sm">{project.nextStep}</p>
            {project.nextStepDue && (
              <span className={`text-xs mt-1 inline-block ${
                dayjs(project.nextStepDue).isBefore(dayjs()) 
                  ? 'text-[var(--danger)]' 
                  : 'text-muted'
              }`}>
                Due {dayjs(project.nextStepDue).format('MMM D')}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTimeline = () => {
    // Group projects by month
    const projectsByMonth = projects.reduce((acc, project) => {
      const month = project.nextStepDue 
        ? dayjs(project.nextStepDue).format('YYYY-MM')
        : 'No Date';
      
      if (!acc[month]) acc[month] = [];
      acc[month].push(project);
      return acc;
    }, {} as Record<string, any[]>);

    return (
      <div className="space-y-6">
        {Object.entries(projectsByMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, monthProjects]) => (
            <div key={month}>
              <h3 className="font-medium mb-3 text-muted">
                {month === 'No Date' ? 'Unscheduled' : dayjs(month).format('MMMM YYYY')}
              </h3>
              <div className="space-y-2 border-l-2 border-[var(--border)] pl-4">
                {monthProjects.map(project => {
                  const metrics = getProjectMetrics(project.id);
                  
                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-elevated transition-all cursor-pointer"
                      onClick={() => openDrawer(project)}
                    >
                      <div className="w-3 h-3 bg-[var(--accent)] rounded-full -ml-[1.375rem]" />
                      <div className="flex-1">
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted">
                          {clients.find(c => c.id === project.clientId)?.name || 'Personal'}
                        </div>
                      </div>
                      <div className="text-sm text-muted">
                        {metrics.completed}/{metrics.total} tasks
                      </div>
                      <span className={`text-sm ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-default">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase size={24} />
            Projects
            <span className="text-sm text-muted ml-2">
              ({projects.filter(p => p.kind === 'Active').length} active)
            </span>
          </h1>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center bg-elevated rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  viewMode === 'cards' ? 'bg-[var(--accent)] text-white' : ''
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  viewMode === 'timeline' ? 'bg-[var(--accent)] text-white' : ''
                }`}
              >
                Timeline
              </button>
            </div>

            {/* Filter */}
            <select
              className="input"
              value={projectFilter.kind || ''}
              onChange={(e) => setProjectFilter({ 
                kind: e.target.value as 'Active' | 'Planned' || undefined 
              })}
            >
              <option value="">All Projects</option>
              <option value="Active">Active</option>
              <option value="Planned">Planned</option>
            </select>

            {/* Add project */}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn flex items-center gap-2"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setProjectFilter({ kind: 'Active' })}
            className={`pb-2 border-b-2 transition-colors ${
              projectFilter.kind === 'Active'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent'
            }`}
          >
            Active ({projects.filter(p => p.kind === 'Active').length})
          </button>
          <button
            onClick={() => setProjectFilter({ kind: 'Planned' })}
            className={`pb-2 border-b-2 transition-colors ${
              projectFilter.kind === 'Planned'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent'
            }`}
          >
            Planned ({projects.filter(p => p.kind === 'Planned').length})
          </button>
          <button
            onClick={() => setProjectFilter({})}
            className={`pb-2 border-b-2 transition-colors ${
              !projectFilter.kind
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent'
            }`}
          >
            All ({projects.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects
              .filter(p => !projectFilter.kind || p.kind === projectFilter.kind)
              .map(renderProjectCard)}
          </div>
        ) : (
          renderTimeline()
        )}

        {projects.length === 0 && (
          <div className="text-center py-12">
            <Briefcase size={48} className="text-muted mx-auto mb-4 opacity-20" />
            <p className="text-muted">No projects yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn mt-4"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>

      {/* Add project modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="card w-[600px] p-6 animate-slideDown">
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Project Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter project name..."
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="label">Client</label>
                <select
                  className="input"
                  value={newProject.clientId}
                  onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                >
                  <option value="">Personal/Internal</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Description</label>
              <textarea
                className="input min-h-[100px]"
                placeholder="Project description..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="label">Project Type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewProject({ ...newProject, kind: 'Active' })}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    newProject.kind === 'Active'
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'border-[var(--border)]'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setNewProject({ ...newProject, kind: 'Planned' })}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    newProject.kind === 'Planned'
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'border-[var(--border)]'
                  }`}
                >
                  Planned
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewProject({
                    title: '',
                    clientId: '',
                    kind: 'Planned',
                    description: ''
                  });
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="btn"
                disabled={!newProject.title.trim()}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}