import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hola. Soy tu asistente de calendario. Puedes preguntarme sobre tus actividades o solicitar cambios.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(userMessage.content);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'error',
        content: `Error: ${error.message}. Verifica que el backend esté corriendo y que la API key de OpenAI esté configurada.`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    '¿Qué actividades tengo hoy?',
    '¿Cuál es mi próxima actividad?',
    '¿Qué tengo esta semana?',
    'Muéstrame todas mis actividades',
  ];

  const handleSuggestionClick = (question) => {
    setInput(question);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2 className="chat-title">Asistente</h2>
        <div className="chat-status">
          <span className={`status-indicator ${loading ? 'loading' : 'ready'}`}></span>
          <span className="status-text">
            {loading ? 'Pensando...' : 'Listo'}
          </span>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role} fade-in`}
          >
            <div className="message-avatar" />
            <div className="message-content">
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant fade-in">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="suggestions fade-in">
          <p className="suggestions-title">Preguntas sugeridas:</p>
          <div className="suggestions-grid">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(question)}
                className="suggestion-chip"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntame sobre tu calendario..."
          disabled={loading}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary send-button"
        >
          {loading ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default Chat;
