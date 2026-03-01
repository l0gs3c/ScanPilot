from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class TargetBase(BaseModel):
    name: str
    domain: str
    port: Optional[str] = None
    description: Optional[str] = None

class TargetCreate(TargetBase):
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    @validator('domain')
    def domain_required(cls, v):
        if not v or not v.strip():
            raise ValueError('Domain is required')
        return v.strip()
    
    @validator('port')
    def validate_port(cls, v):
        if v is not None and v.strip():
            try:
                port_num = int(v.strip())
                if port_num < 1 or port_num > 65535:
                    raise ValueError('Port must be between 1 and 65535')
                return str(port_num)
            except ValueError as e:
                if "invalid literal" in str(e):
                    raise ValueError('Port must be a valid number')
                raise e
        return v

class TargetUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    port: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class TargetInDBBase(TargetBase):
    id: int
    status: str
    activeScans: int
    completedScans: int
    createdAt: str
    updatedAt: Optional[str] = None
    
    class Config:
        from_attributes = True

class Target(TargetInDBBase):
    pass

class TargetInDB(TargetInDBBase):
    pass

# Response schemas with camelCase for frontend compatibility
class TargetResponse(BaseModel):
    id: int
    name: str
    domain: str
    port: Optional[str] = None
    description: Optional[str] = None
    status: str
    activeScans: int
    completedScans: int
    createdAt: str
    updatedAt: Optional[str] = None
    targetUrl: Optional[str] = None
    folderName: Optional[str] = None
    
    class Config:
        from_attributes = True

class TargetListResponse(BaseModel):
    targets: list[TargetResponse]
    total: int
    page: int
    size: int
