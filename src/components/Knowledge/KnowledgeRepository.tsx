import React, { useState } from 'react';
import {
  BookOpen, Plus, Search, ExternalLink,
  FileText, Video, Github, HelpCircle, Link
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from '../../lib/dayjs-config';

type SourceType = 'howto' | 'article' | 'docs' | 'github' | 'video' | 'other';

export default function KnowledgeRepository() {
  const {
    knowledge,
    createKnowledge,
    updateKnowledge
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
  const allTags = Array.from(new Set(knowledge.flatMap((k: any) => k.tags)));

  // Filter items
  const filteredItems = knowledge.filter((item: any) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t: any) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !filterType || item.sourceType === filterType;
    const matchesTag = !filterTag || item.tags.includes(filterTag);
    return matchesSearch && matchesType && matchesTag;
  });

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
      createKnowledge({
        title: newItem.title,
        content: newItem.url,
        category: newItem.sourceType,
        tags: newItem.tags,
        isPublic: false
      });
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
    // Note: lastAccessedAt tracking would need to be added to Knowledge type
  };

  const renderKnowledgeCard = (item: any) => {
    const Icon = sourceTypeIcons[item.category as SourceType] || Link;
    const colorClass = sourceTypeColors[item.category as SourceType] || 'text-[var(--subtle)]';
    
    return (
      <div
        key={item.id}
        className="card hover:shadow-lg transition-all group p-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <Icon size={20} className={`${colorClass} mt-1`} />
            <div className="flex-1">
              <h4 className="font-medium mb-1">{item.title}</h4>
              {item.content && (
                <p className="text-sm text-muted mb-2">{item.content}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>{item.category || 'other'}</span>
                <span>•</span>
                <span>Accessed {dayjs(item.lastAccessedAt || item.createdAt).fromNow()}</span>
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
            onClick={() => handleOpenUrl(item.content, item.id)}
            className="btn btn-ghost text-sm flex items-center gap-2"
          >
            <ExternalLink size={14} />
            Open
          </button>
          <span className="text-xs text-muted capitalize">
            {item.category || 'other'}
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
            <span className="text-sm text-muted ml-2">({knowledge.length})</span>
          </h1>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search knowledge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 w-64"
              />
            </div>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input w-32"
            >
              <option value="">All Types</option>
              <option value="howto">How-to</option>
              <option value="article">Article</option>
              <option value="docs">Docs</option>
              <option value="github">GitHub</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </select>

            {/* Tag filter */}
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="input w-32"
            >
              <option value="">All Tags</option>
              {allTags.map((tag: any) => (
                <option key={String(tag)} value={String(tag)}>#{String(tag)}</option>
              ))}
            </select>

            {/* Add button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn"
            >
              <Plus size={16} />
              Add Knowledge
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => renderKnowledgeCard(item))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center text-muted py-12">
            {searchQuery || filterType || filterTag ? 'No knowledge items match your filters' : 'No knowledge items yet'}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-[500px] p-6">
            <h3 className="text-lg font-semibold mb-4">Add Knowledge Item</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title..."
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="input w-full"
                autoFocus
              />
              
              <input
                type="url"
                placeholder="URL..."
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                className="input w-full"
              />
              
              <select
                value={newItem.sourceType}
                onChange={(e) => setNewItem({ ...newItem, sourceType: e.target.value as SourceType })}
                className="input w-full"
              >
                <option value="other">Other</option>
                <option value="howto">How-to Guide</option>
                <option value="article">Article</option>
                <option value="docs">Documentation</option>
                <option value="github">GitHub</option>
                <option value="video">Video</option>
              </select>
              
              <textarea
                placeholder="Description (optional)..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="input w-full h-20 resize-none"
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
                onClick={handleCreateItem}
                className="btn"
              >
                Add Knowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

