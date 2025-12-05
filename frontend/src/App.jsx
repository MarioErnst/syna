import Calendar from './components/Calendar';
import Chat from './components/Chat';
import './App.css';

function App() {
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
        </div>
      </header>

      <main className="app-main">
        <div className="app-grid">
          <div className="calendar-section">
            <Calendar />
          </div>
          <div className="chat-section">
            <Chat />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Desarrollado con ❤️ usando React & FastAPI</p>
      </footer>
    </div>
  );
}

export default App;
