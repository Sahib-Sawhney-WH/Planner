import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Initialize app
async function init() {
  // Wait for Tauri to be ready
  if (window.__TAURI__) {
    const { appWindow } = await import('@tauri-apps/api/window');
    
    // Set up window event listeners
    document.getElementById('titlebar-minimize')?.addEventListener('click', () => appWindow.minimize());
    document.getElementById('titlebar-maximize')?.addEventListener('click', () => appWindow.toggleMaximize());
    document.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close());
    
    // Register global shortcuts
    const { register } = await import('@tauri-apps/api/globalShortcut');
    
    // Quick capture shortcut (Ctrl+Shift+N)
    await register('CommandOrControl+Shift+N', () => {
      // Focus app and open quick add
      appWindow.show();
      appWindow.setFocus();
      document.getElementById('quick-add-global')?.click();
    });
  }
}

init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);