from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Scan(Base):
    """Model for storing scan records and results"""
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String(36), unique=True, index=True, nullable=False)  # UUID
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    
    # Scan details
    tool = Column(String(50), nullable=False)  # subfinder, dirsearch, nuclei, amass
    config = Column(JSON, nullable=True)  # Tool configuration
    
    # Status tracking
    status = Column(String(50), default="pending", nullable=False)  # pending, running, paused, stopped, completed, error
    
    # Results
    output_file = Column(String(500), nullable=True)  # Path to output file
    output_lines = Column(Text, nullable=True)  # Terminal output (for display)
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    target = relationship("Target", backref="scans")
    
    def __repr__(self):
        return f"<Scan(id={self.id}, scan_id='{self.scan_id}', tool='{self.tool}', status='{self.status}')>"
    
    def to_dict(self):
        """Convert model to dictionary for API responses"""
        duration = None
        if self.start_time and self.end_time:
            duration = (self.end_time - self.start_time).total_seconds()
        
        return {
            "id": self.id,
            "scanId": self.scan_id,
            "targetId": self.target_id,
            "target": self.target.to_dict() if self.target else None,
            "tool": self.tool,
            "config": self.config,
            "status": self.status,
            "outputFile": self.output_file,
            "outputLines": self.output_lines,
            "errorMessage": self.error_message,
            "startTime": self.start_time.isoformat() if self.start_time else None,
            "endTime": self.end_time.isoformat() if self.end_time else None,
            "duration": duration,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }
