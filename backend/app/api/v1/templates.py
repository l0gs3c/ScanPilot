from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...database import get_db
from ...schemas.template import Template, TemplateCreate, TemplateUpdate
from ...crud import template as template_crud
from ...core.deps import get_current_user
from ...schemas.user import User

router = APIRouter()

@router.post("/", response_model=Template, status_code=status.HTTP_201_CREATED)
def create_template(
    template: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new scan template"""
    # Check if template with same name and tool already exists
    existing_template = template_crud.get_template_by_name(db, template.name, template.tool)
    if existing_template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Template '{template.name}' for tool '{template.tool}' already exists"
        )
    
    return template_crud.create_template(db=db, template=template)

@router.get("/", response_model=List[Template])
def list_templates(
    skip: int = 0,
    limit: int = 100,
    tool: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of templates, optionally filtered by tool"""
    return template_crud.get_templates(db=db, skip=skip, limit=limit, tool=tool)

@router.get("/{template_id}", response_model=Template)
def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific template by ID"""
    template = template_crud.get_template(db=db, template_id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template

@router.put("/{template_id}", response_model=Template)
def update_template(
    template_id: int,
    template_update: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a template"""
    template = template_crud.update_template(db=db, template_id=template_id, template_update=template_update)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a template"""
    success = template_crud.delete_template(db=db, template_id=template_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return None