import React from 'react';
import { 
  Clock, AlertCircle, Calendar, TrendingUp, 
  Users, Briefcase, Target, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function ConsultantHome() {
  const { 
    getTodayTasks, 
    getWeekTasks, 
    getOverdueTasks,
    getNextSteps,
    clients,
    projects,
    opportunities,
    timeEntries,
    openDrawer,
    updateTask
  } = useStore();

  const todayTasks = getTodayTasks();
  const weekTasks = getWeekTasks();
  const overdueTasks = getOverdueTasks();
  const nextSteps = getNextSteps();
  
  // Calculate metrics
  const activeProjects = projects.filter(p => p.kind === 'Active').length;
  const totalClients = clients.length;
  const openOpportunities = opportunities.filter(o => !o.stage.includes('Closed')).length;
  const pipelineValue = opportunities
    .filter(o => !o.stage.includes('Closed'))
    .reduce((sum, o) => sum + (o.amount || 0) * o.probability, 0);
  
  // Today's time tracked
  const todayHours = timeEntries
    .filter(e => dayjs(e.date).isSame(dayjs(), 'day'))
    .reduce((sum, e) => sum + e.hours, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return 'bg-[var(--todo)]';
      case 'Doing': return 'bg-[var(--doing)]';
      case 'Blocked': return 'bg-[var(--blocked)]';
      case 'Done': return 'bg-[var(--done)]';
      default: return 'bg-[var(--ring)]';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 4) return <ArrowUp className="text-[var(--danger)]" size={14} />;
    if (priority >= 2) return <ArrowDown className="text-[var(--warn)]" size={14} />;
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Consultant Home</h1>
        <p className="text-muted">
          {dayjs().format('dddd, MMMM D, YYYY')} • {todayHours.toFixed(1)}h tracked today
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted text-sm">Active Projects</span>
            <Briefcase size={18} className="text-muted" />
          </div>
          <div className="text-2xl font-semibold">{activeProjects}</div>
          <div className="text-xs text-muted mt-1">
            {projects.filter(p => p.kind === 'Planned').length} planned
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted text-sm">Clients</span>
            <Users size={18} className="text-muted" />
          </div>
          <div className="text-2xl font-semibold">{totalClients}</div>
          <div className="text-xs text-muted mt-1">
            {clients.filter(c => c.tags.includes('Signed')).length} active
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted text-sm">Pipeline</span>
            <TrendingUp size={18} className="text-muted" />
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(pipelineValue)}</div>
          <div className="text-xs text-muted mt-1">
            {openOpportunities} opportunities
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted text-sm">Today's Focus</span>
            <Target size={18} className="text-muted" />
          </div>
          <div className="text-2xl font-semibold">{todayTasks.length}</div>
          <div className="text-xs text-[var(--danger)] mt-1">
            {overdueTasks.length > 0 && `${overdueTasks.length} overdue`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Clock size={18} />
                Today's Tasks
              </h2>
              <span className="text-sm text-muted">{todayTasks.length} items</span>
            </div>

            {overdueTasks.length > 0 && (
              <div className="mb-4 p-3 bg-[var(--danger)] bg-opacity-10 rounded-lg border border-[var(--danger)] border-opacity-20">
                <div className="flex items-center gap-2 text-[var(--danger)] mb-2">
                  <AlertCircle size={16} />
                  <span className="font-medium text-sm">Overdue Tasks</span>
                </div>
                {overdueTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded"
                        onChange={() => updateTask(task.id, { status: 'Done' })}
                      />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <span className="text-xs text-[var(--danger)]">
                      {dayjs(task.due).fromNow()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <p className="text-muted text-sm py-8 text-center">
                  No tasks scheduled for today
                </p>
              ) : (
                todayTasks.map(task => (
                  <div 
                    key={task.id}
                    className="row cursor-pointer"
                    onClick={() => openDrawer(task, 'task')}
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'Done'}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateTask(task.id, { 
                          status: task.status === 'Done' ? 'Todo' : 'Done' 
                        });
                      }}
                      className="rounded"
                    />
                    <span className={`status-dot ${getStatusColor(task.status)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={task.status === 'Done' ? 'line-through opacity-50' : ''}>
                          {task.title}
                        </span>
                        {task.isNextStep && (
                          <span className="text-xs px-1.5 py-0.5 bg-[var(--accent)] text-white rounded">
                            Next Step
                          </span>
                        )}
                        {getPriorityIcon(task.priority)}
                      </div>
                      {task.clientId && (
                        <span className="text-xs text-muted">
                          {clients.find(c => c.id === task.clientId)?.name}
                        </span>
                      )}
                    </div>
                    <span className="ice-score">{task.score.toFixed(1)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="card mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Target size={18} />
                Next Steps
              </h2>
              <span className="text-sm text-muted">{nextSteps.length} items</span>
            </div>

            <div className="space-y-3">
              {nextSteps.slice(0, 5).map((item: any) => {
                const isTask = 'status' in item;
                const dueDate = isTask ? item.due : item.nextStepDue;
                const title = isTask ? item.title : item.nextStep;
                const entityName = isTask ? 'Task' : ('clients' in item ? 'Project' : 'Client');
                
                return (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-elevated rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{title}</div>
                      <div className="text-xs text-muted mt-1">
                        {entityName} • {item.name || item.title}
                      </div>
                    </div>
                    {dueDate && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        dayjs(dueDate).isBefore(dayjs()) 
                          ? 'chip-overdue' 
                          : dayjs(dueDate).isBefore(dayjs().add(3, 'day'))
                          ? 'chip-soon'
                          : 'chip-date'
                      }`}>
                        {dayjs(dueDate).format('MMM D')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* This Week */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar size={18} />
                This Week
              </h3>
              <span className="text-sm text-muted">{weekTasks.length}</span>
            </div>
            <div className="space-y-2">
              {weekTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between py-2">
                  <span className="text-sm truncate flex-1 mr-2">{task.title}</span>
                  <span className="text-xs text-muted">
                    {dayjs(task.due).format('ddd')}
                  </span>
                </div>
              ))}
              {weekTasks.length === 0 && (
                <p className="text-sm text-muted">No tasks this week</p>
              )}
            </div>
          </div>

          {/* Active Opportunities */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp size={18} />
                Pipeline
              </h3>
              <ChevronRight size={16} className="text-muted" />
            </div>
            <div className="space-y-3">
              {opportunities
                .filter(o => !o.stage.includes('Closed'))
                .slice(0, 3)
                .map(opp => (
                  <div key={opp.id} className="pb-3 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate flex-1 mr-2">
                        {opp.name}
                      </span>
                      <span className="text-xs tag">{opp.stage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">
                        {clients.find(c => c.id === opp.clientId)?.name}
                      </span>
                      <span className="text-xs font-medium">
                        {formatCurrency(opp.amount || 0)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-elevated transition-colors text-sm">
                📝 Weekly Review
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-elevated transition-colors text-sm">
                ⏱️ Start Timer
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-elevated transition-colors text-sm">
                📊 Export Time Report
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-elevated transition-colors text-sm">
                🎯 Review OKRs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

