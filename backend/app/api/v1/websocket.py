from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import Dict
import json
import asyncio

from app.services import scan_service

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
            except Exception:
                self.disconnect(scan_id)

    async def broadcast_to_scan(self, message: dict, scan_id: str):
        if scan_id in self.active_connections:
            try:
                await self.active_connections[scan_id].send_text(json.dumps(message))
            except Exception:
                self.disconnect(scan_id)

manager = ConnectionManager()

@router.websocket("/scans/{scan_id}")
async def websocket_scan_stream(websocket: WebSocket, scan_id: str):
    """WebSocket endpoint for streaming scan output in real-time"""
    await manager.connect(websocket, scan_id)
    
    try:
        # Get scan executor
        executor = scan_service.get_scan(scan_id)
        if not executor:
            await websocket.send_json({
                "type": "error",
                "message": "Scan not found"
            })
            await websocket.close()
            return
        
        # Send initial status
        await websocket.send_json({
            "type": "connected",
            "scan_id": scan_id,
            "tool": executor.tool,
            "target": executor.target,
            "status": executor.status
        })
        
        # Start scan and stream output
        async for message in executor.start():
            await websocket.send_text(message)
        
        # Send completion message
        await websocket.send_json({
            "type": "completed",
            "scan_id": scan_id,
            "status": executor.status,
            "output_file": executor.output_file
        })
        
    except WebSocketDisconnect:
        manager.disconnect(scan_id)
    except Exception as e:
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
        manager.disconnect(scan_id)

@router.websocket("/test")
async def websocket_test(websocket: WebSocket):
    """Test WebSocket endpoint"""
    await websocket.accept()
    try:
        await websocket.send_text("Connection established")
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        pass