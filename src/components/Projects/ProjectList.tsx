import { useState } from 'react';
import {
  Briefcase, Plus, Search, Calendar,
  Target, Clock
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from '../../lib/dayjs-config';

export default function ProjectList() {
  const {
    projects,
    clients,
    tasks,
    opportunities,
    createProject,
    openDrawer
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectClientId, setNewProjectClientId] = useState('');

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || project.kind === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddProject = () => {
    if (newProjectTitle.trim()) {
      createProject({
        title: newProjectTitle,
        clientId: newProjectClientId || undefined,
        kind: 'Active'
      });
      setNewProjectTitle('');
      setNewProjectClientId('');
      setShowAddModal(false);
    }
  };

  const getProjectMetrics = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const projectOpps = opportunities.filter(o => o.projectId === projectId);
    
    return {
      tasks: projectTasks.length,
      completedTasks: projectTasks.filter(t => t.status === 'Done').length,
      opportunities: projectOpps.length,
      totalValue: projectOpps.reduce((sum, opp) => sum + (opp.value || 0), 0)
    };
  };

  const statusOptions = ['Active', 'On Hold', 'Completed', 'Cancelled'];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-default">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Briefcase className="text-[var(--accent)]" size={28} />
            Projects
          </h1>
          <span className="text-muted">
            {filteredProjects.length} of {projects.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-40"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Add project */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn"
          >
            <Plus size={16} />
            Add Project
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => {
            const client = clients.find(c => c.id === project.clientId);
            const metrics = getProjectMetrics(project.id);
            const completionRate = metrics.tasks > 0 ? (metrics.completedTasks / metrics.tasks) * 100 : 0;
            
            return (
              <div
                key={project.id}
                className="card p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => openDrawer(project, 'project')}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                    {client && (
                      <p className="text-sm text-muted sensitive">{client.name}</p>
                    )}
                  </div>
                  
                  <span className={`tag text-xs ${
                    project.kind === 'Active' ? 'bg-[var(--success)] text-white' :
                    project.kind === 'On Hold' ? 'bg-[var(--warn)] text-white' :
                    project.kind === 'Completed' ? 'bg-[var(--accent)] text-white' :
                    'bg-[var(--ring)]'
                  }`}>
                    {project.kind}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-muted mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted">{completionRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-[var(--accent)] h-2 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[var(--accent)]">
                      {metrics.tasks}
                    </div>
                    <div className="text-xs text-muted">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[var(--success)]">
                      ${metrics.totalValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted">Value</div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-1 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    <span>Started {dayjs(project.createdAt).format('MMM D, YYYY')}</span>
                  </div>
                  {project.dueDate && (
                    <div className="flex items-center gap-2">
                      <Target size={12} />
                      <span>Due {dayjs(project.dueDate).format('MMM D, YYYY')}</span>
                    </div>
                  )}
                  {project.updatedAt && project.updatedAt !== project.createdAt && (
                    <div className="flex items-center gap-2">
                      <Clock size={12} />
                      <span>Updated {dayjs(project.updatedAt).fromNow()}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {project.tags.map(tag => (
                      <span key={tag} className="tag text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center text-muted py-12">
            {searchQuery || filterStatus ? 'No projects match your filters' : 'No projects yet'}
          </div>
        )}
      </div>

      {/* Add project modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-96 p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Project</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Project title..."
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                className="input w-full"
                autoFocus
              />
              
              <select
                value={newProjectClientId}
                onChange={(e) => setNewProjectClientId(e.target.value)}
                className="input w-full"
              >
                <option value="">Select client (optional)</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="btn"
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

