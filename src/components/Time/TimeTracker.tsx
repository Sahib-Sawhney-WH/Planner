import { useState } from 'react';
import {
  Clock, Play, Pause, Download,
  Users, Briefcase, Plus
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

export default function TimeTracker() {
  const {
    timeEntries,
    tasks,
    clients,
    projects,
    activeTimer,
    startTimer,
    stopTimer,
    createTimeEntry
  } = useStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntryTaskId, setNewEntryTaskId] = useState('');
  const [newEntryDuration, setNewEntryDuration] = useState('');
  const [newEntryDescription, setNewEntryDescription] = useState('');

  // Filter time entries by period
  const getFilteredEntries = () => {
    const now = dayjs();
    return timeEntries.filter(entry => {
      const entryDate = dayjs(entry.date);
      switch (selectedPeriod) {
        case 'today':
          return entryDate.isSame(now, 'day');
        case 'week':
          return entryDate.isSame(now, 'week');
        case 'month':
          return entryDate.isSame(now, 'month');
        default:
          return true;
      }
    });
  };

  const filteredEntries = getFilteredEntries();

  // Calculate totals
  const totalMinutes = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalHours = totalMinutes / 60;

  // Group by client/project
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const task = tasks.find(t => t.id === entry.taskId);
    const client = task ? clients.find(c => c.id === task.clientId) : null;
    const project = task ? projects.find(p => p.id === task.projectId) : null;
    
    const key = client ? client.name : 'No Client';
    if (!groups[key]) {
      groups[key] = { entries: [], total: 0, client, project };
    }
    groups[key].entries.push(entry);
    groups[key].total += entry.duration;
    
    return groups;
  }, {} as Record<string, { entries: any[], total: number, client: any, project: any }>);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimer = (ms: number) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000) % 60;
    const hours = Math.floor(ms / 3600000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddEntry = () => {
    if (newEntryTaskId && newEntryDuration) {
      const duration = parseInt(newEntryDuration);
      if (duration > 0) {
        createTimeEntry({
          taskId: newEntryTaskId,
          duration,
          description: newEntryDescription,
          date: new Date().toISOString()
        });
        setNewEntryTaskId('');
        setNewEntryDuration('');
        setNewEntryDescription('');
        setShowAddModal(false);
      }
    }
  };

  const exportTimeData = () => {
    const csvData = filteredEntries.map(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      const client = task ? clients.find(c => c.id === task.clientId) : null;
      const project = task ? projects.find(p => p.id === task.projectId) : null;
      
      return {
        Date: dayjs(entry.date).format('YYYY-MM-DD'),
        Client: client?.name || 'No Client',
        Project: project?.title || 'No Project',
        Task: task?.title || 'Unknown Task',
        Duration: formatDuration(entry.duration),
        Description: entry.description || ''
      };
    });

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-report-${selectedPeriod}-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-default">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Clock className="text-[var(--accent)]" size={28} />
            Time Tracker
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="input w-32"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Export */}
          <button
            onClick={exportTimeData}
            className="btn btn-ghost"
          >
            <Download size={16} />
            Export
          </button>

          {/* Add entry */}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn"
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Timer Section */}
      <div className="p-6 border-b border-default">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-2">Current Timer</h3>
              {activeTimer ? (
                <div>
                  <div className="text-3xl font-mono text-[var(--accent)] mb-2">
                    {formatTimer(activeTimer.elapsed)}
                  </div>
                  <p className="text-sm text-muted">
                    {activeTimer.taskId ? 
                      tasks.find(t => t.id === activeTimer.taskId)?.title || 'Unknown Task' :
                      'No task selected'
                    }
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-mono text-muted mb-2">00:00:00</div>
                  <p className="text-sm text-muted">No timer running</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {activeTimer ? (
                <button
                  onClick={stopTimer}
                  className="btn btn-lg bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90"
                >
                  <Pause size={20} />
                  Stop Timer
                </button>
              ) : (
                <button
                  onClick={() => startTimer()}
                  className="btn btn-lg bg-[var(--success)] text-white hover:bg-[var(--success)]/90"
                >
                  <Play size={20} />
                  Start Timer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 border-b border-default">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              {formatDuration(totalMinutes)}
            </div>
            <div className="text-sm text-muted">Total Time</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              {filteredEntries.length}
            </div>
            <div className="text-sm text-muted">Entries</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              {Object.keys(groupedEntries).length}
            </div>
            <div className="text-sm text-muted">Clients</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--accent)] mb-1">
              ${(totalHours * 150).toLocaleString()}
            </div>
            <div className="text-sm text-muted">Est. Value</div>
          </div>
        </div>
      </div>

      {/* Time Entries */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([clientName, group]) => (
            <div key={clientName} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-[var(--accent)]" />
                  <h3 className="font-semibold text-lg">{clientName}</h3>
                </div>
                <div className="text-lg font-semibold text-[var(--accent)]">
                  {formatDuration(group.total)}
                </div>
              </div>
              
              <div className="space-y-2">
                {group.entries.map(entry => {
                  const task = tasks.find(t => t.id === entry.taskId);
                  const project = task ? projects.find(p => p.id === task.projectId) : null;
                  
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-elevated rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{task?.title || 'Unknown Task'}</div>
                        {project && (
                          <div className="text-sm text-muted flex items-center gap-2">
                            <Briefcase size={14} />
                            {project.title}
                          </div>
                        )}
                        {entry.description && (
                          <div className="text-sm text-muted mt-1">{entry.description}</div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{formatDuration(entry.duration)}</div>
                        <div className="text-sm text-muted">
                          {dayjs(entry.date).format('MMM D, h:mm A')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center text-muted py-12">
            No time entries for {selectedPeriod}
          </div>
        )}
      </div>

      {/* Add entry modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-96 p-6">
            <h3 className="text-lg font-semibold mb-4">Add Time Entry</h3>
            
            <div className="space-y-4">
              <select
                value={newEntryTaskId}
                onChange={(e) => setNewEntryTaskId(e.target.value)}
                className="input w-full"
              >
                <option value="">Select task...</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Duration (minutes)..."
                value={newEntryDuration}
                onChange={(e) => setNewEntryDuration(e.target.value)}
                className="input w-full"
                min="1"
              />
              
              <textarea
                placeholder="Description (optional)..."
                value={newEntryDescription}
                onChange={(e) => setNewEntryDescription(e.target.value)}
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
                onClick={handleAddEntry}
                className="btn"
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

