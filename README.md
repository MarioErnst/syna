# Calendario Inteligente 📅💬

Una aplicación web moderna y escalable que combina un calendario interactivo con un asistente de IA. Gestiona tus actividades y consulta tu agenda de manera natural mediante chat.

## 🌟 Características

- **Calendario Interactivo**: Vista mensual con navegación intuitiva
- **Gestión de Actividades**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
- **Chat con IA**: Asistente inteligente que responde preguntas sobre tu calendario
- **Diseño Moderno**: UI con glassmorphism, gradientes y animaciones suaves
- **Responsive**: Funciona perfectamente en desktop y móvil
- **Arquitectura Escalable**: Preparada para crecer con tu proyecto

## 🏗️ Arquitectura

### Backend

- **Framework**: FastAPI (Python)
- **Base de Datos**: SQLite (fácilmente migrable a PostgreSQL)
- **ORM**: SQLAlchemy
- **IA**: OpenAI GPT-4o-mini
- **Validación**: Pydantic schemas

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS moderno con variables y glassmorphism
- **HTTP Client**: Fetch API

## 📋 Requisitos Previos

- Python 3.8+
- Node.js 16+
- npm o yarn
- API Key de OpenAI

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
cd c:\Users\merns\REPOS\syna
```

### 2. Configurar Backend

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env
# Editar .env y agregar tu OPENAI_API_KEY
```

### 3. Configurar Frontend

```bash
# Navegar al directorio frontend (desde la raíz del proyecto)
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
copy .env.example .env
```

## 🎮 Uso

### Ejecutar Backend

```bash
# Desde el directorio backend/
# Con el entorno virtual activado
uvicorn main:app --reload --port 8000
```

El backend estará disponible en:

- API: `http://localhost:8000`
- Documentación interactiva: `http://localhost:8000/docs`

### Ejecutar Frontend

```bash
# Desde el directorio frontend/
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 📖 Guía de Uso

### Crear una Actividad

1. Haz clic en cualquier día del calendario
2. Completa el formulario con:
   - Título (requerido)
   - Fecha (requerido)
   - Hora (opcional)
   - Descripción (opcional)
3. Haz clic en "Crear"

### Editar/Eliminar Actividades

1. Selecciona una fecha con actividades
2. En la lista de actividades del día:
   - Clic en ✏️ para editar
   - Clic en 🗑️ para eliminar

### Usar el Chat

1. Escribe tu pregunta en el chat:
   - "¿Qué tengo hoy?"
   - "¿Cuándo es mi próxima reunión?"
   - "Muéstrame todas mis actividades"
2. El asistente responderá con información de tu calendario

## 🔧 Configuración

### Variables de Entorno - Backend

```env
OPENAI_API_KEY=tu-api-key-aqui
```

### Variables de Entorno - Frontend

```env
VITE_API_URL=http://localhost:8000
```

## 📁 Estructura del Proyecto

```
syna/
├── backend/
│   ├── main.py              # Aplicación FastAPI principal
│   ├── models.py            # Modelos SQLAlchemy
│   ├── schemas.py           # Schemas Pydantic
│   ├── routes/
│   │   ├── activities.py    # Endpoints CRUD
│   │   └── chat.py          # Endpoint de chat IA
│   ├── requirements.txt     # Dependencias Python
│   └── .env                 # Variables de entorno
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar.jsx # Componente de calendario
│   │   │   ├── Calendar.css
│   │   │   ├── Chat.jsx     # Componente de chat
│   │   │   └── Chat.css
│   │   ├── services/
│   │   │   └── api.js       # Cliente HTTP
│   │   ├── App.jsx          # Componente principal
│   │   ├── App.css
│   │   └── index.css        # Sistema de diseño
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🌐 API Endpoints

### Actividades

- `GET /api/activities` - Listar todas las actividades
- `GET /api/activities/{id}` - Obtener una actividad
- `POST /api/activities` - Crear actividad
- `PUT /api/activities/{id}` - Actualizar actividad
- `DELETE /api/activities/{id}` - Eliminar actividad

### Chat

- `POST /api/chat` - Enviar mensaje al asistente

## 🎨 Características de Diseño

- **Glassmorphism**: Efectos de vidrio esmerilado
- **Gradientes Dinámicos**: Colores vibrantes y modernos
- **Animaciones Suaves**: Transiciones fluidas
- **Modo Oscuro**: Diseño principal en tonos oscuros
- **Responsive Design**: Adaptable a todos los tamaños de pantalla

## 🚀 Escalabilidad

### Migrar a PostgreSQL

1. Instalar psycopg2: `pip install psycopg2-binary`
2. Cambiar DATABASE_URL en `models.py`:
   ```python
   DATABASE_URL = "postgresql://user:password@localhost/dbname"
   ```

### Deploy a Producción

**Backend (opciones)**:

- Railway
- Render
- Heroku
- AWS EC2

**Frontend (opciones)**:

- Vercel
- Netlify
- AWS S3 + CloudFront

## 🛠️ Tecnologías Utilizadas

- **Backend**: FastAPI, SQLAlchemy, OpenAI, Pydantic, Uvicorn
- **Frontend**: React, Vite
- **Database**: SQLite (dev), PostgreSQL (producción recomendada)
- **Styling**: CSS moderno con variables
- **Fonts**: Inter (Google Fonts)

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

Desarrollado con ❤️ usando React & FastAPI
