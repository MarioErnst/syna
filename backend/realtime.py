import asyncio
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

_activity_connections: Set[WebSocket] = set()
_loop: asyncio.AbstractEventLoop | None = None


def set_loop(loop: asyncio.AbstractEventLoop):
    global _loop
    _loop = loop


@router.websocket("/ws/activities")
async def activities_ws(websocket: WebSocket):
    await websocket.accept()
    _activity_connections.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        _activity_connections.discard(websocket)


async def _broadcast(message: dict):
    to_remove = []
    for ws in list(_activity_connections):
        try:
            await ws.send_json(message)
        except Exception:
            to_remove.append(ws)
    for ws in to_remove:
        _activity_connections.discard(ws)


def broadcast_activity_change(event: str, payload: dict):
    message = {"event": event, "activity": payload}
    if _loop and _loop.is_running():
        try:
            asyncio.run_coroutine_threadsafe(_broadcast(message), _loop)
        except Exception:
            pass
    else:
        try:
            asyncio.create_task(_broadcast(message))
        except Exception:
            pass
