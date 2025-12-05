from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from openai import OpenAI
import os
import json
from datetime import datetime

from models import Activity, get_db
from schemas import ChatRequest, ChatResponse, ActivityCreate, ActivityUpdate, ActivityResponse
from realtime import broadcast_activity_change

router = APIRouter(prefix="/api/chat", tags=["chat"])

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_activities_context(db: Session) -> str:
    activities = db.query(Activity).order_by(Activity.date, Activity.time).all()
    if not activities:
        return "No hay actividades registradas en el calendario."
    context = "Actividades en el calendario:\n\n"
    for activity in activities:
        time_str = f" a las {activity.time}" if activity.time else ""
        desc_str = f" - {activity.description}" if activity.description else ""
        context += f"- {activity.title} el {activity.date}{time_str}{desc_str}\n"
    return context


def _json_content(obj) -> str:
    if hasattr(obj, "model_dump_json"):
        try:
            return obj.model_dump_json()
        except Exception:
            pass
    try:
        return json.dumps(
            obj,
            default=lambda o: o.isoformat() if hasattr(o, "isoformat") else str(o)
        )
    except Exception:
        return json.dumps(str(obj))

def create_activity_tool(args: dict, db: Session) -> ActivityResponse:
    data = ActivityCreate(**args)
    db_activity = Activity(**data.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    broadcast_activity_change("created", {
        "id": db_activity.id,
        "title": db_activity.title,
        "description": db_activity.description,
        "date": db_activity.date,
        "time": db_activity.time,
        "created_at": db_activity.created_at.isoformat()
    })
    return ActivityResponse.model_validate(db_activity)

def update_activity_tool(args: dict, db: Session) -> ActivityResponse:
    activity_id = args.get("id")
    db_activity = None
    if activity_id is not None:
        db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    else:
        title = args.get("title")
        date = args.get("date")
        if title and date:
            db_activity = db.query(Activity).filter(Activity.title == title, Activity.date == date).first()
        elif title:
            db_activity = db.query(Activity).filter(Activity.title == title).order_by(Activity.date, Activity.time).first()
        elif date:
            db_activity = db.query(Activity).filter(Activity.date == date).order_by(Activity.time).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    update = ActivityUpdate(**{k: v for k, v in args.items() if k != "id"})
    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_activity, field, value)
    db.commit()
    db.refresh(db_activity)
    broadcast_activity_change("updated", {
        "id": db_activity.id,
        "title": db_activity.title,
        "description": db_activity.description,
        "date": db_activity.date,
        "time": db_activity.time,
        "created_at": db_activity.created_at.isoformat()
    })
    return ActivityResponse.model_validate(db_activity)

def delete_activity_tool(args: dict, db: Session) -> dict:
    activity_id = args.get("id")
    db_activity = None
    if activity_id is not None:
        db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    else:
        title = args.get("title")
        date = args.get("date")
        if title and date:
            db_activity = db.query(Activity).filter(Activity.title == title, Activity.date == date).first()
        elif title:
            db_activity = db.query(Activity).filter(Activity.title == title).order_by(Activity.date, Activity.time).first()
        elif date:
            db_activity = db.query(Activity).filter(Activity.date == date).order_by(Activity.time).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    payload = {
        "id": db_activity.id,
        "title": db_activity.title,
        "date": db_activity.date
    }
    db.delete(db_activity)
    db.commit()
    broadcast_activity_change("deleted", payload)
    return {"message": "Actividad eliminada", **payload}

def tools_definitions():
    return [
        {
            "type": "function",
            "function": {
                "name": "create_activity",
                "description": "Crear una actividad en el calendario",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                        "date": {"type": "string", "description": "YYYY-MM-DD"},
                        "time": {"type": "string", "description": "HH:MM"}
                    },
                    "required": ["title", "date"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_activity",
                "description": "Actualizar una actividad del calendario",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer"},
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                        "date": {"type": "string"},
                        "time": {"type": "string"}
                    },
                    "required": ["id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_activity",
                "description": "Eliminar una actividad del calendario",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer"}
                    },
                    "required": ["id"]
                }
            }
        }
    ]


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OpenAI API key no configurada")
    activities_context = get_activities_context(db)
    current_date = datetime.now().strftime("%Y-%m-%d")
    system_prompt = (
        "Eres un asistente de calendario. Puedes consultar y también gestionar actividades: "
        "crear, actualizar y eliminar usando herramientas. "
        f"Fecha actual: {current_date}\n\n{activities_context}\n\n"
        "Cuando el usuario te pida cambios, usa las funciones disponibles."
    )
    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message},
        ]
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=tools_definitions(),
            tool_choice="auto",
            temperature=0.1,
            max_tokens=500,
        )
        choice = response.choices[0]
        msg = choice.message
        if getattr(msg, "tool_calls", None):
            tool_results = []
            for call in msg.tool_calls:
                name = call.function.name
                args = json.loads(call.function.arguments or "{}")
                if name == "create_activity":
                    result = create_activity_tool(args, db)
                elif name == "update_activity":
                    result = update_activity_tool(args, db)
                elif name == "delete_activity":
                    result = delete_activity_tool(args, db)
                else:
                    result = {"error": "Herramienta desconocida"}
                tool_results.append({"tool_call_id": call.id, "name": name, "result": result})
            assistant_msg = {
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {
                        "id": call.id,
                        "type": "function",
                        "function": {
                            "name": call.function.name,
                            "arguments": call.function.arguments or "{}",
                        },
                    }
                    for call in msg.tool_calls
                ],
            }
            messages.append(assistant_msg)
            for tr in tool_results:
                content_obj = tr["result"]
                content_str = _json_content(content_obj)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tr["tool_call_id"],
                    "name": tr["name"],
                    "content": content_str,
                })
            followup = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.1,
                max_tokens=400,
            )
            final_text = followup.choices[0].message.content
            return ChatResponse(response=final_text)
        return ChatResponse(response=msg.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comunicando con el servicio de IA: {str(e)}")
