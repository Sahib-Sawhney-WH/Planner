import { useState } from 'react';
import {
  Users, Plus, Search, Phone, Mail,
  Globe, Star
} from 'lucide-react';
import { useStore } from '../../lib/store';

export default function ClientList() {
  const {
    clients,
    projects,
    tasks,
    opportunities,
    stakeholders,
    createClient,
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
      stakeholders: clientStakeholders.length,
      totalValue: clientOpps.reduce((sum, opp) => sum + (opp.value || 0), 0)
    };
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

  const allTags = Array.from(new Set(clients.flatMap(c => c.tags)));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-default">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="text-[var(--accent)]" size={28} />
            Clients
          </h1>
          <span className="text-muted">
            {filteredClients.length} of {clients.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Search clients..."
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

          {/* Add client */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn"
          >
            <Plus size={16} />
            Add Client
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => {
            const metrics = getClientMetrics(client.id);
            
            return (
              <div
                key={client.id}
                className="card p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => openDrawer(client, 'client')}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white font-semibold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      {client.industry && (
                        <p className="text-sm text-muted">{client.industry}</p>
                      )}
                    </div>
                  </div>
                  
                  {client.isKeyAccount && (
                    <Star className="text-[var(--warn)]" size={20} fill="currentColor" />
                  )}
                </div>

                {/* Contact info */}
                <div className="space-y-2 mb-4">
                  {client.website && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Globe size={14} />
                      <span>{client.website}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Phone size={14} />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Mail size={14} />
                      <span>{client.email}</span>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[var(--accent)]">
                      {metrics.activeProjects}
                    </div>
                    <div className="text-xs text-muted">Active Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[var(--accent)]">
                      {metrics.openTasks}
                    </div>
                    <div className="text-xs text-muted">Open Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[var(--success)]">
                      ${metrics.totalValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted">Pipeline Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {metrics.stakeholders}
                    </div>
                    <div className="text-xs text-muted">Contacts</div>
                  </div>
                </div>

                {/* Tags */}
                {client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {client.tags.map(tag => (
                      <span key={tag} className="tag text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add client modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-96 p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Client</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Client name..."
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="input w-full"
                autoFocus
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={`tag text-xs cursor-pointer ${
                        selectedTags.includes(tag) ? 'bg-[var(--accent)] text-white' : ''
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                className="btn"
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

