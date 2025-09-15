import React, { useState } from 'react';
import {
  Clock, Play, Pause, Calendar, Download, DollarSign,
  TrendingUp, Users, Briefcase, FileText, Plus
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

export default function TimeTracker() {
  const {
    timeEntries,
    clients,
    projects,
    tasks,
    activeTimer,
    startTimer,
    stopTimer,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry
  } = useStore();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    hours: 0,
    billable: true,
    clientId: '',
    projectId: '',
    taskId: '',
    notes: ''
  });

  // Calculate date range based on view mode
  const getDateRange = () => {
    switch (viewMode) {
      case 'daily':
        return {
          start: selectedDate.startOf('day'),
          end: selectedDate.endOf('day')
        };
      case 'weekly':
        return {
          start: selectedDate.startOf('week'),
          end: selectedDate.endOf('week')
        };
      case 'monthly':
        return {
          start: selectedDate.startOf('month'),
          end: selectedDate.endOf('month')
        };
    }
  };

  const { start, end } = getDateRange();

  // Filter entries for current period
  const periodEntries = timeEntries.filter(entry => {
    const entryDate = dayjs(entry.date);
    return entryDate.isAfter(start.subtract(1, 'day')) && 
           entryDate.isBefore(end.add(1, 'day'));
  });

  // Calculate metrics
  const totalHours = periodEntries.reduce((sum, e) => sum + e.hours, 0);
  const billableHours = periodEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0);
  const nonBillableHours = totalHours - billableHours;
  const utilization = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

  // Group by date
  const entriesByDate = periodEntries.reduce((acc, entry) => {
    const date = dayjs(entry.date).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof periodEntries>);

  // Group by client
  const hoursByClient = periodEntries.reduce((acc, entry) => {
    if (entry.clientId) {
      const client = clients.find(c => c.id === entry.clientId);
      const key = client?.name || 'Unknown';
      acc[key] = (acc[key] || 0) + entry.hours;
    }
    return acc;
  }, {} as Record<string, number>);

  // Group by project
  const hoursByProject = periodEntries.reduce((acc, entry) => {
    if (entry.projectId) {
      const project = projects.find(p => p.id === entry.projectId);
      const key = project?.title || 'Unknown';
      acc[key] = (acc[key] || 0) + entry.hours;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleCreateEntry = () => {
    if (newEntry.hours > 0) {
      createTimeEntry(newEntry);
      setNewEntry({
        date: dayjs().format('YYYY-MM-DD'),
        hours: 0,
        billable: true,
        clientId: '',
        projectId: '',
        taskId: '',
        notes: ''
      });
      setShowAddModal(false);
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Date', 'Hours', 'Billable', 'Client', 'Project', 'Task', 'Notes'],
      ...periodEntries.map(entry => [
        dayjs(entry.date).format('YYYY-MM-DD'),
        entry.hours.toString(),
        entry.billable ? 'Yes' : 'No',
        clients.find(c => c.id === entry.clientId)?.name || '',
        projects.find(p => p.id === entry.projectId)?.title || '',
        tasks.find(t => t.id === entry.taskId)?.title || '',
        entry.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time_entries_${start.format('YYYY-MM-DD')}_to_${end.format('YYYY-MM-DD')}.csv`;
    a.click();
  };

  const formatTimer = (ms: number) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000) % 60;
    const hours = Math.floor(ms / 3600000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderDailyView = () => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const dayEntries = entriesByDate[dateStr] || [];
    const dayTotal = dayEntries.reduce((sum, e) => sum + e.hours, 0);

    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate.format('dddd, MMMM D, YYYY')}
          </h3>
          <div className="text-sm text-muted mb-4">
            Total: {dayTotal.toFixed(1)}h 
            ({dayEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0).toFixed(1)}h billable)
          </div>
        </div>

        <div className="space-y-2">
          {dayEntries.map(entry => {
            const client = clients.find(c => c.id === entry.clientId);
            const project = projects.find(p => p.id === entry.projectId);
            const task = tasks.find(t => t.id === entry.taskId);

            return (
              <div key={entry.id} className="row">
                <div className="flex-1">
                  <div className="font-medium">
                    {task?.title || project?.title || client?.name || 'Time Entry'}
                  </div>
                  <div className="text-sm text-muted">
                    {client && <span className="sensitive">{client.name}</span>}
                    {client && project && ' • '}
                    {project && <span>{project.title}</span>}
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-muted mt-1">{entry.notes}</div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`tag text-xs ${
                    entry.billable 
                      ? 'bg-[var(--success)] text-white' 
                      : 'bg-[var(--ring)]'
                  }`}>
                    {entry.billable ? 'Billable' : 'Non-billable'}
                  </span>
                  <span className="font-medium">{entry.hours.toFixed(1)}h</span>
                  <button
                    onClick={() => deleteTimeEntry(entry.id)}
                    className="text-[var(--danger)] opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {dayEntries.length === 0 && (
          <div className="text-center py-12 text-muted">
            No time entries for this day
          </div>
        )}
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(start.add(i, 'day'));
    }

    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Week {selectedDate.week()} • {start.format('MMM D')} - {end.format('MMM D, YYYY')}
          </h3>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map(day => {
            const dateStr = day.format('YYYY-MM-DD');
            const dayEntries = entriesByDate[dateStr] || [];
            const dayTotal = dayEntries.reduce((sum, e) => sum + e.hours, 0);
            const isToday = day.isSame(dayjs(), 'day');

            return (
              <div
                key={dateStr}
                className={`card p-3 ${isToday ? 'ring-2 ring-[var(--accent)]' : ''}`}
              >
                <div className="text-sm font-medium mb-2">
                  {day.format('ddd D')}
                </div>
                <div className="text-2xl font-semibold mb-2">
                  {dayTotal.toFixed(1)}h
                </div>
                <div className="space-y-1">
                  {dayEntries.slice(0, 3).map(entry => {
                    const project = projects.find(p => p.id === entry.projectId);
                    return (
                      <div key={entry.id} className="text-xs truncate">
                        {project?.title || 'Time Entry'}
                      </div>
                    );
                  })}
                  {dayEntries.length > 3 && (
                    <div className="text-xs text-muted">
                      +{dayEntries.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="card p-4">
            <div className="text-sm text-muted mb-1">Total Hours</div>
            <div className="text-2xl font-semibold">{totalHours.toFixed(1)}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted mb-1">Billable</div>
            <div className="text-2xl font-semibold text-[var(--success)]">
              {billableHours.toFixed(1)}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted mb-1">Utilization</div>
            <div className="text-2xl font-semibold">
              {utilization.toFixed(0)}%
            </div>
          </div>
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
            <Clock size={24} />
            Time Tracking
          </h1>

          <div className="flex items-center gap-3">
            {/* Timer */}
            {activeTimer ? (
              <div className="flex items-center gap-3 px-4 py-2 bg-[var(--accent)] text-white rounded-lg">
                <div className="font-mono text-lg">
                  {formatTimer(activeTimer.elapsed)}
                </div>
                <button
                  onClick={stopTimer}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                >
                  <Pause size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startTimer()}
                className="btn btn-ghost flex items-center gap-2"
              >
                <Play size={16} />
                Start Timer
              </button>
            )}

            {/* View mode */}
            <div className="flex items-center bg-elevated rounded-lg p-1">
              {(['daily', 'weekly', 'monthly'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                    viewMode === mode ? 'bg-[var(--accent)] text-white' : ''
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Date navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate(selectedDate.subtract(1, viewMode === 'daily' ? 'day' : viewMode === 'weekly' ? 'week' : 'month'))}
                className="p-2 hover:bg-elevated rounded-lg"
              >
                ←
              </button>
              <button
                onClick={() => setSelectedDate(dayjs())}
                className="px-3 py-1.5 hover:bg-elevated rounded-lg text-sm"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(selectedDate.add(1, viewMode === 'daily' ? 'day' : viewMode === 'weekly' ? 'week' : 'month'))}
                className="p-2 hover:bg-elevated rounded-lg"
              >
                →
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-ghost flex items-center gap-2"
            >
              <Plus size={16} />
              Add Entry
            </button>
            
            <button
              onClick={handleExportCSV}
              className="btn flex items-center gap-2"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted">
            Period Total: <span className="font-medium text-[var(--text)]">{totalHours.toFixed(1)}h</span>
          </span>
          <span className="text-muted">
            Billable: <span className="font-medium text-[var(--success)]">{billableHours.toFixed(1)}h</span>
          </span>
          <span className="text-muted">
            Non-billable: <span className="font-medium text-[var(--text)]">{nonBillableHours.toFixed(1)}h</span>
          </span>
          <span className="text-muted">
            Utilization: <span className="font-medium text-[var(--text)]">{utilization.toFixed(0)}%</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            {viewMode === 'daily' && renderDailyView()}
            {viewMode === 'weekly' && renderWeeklyView()}
            {viewMode === 'monthly' && (
              <div className="text-center py-12 text-muted">
                Monthly view coming soon
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* By client */}
            <div className="card">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users size={16} />
                Hours by Client
              </h3>
              <div className="space-y-2">
                {Object.entries(hoursByClient)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([client, hours]) => (
                    <div key={client} className="flex items-center justify-between">
                      <span className="text-sm truncate sensitive">{client}</span>
                      <span className="text-sm font-medium">{hours.toFixed(1)}h</span>
                    </div>
                  ))}
                {Object.keys(hoursByClient).length === 0 && (
                  <p className="text-sm text-muted">No client hours</p>
                )}
              </div>
            </div>

            {/* By project */}
            <div className="card">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Briefcase size={16} />
                Hours by Project
              </h3>
              <div className="space-y-2">
                {Object.entries(hoursByProject)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([project, hours]) => (
                    <div key={project} className="flex items-center justify-between">
                      <span className="text-sm truncate">{project}</span>
                      <span className="text-sm font-medium">{hours.toFixed(1)}h</span>
                    </div>
                  ))}
                {Object.keys(hoursByProject).length === 0 && (
                  <p className="text-sm text-muted">No project hours</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add entry modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="card w-[600px] p-6 animate-slideDown">
            <h2 className="text-lg font-semibold mb-4">Add Time Entry</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="label">Hours</label>
                <input
                  type="number"
                  step="0.25"
                  className="input"
                  placeholder="2.5"
                  value={newEntry.hours || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, hours: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Client</label>
                <select
                  className="input"
                  value={newEntry.clientId}
                  onChange={(e) => setNewEntry({ ...newEntry, clientId: e.target.value })}
                >
                  <option value="">Select client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">Project</label>
                <select
                  className="input"
                  value={newEntry.projectId}
                  onChange={(e) => setNewEntry({ ...newEntry, projectId: e.target.value })}
                >
                  <option value="">Select project...</option>
                  {projects
                    .filter(p => !newEntry.clientId || p.clientId === newEntry.clientId)
                    .map(project => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Task (optional)</label>
              <select
                className="input"
                value={newEntry.taskId}
                onChange={(e) => setNewEntry({ ...newEntry, taskId: e.target.value })}
              >
                <option value="">Select task...</option>
                {tasks
                  .filter(t => !newEntry.projectId || t.projectId === newEntry.projectId)
                  .map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="label">Notes</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="What did you work on?"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newEntry.billable}
                  onChange={(e) => setNewEntry({ ...newEntry, billable: e.target.checked })}
                  className="rounded"
                />
                <span>Billable</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEntry}
                className="btn"
                disabled={newEntry.hours <= 0}
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}