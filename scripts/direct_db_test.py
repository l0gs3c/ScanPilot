#!/usr/bin/env python3
"""
Direct Database Test - Verify target creation works in database
"""
import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import SessionLocal, init_db
from app.models.target import Target
from app.crud.target import target as crud_target
from app.schemas.target import TargetCreate
import datetime

def test_direct_db_creation():
    """Test creating targets directly in the database"""
    print("🧪 ScanPilot Direct Database Test")
    print("=" * 50)
    
    # Initialize database
    print("=== Initializing Database ===")
    init_db()
    print("✅ Database initialized")
    
    db = SessionLocal()
    try:
        # Clean up any existing test data
        test_targets = db.query(Target).filter(Target.name.like("Test%")).all()
        for target in test_targets:
            db.delete(target)
        db.commit()
        print(f"🧹 Cleaned up {len(test_targets)} existing test targets")
        
        # Test 1: Create a regular target
        print("\n=== Testing Regular Target Creation ===")
        regular_target_data = TargetCreate(
            name="Test Regular Target",
            domain="test-regular.example.com",
            port="443",
            description="Test regular target created directly",
            is_wildcard=False
        )
        
        regular_target = crud_target.create(db, obj_in=regular_target_data)
        print(f"✅ Regular target created with ID: {regular_target.id}")
        print(f"   Name: {regular_target.name}")
        print(f"   Domain: {regular_target.domain}")
        print(f"   Port: {regular_target.port}")
        print(f"   Is Wildcard: {regular_target.is_wildcard}")
        print(f"   Status: {regular_target.status}")
        print(f"   Target URL: {regular_target.target_url}")
        
        # Test 2: Create a wildcard target
        print("\n=== Testing Wildcard Target Creation ===")
        wildcard_target_data = TargetCreate(
            name="Test Wildcard Target",
            wildcard_pattern="*.test-wildcard.com",
            description="Test wildcard target created directly",
            is_wildcard=True
        )
        
        wildcard_target = crud_target.create(db, obj_in=wildcard_target_data)
        print(f"✅ Wildcard target created with ID: {wildcard_target.id}")
        print(f"   Name: {wildcard_target.name}")
        print(f"   Wildcard Pattern: {wildcard_target.wildcard_pattern}")
        print(f"   Is Wildcard: {wildcard_target.is_wildcard}")
        print(f"   Status: {wildcard_target.status}")
        print(f"   Target URL: {wildcard_target.target_url}")
        
        # Test 3: Create a subdomain target with parent wildcard
        print("\n=== Testing Subdomain Target with Parent ===")
        subdomain_target_data = TargetCreate(
            name="Test Subdomain Target",
            domain="sub1.test-wildcard.com",
            port="80",
            parent_wildcard="*.test-wildcard.com",
            description="Test subdomain target with parent wildcard",
            is_wildcard=False
        )
        
        subdomain_target = crud_target.create(db, obj_in=subdomain_target_data)
        print(f"✅ Subdomain target created with ID: {subdomain_target.id}")
        print(f"   Name: {subdomain_target.name}")
        print(f"   Domain: {subdomain_target.domain}")
        print(f"   Port: {subdomain_target.port}")
        print(f"   Parent Wildcard: {subdomain_target.parent_wildcard}")
        print(f"   Is Wildcard: {subdomain_target.is_wildcard}")
        print(f"   Target URL: {subdomain_target.target_url}")
        
        # Test 4: Verify all targets in database
        print("\n=== Verifying Database State ===")
        all_targets = db.query(Target).all()
        print(f"✅ Total targets in database: {len(all_targets)}")
        
        for i, target in enumerate(all_targets, 1):
            print(f"   {i}. ID={target.id}, Name='{target.name}', "
                  f"URL='{target.target_url}', Wildcard={target.is_wildcard}")
        
        # Test 5: Test CRUD operations
        print("\n=== Testing CRUD Operations ===")
        
        # Get by name
        found_target = crud_target.get_by_name(db, name="Test Regular Target")
        if found_target:
            print(f"✅ Found target by name: {found_target.name}")
        
        # Get wildcard targets
        wildcard_targets = crud_target.get_wildcard_targets(db)
        print(f"✅ Found {len(wildcard_targets)} wildcard targets")
        
        # Update target status
        updated_target = crud_target.update_status(db, id=regular_target.id, status="scanning")
        if updated_target:
            print(f"✅ Updated target status to: {updated_target.status}")
        
        # Test search functionality
        search_results = crud_target.get_multi(db, search="test", limit=10)
        print(f"✅ Search for 'test' returned {len(search_results)} results")
        
        print("\n🎉 All tests completed successfully!")
        print("\n=== Summary ===")
        print(f"✅ Regular targets: {len([t for t in all_targets if not t.is_wildcard])}")
        print(f"✅ Wildcard targets: {len([t for t in all_targets if t.is_wildcard])}")
        print(f"✅ Total targets created: {len(all_targets)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during database test: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    success = test_direct_db_creation()
    if success:
        print("\n✅ Database functionality is working correctly!")
        print("🚀 Targets can be created and stored successfully!")
    else:
        print("\n❌ Database test failed!")
    
    sys.exit(0 if success else 1)