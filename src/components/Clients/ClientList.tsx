import React, { useState } from 'react';
import {
  Users, Plus, Search, Building2, Phone, Mail,
  Globe, ChevronRight, MapPin, Clock, Star
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

export default function ClientList() {
  const {
    clients,
    projects,
    tasks,
    opportunities,
    stakeholders,
    createClient,
    updateClient,
    openDrawer
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || client.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Get client metrics
  const getClientMetrics = (clientId: string) => {
    const clientProjects = projects.filter(p => p.clientId === clientId);
    const clientTasks = tasks.filter(t => t.clientId === clientId);
    const clientOpps = opportunities.filter(o => o.clientId === clientId);
    const clientStakeholders = stakeholders.filter(s => s.clientId === clientId);
    
    return {
      projects: clientProjects.length,
      activeProjects: clientProjects.filter(p => p.kind === 'Active').length,
      tasks: clientTasks.length,
      openTasks: clientTasks.filter(t => t.status !== 'Done').length,
      opportunities: clientOpps.length,
      pipelineValue: clientOpps.reduce((sum, o) => sum + (o.amount || 0) * o.probability, 0),
      stakeholders: clientStakeholders.length,
      keyStakeholder: clientStakeholders.find(s => s.influence === 5)
    };
  };

  const getTagColor = (tag: string) => {
    if (tag.includes('Signed')) return 'tag-signed';
    if (tag.includes('Pre-sales')) return 'tag-presales';
    if (tag.includes('Sales')) return 'tag-impl';
    return 'tag';
  };

  const handleAddClient = () => {
    if (newClientName.trim()) {
      createClient({
        name: newClientName,
        tags: selectedTags
      });
      setNewClientName('');
      setSelectedTags([]);
      setShowAddModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-default">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Users size={24} />
            Clients
            <span className="text-sm text-muted ml-2">({clients.length})</span>
          </h1>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search clients..."
                className="input pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tag filter */}
            <select
              className="input"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="">All Tags</option>
              <option value="Signed">Signed</option>
              <option value="Pre-sales">Pre-sales</option>
              <option value="Sales pursuit">Sales pursuit</option>
              <option value="Enterprise">Enterprise</option>
              <option value="SMB">SMB</option>
            </select>

            {/* Add client */}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn flex items-center gap-2"
            >
              <Plus size={16} />
              Add Client
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted">
            <span className="font-medium text-[var(--text)]">
              {clients.filter(c => c.tags.includes('Signed')).length}
            </span> Active
          </span>
          <span className="text-muted">
            <span className="font-medium text-[var(--text)]">
              {clients.filter(c => c.tags.includes('Pre-sales')).length}
            </span> Pre-sales
          </span>
          <span className="text-muted">
            <span className="font-medium text-[var(--text)]">
              {clients.filter(c => c.tags.includes('Sales pursuit')).length}
            </span> Pursuits
          </span>
        </div>
      </div>

      {/* Client grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map(client => {
            const metrics = getClientMetrics(client.id);
            
            return (
              <div
                key={client.id}
                className="card hover:shadow-lg transition-all cursor-pointer"
                onClick={() => openDrawer(client)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg sensitive">{client.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {client.tags.map(tag => (
                        <span key={tag} className={`tag text-xs ${getTagColor(tag)}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Building2 size={20} className="text-muted" />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-3 pb-3 border-b border-default">
                  <div>
                    <div className="text-xs text-muted">Projects</div>
                    <div className="font-semibold">
                      {metrics.activeProjects}/{metrics.projects}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Tasks</div>
                    <div className="font-semibold">
                      {metrics.openTasks}/{metrics.tasks}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Pipeline</div>
                    <div className="font-semibold">
                      ${(metrics.pipelineValue / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>

                {/* Next step */}
                {client.nextStep && (
                  <div className="mb-3">
                    <div className="text-xs text-muted mb-1">Next Step</div>
                    <div className="text-sm">{client.nextStep}</div>
                    {client.nextStepDue && (
                      <div className="text-xs text-muted mt-1">
                        Due {dayjs(client.nextStepDue).format('MMM D')}
                      </div>
                    )}
                  </div>
                )}

                {/* Key stakeholder */}
                {metrics.keyStakeholder && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-[var(--warn)]" />
                      <span className="sensitive">{metrics.keyStakeholder.name}</span>
                    </div>
                    <span className="text-xs text-muted">
                      {metrics.keyStakeholder.role}
                    </span>
                  </div>
                )}

                {/* Quick actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-default">
                  {client.contacts[0]?.email && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${client.contacts[0].email}`;
                      }}
                      className="p-1.5 hover:bg-elevated rounded transition-colors"
                      title="Email"
                    >
                      <Mail size={14} />
                    </button>
                  )}
                  {client.contacts[0]?.phone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${client.contacts[0].phone}`;
                      }}
                      className="p-1.5 hover:bg-elevated rounded transition-colors"
                      title="Call"
                    >
                      <Phone size={14} />
                    </button>
                  )}
                  {client.links[0] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(client.links[0], '_blank');
                      }}
                      className="p-1.5 hover:bg-elevated rounded transition-colors"
                      title="Website"
                    >
                      <Globe size={14} />
                    </button>
                  )}
                  <div className="flex-1" />
                  <span className="text-xs text-muted">
                    {metrics.stakeholders} contacts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="text-muted mx-auto mb-4 opacity-20" />
            <p className="text-muted">
              {searchQuery || filterTag ? 'No clients match your filters' : 'No clients yet'}
            </p>
            {!searchQuery && !filterTag && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn mt-4"
              >
                Add Your First Client
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add client modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="card w-[500px] p-6 animate-slideDown">
            <h2 className="text-lg font-semibold mb-4">Add New Client</h2>
            
            <div className="mb-4">
              <label className="label">Client Name</label>
              <input
                type="text"
                className="input"
                placeholder="Enter client name..."
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="label">Tags</label>
              <div className="flex flex-wrap gap-2">
                {['Sales pursuit', 'Pre-sales', 'Signed', 'Enterprise', 'SMB'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`tag ${
                      selectedTags.includes(tag) ? getTagColor(tag) : ''
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewClientName('');
                  setSelectedTags([]);
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                className="btn"
                disabled={!newClientName.trim()}
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}