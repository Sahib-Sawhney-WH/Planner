import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Moon, Sun, Palette, Database,
  Download, Upload, Shield, Bell, Keyboard, Info,
  Save, FolderOpen, Archive, Trash2, RefreshCw
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

export default function Settings() {
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    density,
    setDensity,
    presenterMode,
    togglePresenterMode
  } = useStore();

  const [activeTab, setActiveTab] = useState('appearance');
  const [dataPath, setDataPath] = useState('%USERPROFILE%\\Planner');
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [startOnBoot, setStartOnBoot] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [encryptDatabase, setEncryptDatabase] = useState(false);

  const accentColors = [
    { name: 'Blue', value: '#4DA3FF' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#4CC38A' },
    { name: 'Orange', value: '#FB923C' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Indigo', value: '#6366F1' }
  ];

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'system', label: 'System', icon: SettingsIcon },
    { id: 'about', label: 'About', icon: Info }
  ];

  const handleExportData = () => {
    // In real app, would export all data to JSON
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      clients: [],
      projects: [],
      tasks: [],
      notes: [],
      timeEntries: []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planner_export_${dayjs().format('YYYY-MM-DD')}.json`;
    a.click();
  };

  const handleBackupNow = () => {
    // In real app, would create backup
    alert('Backup created successfully!');
  };

  const handleOptimizeDatabase = () => {
    // In real app, would run VACUUM on SQLite
    alert('Database optimized successfully!');
  };

  const renderAppearance = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <h3 className="font-medium mb-3">Theme</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
              theme === 'dark'
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border)] hover:border-[var(--ring)]'
            }`}
          >
            <Moon size={20} />
            <div>
              <div className="font-medium">Dark</div>
              <div className="text-xs opacity-75">Easy on the eyes</div>
            </div>
          </button>
          
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
              theme === 'light'
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border)] hover:border-[var(--ring)]'
            }`}
          >
            <Sun size={20} />
            <div>
              <div className="font-medium">Light</div>
              <div className="text-xs opacity-75">Classic bright</div>
            </div>
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="font-medium mb-3">Accent Color</h3>
        <div className="flex gap-2">
          {accentColors.map(color => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                accentColor === color.value
                  ? 'border-[var(--text)] scale-110'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="input w-32 text-sm"
            placeholder="#4DA3FF"
          />
        </div>
      </div>

      {/* Density */}
      <div>
        <h3 className="font-medium mb-3">Display Density</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setDensity('comfortable')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              density === 'comfortable'
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border)] hover:border-[var(--ring)]'
            }`}
          >
            <div className="font-medium">Comfortable</div>
            <div className="text-xs opacity-75">More spacing (56px rows)</div>
          </button>
          
          <button
            onClick={() => setDensity('compact')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              density === 'compact'
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border)] hover:border-[var(--ring)]'
            }`}
          >
            <div className="font-medium">Compact</div>
            <div className="text-xs opacity-75">Less spacing (44px rows)</div>
          </button>
        </div>
      </div>

      {/* Presenter Mode */}
      <div>
        <h3 className="font-medium mb-3">Privacy</h3>
        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-elevated transition-colors cursor-pointer">
          <div>
            <div className="font-medium">Presenter Mode</div>
            <div className="text-sm text-muted">Blur sensitive information during screenshares</div>
          </div>
          <input
            type="checkbox"
            checked={presenterMode}
            onChange={togglePresenterMode}
            className="rounded"
          />
        </label>
      </div>
    </div>
  );

  const renderDataBackup = () => (
    <div className="space-y-6">
      {/* Data Location */}
      <div>
        <h3 className="font-medium mb-3">Data Location</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={dataPath}
            onChange={(e) => setDataPath(e.target.value)}
            className="input flex-1"
            disabled
          />
          <button className="btn btn-ghost flex items-center gap-2">
            <FolderOpen size={16} />
            Browse
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          Database size: 24.3 MB • Last modified: {dayjs().format('MMM D, h:mm A')}
        </p>
      </div>

      {/* Backup */}
      <div>
        <h3 className="font-medium mb-3">Automatic Backup</h3>
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={autoBackup}
            onChange={(e) => setAutoBackup(e.target.checked)}
            className="rounded"
          />
          <span>Enable automatic backups</span>
        </label>
        
        {autoBackup && (
          <div className="pl-6 space-y-3">
            <div>
              <label className="label">Frequency</label>
              <select
                className="input"
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label className="label">Keep backups for</label>
              <select className="input">
                <option>7 days</option>
                <option>30 days</option>
                <option>90 days</option>
                <option>Forever</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleBackupNow}
            className="btn btn-ghost flex items-center gap-2"
          >
            <Archive size={16} />
            Backup Now
          </button>
          <button className="btn btn-ghost flex items-center gap-2">
            <RefreshCw size={16} />
            Restore Backup
          </button>
        </div>
      </div>

      {/* Import/Export */}
      <div>
        <h3 className="font-medium mb-3">Import & Export</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportData}
            className="btn btn-ghost flex items-center gap-2"
          >
            <Download size={16} />
            Export All Data
          </button>
          <button className="btn btn-ghost flex items-center gap-2">
            <Upload size={16} />
            Import Data
          </button>
        </div>
      </div>

      {/* Database */}
      <div>
        <h3 className="font-medium mb-3">Database Maintenance</h3>
        <div className="flex gap-2">
          <button
            onClick={handleOptimizeDatabase}
            className="btn btn-ghost flex items-center gap-2"
          >
            <Database size={16} />
            Optimize Database
          </button>
          <button className="btn btn-ghost flex items-center gap-2 text-[var(--danger)]">
            <Trash2 size={16} />
            Clear All Data
          </button>
        </div>
      </div>

      {/* Security */}
      <div>
        <h3 className="font-medium mb-3">Security</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={encryptDatabase}
            onChange={(e) => setEncryptDatabase(e.target.checked)}
            className="rounded"
          />
          <span>Encrypt database with Windows DPAPI</span>
        </label>
        <p className="text-xs text-muted mt-2">
          Protects your data if your device is lost or stolen
        </p>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Notifications</h3>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="rounded"
          />
          <span>Enable desktop notifications</span>
        </label>

        {notifications && (
          <div className="space-y-3 pl-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Overdue tasks</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Upcoming milestones</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Next step reminders</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Daily summary</span>
            </label>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-medium mb-3">Daily Planning Reminder</h3>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={notificationTime}
            onChange={(e) => setNotificationTime(e.target.value)}
            className="input"
          />
          <span className="text-sm text-muted">Local time</span>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Snooze Options</h3>
        <div className="grid grid-cols-3 gap-2">
          {['15 min', '30 min', '1 hour', '2 hours', '4 hours', 'Tomorrow'].map(option => (
            <button
              key={option}
              className="px-3 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--ring)] transition-colors text-sm"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShortcuts = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Global Shortcuts</h3>
        <div className="space-y-2">
          {[
            { key: 'Ctrl+K', action: 'Global search' },
            { key: 'N', action: 'New task' },
            { key: 'Shift+N', action: 'New note' },
            { key: 'Ctrl+Shift+N', action: 'Quick capture (system-wide)' },
            { key: 'B', action: 'Start/stop timer' },
            { key: 'V', action: 'Toggle presenter mode' },
            { key: 'Ctrl+,', action: 'Open settings' },
            { key: 'Ctrl+/', action: 'Keyboard shortcuts help' }
          ].map(shortcut => (
            <div key={shortcut.key} className="flex items-center justify-between py-2">
              <span className="text-sm">{shortcut.action}</span>
              <kbd className="px-2 py-1 bg-elevated rounded text-xs font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Navigation</h3>
        <div className="space-y-2">
          {[
            { key: 'G C', action: 'Go to Clients' },
            { key: 'G P', action: 'Go to Projects' },
            { key: 'G T', action: 'Go to Tasks' },
            { key: 'G K', action: 'Go to Knowledge' },
            { key: 'G O', action: 'Go to Opportunities' },
            { key: 'G R', action: 'Go to RAID' }
          ].map(shortcut => (
            <div key={shortcut.key} className="flex items-center justify-between py-2">
              <span className="text-sm">{shortcut.action}</span>
              <kbd className="px-2 py-1 bg-elevated rounded text-xs font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Task Actions</h3>
        <div className="space-y-2">
          {[
            { key: 'Space', action: 'Toggle checkbox' },
            { key: 'E', action: 'Edit selected' },
            { key: 'D', action: 'Delete selected' },
            { key: 'J/K', action: 'Move up/down' },
            { key: 'Enter', action: 'Open details' },
            { key: 'L', action: 'Mark as next step' },
            { key: 'R', action: 'Set recurrence' }
          ].map(shortcut => (
            <div key={shortcut.key} className="flex items-center justify-between py-2">
              <span className="text-sm">{shortcut.action}</span>
              <kbd className="px-2 py-1 bg-elevated rounded text-xs font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Startup</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={startOnBoot}
            onChange={(e) => setStartOnBoot(e.target.checked)}
            className="rounded"
          />
          <span>Start Planner when Windows starts</span>
        </label>
      </div>

      <div>
        <h3 className="font-medium mb-3">System Tray</h3>
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={minimizeToTray}
            onChange={(e) => setMinimizeToTray(e.target.checked)}
            className="rounded"
          />
          <span>Minimize to system tray instead of closing</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            defaultChecked
            className="rounded"
          />
          <span>Show tray icon</span>
        </label>
      </div>

      <div>
        <h3 className="font-medium mb-3">Performance</h3>
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            defaultChecked
            className="rounded"
          />
          <span>Hardware acceleration</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded"
          />
          <span>Reduce motion (respect Windows setting)</span>
        </label>
      </div>

      <div>
        <h3 className="font-medium mb-3">Deep Links</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            defaultChecked
            className="rounded"
          />
          <span>Register planner:// protocol handler</span>
        </label>
        <p className="text-xs text-muted mt-2">
          Allows opening Planner from other applications
        </p>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-[var(--accent)] rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <SettingsIcon size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Planner</h2>
        <p className="text-muted mb-4">Local-first productivity hub</p>
        <p className="text-sm text-muted">Version 1.0.0</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Built with</h3>
          <p className="text-sm text-muted">
            Tauri, React, TypeScript, SQLite, Tailwind CSS
          </p>
        </div>

        <div>
          <h3 className="font-medium mb-2">Privacy</h3>
          <p className="text-sm text-muted">
            All data stays local. No cloud, no accounts, no telemetry.
          </p>
        </div>

        <div>
          <h3 className="font-medium mb-2">License</h3>
          <p className="text-sm text-muted">
            Private use only. No redistribution without permission.
          </p>
        </div>

        <div>
          <h3 className="font-medium mb-2">Credits</h3>
          <p className="text-sm text-muted">
            Built for consultants who value privacy and productivity.
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-3 pt-4">
        <button className="btn btn-ghost text-sm">
          Check for Updates
        </button>
        <button className="btn btn-ghost text-sm">
          View Changelog
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-default">
        <div className="p-6">
          <h1 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <SettingsIcon size={24} />
            Settings
          </h1>
          
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'hover:bg-elevated'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-3xl">
          {activeTab === 'appearance' && renderAppearance()}
          {activeTab === 'data' && renderDataBackup()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'shortcuts' && renderShortcuts()}
          {activeTab === 'system' && renderSystem()}
          {activeTab === 'about' && renderAbout()}
        </div>
      </div>
    </div>
  );
}