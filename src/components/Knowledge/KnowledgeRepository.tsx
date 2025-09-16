import React, { useState } from 'react';
import {
  BookOpen, Plus, Search, ExternalLink,
  FileText, Video, Github, HelpCircle, Link
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

type SourceType = 'howto' | 'article' | 'docs' | 'github' | 'video' | 'other';

export default function KnowledgeRepository() {
  const {
    knowledgeItems,
    createKnowledgeItem,
    updateKnowledgeItem
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
    sourceType: 'other' as SourceType
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

  const sourceTypeIcons: Record<SourceType, React.ComponentType<any>> = {
    howto: HelpCircle,
    article: FileText,
    docs: BookOpen,
    github: Github,
    video: Video,
    other: Link
  };

  const sourceTypeColors: Record<SourceType, string> = {
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
    const Icon = sourceTypeIcons[item.sourceType as SourceType];
    const colorClass = sourceTypeColors[item.sourceType as SourceType];
    
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
            Open
          </button>
          <span className="text-xs text-muted capitalize">
            {item.sourceType}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-default">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen size={24} />
            Knowledge Repository
            <span className="text-sm text-muted ml-2">({knowledgeItems.length})</span>
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
                <option key={tag} value={tag}>#{tag}</option>
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

        {/* Summary stats */}
        <div className="flex items-center gap-6 text-sm">
          {Object.entries(itemsByType).map(([type, items]) => (
            <span key={type} className="text-muted">
              <span className="font-medium text-[var(--text)]">
                {items.length}
              </span> {type}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map(item => renderKnowledgeCard(item))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-muted mx-auto mb-4 opacity-20" />
            <p className="text-muted">
              {searchQuery || filterType || filterTag 
                ? 'No resources match your filters' 
                : 'No resources yet'
              }
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

      {/* Add resource modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="card w-[600px] p-6 animate-slideDown">
            <h2 className="text-lg font-semibold mb-4">Add Knowledge Resource</h2>
            
            <div className="mb-4">
              <label className="label">Title</label>
              <input
                type="text"
                className="input"
                placeholder="Resource title..."
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="label">URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://..."
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="label">Description</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Brief description..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="label">Source Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['howto', 'article', 'docs', 'github', 'video', 'other'] as SourceType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setNewItem({ ...newItem, sourceType: type })}
                    className={`p-2 rounded border transition-colors capitalize ${
                      newItem.sourceType === type
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Tags (comma-separated)</label>
              <input
                type="text"
                className="input"
                placeholder="react, typescript, tutorial"
                value={newItem.tags.join(', ')}
                onChange={(e) => setNewItem({ 
                  ...newItem, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
              />
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