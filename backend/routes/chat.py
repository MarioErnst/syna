from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI
import os
from datetime import datetime

from models import Activity, get_db
from schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_activities_context(db: Session) -> str:
    """Get all activities formatted for AI context"""
    activities = db.query(Activity).order_by(Activity.date, Activity.time).all()
    
    if not activities:
        return "No hay actividades registradas en el calendario."
    
    context = "Actividades en el calendario:\n\n"
    for activity in activities:
        time_str = f" a las {activity.time}" if activity.time else ""
        desc_str = f" - {activity.description}" if activity.description else ""
        context += f"- {activity.title} el {activity.date}{time_str}{desc_str}\n"
    
    return context


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Chat endpoint with AI assistant about calendar activities"""
    
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured"
        )
    
    # Get current activities context
    activities_context = get_activities_context(db)
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # System prompt with calendar context
    system_prompt = f"""Eres un asistente útil de calendario. Tu función es ayudar al usuario a consultar información sobre sus actividades.

Fecha actual: {current_date}

{activities_context}

Responde de manera concisa y útil. Si te preguntan sobre actividades, usa la información del calendario. Si no hay información relevante, indícalo amablemente. Responde siempre en español."""
    
    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        assistant_response = response.choices[0].message.content
        return ChatResponse(response=assistant_response)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with AI service: {str(e)}"
        )
