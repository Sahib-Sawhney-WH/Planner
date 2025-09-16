import { useState } from 'react';
import {
  AlertTriangle, Plus, Search,
  Shield, Bug, AlertCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from '../../lib/dayjs-config';

export default function RAIDLog() {
  const {
    risks,
    issues,
    assumptions,
    dependencies,
    createRisk,
    createIssue,
    createAssumption,
    createDependency,
    openDrawer
  } = useStore();

  const [activeTab, setActiveTab] = useState<'risks' | 'issues' | 'assumptions' | 'dependencies'>('risks');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  const tabs = [
    { id: 'risks', label: 'Risks', icon: AlertTriangle, count: risks.length },
    { id: 'issues', label: 'Issues', icon: Bug, count: issues.length },
    { id: 'assumptions', label: 'Assumptions', icon: AlertCircle, count: assumptions.length },
    { id: 'dependencies', label: 'Dependencies', icon: Shield, count: dependencies.length },
  ];

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'risks': return risks;
      case 'issues': return issues;
      case 'assumptions': return assumptions;
      case 'dependencies': return dependencies;
      default: return [];
    }
  };

  const filteredItems = getCurrentItems().filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || 
      ((item as any).impact === filterPriority || (item as any).priority === filterPriority);
    return matchesSearch && matchesPriority;
  });

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      const baseData = {
        title: newItemTitle,
        description: newItemDescription,
        status: 'Open' as const
      };

      switch (activeTab) {
        case 'risks':
          createRisk({
            ...baseData,
            impact: 'Medium' as const,
            probability: 'Medium' as const
          });
          break;
        case 'issues':
          createIssue({
            ...baseData,
            priority: 'Medium' as const
          });
          break;
        case 'assumptions':
          createAssumption({
            ...baseData,
            priority: 'Medium' as const
          });
          break;
        case 'dependencies':
          createDependency({
            ...baseData,
            priority: 'Medium' as const
          });
          break;
      }

      setNewItemTitle('');
      setNewItemDescription('');
      setShowAddModal(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-[var(--danger)]';
      case 'Medium': return 'text-[var(--warn)]';
      case 'Low': return 'text-[var(--success)]';
      default: return 'text-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-[var(--danger)] text-white';
      case 'In Progress': return 'bg-[var(--warn)] text-white';
      case 'Resolved': return 'bg-[var(--success)] text-white';
      case 'Closed': return 'bg-[var(--ring)]';
      default: return 'bg-[var(--ring)]';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-default">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <AlertTriangle className="text-[var(--accent)]" size={28} />
            RAID Log
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input w-32"
          >
            <option value="">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Add item */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn"
          >
            <Plus size={16} />
            Add {activeTab.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-default">
        <nav className="flex px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent hover:text-[var(--text)]'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                <span className="bg-elevated px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="card p-6 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => openDrawer(item, activeTab.slice(0, -1) as any)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-muted line-clamp-2">{item.description}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <span className={`tag text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {((item as any).impact || (item as any).priority) && (
                  <div>
                    <span className="text-xs text-muted block">
                      {activeTab === 'risks' ? 'Impact' : 'Priority'}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor((item as any).impact || (item as any).priority)}`}>
                      {(item as any).impact || (item as any).priority}
                    </span>
                  </div>
                )}
                
                {(item as any).probability && (
                  <div>
                    <span className="text-xs text-muted block">Probability</span>
                    <span className={`text-sm font-medium ${getPriorityColor((item as any).probability)}`}>
                      {(item as any).probability}
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="text-xs text-muted block">Created</span>
                  <span className="text-sm">{dayjs(item.createdAt).format('MMM D')}</span>
                </div>
              </div>

              {/* Owner and due date */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  {item.owner && (
                    <span className="text-muted">
                      Owner: <span className="text-[var(--text)]">{item.owner}</span>
                    </span>
                  )}
                  {item.dueDate && (
                    <span className="text-muted">
                      Due: <span className="text-[var(--text)]">{dayjs(item.dueDate).format('MMM D, YYYY')}</span>
                    </span>
                  )}
                </div>
                
                {item.updatedAt && item.updatedAt !== item.createdAt && (
                  <span className="text-muted">
                    Updated {dayjs(item.updatedAt).fromNow()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center text-muted py-12">
            {searchQuery || filterPriority ? `No ${activeTab} match your filters` : `No ${activeTab} yet`}
          </div>
        )}
      </div>

      {/* Add item modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-[600px] p-6">
            <h3 className="text-lg font-semibold mb-4">
              Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
            </h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="input w-full"
                autoFocus
              />
              
              <textarea
                placeholder="Description..."
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                className="input w-full h-24 resize-none"
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
                onClick={handleAddItem}
                className="btn"
              >
                Add {activeTab.slice(0, -1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

