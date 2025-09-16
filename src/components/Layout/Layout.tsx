import React, { useState } from 'react';
import { 
  Home, CheckSquare, Briefcase, Users, FileText, 
  TrendingUp, AlertTriangle, BookOpen, Clock, Settings,
  Search, Plus, Menu, X, ChevronRight, Timer, Eye, EyeOff
} from 'lucide-react';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { 
    currentView, 
    setView, 
    searchQuery,
    search,
    clearSearch,
    createTask,
    activeTimer,
    stopTimer,
    updateTimer,
    presenterMode,
    togglePresenterMode,
    drawerOpen,
    drawerContent,
    closeDrawer
  } = useStore();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Update timer every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (activeTimer) {
        updateTimer();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home, shortcut: '' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, shortcut: 'G T' },
    { id: 'projects', label: 'Projects', icon: Briefcase, shortcut: 'G P' },
    { id: 'clients', label: 'Clients', icon: Users, shortcut: 'G C' },
    { id: 'notes', label: 'Notes', icon: FileText, shortcut: 'Shift+N' },
    { id: 'opportunities', label: 'Pipeline', icon: TrendingUp, shortcut: 'G O' },
    { id: 'raid', label: 'RAID', icon: AlertTriangle, shortcut: 'G R' },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen, shortcut: 'G K' },
    { id: 'time', label: 'Time', icon: Clock, shortcut: 'B' },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: '' },
  ];

  const formatTimer = (ms: number) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000) % 60;
    const hours = Math.floor(ms / 3600000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-elevated border-r border-default transition-all duration-180 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-default">
          {!sidebarCollapsed && (
            <h1 className="font-semibold text-lg">Planner</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  isActive 
                    ? 'bg-[var(--accent)] text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-muted hover:text-[var(--text)]'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.shortcut && (
                      <span className="text-xs opacity-60">{item.shortcut}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Timer display */}
        {activeTimer && (
          <div className="absolute bottom-4 left-2 right-2">
            <div className="card p-3">
              {!sidebarCollapsed && (
                <div className="text-xs text-muted mb-1">Timer Running</div>
              )}
              <div className="font-mono text-lg text-[var(--accent)]">
                {formatTimer(activeTimer.elapsed)}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={stopTimer}
                  className="mt-2 w-full btn btn-ghost text-xs py-1"
                >
                  Stop Timer
                </button>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-elevated border-b border-default flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            {/* Global search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                id="global-search"
                type="text"
                placeholder="Search everything... (Ctrl+K)"
                className="input pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => search(e.target.value)}
                onFocus={() => setSearchOpen(true)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text)]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick add */}
            <button
              onClick={() => createTask({ title: 'New Task', status: 'Inbox' })}
              className="btn flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Quick Add</span>
              <span className="text-xs opacity-60">N</span>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Timer button */}
            <button
              onClick={() => {
                if (activeTimer) {
                  stopTimer();
                } else {
                  // Start timer - would open task selector
                  useStore.getState().startTimer();
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                activeTimer 
                  ? 'bg-[var(--accent)] text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Start/Stop Timer (B)"
            >
              <Timer size={18} />
            </button>

            {/* Presenter mode */}
            <button
              onClick={togglePresenterMode}
              className={`p-2 rounded-lg transition-colors ${
                presenterMode 
                  ? 'bg-[var(--warn)] text-[var(--bg)]' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Presenter Mode (V)"
            >
              {presenterMode ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {/* Current time */}
            <div className="text-sm text-muted">
              {dayjs().format('ddd, MMM D • h:mm A')}
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto bg-[var(--bg)]">
          {children}
        </main>
      </div>

      {/* Drawer */}
      <div 
        className={`drawer ${drawerOpen ? 'open' : ''}`}
        style={{ width: '480px' }}
      >
        {drawerOpen && (
          <>
            <div className="flex items-center justify-between h-14 px-6 border-b border-default">
              <h2 className="font-semibold">Details</h2>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-auto h-[calc(100%-3.5rem)]">
              {drawerContent}
            </div>
          </>
        )}
      </div>

      {/* Search results overlay */}
      {searchOpen && searchQuery && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] max-h-[500px] overflow-auto card animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <h3 className="font-semibold mb-3">Search Results</h3>
              <div className="text-muted">
                Search functionality would be implemented here
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

