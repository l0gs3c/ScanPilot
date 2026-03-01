"""
Target API endpoints using file-based storage
No database required - all data stored in JSON files
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ...schemas.target import (
    TargetCreate,
    TargetUpdate,
    TargetResponse,
    TargetListResponse
)
from ...utils.file_storage import TargetStorage, get_target_folder_name

router = APIRouter()


class TargetCreateRequest(BaseModel):
    """Request model for creating targets"""
    name: str
    domain: str
    port: Optional[str] = None
    description: Optional[str] = None


@router.post("/", response_model=TargetResponse)
def create_target(target_data: TargetCreateRequest):
    """
    Create new target.
    Target data is stored as JSON file and a folder is created for scan results.
    """
    try:
        print(f"[DEBUG] Creating target: {target_data.model_dump()}")
        
        # Check if domain+port combination already exists
        existing = TargetStorage.get_by_domain_and_port(target_data.domain, target_data.port)
        if existing:
            port_display = target_data.port if target_data.port else "80"
            raise HTTPException(
                status_code=400,
                detail=f"Target with domain '{target_data.domain}' and port '{port_display}' already exists"
            )
        
        # Create target
        target = TargetStorage.create({
            "name": target_data.name,
            "domain": target_data.domain,
            "port": target_data.port,
            "description": target_data.description
        })
        
        # Generate targetUrl for display - always show port
        if target["port"]:
            target["targetUrl"] = f"{target['domain']}:{target['port']}"
        else:
            target["targetUrl"] = f"{target['domain']}:80"
        
        print(f"[DEBUG] Target created successfully with ID: {target['id']}")
        print(f"[DEBUG] Scan results folder: {target.get('folderName')}")
        
        return TargetResponse(**target)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to create target: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create target: {str(e)}"
        )


@router.get("/", response_model=TargetListResponse)
def read_targets(
    skip: int = Query(0, ge=0, description="Number of targets to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of targets to return"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in name or domain"),
    order_by: str = Query("createdAt", description="Field to order by"),
    order_desc: bool = Query(True, description="Order descending")
):
    """
    Retrieve targets from file storage.
    """
    try:
        # Get targets
        targets = TargetStorage.get_all(
            skip=skip,
            limit=limit,
            status=status,
            search=search
        )
        
        # Get total count
        total = TargetStorage.count(status=status, search=search)
        
        # Add targetUrl to each target - always show port
        target_responses = []
        for target in targets:
            if target.get("port"):
                target["targetUrl"] = f"{target['domain']}:{target['port']}"
            else:
                target["targetUrl"] = f"{target['domain']}:80"
            
            target_responses.append(TargetResponse(**target))
        
        return TargetListResponse(
            targets=target_responses,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        print(f"[ERROR] Failed to retrieve targets: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve targets: {str(e)}"
        )


@router.get("/{target_id}", response_model=TargetResponse)
def read_target(target_id: int):
    """
    Get target by ID.
    """
    target = TargetStorage.get(target_id)
    if not target:
        raise HTTPException(
            status_code=404,
            detail=f"Target with ID {target_id} not found"
        )
    
    # Add targetUrl - always show port
    if target.get("port"):
        target["targetUrl"] = f"{target['domain']}:{target['port']}"
    else:
        target["targetUrl"] = f"{target['domain']}:80"
    
    return TargetResponse(**target)


@router.put("/{target_id}", response_model=TargetResponse)
def update_target(target_id: int, target_update: TargetUpdate):
    """
    Update target.
    """
    # Check if target exists
    existing = TargetStorage.get(target_id)
    if not existing:
        raise HTTPException(
            status_code=404,
            detail=f"Target with ID {target_id} not found"
        )
    
    try:
        # Get update data
        update_data = target_update.model_dump(exclude_unset=True)
        
        # Check if domain or port is being updated
        new_domain = update_data.get("domain", existing.get("domain"))
        new_port = update_data.get("port", existing.get("port"))
        
        # Check for duplicate domain+port combination (excluding current target)
        if new_domain != existing.get("domain") or new_port != existing.get("port"):
            duplicate = TargetStorage.get_by_domain_and_port(new_domain, new_port)
            if duplicate and duplicate.get("id") != target_id:
                port_display = new_port if new_port else "80"
                raise HTTPException(
                    status_code=400,
                    detail=f"Target with domain '{new_domain}' and port '{port_display}' already exists"
                )
        
        # Update target
        updated_target = TargetStorage.update(target_id, update_data)
        
        if not updated_target:
            raise HTTPException(
                status_code=500,
                detail="Failed to update target"
            )
        
        # Add targetUrl - always show port
        if updated_target.get("port"):
            updated_target["targetUrl"] = f"{updated_target['domain']}:{updated_target['port']}"
        else:
            updated_target["targetUrl"] = f"{updated_target['domain']}:80"
        
        return TargetResponse(**updated_target)
        
    except Exception as e:
        print(f"[ERROR] Failed to update target: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update target: {str(e)}"
        )


@router.delete("/{target_id}")
def delete_target(target_id: int):
    """
    Delete target.
    Note: Scan results are preserved even after deleting the target.
    """
    target = TargetStorage.get(target_id)
    if not target:
        raise HTTPException(
            status_code=404,
            detail=f"Target with ID {target_id} not found"
        )
    
    success = TargetStorage.delete(target_id)
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete target"
        )
    
    return {"message": f"Target {target_id} deleted successfully"}


@router.get("/scannable/list", response_model=List[TargetResponse])
def get_scannable_targets():
    """
    Get all targets available for scanning.
    Since we removed wildcards, all targets are scannable.
    """
    try:
        targets = TargetStorage.get_all(limit=1000)
        
        target_responses = []
        for target in targets:
            # Always show port in targetUrl
            if target.get("port"):
                target["targetUrl"] = f"{target['domain']}:{target['port']}"
            else:
                target["targetUrl"] = f"{target['domain']}:80"
            
            target_responses.append(TargetResponse(**target))
        
        return target_responses
        
    except Exception as e:
        print(f"[ERROR] Failed to get scannable targets: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get scannable targets: {str(e)}"
        )
