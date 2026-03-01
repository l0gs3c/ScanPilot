"""
File-based storage system for ScanPilot
Manages targets and scan results using filesystem instead of database
"""
import json
import os
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import re


# Storage paths - use project root storage/ (not backend/storage/)
# __file__ = backend/app/utils/file_storage.py -> .parent x4 = project root
STORAGE_ROOT = Path(__file__).parent.parent.parent.parent / "storage"
TARGETS_DIR = STORAGE_ROOT / "targets"  # Contains both JSON metadata and scan result folders
UPLOADS_DIR = STORAGE_ROOT / "uploads"

# Ensure directories exist
TARGETS_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def sanitize_filename(text: str) -> str:
    """Sanitize text for use in filenames"""
    # Replace invalid characters with underscore
    text = re.sub(r'[<>:"/\\|?*]', '_', text)
    # Remove leading/trailing spaces and dots
    text = text.strip('. ')
    return text


def get_target_folder_name(domain: str, port: Optional[str] = None) -> str:
    """
    Generate folder name for a target
    Format: domain_port (e.g., example.com_80, example.com_443)
    Always includes port - no special cases
    """
    domain = sanitize_filename(domain)
    if port:
        return f"{domain}_{port}"
    return f"{domain}_80"  # Default to 80 if no port specified


def get_next_scan_file_number(target_folder: Path, tool_name: str) -> int:
    """
    Get the next available number for a scan result file
    E.g., if nuclei_1.txt and nuclei_2.txt exist, return 3
    """
    pattern = f"{tool_name}_*.txt"
    existing_files = list(target_folder.glob(pattern))
    
    if not existing_files:
        return 1
    
    numbers = []
    for file in existing_files:
        # Extract number from filename like "nuclei_1.txt"
        match = re.search(rf'{tool_name}_(\d+)\.txt', file.name)
        if match:
            numbers.append(int(match.group(1)))
    
    return max(numbers) + 1 if numbers else 1


