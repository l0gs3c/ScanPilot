from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from ..models.target import Target
from ..schemas.target import TargetCreate, TargetUpdate

class CRUDTarget:
    def create(self, db: Session, *, obj_in: TargetCreate) -> Target:
        """Create a new target"""
        print(f"[CRUD DEBUG] Creating target object with data: {obj_in.model_dump()}")
        
        # Auto-generate name from domain if not provided
        target_name = obj_in.name
        if not target_name:
            if obj_in.is_wildcard and obj_in.wildcard_pattern:
                target_name = obj_in.wildcard_pattern
            elif obj_in.domain:
                target_name = obj_in.domain
            else:
                target_name = "Unnamed Target"
        
        db_obj = Target(
            name=target_name,
            domain=obj_in.domain,
            port=obj_in.port,
            wildcard_pattern=obj_in.wildcard_pattern,
            parent_wildcard=obj_in.parent_wildcard,
            description=obj_in.description,
            is_wildcard=obj_in.is_wildcard,
            status="idle",
            active_scans=0,
            completed_scans=0
        )
        
        print(f"[CRUD DEBUG] Adding target to database session...")
        db.add(db_obj)
        
        print(f"[CRUD DEBUG] Committing to database...")
        db.commit()
        
        print(f"[CRUD DEBUG] Refreshing object...")
        db.refresh(db_obj)
        
        print(f"[CRUD DEBUG] Target created with ID: {db_obj.id}")
        return db_obj

    def get(self, db: Session, id: int) -> Optional[Target]:
        """Get target by ID"""
        return db.query(Target).filter(Target.id == id).first()

    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None,
        search: Optional[str] = None,
        order_by: str = "created_at",
        order_desc: bool = True,
        include_children: bool = False
    ) -> List[Target]:
        """Get multiple targets with filters"""
        query = db.query(Target)
        
        # Filter out child targets unless explicitly requested
        if not include_children:
            query = query.filter(Target.parent_wildcard == None)
        
        # Apply filters
        if status:
            query = query.filter(Target.status == status)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                Target.name.ilike(search_term) |
                Target.domain.ilike(search_term) |
                Target.wildcard_pattern.ilike(search_term)
            )
        
        # Apply ordering
        if order_by == "name":
            order_column = Target.name
        elif order_by == "domain":
            order_column = Target.domain
        elif order_by == "status":
            order_column = Target.status
        else:
            order_column = Target.created_at
            
        if order_desc:
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(asc(order_column))
        
        return query.offset(skip).limit(limit).all()

    def count(
        self, 
        db: Session,
        *,
        status: Optional[str] = None,
        search: Optional[str] = None,
        include_children: bool = False
    ) -> int:
        """Count targets with filters"""
        query = db.query(Target)
        
        # Filter out child targets unless explicitly requested
        if not include_children:
            query = query.filter(Target.parent_wildcard == None)
        
        if status:
            query = query.filter(Target.status == status)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                Target.name.ilike(search_term) |
                Target.domain.ilike(search_term) |
                Target.wildcard_pattern.ilike(search_term)
            )
        
        return query.count()

    def update(self, db: Session, *, db_obj: Target, obj_in: TargetUpdate) -> Target:
        """Update target"""
        update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: int) -> Optional[Target]:
        """Delete target"""
        obj = db.query(Target).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def count_children(self, db: Session, *, wildcard_pattern: str) -> int:
        """Count children targets of a wildcard pattern"""
        return db.query(Target).filter(Target.parent_wildcard == wildcard_pattern).count()

    def get_by_name(self, db: Session, *, name: str) -> Optional[Target]:
        """Get target by name"""
        return db.query(Target).filter(Target.name == name).first()
    
    def get_by_domain(self, db: Session, *, domain: str) -> Optional[Target]:
        """Get target by domain"""
        return db.query(Target).filter(Target.domain == domain).first()
    
    def get_wildcard_targets(self, db: Session) -> List[Target]:
        """Get all wildcard targets"""
        return db.query(Target).filter(Target.is_wildcard == True).all()
    
    def get_active_targets(self, db: Session) -> List[Target]:
        """Get targets currently being scanned"""
        return db.query(Target).filter(Target.status == "scanning").all()
    
    def update_status(self, db: Session, *, id: int, status: str) -> Optional[Target]:
        """Update target status"""
        target = self.get(db, id=id)
        if target:
            target.status = status
            db.add(target)
            db.commit()
            db.refresh(target)
        return target
    
    def increment_scan_count(self, db: Session, *, id: int, scan_type: str = "completed") -> Optional[Target]:
        """Increment scan counters"""
        target = self.get(db, id=id)
        if target:
            if scan_type == "active":
                target.active_scans += 1
            elif scan_type == "completed":
                target.completed_scans += 1
                if target.active_scans > 0:
                    target.active_scans -= 1
            
            db.add(target)
            db.commit()
            db.refresh(target)
        return target

    def get_children(
        self, 
        db: Session, *, 
        parent_wildcard_id: int,
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None,
        search: Optional[str] = None,
        order_by: str = "created_at",
        order_desc: bool = True
    ) -> List[Target]:
        """Get children targets of a wildcard target"""
        print(f"[CRUD DEBUG] Searching for children with parent_wildcard_id: {parent_wildcard_id} (as string: '{str(parent_wildcard_id)}')")
        query = db.query(Target).filter(Target.parent_wildcard == str(parent_wildcard_id))
        
        # Debug: check all targets with parent_wildcard
        all_with_parents = db.query(Target).filter(Target.parent_wildcard.isnot(None)).all()
        print(f"[CRUD DEBUG] All targets with parent_wildcard:")
        for t in all_with_parents:
            print(f"  Target {t.id}: parent_wildcard='{t.parent_wildcard}' (type: {type(t.parent_wildcard)})")
        
        if status:
            query = query.filter(Target.status == status)
        
        if search:
            query = query.filter(
                (Target.name.contains(search)) | 
                (Target.domain.contains(search)) |
                (Target.description.contains(search))
            )
        
        # Apply ordering
        if hasattr(Target, order_by):
            order_column = getattr(Target, order_by)
            if order_desc:
                query = query.order_by(desc(order_column))
            else:
                query = query.order_by(asc(order_column))
        
        result = query.offset(skip).limit(limit).all()
        print(f"[CRUD DEBUG] Query returned {len(result)} children")
        for child in result:
            print(f"  Child: {child.id}, {child.name}, {child.domain}")
        return result

    def count_children(
        self, 
        db: Session, *, 
        parent_wildcard_id: int,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> int:
        """Count children targets of a wildcard target"""
        query = db.query(Target).filter(Target.parent_wildcard == str(parent_wildcard_id))
        
        if status:
            query = query.filter(Target.status == status)
        
        if search:
            query = query.filter(
                (Target.name.contains(search)) | 
                (Target.domain.contains(search)) |
                (Target.description.contains(search))
            )
        
        return query.count()

target = CRUDTarget()