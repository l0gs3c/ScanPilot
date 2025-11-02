from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class TargetBase(BaseModel):
    name: str
    domain: Optional[str] = None
    port: Optional[str] = None
    wildcard_pattern: Optional[str] = None
    parent_wildcard: Optional[str] = None
    description: Optional[str] = None
    is_wildcard: bool = False

class TargetCreate(TargetBase):
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    @validator('domain')
    def domain_required_for_non_wildcard(cls, v, values):
        if not values.get('is_wildcard', False) and not v:
            raise ValueError('Domain is required for non-wildcard targets')
        return v
    
    @validator('wildcard_pattern')
    def wildcard_pattern_required_for_wildcard(cls, v, values):
        if values.get('is_wildcard', False) and not v:
            raise ValueError('Wildcard pattern is required for wildcard targets')
        return v
    
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
    wildcard_pattern: Optional[str] = None
    parent_wildcard: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class TargetInDBBase(TargetBase):
    id: int
    status: str
    active_scans: int
    completed_scans: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
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
    domain: Optional[str] = None
    port: Optional[str] = None
    wildcardPattern: Optional[str] = None
    parentWildcard: Optional[str] = None
    description: Optional[str] = None
    isWildcard: bool
    status: str
    activeScans: int
    completedScans: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    targetUrl: Optional[str] = None
    childrenCount: Optional[int] = 0  # Number of sub-targets for wildcard targets
    
    class Config:
        from_attributes = True

class TargetListResponse(BaseModel):
    targets: list[TargetResponse]
    total: int
    page: int
    size: int