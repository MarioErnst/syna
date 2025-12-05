from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models import init_db
from routes import activities, chat
import realtime

# Initialize FastAPI app
app = FastAPI(
    title="Calendar Chat API",
    description="API para calendario con asistente de chat IA",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:5175"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Register routers
app.include_router(activities.router)
app.include_router(chat.router)
app.include_router(realtime.router)


@app.on_event("startup")
async def _startup():
    import asyncio
    realtime.set_loop(asyncio.get_running_loop())


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Calendar Chat API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
