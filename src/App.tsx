import React, { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { initDB } from './lib/db';
import { useStore } from './lib/store';
import Layout from './components/Layout/Layout';
import ConsultantHome from './components/Dashboard/ConsultantHome';
import TaskList from './components/Tasks/TaskList';
import ProjectList from './components/Projects/ProjectList';
import ClientList from './components/Clients/ClientList';
import NoteList from './components/Notes/NoteList';
import OpportunityPipeline from './components/Opportunities/OpportunityPipeline';
import RAIDLog from './components/RAID/RAIDLog';
import KnowledgeRepository from './components/Knowledge/KnowledgeRepository';
import TimeTracker from './components/Time/TimeTracker';
import Settings from './components/Common/Settings';
import './styles/globals.css';

function App() {
  const { 
    currentView, 
    setView, 
    loadClients, 
    loadTasks, 
    loadProjects,
    theme,
    density,
    createTask
  } = useStore();

  // Initialize database and load initial data
  useEffect(() => {
    const init = async () => {
      await initDB();
      await loadClients();
      await loadTasks();
      await loadProjects();
    };
    init();
  }, [loadClients, loadTasks, loadProjects]); // Added dependencies to useEffect

  // Apply theme and density
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-density', density);
  }, [theme, density]);

  // Helper to check if input is focused
  const isInputFocused = () => {
    const activeElement = document.activeElement;
    return activeElement?.tagName === 'INPUT' ||
           activeElement?.tagName === 'TEXTAREA' ||
           activeElement?.getAttribute('contenteditable') === 'true';
  };

  // Global keyboard shortcuts
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    // Open search
    document.getElementById('global-search')?.focus();
  });

  useHotkeys('n', () => {
    // Quick add task
    createTask({ title: 'New Task', status: 'Inbox' });
  }, { enabled: !isInputFocused() });

  useHotkeys('shift+n', () => {
    // Quick add note
    setView('notes');
  }, { enabled: !isInputFocused() });

  useHotkeys('g c', () => setView('clients'), { enabled: !isInputFocused() });
  useHotkeys('g p', () => setView('projects'), { enabled: !isInputFocused() });
  useHotkeys('g t', () => setView('tasks'), { enabled: !isInputFocused() });
  useHotkeys('g k', () => setView('knowledge'), { enabled: !isInputFocused() });
  useHotkeys('g o', () => setView('opportunities'), { enabled: !isInputFocused() });
  useHotkeys('g r', () => setView('raid'), { enabled: !isInputFocused() });

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ConsultantHome />;
      case 'tasks':
        return <TaskList />;
      case 'projects':
        return <ProjectList />;
      case 'clients':
        return <ClientList />;
      case 'notes':
        return <NoteList />;
      case 'opportunities':
        return <OpportunityPipeline />;
      case 'raid':
        return <RAIDLog />;
      case 'knowledge':
        return <KnowledgeRepository />;
      case 'time':
        return <TimeTracker />;
      case 'settings':
        return <Settings />;
      default:
        return <ConsultantHome />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
}

export default App;