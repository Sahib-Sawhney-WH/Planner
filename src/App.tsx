import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import { initDB } from './lib/db';
import { useStore } from './lib/store';

function App() {
  const { loadData, setTheme, setAccentColor, setDensity } = useStore();

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

  return <Layout />;
}

export default App;