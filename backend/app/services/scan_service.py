"""
Scan Service - Manages security scan operations
Handles subprocess execution for security tools: nuclei, dirsearch, subfinder, amass
Uses JSON file storage for persistence (no database)
"""
import asyncio
import json
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, AsyncIterator, List

# Determine project root using relative path from backend/
# This allows the project to be moved to different machines/folders
_current_path = Path(__file__).resolve()
_backend_path = _current_path.parent.parent.parent  # Go up from app/services/ to backend/
PROJECT_ROOT = _backend_path.parent if _backend_path.name == "backend" else _backend_path

# Path to scans.json and targets folder (relative to current working directory)
# When backend runs, cwd should be project root
SCANS_JSON_PATH = Path("storage") / "scans.json"
TARGETS_BASE_PATH = Path("storage") / "targets"

# Scan status enumeration
class ScanStatus:
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"
    COMPLETED = "completed"
    ERROR = "error"

# Active scans registry (for real-time tracking)
active_scans: Dict[str, Dict] = {}


# ==================== JSON Persistence Functions ====================

def _load_scans_from_json() -> List[dict]:
    """Load all scans from scans.json"""
    try:
        if SCANS_JSON_PATH.exists():
            with open(SCANS_JSON_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading scans.json: {e}")
        return []


def _save_scans_to_json(scans: List[dict]):
    """Save all scans to scans.json"""
    try:
        SCANS_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(SCANS_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(scans, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving scans.json: {e}")


def save_scan_to_json(scan_data: dict):
    """Add a new scan to scans.json"""
    scans = _load_scans_from_json()
    scans.append(scan_data)
    _save_scans_to_json(scans)


def update_scan_in_json(scan_id: str, updates: dict):
    """Update an existing scan in scans.json"""
    scans = _load_scans_from_json()
    for scan in scans:
        if scan.get("id") == scan_id:
            scan.update(updates)
            break
    _save_scans_to_json(scans)


def get_scan_from_json(scan_id: str) -> Optional[dict]:
    """Get a specific scan from scans.json"""
    scans = _load_scans_from_json()
    for scan in scans:
        if scan.get("id") == scan_id:
            return scan
    return None


# ==================== End JSON Persistence Functions ====================

class ScanExecutor:
    """Handles execution of security scanning tools"""
    
    def __init__(self, scan_id: str, tool: str, target: str, target_id: int, target_folder: str, config: dict):
        self.scan_id = scan_id
        self.tool = tool
        self.target = target
        self.target_id = target_id
        self.target_folder = target_folder  # Folder name for this target
        self.config = config
        self.process: Optional[asyncio.subprocess.Process] = None
        self.status = ScanStatus.PENDING
        self.output_lines = []
        self.start_time: Optional[datetime] = None
        self.end_time: Optional[datetime] = None
        self.output_file: Optional[str] = None
        self.error_message: Optional[str] = None
        
    def _build_command(self) -> list:
        """Build command based on tool and configuration"""
        # Store results in storage/targets/<target_folder>/<tool_name>/ (relative path)
        target_dir = Path("storage") / "targets" / self.target_folder
        tool_dir = target_dir / self.tool
        tool_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_target = self.target.replace('.', '_').replace(':', '_').replace('/', '_')
        
        if self.tool == "subfinder":
            # subfinder is a Go binary, run directly
            output_file = tool_dir / f"subfinder_{safe_target}_{timestamp}.txt"
            self.output_file = str(output_file)
            
            cmd = ["subfinder", "-d", self.target, "-o", str(output_file)]
            
            # Add optional parameters
            if self.config.get("silent"):
                cmd.append("-silent")
            if self.config.get("verbose"):
                cmd.append("-v")
            if self.config.get("threads"):
                cmd.extend(["-t", str(self.config["threads"])])
            if self.config.get("timeout"):
                cmd.extend(["-timeout", str(self.config["timeout"])])
            if self.config.get("resolvers"):
                cmd.extend(["-r", self.config["resolvers"]])
            if self.config.get("all"):
                cmd.append("-all")
                
        elif self.tool == "dirsearch":
            # dirsearch is a Python tool, run with python
            output_dir = tool_dir / f"dirsearch_{safe_target}_{timestamp}"
            output_dir.mkdir(exist_ok=True)
            self.output_file = str(output_dir)
            
            # Path to dirsearch.py
            dirsearch_path = Path("tools/dirsearch-0.4.3/dirsearch.py")
            
            url = self.target if self.target.startswith("http") else f"https://{self.target}"
            
            # Run with Python
            cmd = [sys.executable, str(dirsearch_path), "-u", url, "-o", str(output_dir / "report.txt")]
            
            # Add optional parameters
            if self.config.get("extensions"):
                cmd.extend(["-e", ",".join(self.config["extensions"])])
            if self.config.get("wordlist"):
                cmd.extend(["-w", self.config["wordlist"]])
            if self.config.get("threads"):
                cmd.extend(["-t", str(self.config["threads"])])
            if self.config.get("recursive"):
                cmd.append("-r")
            if self.config.get("exclude_status"):
                cmd.extend(["-x", ",".join(map(str, self.config["exclude_status"]))])
            if self.config.get("random_agent"):
                cmd.append("--random-agent")
                
        elif self.tool == "nuclei":
            # nuclei is a Go binary, run directly
            output_file = tool_dir / f"nuclei_{safe_target}_{timestamp}.json"
            self.output_file = str(output_file)
            
            url = self.target if self.target.startswith("http") else f"https://{self.target}"
            cmd = ["nuclei", "-u", url, "-jsonl", "-o", str(output_file)]
            
            # Add optional parameters
            if self.config.get("templates"):
                for template in self.config["templates"]:
                    cmd.extend(["-t", template])
            if self.config.get("severity"):
                cmd.extend(["-s", ",".join(self.config["severity"])])
            if self.config.get("tags"):
                cmd.extend(["-tags", ",".join(self.config["tags"])])
            if self.config.get("exclude_tags"):
                cmd.extend(["-etags", ",".join(self.config["exclude_tags"])])
            if self.config.get("threads"):
                cmd.extend(["-c", str(self.config["threads"])])
            if self.config.get("rate_limit"):
                cmd.extend(["-rate-limit", str(self.config["rate_limit"])])
            if self.config.get("timeout"):
                cmd.extend(["-timeout", str(self.config["timeout"])])
            if self.config.get("verbose"):
                cmd.append("-v")
                
        elif self.tool == "amass":
            # amass is a Go binary, run directly
            output_file = tool_dir / f"amass_{safe_target}_{timestamp}.txt"
            self.output_file = str(output_file)
            
            cmd = ["amass", "enum", "-d", self.target, "-o", str(output_file)]
            
            # Add optional parameters
            if self.config.get("passive"):
                cmd.append("-passive")
            if self.config.get("active"):
                cmd.append("-active")
            if self.config.get("brute"):
                cmd.append("-brute")
            if self.config.get("timeout"):
                cmd.extend(["-timeout", str(self.config["timeout"])])
            if self.config.get("max_dns_queries"):
                cmd.extend(["-max-dns-queries", str(self.config["max_dns_queries"])])
            if self.config.get("verbose"):
                cmd.append("-v")
        else:
            raise ValueError(f"Unsupported tool: {self.tool}")
        
        return cmd
    
    async def start(self) -> AsyncIterator[str]:
        """Start scan and yield real-time output"""
        try:
            self.status = ScanStatus.RUNNING
            self.start_time = datetime.now()
            
            cmd = self._build_command()
            cmd_str = " ".join(cmd)
            
            yield json.dumps({
                "type": "status",
                "status": self.status,
                "message": f"Starting {self.tool} scan...",
                "command": cmd_str
            }) + "\n"
            
            # Start process
            # Use relative working directory (.) - should be project root when backend starts
            # Backend must be started from project root, not from backend/ folder
            
            self.process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                cwd="."  # Current working directory (project root)
            )
            
            # Stream output
            while True:
                if self.process.stdout is None:
                    break
                    
                line = await self.process.stdout.readline()
                if not line:
                    break
                    
                line_text = line.decode('utf-8', errors='ignore').strip()
                if line_text:
                    self.output_lines.append(line_text)
                    yield json.dumps({
                        "type": "output",
                        "data": line_text
                    }) + "\n"
            
            # Wait for completion
            returncode = await self.process.wait()
            self.end_time = datetime.now()
            
            if returncode == 0:
                self.status = ScanStatus.COMPLETED
                
                # Save to JSON
                self._save_to_json()
                
                yield json.dumps({
                    "type": "status",
                    "status": self.status,
                    "message": f"Scan completed successfully",
                    "output_file": self.output_file
                }) + "\n"
            else:
                self.status = ScanStatus.ERROR
                # Include last output lines in error message for debugging
                last_output = "\n".join(self.output_lines[-10:]) if self.output_lines else "No output"
                self.error_message = f"Process exited with code {returncode}\n\nLast output:\n{last_output}"
                
                # Save to JSON
                self._save_to_json()
                
                yield json.dumps({
                    "type": "status",
                    "status": self.status,
                    "message": self.error_message
                }) + "\n"
                
        except Exception as e:
            self.status = ScanStatus.ERROR
            self.error_message = str(e)
            self.end_time = datetime.now()
            
            # Save to JSON
            self._save_to_json()
            
            yield json.dumps({
                "type": "error",
                "message": str(e)
            }) + "\n"
    
    def _save_to_json(self):
        """Save current scan state to JSON"""
        # Get target info from targets.json
        target_name = self.target
        target_domain = self.target
        
        # Try to load target details from JSON (relative path)
        try:
            targets_path = Path("storage") / "targets" / "targets.json"
            if targets_path.exists():
                with open(targets_path, 'r', encoding='utf-8') as f:
                    targets = json.load(f)
                    for t in targets:
                        if t.get("id") == self.target_id:
                            target_name = t.get("name", self.target)
                            target_domain = t.get("domain", self.target)
                            break
        except Exception as e:
            print(f"Error loading target info: {e}")
        
        # Calculate duration
        duration = None
        if self.start_time and self.end_time:
            duration = (self.end_time - self.start_time).total_seconds()
        
        # Calculate progress (simple: 100% if completed, 0% otherwise)
        progress = 100 if self.status == ScanStatus.COMPLETED else 0
        
        scan_data = {
            "id": self.scan_id,
            "name": f"{self.tool.capitalize()} scan - {target_name}",
            "targetId": self.target_id,
            "targetName": target_name,
            "targetDomain": target_domain or self.target,
            "tool": self.tool,
            "status": self.status,
            "command": " ".join(self._build_command()) if hasattr(self, '_build_command') else "",
            "progress": progress,
            "startedAt": self.start_time.isoformat() if self.start_time else None,
            "completedAt": self.end_time.isoformat() if self.end_time else None,
            "duration": duration,
            "outputFile": self.output_file,
            "errorMessage": self.error_message,
            "createdAt": self.start_time.isoformat() if self.start_time else datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        # Check if scan already exists in JSON (update) or new (insert)
        existing = get_scan_from_json(self.scan_id)
        if existing:
            update_scan_in_json(self.scan_id, scan_data)
        else:
            save_scan_to_json(scan_data)
    
    async def stop(self):
        """Stop running scan"""
        if self.process and self.status == ScanStatus.RUNNING:
            self.process.terminate()
            try:
                await asyncio.wait_for(self.process.wait(), timeout=5.0)
            except asyncio.TimeoutError:
                self.process.kill()
            self.status = ScanStatus.STOPPED
            self.end_time = datetime.now()
    
    async def pause(self):
        """Pause scan (send SIGSTOP on Unix)"""
        if self.process and self.status == ScanStatus.RUNNING:
            try:
                self.process.send_signal(19)  # SIGSTOP
                self.status = ScanStatus.PAUSED
            except Exception:
                pass  # Not supported on Windows
    
    async def resume(self):
        """Resume paused scan (send SIGCONT on Unix)"""
        if self.process and self.status == ScanStatus.PAUSED:
            try:
                self.process.send_signal(18)  # SIGCONT
                self.status = ScanStatus.RUNNING
            except Exception:
                pass  # Not supported on Windows


def create_scan(tool: str, target: str, target_id: int, target_folder: str, config: dict) -> str:
    """Create a new scan"""
    scan_id = str(uuid.uuid4())
    executor = ScanExecutor(scan_id, tool, target, target_id, target_folder, config)
    created_at = datetime.now()
    active_scans[scan_id] = {
        "executor": executor,
        "created_at": created_at
    }
    
    # Save initial scan state to JSON
    scan_data = {
        "id": scan_id,
        "name": f"{tool.capitalize()} scan - {target}",
        "targetId": target_id,
        "targetName": target,
        "targetDomain": target,
        "tool": tool,
        "status": ScanStatus.PENDING,
        "command": "",
        "progress": 0,
        "startedAt": None,
        "completedAt": None,
        "duration": None,
        "outputFile": None,
        "errorMessage": None,
        "createdAt": created_at.isoformat(),
        "updatedAt": created_at.isoformat()
    }
    save_scan_to_json(scan_data)
    
    return scan_id


def get_scan(scan_id: str) -> Optional[ScanExecutor]:
    """Get scan executor by ID"""
    scan = active_scans.get(scan_id)
    return scan["executor"] if scan else None


def list_scans() -> list:
    """List all scans (active + historical from JSON)"""
    all_scans = []
    
    # Load historical scans from JSON
    json_scans = _load_scans_from_json()
    active_scan_ids = set(active_scans.keys())
    
    # Add historical scans (not currently active)
    for scan in json_scans:
        if scan.get("id") not in active_scan_ids:
            all_scans.append(scan)
    
    # Add active scans with real-time status
    for scan_id, data in active_scans.items():
        executor = data["executor"]
        
        # Get target info from JSON (relative path)
        target_name = executor.target
        target_domain = executor.target
        try:
            targets_path = Path("storage") / "targets" / "targets.json"
            if targets_path.exists():
                with open(targets_path, 'r', encoding='utf-8') as f:
                    targets = json.load(f)
                    for t in targets:
                        if t.get("id") == executor.target_id:
                            target_name = t.get("name", executor.target)
                            target_domain = t.get("domain", executor.target)
                            break
        except Exception as e:
            print(f"Error loading target info: {e}")
        
        # Calculate duration
        duration = None
        if executor.start_time:
            end = executor.end_time or datetime.now()
            duration = (end - executor.start_time).total_seconds()
        
        # Calculate progress (simple estimate)
        progress = 0
        if executor.status == ScanStatus.COMPLETED:
            progress = 100
        elif executor.status == ScanStatus.RUNNING:
            progress = 50  # Estimate
        
        all_scans.append({
            "id": scan_id,
            "name": f"{executor.tool.capitalize()} scan - {target_name}",
            "targetId": executor.target_id,
            "targetName": target_name,
            "targetDomain": target_domain,
            "tool": executor.tool,
            "status": executor.status,
            "command": " ".join(executor._build_command()),
            "progress": progress,
            "startedAt": executor.start_time.isoformat() if executor.start_time else None,
            "completedAt": executor.end_time.isoformat() if executor.end_time else None,
            "duration": duration,
            "outputFile": executor.output_file,
            "errorMessage": executor.error_message,
            "createdAt": data["created_at"].isoformat(),
            "updatedAt": datetime.now().isoformat()
        })
    
    # Sort by created date (newest first)
    all_scans.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    return all_scans


def delete_scan(scan_id: str) -> bool:
    """Delete a scan"""
    if scan_id in active_scans:
        del active_scans[scan_id]
        return True
    return False
