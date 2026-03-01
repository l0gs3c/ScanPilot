from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from typing import List
from pydantic import BaseModel
from pathlib import Path
import json
import os

from app.services import scan_service

router = APIRouter()

# Path to targets.json (relative to project root)
# Backend must be started from project root for relative paths to work
TARGETS_JSON_PATH = Path("storage") / "targets" / "targets.json"

# ==================== Helper Functions ====================

def _load_targets() -> List[dict]:
    """Load all targets from targets.json"""
    try:
        if TARGETS_JSON_PATH.exists():
            with open(TARGETS_JSON_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading targets.json: {e}")
        return []


def _save_targets(targets: List[dict]):
    """Save all targets to targets.json"""
    try:
        TARGETS_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(TARGETS_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(targets, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving targets.json: {e}")


def _load_target_by_id(target_id: int) -> dict:
    """Get a specific target by ID"""
    targets = _load_targets()
    print(f"🔍 [DEBUG] Looking for target_id={target_id}")
    print(f"🔍 [DEBUG] TARGETS_JSON_PATH={TARGETS_JSON_PATH}")
    print(f"🔍 [DEBUG] File exists: {TARGETS_JSON_PATH.exists()}")
    print(f"🔍 [DEBUG] Loaded {len(targets)} targets: {[t.get('id') for t in targets]}")
    
    for target in targets:
        if target.get("id") == target_id:
            print(f"✅ [DEBUG] Found target: {target.get('name')}")
            return target
    
    print(f"❌ [DEBUG] Target with ID {target_id} not found!")
    return None


def _update_target_stats(target_id: int, active_scans_delta: int = 0, completed_scans_delta: int = 0):
    """Update target statistics (activeScans, completedScans)"""
    targets = _load_targets()
    for target in targets:
        if target.get("id") == target_id:
            target["activeScans"] = target.get("activeScans", 0) + active_scans_delta
            target["completedScans"] = target.get("completedScans", 0) + completed_scans_delta
            
            # Update status based on active scans
            if target["activeScans"] > 0:
                target["status"] = "scanning"
            else:
                target["status"] = "idle"
            
            # Update timestamp
            from datetime import datetime
            target["updatedAt"] = datetime.now().isoformat()
            break
    _save_targets(targets)

# ==================== End Helper Functions ====================

# Request models
class ScanCreate(BaseModel):
    tool: str  # subfinder, dirsearch, nuclei, amass
    target_id: int
    config: dict = {}

class ScanControl(BaseModel):
    action: str  # pause, resume, stop

# Response models
class ScanResponse(BaseModel):
    scan_id: str
    tool: str
    target: str
    target_id: int
    status: str
    created_at: str
    start_time: str = None
    output_file: str = None

@router.get("/")
async def get_scans():
    """Get all active scans"""
    scans = scan_service.list_scans()
    return {"value": scans, "count": len(scans)}

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_scan(scan_data: ScanCreate):
    """Create new scan (use WebSocket to stream output)"""
    try:
        # Get target from JSON file
        target = _load_target_by_id(scan_data.target_id)
        if not target:
            raise HTTPException(status_code=404, detail="Target not found")
        
        # Get target URL/domain
        target_url = target.get("domain")
        target_port = target.get("port", "")
        
        if not target_url:
            raise HTTPException(status_code=400, detail="Target has no valid domain")
        
        # Add port to URL if specified and not default
        if target_port and target_port not in ["", "80", "443"]:
            target_full = f"{target_url}:{target_port}"
        else:
            target_full = target_url
        
        # Create scan (no database)
        scan_id = scan_service.create_scan(
            tool=scan_data.tool,
            target=target_full,
            target_id=scan_data.target_id,
            target_folder=target.get("folderName", f"{target_url}_{target_port}"),
            config=scan_data.config
        )
        
        # Update target statistics in JSON
        _update_target_stats(scan_data.target_id, active_scans_delta=1)
        
        return {
            "scan_id": scan_id,
            "message": f"Scan created. Connect to WebSocket /ws/scans/{scan_id} to start streaming",
            "websocket_url": f"/ws/scans/{scan_id}"
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{scan_id}")
async def get_scan(scan_id: str):
    """Get specific scan"""
    # Try to get from JSON file first
    scan = scan_service.get_scan_from_json(scan_id)
    if scan:
        return scan
    
    # Fallback to in-memory executor if not in JSON yet (scan still running)
    executor = scan_service.get_scan(scan_id)
    if not executor:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return {
        "id": scan_id,
        "tool": executor.tool,
        "targetId": executor.target_id,
        "status": executor.status,
        "startedAt": executor.start_time.isoformat() if executor.start_time else None,
        "completedAt": executor.end_time.isoformat() if executor.end_time else None,
        "outputFile": executor.output_file,
        "errorMessage": executor.error_message
    }

@router.post("/{scan_id}/control")
async def control_scan(scan_id: str, control: ScanControl):
    """Control scan (pause/resume/stop)"""
    executor = scan_service.get_scan(scan_id)
    if not executor:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    try:
        if control.action == "pause":
            await executor.pause()
            return {"message": "Scan paused"}
        elif control.action == "resume":
            await executor.resume()
            return {"message": "Scan resumed"}
        elif control.action == "stop":
            await executor.stop()
            return {"message": "Scan stopped"}
        else:
            raise HTTPException(status_code=400, detail=f"Invalid action: {control.action}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{scan_id}")
async def delete_scan(scan_id: str):
    """Delete scan"""
    success = scan_service.delete_scan(scan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"message": "Scan deleted successfully"}

@router.get("/{scan_id}/results")
async def get_scan_results(scan_id: str):
    """Get scan results"""
    executor = scan_service.get_scan(scan_id)
    if not executor:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    if not executor.output_file or not os.path.exists(executor.output_file):
        raise HTTPException(status_code=404, detail="Results file not found")
    
    return {
        "output_file": executor.output_file,
        "status": executor.status,
        "download_url": f"/api/v1/scans/{scan_id}/download"
    }

@router.get("/{scan_id}/download")
async def download_scan_results(scan_id: str):
    """Download scan results file"""
    executor = scan_service.get_scan(scan_id)
    if not executor:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    if not executor.output_file:
        raise HTTPException(status_code=404, detail="Results file not found")
    
    file_path = Path(executor.output_file)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Results file not found")
    
    # If it's a directory (dirsearch), zip it
    if file_path.is_dir():
        import shutil
        zip_path = file_path.parent / f"{file_path.name}.zip"
        shutil.make_archive(str(file_path), 'zip', file_path)
        return FileResponse(
            path=str(zip_path),
            filename=f"{executor.tool}_{executor.target}_results.zip",
            media_type="application/zip"
        )
    else:
        return FileResponse(
            path=str(file_path),
            filename=file_path.name,
            media_type="text/plain"
        )