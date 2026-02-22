from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...schemas.target import TargetResponse
from ...models.target import Target
from ...core.deps import get_current_user
from ...models.user import User

router = APIRouter()

@router.get("/scannable", response_model=List[TargetResponse])
def get_scannable_targets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all targets that can be scanned (excludes wildcards, includes sub-targets).
    This endpoint is specifically for the scan creation modal.
    """
    print(f"[DEBUG] Getting scannable targets for user: {current_user.username}")
    
    # Get all non-wildcard targets (both standalone and sub-targets of wildcards)
    targets = db.query(Target).filter(
        Target.is_wildcard == False  # Only non-wildcard targets
    ).order_by(Target.created_at.desc()).all()
    
    print(f"[DEBUG] Found {len(targets)} scannable targets")
    
    target_responses = []
    for target in targets:
        print(f"[DEBUG] Target: {target.id}, {target.name}, {target.domain}, wildcard: {target.is_wildcard}, parent: {target.parent_wildcard}")
        
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
    
    print(f"[DEBUG] Returning {len(target_responses)} scannable targets")
    return target_responses