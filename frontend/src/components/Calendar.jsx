import { useState, useEffect } from 'react';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../services/api';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    pillar: 'habitos_personales',
  });

  // Load activities
  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/activities';
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'created') {
          setActivities(prev => [...prev, data.activity]);
        } else if (data.event === 'updated') {
          setActivities(prev => prev.map(a => a.id === data.activity.id ? data.activity : a));
        } else if (data.event === 'deleted') {
          setActivities(prev => prev.filter(a => a.id !== data.activity.id));
        }
      } catch {
        console.error('Error procesando mensaje WS');
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getActivities();
      setActivities(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar actividades: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getActivitiesForDate = (date) => {
    return activities.filter(activity => activity.date === date);
  };

  const sortByTime = (list) => {
    return [...list].sort((a, b) => {
      const ta = a.time ? a.time : '99:99';
      const tb = b.time ? b.time : '99:99';
      return ta.localeCompare(tb);
    });
  };

  const handleDayClick = (day) => {
    const date = formatDate(year, month, day);
    setSelectedDate(date);
    setFormData({ ...formData, date });
    setShowModal(true);
    setEditingActivity(null);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description || '',
      date: activity.date,
      time: activity.time || '',
      pillar: activity.pillar || 'habitos_personales',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, formData);
      } else {
        await createActivity(formData);
      }
      
      await loadActivities();
      setShowModal(false);
      setFormData({ title: '', description: '', date: '', time: '', pillar: 'habitos_personales' });
      setEditingActivity(null);
      setError(null);
    } catch (err) {
      setError('Error al guardar actividad: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;
    
    setLoading(true);
    try {
      await deleteActivity(id);
      await loadActivities();
      setError(null);
    } catch (err) {
      setError('Error al eliminar actividad: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(year, month, day);
      const dayActivities = getActivitiesForDate(date);
      const isToday = 
        day === today.getDate() && 
        month === today.getMonth() && 
        year === today.getFullYear();
      
      const sorted = sortByTime(dayActivities);
      const visible = sorted.slice(0, 3);
      const remaining = sorted.length - visible.length;
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${dayActivities.length > 0 ? 'has-activities' : ''} ${dayActivities.length > 0 ? `has-activities-${dayActivities[0].pillar}` : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{day}</span>
          {visible.length > 0 && (
            <div className="day-activities">
              {visible.map(a => (
                <div
                  key={a.id}
                  className={`activity-block pillar-${a.pillar}`}
                  onClick={(e) => { e.stopPropagation(); handleEditActivity(a); }}
                  title={`${a.time ? a.time + ' ' : ''}${a.title}`}
                >
                  {a.time && <span className="activity-time-small">{a.time}</span>}
                  <span className="activity-title-small">{a.title}</span>
                </div>
              ))}
              {remaining > 0 && (
                <div className="more-indicator">+{remaining} más</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2 className="calendar-title">Calendario</h2>
        
        <div className="month-navigation">
          <button onClick={prevMonth} className="btn btn-secondary">
            ←
          </button>
          <h3 className="current-month">
            {monthNames[month]} {year}
          </h3>
          <button onClick={nextMonth} className="btn btn-secondary">
            →
          </button>
          <button
            onClick={() => {
              const todayDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              setSelectedDate(todayDate);
              setFormData({ title: '', description: '', date: todayDate, time: '', pillar: 'habitos_personales' });
              setEditingActivity(null);
              setShowModal(true);
            }}
            className="btn btn-primary"
            style={{ marginLeft: 'auto' }}
          >
            Nueva actividad
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message fade-in">
          {error}
        </div>
      )}

      <div className="calendar-grid">
        {dayNames.map(name => (
          <div key={name} className="calendar-day-name">
            {name}
          </div>
        ))}
        {renderCalendarDays()}
      </div>

      {selectedDate && (
        <div className="activities-list">
          <h3 className="activities-title">
            Actividades del {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </h3>
          
          {getActivitiesForDate(selectedDate).length === 0 ? (
            <p className="no-activities">No hay actividades para este día</p>
          ) : (
            <div className="activities-grid">
              {getActivitiesForDate(selectedDate).map(activity => (
                <div key={activity.id} className="activity-card fade-in">
                  <div className="activity-content">
                    <h4 className="activity-title">{activity.title}</h4>
                    <span className={`pillar-chip pillar-${activity.pillar}`}>{activity.pillar.replace('_', ' ')}</span>
                    {activity.time && (
                      <p className="activity-time">{activity.time}</p>
                    )}
                    {activity.description && (
                      <p className="activity-description">{activity.description}</p>
                    )}
                  </div>
                  <div className="activity-actions">
                    <button
                      onClick={() => handleEditActivity(activity)}
                      className="btn btn-secondary btn-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
            </h3>
            
            <form onSubmit={handleSubmit} className="activity-form">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Reunión de equipo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hora</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Pilar *</label>
                <select
                  value={formData.pillar}
                  onChange={(e) => setFormData({ ...formData, pillar: e.target.value })}
                  required
                >
                  <option value="vida_sana">Vida sana</option>
                  <option value="crecimiento_intelectual">Crecimiento intelectual</option>
                  <option value="habitos_personales">Hábitos personales</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles adicionales..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : editingActivity ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
