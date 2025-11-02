from sqlalchemy.orm import Session
from ..models.template import Template
from ..schemas.template import TemplateCreate, TemplateUpdate
from typing import List, Optional

def get_template(db: Session, template_id: int) -> Optional[Template]:
    return db.query(Template).filter(Template.id == template_id).first()

def get_templates(db: Session, skip: int = 0, limit: int = 100, tool: Optional[str] = None) -> List[Template]:
    query = db.query(Template)
    if tool:
        query = query.filter(Template.tool == tool)
    return query.offset(skip).limit(limit).all()

def get_template_by_name(db: Session, name: str, tool: str) -> Optional[Template]:
    return db.query(Template).filter(Template.name == name, Template.tool == tool).first()

def create_template(db: Session, template: TemplateCreate) -> Template:
    db_template = Template(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def update_template(db: Session, template_id: int, template_update: TemplateUpdate) -> Optional[Template]:
    db_template = get_template(db, template_id)
    if not db_template:
        return None
    
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)
    
    db.commit()
    db.refresh(db_template)
    return db_template

def delete_template(db: Session, template_id: int) -> bool:
    db_template = get_template(db, template_id)
    if not db_template:
        return False
    
    db.delete(db_template)
    db.commit()
    return True