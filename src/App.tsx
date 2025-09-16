import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import { initDB } from './lib/db';
import { useStore } from './lib/store';
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

function App() {
  const { loadData, setTheme, setAccentColor, setDensity, currentView } = useStore();

  useEffect(() => {
    const init = async () => {
      await initDB();
      await loadData();
      
      // Load saved preferences
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
      const savedAccentColor = localStorage.getItem('accentColor') || '#4DA3FF';
      const savedDensity = localStorage.getItem('density') as 'comfortable' | 'compact' || 'comfortable';
      
      setTheme(savedTheme);
      setAccentColor(savedAccentColor);
      setDensity(savedDensity);
    };
    
    init();
  }, [loadData, setTheme, setAccentColor, setDensity]);

  const renderCurrentView = () => {
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
      {renderCurrentView()}
    </Layout>
  );
}

export default App;

