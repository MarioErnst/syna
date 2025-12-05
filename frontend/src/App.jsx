import { useState } from 'react';
import Calendar from './components/Calendar';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [view, setView] = useState('chat');
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="gradient-text">Calendario Inteligente</span>
          </h1>
          <p className="app-subtitle">
            Gestiona tus actividades y consulta con IA 
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              className={`btn ${view === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('chat')}
            >
              Inicio (Chat)
            </button>
            <button
              className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('calendar')}
            >
              Calendario
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {view === 'chat' ? (
          <div className="chat-section">
            <Chat />
          </div>
        ) : (
          <div className="calendar-section">
            <Calendar />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p></p>
      </footer>
    </div>
  );
}

export default App;
