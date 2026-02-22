from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TemplateBase(BaseModel):
    name: str
    tool: str  # subfinder, dirsearch, nuclei
    command_template: str
    description: Optional[str] = None

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    tool: Optional[str] = None
    command_template: Optional[str] = None
    description: Optional[str] = None

class Template(TemplateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True