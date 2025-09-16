import { useState } from 'react';
import {
  TrendingUp, Plus, DollarSign, Target,
  AlertCircle, CheckCircle, XCircle,
  BarChart3, Users
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from '../../lib/dayjs-config';

export default function OpportunityPipeline() {
  const {
    opportunities,
    clients,
    createOpportunity,
    openDrawer
  } = useStore();

  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOpp, setNewOpp] = useState({
    clientId: '',
    title: '',
    stage: 'Discovery' as any,
    value: 0,
    probability: 50,
    nextStep: '',
    expectedCloseDate: '',
    notes: ''
  });

  const stages = [
    { id: 'Discovery', color: 'bg-[var(--todo)]', icon: Target },
    { id: 'Scoping', color: 'bg-[var(--warn)]', icon: BarChart3 },
    { id: 'Proposal', color: 'bg-[var(--accent)]', icon: DollarSign },
    { id: 'Negotiation', color: 'bg-[var(--doing)]', icon: Users },
    { id: 'Closed Won', color: 'bg-[var(--success)]', icon: CheckCircle },
    { id: 'Closed Lost', color: 'bg-[var(--danger)]', icon: XCircle }
  ];

  // Group opportunities by stage
  const oppsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = opportunities.filter(o => o.stage === stage.id);
    return acc;
  }, {} as Record<string, typeof opportunities>);

  // Calculate metrics
  const totalPipeline = opportunities
    .filter(o => !o.stage.includes('Closed'))
    .reduce((sum, o) => sum + (o.value || 0), 0);
  
  const weightedPipeline = opportunities
    .filter(o => !o.stage.includes('Closed'))
    .reduce((sum, o) => sum + (o.value || 0) * (o.probability / 100), 0);
  
  const closedWon = opportunities
    .filter(o => o.stage === 'Closed Won')
    .reduce((sum, o) => sum + (o.value || 0), 0);
  
  const winRate = opportunities.filter(o => o.stage.includes('Closed')).length > 0
    ? (opportunities.filter(o => o.stage === 'Closed Won').length / 
       opportunities.filter(o => o.stage.includes('Closed')).length) * 100
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateOpportunity = async () => {
    if (newOpp.title.trim()) {
      await createOpportunity({
        title: newOpp.title,
        clientId: newOpp.clientId || undefined,
        stage: newOpp.stage,
        value: newOpp.value,
        probability: newOpp.probability,
        expectedCloseDate: newOpp.expectedCloseDate || undefined,
        description: newOpp.notes
      });
      
      setNewOpp({
        clientId: '',
        title: '',
        stage: 'Discovery',
        value: 0,
        probability: 50,
        nextStep: '',
        expectedCloseDate: '',
        notes: ''
      });
      setShowAddModal(false);
    }
  };

  const renderOpportunityCard = (opp: any) => {
    const client = clients.find(c => c.id === opp.clientId);
    const isOverdue = opp.expectedCloseDate && dayjs(opp.expectedCloseDate).isBefore(dayjs());
    
    return (
      <div
        key={opp.id}
        className="card p-4 cursor-pointer hover:shadow-lg transition-all mb-3"
        onClick={() => openDrawer(opp, 'opportunity')}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm line-clamp-2">{opp.title}</h4>
          {isOverdue && (
            <AlertCircle size={16} className="text-[var(--danger)] flex-shrink-0" />
          )}
        </div>
        
        {client && (
          <div className="text-xs text-muted mb-2">
            {client.name}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-[var(--success)]">
            {formatCurrency(opp.value || 0)}
          </div>
          <div className="text-xs text-muted">
            {opp.probability}% probability
          </div>
        </div>
        
        <div className="text-xs text-muted">
          Expected: {formatCurrency((opp.value || 0) * (opp.probability / 100))}
        </div>
        
        {opp.expectedCloseDate && (
          <div className={`text-xs mt-2 ${isOverdue ? 'text-[var(--danger)]' : 'text-muted'}`}>
            Due: {dayjs(opp.expectedCloseDate).format('MMM D')}
          </div>
        )}
      </div>
    );
  };

  const renderStageColumn = (stage: any) => {
    const stageOpps = oppsByStage[stage.id] || [];
    const stageTotal = stageOpps.reduce((sum, o) => sum + (o.value || 0), 0);
    const Icon = stage.icon;
    
    return (
      <div key={stage.id} className="flex-1 min-w-[280px]">
        <div className="bg-elevated rounded-lg p-4 h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stage.color}`} />
              <h3 className="font-semibold">{stage.id}</h3>
              <Icon size={16} className="text-muted" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{stageOpps.length}</div>
              <div className="text-xs text-muted">{formatCurrency(stageTotal)}</div>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {stageOpps.map(renderOpportunityCard)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-default">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <TrendingUp className="text-[var(--accent)]" size={28} />
            Opportunity Pipeline
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex bg-elevated rounded-lg p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'pipeline' ? 'bg-[var(--accent)] text-white' : 'text-muted'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list' ? 'bg-[var(--accent)] text-white' : 'text-muted'
              }`}
            >
              List
            </button>
          </div>

          {/* Add opportunity */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn"
          >
            <Plus size={16} />
            Add Opportunity
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-6 border-b border-default">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              {formatCurrency(totalPipeline)}
            </div>
            <div className="text-sm text-muted">Total Pipeline</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--warn)] mb-1">
              {formatCurrency(weightedPipeline)}
            </div>
            <div className="text-sm text-muted">Weighted Pipeline</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--success)] mb-1">
              {formatCurrency(closedWon)}
            </div>
            <div className="text-sm text-muted">Closed Won</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              {Math.round(winRate)}%
            </div>
            <div className="text-sm text-muted">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'pipeline' ? (
          <div className="flex gap-6 h-full overflow-x-auto">
            {stages.map(renderStageColumn)}
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map(renderOpportunityCard)}
          </div>
        )}
      </div>

      {/* Add opportunity modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-[500px] p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Opportunity</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Opportunity title..."
                value={newOpp.title}
                onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                className="input w-full"
                autoFocus
              />
              
              <select
                value={newOpp.clientId}
                onChange={(e) => setNewOpp({ ...newOpp, clientId: e.target.value })}
                className="input w-full"
              >
                <option value="">Select client (optional)</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Value ($)..."
                  value={newOpp.value || ''}
                  onChange={(e) => setNewOpp({ ...newOpp, value: parseFloat(e.target.value) || 0 })}
                  className="input"
                  min="0"
                />
                
                <input
                  type="number"
                  placeholder="Probability (%)..."
                  value={newOpp.probability || ''}
                  onChange={(e) => setNewOpp({ ...newOpp, probability: parseInt(e.target.value) || 0 })}
                  className="input"
                  min="0"
                  max="100"
                />
              </div>
              
              <select
                value={newOpp.stage}
                onChange={(e) => setNewOpp({ ...newOpp, stage: e.target.value })}
                className="input w-full"
              >
                {stages.filter(s => !s.id.includes('Closed')).map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.id}</option>
                ))}
              </select>
              
              <input
                type="date"
                placeholder="Expected close date..."
                value={newOpp.expectedCloseDate}
                onChange={(e) => setNewOpp({ ...newOpp, expectedCloseDate: e.target.value })}
                className="input w-full"
              />
              
              <textarea
                placeholder="Notes (optional)..."
                value={newOpp.notes}
                onChange={(e) => setNewOpp({ ...newOpp, notes: e.target.value })}
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
                onClick={handleCreateOpportunity}
                className="btn"
              >
                Add Opportunity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

