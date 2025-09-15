import React, { useState } from 'react';
import {
  AlertTriangle, Shield, AlertCircle, CheckCircle,
  Plus, Filter, ChevronDown, User, Calendar, TrendingUp
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

type RAIDType = 'risks' | 'assumptions' | 'issues' | 'decisions';

export default function RAIDLog() {
  const {
    risks,
    assumptions,
    issues,
    decisions,
    clients,
    projects,
    createRisk,
    updateRisk,
    createIssue,
    updateIssue,
    createAssumption,
    updateAssumption,
    createDecision,
    updateDecision,
    openDrawer
  } = useStore();

  const [activeTab, setActiveTab] = useState<RAIDType>('risks');
  const [filterProject, setFilterProject] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<any>({
    type: 'risk',
    title: '',
    description: '',
    severity: 'Medium',
    likelihood: 'Medium',
    owner: '',
    projectId: '',
    clientId: ''
  });

  const tabs = [
    { id: 'risks', label: 'Risks', icon: AlertTriangle, color: 'text-[var(--danger)]', count: risks.length },
    { id: 'assumptions', label: 'Assumptions', icon: Shield, color: 'text-[var(--warn)]', count: assumptions.length },
    { id: 'issues', label: 'Issues', icon: AlertCircle, color: 'text-[var(--danger)]', count: issues.length },
    { id: 'decisions', label: 'Decisions', icon: CheckCircle, color: 'text-[var(--success)]', count: decisions.length }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-[var(--danger)] text-white';
      case 'Medium': return 'bg-[var(--warn)] text-[var(--bg)]';
      case 'Low': return 'bg-[var(--ring)]';
      default: return 'bg-[var(--ring)]';
    }
  };

  const getRiskScore = (severity: string, likelihood: string) => {
    const severityScore = { Low: 1, Medium: 2, High: 3 }[severity] || 1;
    const likelihoodScore = { Low: 1, Medium: 2, High: 3 }[likelihood] || 1;
    return severityScore * likelihoodScore;
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 6) return 'text-[var(--danger)]';
    if (score >= 3) return 'text-[var(--warn)]';
    return 'text-[var(--success)]';
  };

  const handleCreateItem = () => {
    const { type, ...itemData } = newItem;
    
    switch (type) {
      case 'risk':
        createRisk(itemData);
        break;
      case 'issue':
        createIssue(itemData);
        break;
      case 'assumption':
        createAssumption(itemData);
        break;
      case 'decision':
        createDecision(itemData);
        break;
    }
    
    setShowAddModal(false);
    setNewItem({
      type: 'risk',
      title: '',
      description: '',
      severity: 'Medium',
      likelihood: 'Medium',
      owner: '',
      projectId: '',
      clientId: ''
    });
  };

  const renderRisks = () => {
    const filteredRisks = risks.filter(r => {
      if (filterProject && r.projectId !== filterProject) return false;
      if (filterClient && r.clientId !== filterClient) return false;
      return true;
    });

    return (
      <div className="space-y-3">
        {filteredRisks.map(risk => {
          const project = projects.find(p => p.id === risk.projectId);
          const client = clients.find(c => c.id === risk.clientId);
          const score = getRiskScore(risk.severity, risk.likelihood);
          
          return (
            <div
              key={risk.id}
              className="card hover:shadow-lg transition-all cursor-pointer"
              onClick={() => openDrawer(risk)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{risk.title}</h4>
                  <div className="text-sm text-muted mt-1">
                    {client && <span className="sensitive">{client.name}</span>}
                    {client && project && ' • '}
                    {project && <span>{project.title}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`tag text-xs ${getSeverityColor(risk.severity)}`}>
                    {risk.severity}
                  </span>
                  <span className={`text-2xl font-bold ${getRiskScoreColor(score)}`}>
                    {score}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-muted mb-1">Mitigation</div>
                <p className="text-sm">{risk.mitigation || 'No mitigation defined'}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-muted">
                    <User size={14} />
                    {risk.owner || 'Unassigned'}
                  </span>
                  {risk.due && (
                    <span className="flex items-center gap-1 text-muted">
                      <Calendar size={14} />
                      {dayjs(risk.due).format('MMM D')}
                    </span>
                  )}
                </div>
                <span className={`tag text-xs ${
                  risk.status === 'Open' ? 'bg-[var(--danger)]' :
                  risk.status === 'Monitoring' ? 'bg-[var(--warn)]' :
                  'bg-[var(--success)]'
                } text-white`}>
                  {risk.status}
                </span>
              </div>
            </div>
          );
        })}
        
        {filteredRisks.length === 0 && (
          <div className="text-center py-12 text-muted">
            No risks recorded
          </div>
        )}
      </div>
    );
  };

  const renderIssues = () => {
    const filteredIssues = issues.filter(i => {
      if (filterProject && i.projectId !== filterProject) return false;
      if (filterClient && i.clientId !== filterClient) return false;
      return true;
    });

    return (
      <div className="space-y-3">
        {filteredIssues.map(issue => {
          const project = projects.find(p => p.id === issue.projectId);
          const client = clients.find(c => c.id === issue.clientId);
          
          return (
            <div
              key={issue.id}
              className="card hover:shadow-lg transition-all cursor-pointer"
              onClick={() => openDrawer(issue)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{issue.title}</h4>
                  <div className="text-sm text-muted mt-1">
                    {client && <span className="sensitive">{client.name}</span>}
                    {client && project && ' • '}
                    {project && <span>{project.title}</span>}
                  </div>
                </div>
                <span className={`tag text-xs ${getSeverityColor(issue.severity)}`}>
                  {issue.severity}
                </span>
              </div>

              <p className="text-sm text-muted mb-3">{issue.description}</p>

              {issue.resolution && (
                <div className="p-2 bg-[var(--success)] bg-opacity-10 rounded-lg mb-3">
                  <div className="text-xs font-medium text-[var(--success)] mb-1">Resolution</div>
                  <p className="text-sm">{issue.resolution}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted">
                  <User size={14} />
                  {issue.owner || 'Unassigned'}
                </span>
                <span className={`tag text-xs ${
                  issue.status === 'Open' ? 'bg-[var(--danger)]' :
                  issue.status === 'In Progress' ? 'bg-[var(--warn)]' :
                  'bg-[var(--success)]'
                } text-white`}>
                  {issue.status}
                </span>
              </div>
            </div>
          );
        })}
        
        {filteredIssues.length === 0 && (
          <div className="text-center py-12 text-muted">
            No issues recorded
          </div>
        )}
      </div>
    );
  };

  const renderAssumptions = () => {
    const filteredAssumptions = assumptions.filter(a => {
      if (filterProject && a.projectId !== filterProject) return false;
      if (filterClient && a.clientId !== filterClient) return false;
      return true;
    });

    return (
      <div className="space-y-3">
        {filteredAssumptions.map(assumption => {
          const project = projects.find(p => p.id === assumption.projectId);
          const client = clients.find(c => c.id === assumption.clientId);
          
          return (
            <div
              key={assumption.id}
              className="card hover:shadow-lg transition-all cursor-pointer"
              onClick={() => openDrawer(assumption)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{assumption.title}</h4>
                  <div className="text-sm text-muted mt-1">
                    {client && <span className="sensitive">{client.name}</span>}
                    {client && project && ' • '}
                    {project && <span>{project.title}</span>}
                  </div>
                </div>
                <span className={`tag text-xs ${
                  assumption.validated 
                    ? 'bg-[var(--success)] text-white' 
                    : 'bg-[var(--ring)]'
                }`}>
                  {assumption.validated ? 'Validated' : 'Unvalidated'}
                </span>
              </div>

              <p className="text-sm text-muted mb-3">{assumption.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted">
                  <User size={14} />
                  {assumption.owner || 'Unassigned'}
                </span>
                <span className="text-xs text-muted">
                  Created {dayjs(assumption.createdAt).format('MMM D')}
                </span>
              </div>
            </div>
          );
        })}
        
        {filteredAssumptions.length === 0 && (
          <div className="text-center py-12 text-muted">
            No assumptions recorded
          </div>
        )}
      </div>
    );
  };

  const renderDecisions = () => {
    const filteredDecisions = decisions.filter(d => {
      if (filterProject && d.projectId !== filterProject) return false;
      if (filterClient && d.clientId !== filterClient) return false;
      return true;
    });

    return (
      <div className="space-y-3">
        {filteredDecisions.map(decision => {
          const project = projects.find(p => p.id === decision.projectId);
          const client = clients.find(c => c.id === decision.clientId);
          
          return (
            <div
              key={decision.id}
              className="card hover:shadow-lg transition-all cursor-pointer"
              onClick={() => openDrawer(decision)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{decision.title}</h4>
                  <div className="text-sm text-muted mt-1">
                    {client && <span className="sensitive">{client.name}</span>}
                    {client && project && ' • '}
                    {project && <span>{project.title}</span>}
                  </div>
                </div>
                {decision.decidedOn && (
                  <span className="text-sm text-muted">
                    {dayjs(decision.decidedOn).format('MMM D')}
                  </span>
                )}
              </div>

              <div className="p-3 bg-elevated rounded-lg mb-3">
                <p className="text-sm">{decision.decisionText}</p>
              </div>

              {decision.impact && (
                <div className="mb-3">
                  <div className="text-xs font-medium text-muted mb-1">Impact</div>
                  <p className="text-sm">{decision.impact}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted">
                  <User size={14} />
                  {decision.owner || 'Unassigned'}
                </span>
                {decision.links && decision.links.length > 0 && (
                  <span className="text-xs text-[var(--accent)]">
                    {decision.links.length} link{decision.links.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        {filteredDecisions.length === 0 && (
          <div className="text-center py-12 text-muted">
            No decisions recorded
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-default">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle size={24} />
            RAID Log
          </h1>

          <div className="flex items-center gap-3">
            {/* Filters */}
            <select
              className="input text-sm"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>

            <select
              className="input text-sm"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn flex items-center gap-2"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as RAIDType)}
                className={`pb-2 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent'
                }`}
              >
                <Icon size={16} className={tab.color} />
                {tab.label}
                <span className="text-xs bg-[var(--ring)] px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'risks' && renderRisks()}
        {activeTab === 'issues' && renderIssues()}
        {activeTab === 'assumptions' && renderAssumptions()}
        {activeTab === 'decisions' && renderDecisions()}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="card w-[600px] p-6 animate-slideDown max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Add RAID Item</h2>
            
            <div className="mb-4">
              <label className="label">Type</label>
              <div className="grid grid-cols-4 gap-2">
                {['risk', 'issue', 'assumption', 'decision'].map(type => (
                  <button
                    key={type}
                    onClick={() => setNewItem({ ...newItem, type })}
                    className={`p-2 rounded-lg border capitalize transition-colors ${
                      newItem.type === type
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Client</label>
                <select
                  className="input"
                  value={newItem.clientId}
                  onChange={(e) => setNewItem({ ...newItem, clientId: e.target.value })}
                >
                  <option value="">Select client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">Project</label>
                <select
                  className="input"
                  value={newItem.projectId}
                  onChange={(e) => setNewItem({ ...newItem, projectId: e.target.value })}
                >
                  <option value="">Select project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Title</label>
              <input
                type="text"
                className="input"
                placeholder="Brief title..."
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="label">
                {newItem.type === 'decision' ? 'Decision' : 'Description'}
              </label>
              <textarea
                className="input min-h-[80px]"
                placeholder={
                  newItem.type === 'decision' 
                    ? 'What was decided...'
                    : 'Detailed description...'
                }
                value={newItem.type === 'decision' ? newItem.decisionText : newItem.description}
                onChange={(e) => setNewItem({ 
                  ...newItem, 
                  [newItem.type === 'decision' ? 'decisionText' : 'description']: e.target.value 
                })}
              />
            </div>

            {(newItem.type === 'risk' || newItem.type === 'issue') && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Severity</label>
                  <select
                    className="input"
                    value={newItem.severity}
                    onChange={(e) => setNewItem({ ...newItem, severity: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                {newItem.type === 'risk' && (
                  <div>
                    <label className="label">Likelihood</label>
                    <select
                      className="input"
                      value={newItem.likelihood}
                      onChange={(e) => setNewItem({ ...newItem, likelihood: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="label">Owner</label>
              <input
                type="text"
                className="input"
                placeholder="Responsible person..."
                value={newItem.owner}
                onChange={(e) => setNewItem({ ...newItem, owner: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({
                    type: 'risk',
                    title: '',
                    description: '',
                    severity: 'Medium',
                    likelihood: 'Medium',
                    owner: '',
                    projectId: '',
                    clientId: ''
                  });
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                className="btn"
                disabled={!newItem.title.trim()}
              >
                Add {newItem.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}