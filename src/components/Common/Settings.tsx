import { useState } from 'react';
import {
  Settings, Monitor, Moon, Sun, Palette, 
  Download, Upload, Keyboard, Info,
  FolderOpen, Archive, Trash2, RefreshCw
} from 'lucide-react';
import { useStore } from '../../lib/store';

export default function SettingsComponent() {
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

  const accentColors = [
    { name: 'Blue', value: '#4DA3FF' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' },
  ];

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data', icon: Archive },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'about', label: 'About', icon: Info },
  ];

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <h3 className="font-medium mb-3">Theme</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              theme === 'light' 
                ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                : 'border-default hover:bg-elevated'
            }`}
          >
            <Sun size={16} />
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              theme === 'dark' 
                ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                : 'border-default hover:bg-elevated'
            }`}
          >
            <Moon size={16} />
            Dark
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="font-medium mb-3">Accent Color</h3>
        <div className="grid grid-cols-3 gap-2">
          {accentColors.map(color => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                accentColor === color.value 
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                  : 'border-default hover:bg-elevated'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color.value }}
              />
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div>
        <h3 className="font-medium mb-3">Density</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDensity('comfortable')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              density === 'comfortable' 
                ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                : 'border-default hover:bg-elevated'
            }`}
          >
            Comfortable
          </button>
          <button
            onClick={() => setDensity('compact')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              density === 'compact' 
                ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                : 'border-default hover:bg-elevated'
            }`}
          >
            Compact
          </button>
        </div>
      </div>

      {/* Presenter Mode */}
      <div>
        <h3 className="font-medium mb-3">Presenter Mode</h3>
        <button
          onClick={togglePresenterMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            presenterMode 
              ? 'border-[var(--warn)] bg-[var(--warn)]/10' 
              : 'border-default hover:bg-elevated'
          }`}
        >
          <Monitor size={16} />
          {presenterMode ? 'Disable' : 'Enable'} Presenter Mode
        </button>
        <p className="text-sm text-muted mt-2">
          Hides sensitive information when presenting or sharing screen
        </p>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Export Data</h3>
        <div className="space-y-2">
          <button className="btn btn-ghost w-full justify-start">
            <Download size={16} />
            Export All Data
          </button>
          <button className="btn btn-ghost w-full justify-start">
            <FolderOpen size={16} />
            Export Tasks Only
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Import Data</h3>
        <button className="btn btn-ghost w-full justify-start">
          <Upload size={16} />
          Import from File
        </button>
      </div>

      <div>
        <h3 className="font-medium mb-3">Data Management</h3>
        <div className="space-y-2">
          <button className="btn btn-ghost w-full justify-start">
            <RefreshCw size={16} />
            Refresh All Data
          </button>
          <button className="btn btn-ghost w-full justify-start text-[var(--danger)]">
            <Trash2 size={16} />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderShortcutsTab = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Navigation</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Go to Tasks</span>
            <kbd className="kbd">G T</kbd>
          </div>
          <div className="flex justify-between">
            <span>Go to Projects</span>
            <kbd className="kbd">G P</kbd>
          </div>
          <div className="flex justify-between">
            <span>Go to Clients</span>
            <kbd className="kbd">G C</kbd>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Actions</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Quick Add Task</span>
            <kbd className="kbd">N</kbd>
          </div>
          <div className="flex justify-between">
            <span>Global Search</span>
            <kbd className="kbd">Ctrl K</kbd>
          </div>
          <div className="flex justify-between">
            <span>Start/Stop Timer</span>
            <kbd className="kbd">B</kbd>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Planner</h3>
        <p className="text-muted">Version 1.0.0</p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">About</h4>
          <p className="text-sm text-muted">
            A local-first productivity application for consultants, built with Tauri and React.
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Features</h4>
          <ul className="text-sm text-muted space-y-1">
            <li>• Task and project management</li>
            <li>• Client relationship tracking</li>
            <li>• Time tracking and reporting</li>
            <li>• Knowledge repository</li>
            <li>• Opportunity pipeline</li>
            <li>• RAID log management</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceTab();
      case 'data':
        return renderDataTab();
      case 'shortcuts':
        return renderShortcutsTab();
      case 'about':
        return renderAboutTab();
      default:
        return renderAppearanceTab();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-default">
        <Settings className="text-[var(--accent)]" size={28} />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-default p-4">
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
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

