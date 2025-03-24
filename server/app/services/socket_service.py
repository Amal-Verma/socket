from fastapi import WebSocket
from typing import Dict, List, Set
import logging

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        # Dictionary mapping room_id -> list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Dictionary mapping room_id -> room's JSON data
        self.room_data: Dict[str, Dict] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        """Connect a client to a specific room"""
        await websocket.accept()
        
        # Create room if it doesn't exist
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
            self.room_data[room_id] = {}
            logger.info(f"Created new room: {room_id}")
        
        # Add connection to room
        self.active_connections[room_id].append(websocket)
        logger.info(f"Client connected to room {room_id}. Total clients in room: {len(self.active_connections[room_id])}")

    def disconnect(self, websocket: WebSocket, room_id: str):
        """Remove client from a room"""
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
                logger.info(f"Client disconnected from room {room_id}. Remaining clients: {len(self.active_connections[room_id])}")
            
            # Clean up empty rooms
            if len(self.active_connections[room_id]) == 0:
                del self.active_connections[room_id]
                del self.room_data[room_id]
                logger.info(f"Room {room_id} deleted (no more clients)")

    async def broadcast_to_room(self, room_id: str):
        """Broadcast JSON updates to all clients in a specific room"""
        if room_id not in self.active_connections:
            return
            
        data = self.room_data.get(room_id, {})
        for connection in self.active_connections[room_id]:
            try:
                await connection.send_json(data)
            except Exception as e:
                logger.error(f"Failed to send to client in room {room_id}: {str(e)}")

    async def update_json(self, room_id: str, new_data: Dict):
        """Update the shared JSON for a specific room and notify clients"""
        if room_id not in self.room_data:
            self.room_data[room_id] = {}
            
        self.room_data[room_id].update(new_data)
        await self.broadcast_to_room(room_id)
    
    def get_room_data(self, room_id: str) -> Dict:
        """Get the current JSON data for a room"""
        return self.room_data.get(room_id, {})
    
    def get_active_rooms(self) -> List[str]:
        """Get list of active room IDs"""
        return list(self.active_connections.keys())

# Create a singleton instance
socket_manager = WebSocketManager()
