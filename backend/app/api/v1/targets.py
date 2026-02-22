from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json

from ...database import get_db
from ...crud import target as crud_target
from ...schemas.target import (
    TargetCreate,
    TargetUpdate,
    TargetResponse,
    TargetListResponse
)
from ...models.target import Target
from ...core.deps import get_current_user
from ...models.user import User

router = APIRouter()

class TargetCreateRequest(BaseModel):
    name: Optional[str] = None  # Changed to optional
    domain: Optional[str] = None
    port: Optional[str] = None
    wildcardPattern: Optional[str] = None
    parentWildcard: Optional[str] = None
    description: Optional[str] = None
    isWildcard: bool = False
    
    def validate_fields(self):
        """Custom validation for target creation"""
        if not self.isWildcard and not self.domain:
            raise ValueError("Domain is required for non-wildcard targets")
        if self.isWildcard and not self.wildcardPattern:
            raise ValueError("Wildcard pattern is required for wildcard targets")
        return True

@router.post("/", response_model=TargetResponse)
def create_target(
    target_data: TargetCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create new target.
    """
    try:
        print(f"[DEBUG] Raw request received")
        print(f"[DEBUG] Request data: {target_data.model_dump()}")
        
        # Validate request data
        target_data.validate_fields()
        
        # Auto-generate name if not provided
        target_name = target_data.name
        if not target_name:
            if target_data.isWildcard and target_data.wildcardPattern:
                target_name = target_data.wildcardPattern
            elif target_data.domain:
                target_name = target_data.domain
            else:
                target_name = "Unnamed Target"
        
        # Create target directly without pydantic validation
        from ...models.target import Target
        
        target_obj = Target(
            name=target_name,
            domain=target_data.domain,
            port=target_data.port,
            wildcard_pattern=target_data.wildcardPattern,
            parent_wildcard=target_data.parentWildcard,
            description=target_data.description,
            is_wildcard=target_data.isWildcard,
            status="idle",
            active_scans=0,
            completed_scans=0
        )
        print(f"[DEBUG] Creating target with data: {target_obj.__dict__}")
        
        # For non-wildcard targets, check if domain already exists
        if not target_obj.is_wildcard and target_obj.domain:
            existing_domain = crud_target.get_by_domain(db, domain=target_obj.domain)
            if existing_domain:
                print(f"[DEBUG] Target with domain '{target_obj.domain}' already exists")
                raise HTTPException(
                    status_code=400,
                    detail="Target with this domain already exists"
                )
        
        print(f"[DEBUG] Adding target to database...")
        db.add(target_obj)
        db.commit()
        db.refresh(target_obj)
        target = target_obj
        print(f"[DEBUG] Target created successfully with ID: {target.id}")
        
        return TargetResponse(
            id=target.id,
            name=target.name,
            domain=target.domain,
            port=target.port,
            wildcardPattern=target.wildcard_pattern,
            parentWildcard=target.parent_wildcard,
            description=target.description,
            isWildcard=target.is_wildcard,
            status=target.status,
            activeScans=target.active_scans,
            completedScans=target.completed_scans,
            createdAt=target.created_at,
            updatedAt=target.updated_at,
            targetUrl=target.target_url
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Unexpected error creating target: {str(e)}")
        print(f"[ERROR] Error type: {type(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/", response_model=TargetListResponse)
def read_targets(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of targets to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of targets to return"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in name, domain, or wildcard pattern"),
    order_by: str = Query("created_at", description="Field to order by"),
    order_desc: bool = Query(True, description="Order descending"),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve targets.
    """
    targets = crud_target.get_multi(
        db, 
        skip=skip, 
        limit=limit,
        status=status,
        search=search,
        order_by=order_by,
        order_desc=order_desc,
        include_children=False  # Only show top-level targets
    )
    
    total = crud_target.count(
        db,
        status=status,
        search=search,
        include_children=False  # Only count top-level targets
    )
    
    target_responses = []
    for target in targets:
        # Count children for wildcard targets
        children_count = 0
        if target.is_wildcard:
            children_count = crud_target.count_children(db, parent_wildcard_id=target.id)
        
        target_responses.append(TargetResponse(
            id=target.id,
            name=target.name,
            domain=target.domain,
            port=target.port,
            wildcardPattern=target.wildcard_pattern,
            parentWildcard=target.parent_wildcard,
            description=target.description,
            isWildcard=target.is_wildcard,
            status=target.status,
            activeScans=target.active_scans,
            completedScans=target.completed_scans,
            createdAt=target.created_at,
            updatedAt=target.updated_at,
            targetUrl=target.target_url,
            childrenCount=children_count
        ))
    
    return TargetListResponse(
        targets=target_responses,
        total=total,
        page=skip // limit + 1,
        size=limit
    )

@router.get("/{target_id}/children", response_model=TargetListResponse)
def get_target_children(
    target_id: int,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of targets to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of targets to return"),
    current_user: User = Depends(get_current_user)
):
    """
    Get children targets of a wildcard target.
    """
    print(f"[DEBUG] Getting children for target_id: {target_id}")
    
    # First verify the parent target exists and is a wildcard
    parent_target = crud_target.get(db, id=target_id)
    if not parent_target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    if not parent_target.is_wildcard:
        raise HTTPException(status_code=400, detail="Target is not a wildcard target")
    
    # Get children targets - query by parent_wildcard = target_id (as string)
    children = db.query(Target).filter(
        Target.parent_wildcard == str(target_id)
    ).offset(skip).limit(limit).all()
    
    print(f"[DEBUG] Found {len(children)} children for target {target_id}")
    for child in children:
        print(f"[DEBUG] Child: {child.id}, {child.name}, {child.domain}, parent_wildcard: '{child.parent_wildcard}'")
    
    total = db.query(Target).filter(
        Target.parent_wildcard == str(target_id)
    ).count()
    
    print(f"[DEBUG] Total children count: {total}")
    
    target_responses = []
    for target in children:
        target_responses.append(TargetResponse(
            id=target.id,
            name=target.name,
            domain=target.domain,
            port=target.port,
            wildcardPattern=target.wildcard_pattern,
            parentWildcard=target.parent_wildcard,
            description=target.description,
            isWildcard=target.is_wildcard,
            status=target.status,
            activeScans=target.active_scans,
            completedScans=target.completed_scans,
            createdAt=target.created_at,
            updatedAt=target.updated_at,
            targetUrl=target.target_url
        ))
    
    return TargetListResponse(
        targets=target_responses,
        total=total,
        page=skip // limit + 1,
        size=len(target_responses)
    )

@router.get("/test-scannable")
def test_scannable():
    """Test endpoint without authentication"""
    print("[DEBUG] Test scannable endpoint called!")
    return {"message": "Test scannable works", "status": "ok"}

@router.get("/scannable")
def get_scannable_targets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all targets that can be scanned (excludes wildcards, includes sub-targets).
    This endpoint is specifically for the scan creation modal.
    """
    print(f"[DEBUG] Getting scannable targets for user: {current_user.username}")
    print(f"[DEBUG] User ID: {current_user.id}, User role: {getattr(current_user, 'role', 'unknown')}")
    
    try:
        # Get all non-wildcard targets (both standalone and sub-targets of wildcards)
        targets = db.query(Target).filter(
            Target.is_wildcard == False  # Only non-wildcard targets
        ).order_by(Target.created_at.desc()).all()
        
        print(f"[DEBUG] Found {len(targets)} scannable targets")
        
        # Return simple format first
        simple_targets = []
        for target in targets:
            simple_targets.append({
                "id": target.id,
                "name": target.name,
                "domain": target.domain,
                "isWildcard": target.is_wildcard,
                "status": target.status
            })
        
        return {"targets": simple_targets, "count": len(simple_targets)}
        
    except Exception as e:
        print(f"[ERROR] Error in scannable endpoint: {str(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        return {"error": str(e), "targets": [], "count": 0}

@router.get("/{target_id}", response_model=TargetResponse)
def read_target(
    *,
    db: Session = Depends(get_db),
    target_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get target by ID.
    """
    target = crud_target.get(db, id=target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    return TargetResponse(
        id=target.id,
        name=target.name,
        domain=target.domain,
        port=target.port,
        wildcardPattern=target.wildcard_pattern,
        parentWildcard=target.parent_wildcard,
        description=target.description,
        isWildcard=target.is_wildcard,
        status=target.status,
        activeScans=target.active_scans,
        completedScans=target.completed_scans,
        createdAt=target.created_at,
        updatedAt=target.updated_at,
        targetUrl=target.target_url
    )

@router.put("/{target_id}", response_model=TargetResponse)
def update_target(
    *,
    db: Session = Depends(get_db),
    target_id: int,
    target_in: TargetUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update target.
    """
    target = crud_target.get(db, id=target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    # Names can be duplicate - no uniqueness check needed
    
    # Check domain uniqueness if being updated (only for non-wildcard targets)
    if target_in.domain and target_in.domain != target.domain and not target.is_wildcard:
        existing_domain = crud_target.get_by_domain(db, domain=target_in.domain)
        if existing_domain:
            raise HTTPException(
                status_code=400,
                detail="Target with this domain already exists"
            )
    
    target = crud_target.update(db, db_obj=target, obj_in=target_in)
    
    return TargetResponse(
        id=target.id,
        name=target.name,
        domain=target.domain,
        port=target.port,
        wildcardPattern=target.wildcard_pattern,
        parentWildcard=target.parent_wildcard,
        description=target.description,
        isWildcard=target.is_wildcard,
        status=target.status,
        activeScans=target.active_scans,
        completedScans=target.completed_scans,
        createdAt=target.created_at,
        updatedAt=target.updated_at,
        targetUrl=target.target_url
    )

@router.delete("/{target_id}")
def delete_target(
    *,
    db: Session = Depends(get_db),
    target_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Delete target.
    """
    target = crud_target.get(db, id=target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    # Check if target has active scans
    if target.active_scans > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete target with active scans"
        )
    
    crud_target.delete(db, id=target_id)
    return {"message": "Target deleted successfully"}

@router.patch("/{target_id}/status")
def update_target_status(
    *,
    db: Session = Depends(get_db),
    target_id: int,
    status: str,
    current_user: User = Depends(get_current_user)
):
    """
    Update target status.
    """
    valid_statuses = ["idle", "scanning", "completed", "error"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    target = crud_target.update_status(db, id=target_id, status=status)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    return {"message": f"Target status updated to {status}"}

@router.get("/wildcards/list", response_model=List[TargetResponse])
def get_wildcard_targets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all wildcard targets for parent selection.
    """
    targets = crud_target.get_wildcard_targets(db)
    
    target_responses = []
    for target in targets:
        target_responses.append(TargetResponse(
            id=target.id,
            name=target.name,
            domain=target.domain,
            port=target.port,
            wildcardPattern=target.wildcard_pattern,
            parentWildcard=target.parent_wildcard,
            description=target.description,
            isWildcard=target.is_wildcard,
            status=target.status,
            activeScans=target.active_scans,
            completedScans=target.completed_scans,
            createdAt=target.created_at,
            updatedAt=target.updated_at,
            targetUrl=target.target_url
        ))
    
    return target_responses


    
