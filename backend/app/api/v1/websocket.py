from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import json
import asyncio

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, scan_id: str):
        await websocket.accept()
        self.active_connections[scan_id] = websocket

    def disconnect(self, scan_id: str):
        if scan_id in self.active_connections:
            del self.active_connections[scan_id]

    async def send_message(self, message: str, scan_id: str):
        if scan_id in self.active_connections:
            try:
                await self.active_connections[scan_id].send_text(message)
            except:
                self.disconnect(scan_id)

    async def broadcast_to_scan(self, message: dict, scan_id: str):
        if scan_id in self.active_connections:
            try:
                await self.active_connections[scan_id].send_text(json.dumps(message))
            except:
                self.disconnect(scan_id)

manager = ConnectionManager()

@router.websocket("/scans/{scan_id}")
async def websocket_endpoint(websocket: WebSocket, scan_id: str):
    await manager.connect(websocket, scan_id)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Echo back for testing
            await manager.send_message(f"Echo: {data}", scan_id)
    except WebSocketDisconnect:
        manager.disconnect(scan_id)