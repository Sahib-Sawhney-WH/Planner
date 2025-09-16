import {
  CheckSquare, Briefcase, TrendingUp,
  Clock, AlertTriangle, Target
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from '../../lib/dayjs-config';

export default function ConsultantHome() {
  const {
    tasks,
    projects,
    clients,
    opportunities,
    timeEntries,
    risks
  } = useStore();

  // Calculate metrics
  const metrics = {
    tasks: {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Done').length,
      overdue: tasks.filter(t => t.due && dayjs(t.due).isBefore(dayjs(), 'day')).length,
      nextSteps: tasks.filter(t => t.isNextStep).length
    },
    projects: {
      total: projects.length,
      active: projects.filter(p => p.kind === 'Active').length,
      onHold: projects.filter(p => p.kind === 'On Hold').length
    },
    clients: {
      total: clients.length,
      key: clients.filter(c => c.isKeyAccount).length
    },
    opportunities: {
      total: opportunities.length,
      value: opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0),
      qualified: opportunities.filter(o => o.stage === 'Qualified').length
    },
    time: {
      today: timeEntries
        .filter(entry => dayjs(entry.date).isSame(dayjs(), 'day'))
        .reduce((sum, entry) => sum + entry.duration, 0),
      week: timeEntries
        .filter(entry => dayjs(entry.date).isSame(dayjs(), 'week'))
        .reduce((sum, entry) => sum + entry.duration, 0)
    },
    risks: {
      high: risks.filter(r => r.impact === 'High' && r.probability === 'High').length,
      total: risks.length
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const upcomingTasks = tasks
    .filter(t => t.status !== 'Done' && t.due)
    .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())
    .slice(0, 5);

  const recentProjects = projects
    .filter(p => p.kind === 'Active')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 3);

  const topOpportunities = opportunities
    .filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost')
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 3);

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Good morning! 👋</h1>
        <p className="text-muted">Here's what's happening with your work today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckSquare className="text-[var(--accent)]" size={24} />
            <span className="text-2xl font-bold">{metrics.tasks.total}</span>
          </div>
          <h3 className="font-semibold mb-2">Tasks</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Completed</span>
              <span>{metrics.tasks.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Overdue</span>
              <span className="text-[var(--danger)]">{metrics.tasks.overdue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Next Steps</span>
              <span className="text-[var(--accent)]">{metrics.tasks.nextSteps}</span>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <Briefcase className="text-[var(--accent)]" size={24} />
            <span className="text-2xl font-bold">{metrics.projects.total}</span>
          </div>
          <h3 className="font-semibold mb-2">Projects</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Active</span>
              <span className="text-[var(--success)]">{metrics.projects.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">On Hold</span>
              <span className="text-[var(--warn)]">{metrics.projects.onHold}</span>
            </div>
          </div>
        </div>

        {/* Opportunities */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-[var(--accent)]" size={24} />
            <span className="text-2xl font-bold">{metrics.opportunities.total}</span>
          </div>
          <h3 className="font-semibold mb-2">Pipeline</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Total Value</span>
              <span className="text-[var(--success)]">${metrics.opportunities.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Qualified</span>
              <span>{metrics.opportunities.qualified}</span>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="text-[var(--accent)]" size={24} />
            <span className="text-2xl font-bold">{formatDuration(metrics.time.today)}</span>
          </div>
          <h3 className="font-semibold mb-2">Time Today</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">This Week</span>
              <span>{formatDuration(metrics.time.week)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target size={20} />
              Upcoming Tasks
            </h3>
            <span className="text-sm text-muted">{upcomingTasks.length} tasks</span>
          </div>
          
          <div className="space-y-3">
            {upcomingTasks.map(task => {
              const isOverdue = dayjs(task.due).isBefore(dayjs(), 'day');
              const isToday = dayjs(task.due).isSame(dayjs(), 'day');
              const isTomorrow = dayjs(task.due).isSame(dayjs().add(1, 'day'), 'day');
              
              return (
                <div key={task.id} className="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted">
                      {isOverdue && <span className="text-[var(--danger)]">Overdue</span>}
                      {isToday && <span className="text-[var(--warn)]">Today</span>}
                      {isTomorrow && <span className="text-[var(--accent)]">Tomorrow</span>}
                      {!isOverdue && !isToday && !isTomorrow && dayjs(task.due).format('MMM D')}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {task.score.toFixed(1)}
                  </div>
                </div>
              );
            })}
            
            {upcomingTasks.length === 0 && (
              <div className="text-center text-muted py-8">
                No upcoming tasks with due dates
              </div>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Briefcase size={20} />
              Active Projects
            </h3>
            <span className="text-sm text-muted">{recentProjects.length} projects</span>
          </div>
          
          <div className="space-y-3">
            {recentProjects.map(project => (
              <div key={project.id} className="p-3 bg-elevated rounded-lg">
                <div className="font-medium mb-1">{project.title}</div>
                <div className="text-sm text-muted mb-2">
                  {clients.find(c => c.id === project.clientId)?.name}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">
                    Updated {dayjs(project.updatedAt || project.createdAt).fromNow()}
                  </span>
                  <span className={`tag text-xs ${
                    project.kind === 'Active' ? 'bg-[var(--success)] text-white' : ''
                  }`}>
                    {project.kind}
                  </span>
                </div>
              </div>
            ))}
            
            {recentProjects.length === 0 && (
              <div className="text-center text-muted py-8">
                No active projects
              </div>
            )}
          </div>
        </div>

        {/* Top Opportunities */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp size={20} />
              Top Opportunities
            </h3>
            <span className="text-sm text-muted">{topOpportunities.length} opportunities</span>
          </div>
          
          <div className="space-y-3">
            {topOpportunities.map(opp => (
              <div key={opp.id} className="p-3 bg-elevated rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium">{opp.title}</div>
                  <div className="text-sm font-semibold text-[var(--success)]">
                    ${(opp.value || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-muted mb-2">
                  {clients.find(c => c.id === opp.clientId)?.name}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`tag text-xs ${
                    opp.stage === 'Qualified' ? 'bg-[var(--accent)] text-white' :
                    opp.stage === 'Proposal' ? 'bg-[var(--warn)] text-white' :
                    'bg-[var(--ring)]'
                  }`}>
                    {opp.stage}
                  </span>
                  <span className="text-xs text-muted">
                    {opp.probability}% probability
                  </span>
                </div>
              </div>
            ))}
            
            {topOpportunities.length === 0 && (
              <div className="text-center text-muted py-8">
                No open opportunities
              </div>
            )}
          </div>
        </div>

        {/* Risk Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle size={20} />
              Risk Summary
            </h3>
            <span className="text-sm text-muted">{metrics.risks.total} total</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">High Risk Items</span>
              <span className={`text-lg font-semibold ${
                metrics.risks.high > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'
              }`}>
                {metrics.risks.high}
              </span>
            </div>
            
            <div className="text-center text-muted py-4">
              {metrics.risks.high === 0 ? (
                <span className="text-[var(--success)]">No high-risk items</span>
              ) : (
                <span>Review high-risk items in RAID log</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

