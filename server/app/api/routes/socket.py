from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Query, Path
from app.services.socket_service import socket_manager
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/{room_id}")
async def websocket_room_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket connection for tracking JSON changes in a specific room."""
    client_id = f"{websocket.client.host}:{websocket.client.port}"
    logger.info(f"Client {client_id} connecting to room {room_id}...")
    
    # Connect client to socket manager with room ID
    await socket_manager.connect(websocket, room_id)
    
    # Send current state immediately after connection
    await websocket.send_json(socket_manager.get_room_data(room_id))
    
    try:
        while True:
            # Receive JSON update
            data = await websocket.receive_json()
            logger.info(f"Received data from {client_id} in room {room_id}: {data}")
            await socket_manager.update_json(room_id, data)
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected from room {room_id}")
        socket_manager.disconnect(websocket, room_id)
    except Exception as e:
        logger.error(f"Error with client {client_id} in room {room_id}: {str(e)}")
        socket_manager.disconnect(websocket, room_id)

# Keep the original endpoint for backward compatibility
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Legacy endpoint that uses a default room"""
    await websocket_room_endpoint(websocket, "default")

# API to get list of active rooms
@router.get("/rooms")
async def get_active_rooms():
    """Get list of active rooms"""
    rooms = socket_manager.get_active_rooms()
    return {"active_rooms": rooms, "count": len(rooms)}
