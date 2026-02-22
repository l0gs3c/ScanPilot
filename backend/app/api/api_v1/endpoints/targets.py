from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

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

@router.post("/", response_model=TargetResponse)
def create_target(
    *,
    db: Session = Depends(get_db),
    target_in: TargetCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create new target.
    """
    # Check if target with same name already exists (only if name is provided)
    if target_in.name:
        existing_target = crud_target.target.get_by_name(db, name=target_in.name)
        if existing_target:
            raise HTTPException(
                status_code=400,
                detail="Target with this name already exists"
            )
    
    # For non-wildcard targets, check if domain already exists
    if not target_in.is_wildcard and target_in.domain:
        existing_domain = crud_target.target.get_by_domain(db, domain=target_in.domain)
        if existing_domain:
            raise HTTPException(
                status_code=400,
                detail="Target with this domain already exists"
            )
    
    target = crud_target.target.create(db, obj_in=target_in)
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
    targets = crud_target.target.get_multi(
        db, 
        skip=skip, 
        limit=limit,
        status=status,
        search=search,
        order_by=order_by,
        order_desc=order_desc
    )
    
    total = crud_target.target.count(
        db,
        status=status,
        search=search
    )
    
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
    
    return TargetListResponse(
        targets=target_responses,
        total=total,
        page=skip // limit + 1,
        size=limit
    )

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
    target = crud_target.target.get(db, id=target_id)
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
    target = crud_target.target.get(db, id=target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    # Check name uniqueness if being updated
    if target_in.name and target_in.name != target.name:
        existing_target = crud_target.target.get_by_name(db, name=target_in.name)
        if existing_target:
            raise HTTPException(
                status_code=400,
                detail="Target with this name already exists"
            )
    
    target = crud_target.target.update(db, db_obj=target, obj_in=target_in)
    
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
    target = crud_target.target.get(db, id=target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    # Check if target has active scans
    if target.active_scans > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete target with active scans"
        )
    
    crud_target.target.delete(db, id=target_id)
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
    
    target = crud_target.target.update_status(db, id=target_id, status=status)
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
    targets = crud_target.target.get_wildcard_targets(db)
    
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

@router.get("/{target_id}/children", response_model=TargetListResponse)
def get_target_children(
    *,
    db: Session = Depends(get_db),
    target_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    order_by: str = Query("created_at"),
    order_desc: bool = Query(True),
    current_user: User = Depends(get_current_user)
):
    """
    Get children targets of a wildcard target.
    """
    print(f"[DEBUG] Getting children for target_id: {target_id}")
    # Verify the parent target exists and is a wildcard
    parent_target = crud_target.target.get(db, id=target_id)
    if not parent_target:
        raise HTTPException(status_code=404, detail="Parent target not found")
    
    if not parent_target.is_wildcard:
        raise HTTPException(status_code=400, detail="Target is not a wildcard target")
    
    # Get children targets
    children = crud_target.target.get_children(
        db,
        parent_wildcard_id=target_id,
        skip=skip,
        limit=limit,
        status=status,
        search=search,
        order_by=order_by,
        order_desc=order_desc
    )
    
    print(f"[DEBUG] Found {len(children)} children for target {target_id}")
    for child in children:
        print(f"[DEBUG] Child: {child.id}, {child.name}, {child.domain}, parent_wildcard: {child.parent_wildcard}")
    
    total = crud_target.target.count_children(
        db,
        parent_wildcard_id=target_id,
        status=status,
        search=search
    )
    
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
        size=limit
    )