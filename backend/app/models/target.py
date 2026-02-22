from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=True)
    port = Column(String(10), nullable=True) 
    wildcard_pattern = Column(String(255), nullable=True)
    parent_wildcard = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    is_wildcard = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="idle", nullable=False)  # idle, scanning, completed, error
    
    # Statistics
    active_scans = Column(Integer, default=0)
    completed_scans = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - will be added when we create scan models
    # scans = relationship("Scan", back_populates="target")
    
    def __repr__(self):
        return f"<Target(id={self.id}, name='{self.name}', domain='{self.domain}')>"
    
    @property
    def target_url(self):
        """Get the formatted target URL or pattern"""
        if self.is_wildcard and self.wildcard_pattern:
            return self.wildcard_pattern
        elif self.domain:
            if self.port and self.port != "80" and self.port != "443":
                return f"{self.domain}:{self.port}"
            return self.domain
        return None
    
    def to_dict(self):
        """Convert model to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "domain": self.domain,
            "port": self.port,
            "wildcardPattern": self.wildcard_pattern,
            "parentWildcard": self.parent_wildcard,
            "description": self.description,
            "isWildcard": self.is_wildcard,
            "status": self.status,
            "activeScans": self.active_scans,
            "completedScans": self.completed_scans,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "targetUrl": self.target_url
        }