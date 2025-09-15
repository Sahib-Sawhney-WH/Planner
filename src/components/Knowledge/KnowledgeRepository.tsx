import React, { useState } from 'react';
import {
  BookOpen, Plus, Search, ExternalLink, Tag, Clock,
  FileText, Video, Github, HelpCircle, Link, Filter
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

export default function KnowledgeRepository() {
  const {
    knowledgeItems,
    createKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    url: '',
    description: '',
    tags: [] as string[],
    sourceType: 'other' as any
  });

  // Get all unique tags
  const allTags = Array.from(new Set(knowledgeItems.flatMap(k => k.tags)));

  // Filter items
  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !filterType || item.sourceType === filterType;
    const matchesTag = !filterTag || item.tags.includes(filterTag);
    return matchesSearch && matchesType && matchesTag;
  });

  // Group by source type
  const itemsByType = {
    howto: filteredItems.filter(i => i.sourceType === 'howto'),
    article: filteredItems.filter(i => i.sourceType === 'article'),
    docs: filteredItems.filter(i => i.sourceType === 'docs'),
    github: filteredItems.filter(i => i.sourceType === 'github'),
    video: filteredItems.filter(i => i.sourceType === 'video'),
    other: filteredItems.filter(i => i.sourceType === 'other')
  };

  const sourceTypeIcons = {
    howto: HelpCircle,
    article: FileText,
    docs: BookOpen,
    github: Github,
    video: Video,
    other: Link
  };

  const sourceTypeColors = {
    howto: 'text-[var(--success)]',
    article: 'text-[var(--todo)]',
    docs: 'text-[var(--accent)]',
    github: 'text-[var(--muted)]',
    video: 'text-[var(--danger)]',
    other: 'text-[var(--subtle)]'
  };

  const handleCreateItem = () => {
    if (newItem.title.trim() && newItem.url.trim()) {
      createKnowledgeItem(newItem);
      setNewItem({
        title: '',
        url: '',
        description: '',
        tags: [],
        sourceType: 'other'
      });
      setShowAddModal(false);
    }
  };

  const handleOpenUrl = (url: string, itemId: string) => {
    window.open(url, '_blank');
    // Update last accessed time
    updateKnowledgeItem(itemId, {
      lastAccessedAt: new Date().toISOString()
    });
  };

  const renderKnowledgeCard = (item: any) => {
    const Icon = sourceTypeIcons[item.sourceType];
    const colorClass = sourceTypeColors[item.sourceType];
    
    return (
      <div
        key={item.id}
        className="card hover:shadow-lg transition-all group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <Icon size={20} className={`${colorClass} mt-1`} />
            <div className="flex-1">
              <h4 className="font-medium mb-1">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-muted mb-2">{item.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>{new URL(item.url).hostname}</span>
                <span>•</span>
                <span>Accessed {dayjs(item.lastAccessedAt).fromNow()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.map((tag: string) => (
            <span key={tag} className="tag text-xs">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => handleOpenUrl(item.url, item.id)}
            className="btn btn-ghost text-sm flex items-center gap-2"
          >
            <ExternalLink size={14} />
            Open Link
          </button>
          
          <button
            onClick={() => {
              if (confirm('Delete this knowledge item?')) {
                deleteKnowledgeItem(item.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 text-[var(--danger)] p-2 hover:bg-elevated rounded-lg transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const typeStats = Object.entries(itemsByType).map(([type, items]) => ({
    type,
    count: items.length,
    icon: sourceTypeIcons[type as keyof typeof sourceTypeIcons],
    color: sourceTypeColors[type as keyof typeof sourceTypeColors]
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-default">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen size={24} />
            Knowledge Repository
            <span className="text-sm text-muted ml-2">({knowledgeItems.length} items)</span>
          </h1>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search knowledge..."
                className="input pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type filter */}
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="howto">How-to</option>
              <option value="article">Article</option>
              <option value="docs">Documentation</option>
              <option value="github">GitHub</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </select>

            {/* Tag filter */}
            <select
              className="input"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn flex items-center gap-2"
            >
              <Plus size={16} />
              Add Resource
            </button>
          </div>
        </div>

        {/* Type stats */}
        <div className="flex items-center gap-4">
          {typeStats.map(({ type, count, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => setFilterType(type === filterType ? '' : type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                filterType === type 
                  ? 'bg-[var(--accent)] text-white' 
                  : 'hover:bg-elevated'
              }`}
            >
              <Icon size={16} className={filterType === type ? 'text-white' : color} />
              <span className="text-sm capitalize">{type}</span>
              <span className="text-xs bg-[var(--ring)] px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map(renderKnowledgeCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-muted mx-auto mb-4 opacity-20" />
            <p className="text-muted">
              {searchQuery || filterType || filterTag 
                ? 'No items match your filters' 
                : 'No knowledge items yet'}
            </p>
            {!searchQuery && !filterType && !filterTag && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn mt-4"
              >
                Add Your First Resource
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="card w-[600px] p-6 animate-slideDown">
            <h2 className="text-lg font-semibold mb-4">Add Knowledge Resource</h2>
            
            <div className="mb-4">
              <label className="label">Title *</label>
              <input
                type="text"
                className="input"
                placeholder="D365 Data Entities Guide"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="label">URL *</label>
              <input
                type="url"
                className="input"
                placeholder="https://learn.microsoft.com/..."
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="label">Description</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Brief description of what this resource covers..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="label">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(sourceTypeIcons).map(([type, Icon]) => (
                  <button
                    key={type}
                    onClick={() => setNewItem({ ...newItem, sourceType: type as any })}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                      newItem.sourceType === type
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Tags</label>
              <input
                type="text"
                className="input"
                placeholder="D365, integration, reference (comma-separated)"
                value={newItem.tags.join(', ')}
                onChange={(e) => setNewItem({ 
                  ...newItem, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
              />
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs text-muted">Popular:</span>
                  {allTags.slice(0, 5).map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (!newItem.tags.includes(tag)) {
                          setNewItem({ ...newItem, tags: [...newItem.tags, tag] });
                        }
                      }}
                      className="tag text-xs hover:bg-[var(--accent)] hover:text-white transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({
                    title: '',
                    url: '',
                    description: '',
                    tags: [],
                    sourceType: 'other'
                  });
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                className="btn"
                disabled={!newItem.title.trim() || !newItem.url.trim()}
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}