class TargetStorage:
    """Manages target data in a single JSON file"""
    
    TARGETS_FILE = TARGETS_DIR / "targets.json"
    
    @staticmethod
    def _read_all_targets() -> List[Dict[str, Any]]:
        """Read all targets from the JSON file"""
        if not TargetStorage.TARGETS_FILE.exists():
            return []
        
        try:
            with open(TargetStorage.TARGETS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"[ERROR] Corrupted targets file: {str(e)}")
            return []
    
    @staticmethod
    def _write_all_targets(targets: List[Dict[str, Any]]) -> None:
        """Write all targets to the JSON file"""
        with open(TargetStorage.TARGETS_FILE, 'w', encoding='utf-8') as f:
            json.dump(targets, f, indent=2, ensure_ascii=False)
    
    @staticmethod
    def _get_next_id() -> int:
        """Get next available target ID"""
        targets = TargetStorage._read_all_targets()
        if not targets:
            return 1
        
        max_id = max(target.get("id", 0) for target in targets)
        return max_id + 1
    
    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new target"""
        targets = TargetStorage._read_all_targets()
        target_id = TargetStorage._get_next_id()
        
        # Create scan results folder
        folder_name = get_target_folder_name(data.get("domain"), data.get("port"))
        target_folder = TARGETS_DIR / folder_name
        target_folder.mkdir(parents=True, exist_ok=True)
        
        # Create target data
        target = {
            "id": target_id,
            "name": data.get("name"),
            "domain": data.get("domain"),
            "port": data.get("port"),
            "description": data.get("description"),
            "status": "idle",
            "activeScans": 0,
            "completedScans": 0,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": None,
            "folderName": folder_name
        }
        
        # Add to targets list and save
        targets.append(target)
        TargetStorage._write_all_targets(targets)
        
        return target
    
    @staticmethod
    def get(target_id: int) -> Optional[Dict[str, Any]]:
        """Get target by ID"""
        targets = TargetStorage._read_all_targets()
        for target in targets:
            if target.get("id") == target_id:
                return target
        return None
    
    @staticmethod
    def get_all(skip: int = 0, limit: int = 100, status: Optional[str] = None, 
                search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all targets with optional filtering"""
        targets = TargetStorage._read_all_targets()
        
        # Apply filters
        filtered = []
        for target in targets:
            if status and target.get("status") != status:
                continue
            
            if search:
                search_lower = search.lower()
                if not any(search_lower in str(target.get(field, '')).lower() 
                         for field in ['name', 'domain', 'description']):
                    continue
            
            filtered.append(target)
        
        # Sort by created_at descending
        filtered.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
        
        # Apply pagination
        return filtered[skip:skip + limit]
    
    @staticmethod
    def count(status: Optional[str] = None, search: Optional[str] = None) -> int:
        """Count targets with optional filtering"""
        targets = TargetStorage._read_all_targets()
        count = 0
        
        for target in targets:
            if status and target.get("status") != status:
                continue
            
            if search:
                search_lower = search.lower()
                if not any(search_lower in str(target.get(field, '')).lower() 
                         for field in ['name', 'domain', 'description']):
                    continue
            
            count += 1
        
        return count
    
    @staticmethod
    def update(target_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a target"""
        targets = TargetStorage._read_all_targets()
        target_index = None
        target = None
        
        # Find target
        for i, t in enumerate(targets):
            if t.get("id") == target_id:
                target_index = i
                target = t
                break
        
        if target is None:
            return None
        
        old_domain = target.get("domain")
        old_port = target.get("port")
        old_folder_name = target.get("folderName")
        
        # Update fields
        for key, value in data.items():
            if value is not None and key not in ['id', 'createdAt']:
                target[key] = value
        
        target["updatedAt"] = datetime.now().isoformat()
        
        # Check if domain or port changed - need to rename folder
        new_domain = target.get("domain")
        new_port = target.get("port")
        
        if old_domain != new_domain or old_port != new_port:
            # Generate new folder name
            new_folder_name = get_target_folder_name(new_domain, new_port)
            
            # Rename scan results folder if it exists
            if old_folder_name:
                old_folder = TARGETS_DIR / old_folder_name
                new_folder = TARGETS_DIR / new_folder_name
                
                if old_folder.exists() and old_folder != new_folder:
                    # Rename the folder
                    old_folder.rename(new_folder)
                    print(f"[DEBUG] Renamed scan folder: {old_folder_name} -> {new_folder_name}")
            else:
                # Create new folder if didn't exist
                new_folder = TARGETS_DIR / new_folder_name
                new_folder.mkdir(parents=True, exist_ok=True)
            
            target["folderName"] = new_folder_name
        
        # Save updated targets
        targets[target_index] = target
        TargetStorage._write_all_targets(targets)
        
        return target
    
    @staticmethod
    def delete(target_id: int) -> bool:
        """Delete a target"""
        targets = TargetStorage._read_all_targets()
        
        # Find and remove target
        new_targets = [t for t in targets if t.get("id") != target_id]
        
        if len(new_targets) == len(targets):
            return False  # Target not found
        
        # Save updated targets
        TargetStorage._write_all_targets(new_targets)
        
        # Optionally delete scan results folder
        # (You may want to keep scan results even after deleting target)
        return True
    
    @staticmethod
    def get_by_domain(domain: str) -> Optional[Dict[str, Any]]:
        """Get target by domain"""
        targets = TargetStorage._read_all_targets()
        for target in targets:
            if target.get("domain") == domain:
                return target
        return None
    
    @staticmethod
    def get_by_domain_and_port(domain: str, port: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get target by domain and port combination"""
        # Normalize port to string for comparison
        port_str = str(port) if port else None
        
        targets = TargetStorage._read_all_targets()
        for target in targets:
            target_port = str(target.get("port")) if target.get("port") else None
            
            if target.get("domain") == domain and target_port == port_str:
                return target
        
        return None


class ScanResultStorage:
    """Manages scan results in target folders"""
    
    @staticmethod
    def get_target_folder(target_id: int) -> Optional[Path]:
        """Get scan results folder for a target"""
        target = TargetStorage.get(target_id)
        if not target:
            return None
        
        folder_name = target.get("folderName")
        if not folder_name:
            # Generate folder name from domain/port
            folder_name = get_target_folder_name(
                target.get("domain"), 
                target.get("port")
            )
            # Update target with folder name
            TargetStorage.update(target_id, {"folderName": folder_name})
        
        target_folder = TARGETS_DIR / folder_name
        target_folder.mkdir(parents=True, exist_ok=True)
        return target_folder
    
    @staticmethod
    def save_scan_result(target_id: int, tool_name: str, content: str) -> Optional[str]:
        """
        Save scan result for a target
        Returns the filename of the saved result
        """
        target_folder = ScanResultStorage.get_target_folder(target_id)
        if not target_folder:
            return None
        
        # Get next file number
        file_number = get_next_scan_file_number(target_folder, tool_name)
        filename = f"{tool_name}_{file_number}.txt"
        
        result_file = target_folder / filename
        with open(result_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return filename
    
    @staticmethod
    def get_scan_results(target_id: int, tool_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all scan results for a target, optionally filtered by tool"""
        target_folder = ScanResultStorage.get_target_folder(target_id)
        if not target_folder:
            return []
        
        pattern = f"{tool_name}_*.txt" if tool_name else "*.txt"
        results = []
        
        for result_file in target_folder.glob(pattern):
            results.append({
                "filename": result_file.name,
                "path": str(result_file),
                "size": result_file.stat().st_size,
                "modified": datetime.fromtimestamp(result_file.stat().st_mtime).isoformat()
            })
        
        return results
    
    @staticmethod
    def get_scan_result_content(target_id: int, filename: str) -> Optional[str]:
        """Get content of a specific scan result file"""
        target_folder = ScanResultStorage.get_target_folder(target_id)
        if not target_folder:
            return None
        
        result_file = target_folder / filename
        if not result_file.exists():
            return None
        
        with open(result_file, 'r', encoding='utf-8') as f:
            return f.read()


# Export main classes
__all__ = ['TargetStorage', 'ScanResultStorage', 'get_target_folder_name', 'get_next_scan_file_number']
