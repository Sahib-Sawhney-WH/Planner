import React, { useState } from 'react';
import {
  TrendingUp, Plus, DollarSign, Target, Calendar,
  ChevronRight, AlertCircle, CheckCircle, XCircle,
  BarChart3, Users, Percent
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

export default function OpportunityPipeline() {
  const {
    opportunities,
    clients,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    openDrawer
  } = useStore();

  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOpp, setNewOpp] = useState({
    clientId: '',
    name: '',
    stage: 'Discovery' as any,
    amount: 0,
    probability: 0.5,
    nextStep: '',
    nextStepDue: '',
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
    .reduce((sum, o) => sum + (o.amount || 0), 0);
  
  const weightedPipeline = opportunities
    .filter(o => !o.stage.includes('Closed'))
    .reduce((sum, o) => sum + (o.amount || 0) * o.probability, 0);
  
  const closedWon = opportunities
    .filter(o => o.stage === 'Closed Won')
    .reduce((sum, o) => sum + (o.amount || 0), 0);
  
  const winRate = opportunities.filter(o => o.stage.includes('Closed')).length > 0
    ? (opportunities.filter(o => o.stage === 'Closed Won').length / 
       opportunities.filter(o => o.stage.includes('Closed')).length) * 100
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleCreateOpportunity = () => {
    if (newOpp.name.trim() && newOpp.clientId) {
      createOpportunity(newOpp);
      setNewOpp({
        clientId: '',
        name: '',
        stage: 'Discovery',
        amount: 0,
        probability: 0.5,
        nextStep: '',
        nextStepDue: '',
        notes: ''
      });
      setShowAddModal(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    e.dataTransfer.setData('oppId', oppId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const oppId = e.dataTransfer.getData('oppId');
    updateOpportunity(oppId, { stage: newStage as any });
  };

  const renderOpportunityCard = (opp: any, draggable = true) => {
    const client = clients.find(c => c.id === opp.clientId);
    const isOverdue = opp.nextStepDue && dayjs(opp.nextStepDue).isBefore(dayjs());
    
    return (
      <div
        key={opp.id}
        draggable={draggable && !opp.stage.includes('Closed')}
        onDragStart={draggable ? (e) => handleDragStart(e, opp.id) : undefined}
        className="card p-3 cursor-pointer hover:shadow-lg transition-all"
        onClick={() => openDrawer(opp)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{opp.name}</h4>
            <span className="text-xs text-muted sensitive">{client?.name}</span>
          </div>
          {isOverdue && (
            <AlertCircle size={14} className="text-[var(--danger)]" />
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold">
            {formatCurrency(opp.amount || 0)}
          </span>
          <span className="text-xs bg-[var(--ring)] px-2 py-0.5 rounded-full">
            {Math.round(opp.probability * 100)}%
          </span>
        </div>

        {opp.nextStep && (
          <div className="p-2 bg-elevated rounded text-xs">
            <div className="font-medium mb-1">Next: {opp.nextStep}</div>
            {opp.nextStepDue && (
              <div className={isOverdue ? 'text-[var(--danger)]' : 'text-muted'}>
                {dayjs(opp.nextStepDue).format('MMM D')}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Weighted</span>
            <span className="font-medium">
              {formatCurrency((opp.amount || 0) * opp.probability)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderPipelineColumn = (stage: any) => {
    const stageOpps = oppsByStage[stage.id];
    const stageTotal = stageOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
    const Icon = stage.icon;
    
    return (
      <div
        key={stage.id}
        className="flex-1 min-w-[280px]"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, stage.id)}
      >
        <div className={`flex items-center justify-between mb-3 px-2 pb-2 border-b-2 ${stage.color}`}>
          <div className="flex items-center gap-2">
            <Icon size={16} />
            <h3 className="font-medium">{stage.id}</h3>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{formatCurrency(stageTotal)}</div>
            <div className="text-xs text-muted">{stageOpps.length} deals</div>
          </div>
        </div>

        <div className="space-y-2 min-h-[200px]">
          {stageOpps.map(opp => renderOpportunityCard(opp))}
        </div>

        {stageOpps.length === 0 && (
          <div className="text-center py-8 text-muted text-sm opacity-50">
            Drop opportunities here
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
            <TrendingUp size={24} />
            Sales Pipeline
          </h1>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center bg-elevated rounded-lg p-1">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  viewMode === 'pipeline' ? 'bg-[var(--accent)] text-white' : ''
                }`}
              >
                Pipeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-[var(--accent)] text-white' : ''
                }`}
              >
                List
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn flex items-center gap-2"
            >
              <Plus size={16} />
              New Opportunity
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-elevated p-3 rounded-lg">
            <div className="text-xs text-muted mb-1">Total Pipeline</div>
            <div className="text-xl font-semibold">{formatCurrency(totalPipeline)}</div>
          </div>
          <div className="bg-elevated p-3 rounded-lg">
            <div className="text-xs text-muted mb-1">Weighted Pipeline</div>
            <div className="text-xl font-semibold">{formatCurrency(weightedPipeline)}</div>
          </div>
          <div className="bg-elevated p-3 rounded-lg">
            <div className="text-xs text-muted mb-1">Closed Won</div>
            <div className="text-xl font-semibold text-[var(--success)]">
              {formatCurrency(closedWon)}
            </div>
          </div>
          <div className="bg-elevated p-3 rounded-lg">
            <div className="text-xs text-muted mb-1">Win Rate</div>
            <div className="text-xl font-semibold">{winRate.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'pipeline' ? (
          <div className="flex gap-4 h-full overflow-x-auto">
            {stages.map(stage => renderPipelineColumn(stage))}
          </div>
        ) : (
          <div className="space-y-2">
            {opportunities.map(opp => {
              const client = clients.find(c => c.id === opp.clientId);
              const stage = stages.find(s => s.id === opp.stage);
              
              return (
                <div
                  key={opp.id}
                  className="row cursor-pointer"
                  onClick={() => openDrawer(opp)}
                >
                  <div className={`w-1 h-8 rounded ${stage?.color}`} />
                  <div className="flex-1">
                    <div className="font-medium">{opp.name}</div>
                    <div className="text-sm text-muted sensitive">{client?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(opp.amount || 0)}</div>
                    <div className="text-xs text-muted">
                      {Math.round(opp.probability * 100)}% = {formatCurrency((opp.amount || 0) * opp.probability)}
                    </div>
                  </div>
                  <span className="tag text-xs">{opp.stage}</span>
                  {opp.nextStepDue && (
                    <span className={`text-xs ${
                      dayjs(opp.nextStepDue).isBefore(dayjs()) 
                        ? 'text-[var(--danger)]' 
                        : 'text-muted'
                    }`}>
                      {dayjs(opp.nextStepDue).format('MMM D')}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-muted" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add opportunity modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="card w-[600px] p-6 animate-slideDown max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">New Opportunity</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Client *</label>
                <select
                  className="input"
                  value={newOpp.clientId}
                  onChange={(e) => setNewOpp({ ...newOpp, clientId: e.target.value })}
                >
                  <option value="">Select client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">Opportunity Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Q2 Cloud Migration"
                  value={newOpp.name}
                  onChange={(e) => setNewOpp({ ...newOpp, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Deal Value ($)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="125000"
                  value={newOpp.amount || ''}
                  onChange={(e) => setNewOpp({ ...newOpp, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <label className="label">Probability (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newOpp.probability * 100}
                  onChange={(e) => setNewOpp({ ...newOpp, probability: parseFloat(e.target.value) / 100 })}
                  className="w-full"
                />
                <div className="text-center text-sm mt-1">
                  {Math.round(newOpp.probability * 100)}%
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Stage</label>
              <div className="grid grid-cols-3 gap-2">
                {stages.slice(0, 4).map(stage => (
                  <button
                    key={stage.id}
                    onClick={() => setNewOpp({ ...newOpp, stage: stage.id as any })}
                    className={`p-2 rounded-lg border transition-colors ${
                      newOpp.stage === stage.id
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    {stage.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Next Step</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Schedule technical review"
                  value={newOpp.nextStep}
                  onChange={(e) => setNewOpp({ ...newOpp, nextStep: e.target.value })}
                />
              </div>
              
              <div>
                <label className="label">Next Step Due</label>
                <input
                  type="date"
                  className="input"
                  value={newOpp.nextStepDue}
                  onChange={(e) => setNewOpp({ ...newOpp, nextStepDue: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Notes</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Key decision makers, competition, etc..."
                value={newOpp.notes}
                onChange={(e) => setNewOpp({ ...newOpp, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOpportunity}
                className="btn"
                disabled={!newOpp.name.trim() || !newOpp.clientId}
              >
                Create Opportunity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}