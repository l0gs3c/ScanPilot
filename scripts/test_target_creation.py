#!/usr/bin/env python3
"""
Test script to verify target creation and database storage
"""
import sys
import os
import requests
import json

# Add the backend directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.database import SessionLocal
from backend.app.models.target import Target

def test_database_connection():
    """Test if we can connect to the database and query targets"""
    print("=== Testing Database Connection ===")
    
    try:
        db = SessionLocal()
        targets = db.query(Target).all()
        print(f"✅ Database connection successful")
        print(f"✅ Current targets in database: {len(targets)}")
        
        for target in targets:
            print(f"   - ID: {target.id}, Name: {target.name}, Domain: {target.domain}")
            
        db.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_api_login():
    """Test API login and get token"""
    print("\n=== Testing API Login ===")
    
    try:
        login_url = "http://localhost:8000/api/v1/auth/login"
        login_data = {
            "username": "l0gs3c",
            "password": "l0gs3c"
        }
        
        response = requests.post(login_url, json=login_data)
        
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Login successful")
            return token_data.get("access_token")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_api_create_target(token):
    """Test creating target via API"""
    print("\n=== Testing Target Creation via API ===")
    
    if not token:
        print("❌ No token available for API test")
        return False
        
    try:
        create_url = "http://localhost:8000/api/v1/targets/"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test regular target
        target_data = {
            "name": "Test Target API",
            "domain": "test-api.example.com",
            "port": "443",
            "description": "Test target created via API",
            "isWildcard": False
        }
        
        print(f"Creating target: {target_data}")
        response = requests.post(create_url, headers=headers, json=target_data)
        
        if response.status_code == 200:
            created_target = response.json()
            print(f"✅ Target created successfully: ID {created_target.get('id')}")
            return True
        else:
            print(f"❌ Target creation failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API error: {e}")
        return False

def test_api_create_wildcard(token):
    """Test creating wildcard target via API"""
    print("\n=== Testing Wildcard Creation via API ===")
    
    if not token:
        print("❌ No token available for API test")
        return False
        
    try:
        create_url = "http://localhost:8000/api/v1/targets/"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test wildcard target
        wildcard_data = {
            "name": "Test Wildcard API",
            "wildcardPattern": "*.test-api.com",
            "description": "Test wildcard created via API",
            "isWildcard": True
        }
        
        print(f"Creating wildcard: {wildcard_data}")
        response = requests.post(create_url, headers=headers, json=wildcard_data)
        
        if response.status_code == 200:
            created_target = response.json()
            print(f"✅ Wildcard created successfully: ID {created_target.get('id')}")
            return True
        else:
            print(f"❌ Wildcard creation failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API error: {e}")
        return False

def verify_database_after_creation():
    """Verify that targets were actually saved to database"""
    print("\n=== Verifying Database After Creation ===")
    
    try:
        db = SessionLocal()
        targets = db.query(Target).all()
        
        print(f"✅ Total targets in database: {len(targets)}")
        
        for target in targets:
            print(f"   - ID: {target.id}")
            print(f"     Name: {target.name}")
            print(f"     Domain: {target.domain}")
            print(f"     Wildcard: {target.wildcard_pattern}")
            print(f"     Is Wildcard: {target.is_wildcard}")
            print(f"     Status: {target.status}")
            print(f"     Created: {target.created_at}")
            print("     ---")
            
        db.close()
        return len(targets) > 0
    except Exception as e:
        print(f"❌ Database verification failed: {e}")
        return False

def main():
    print("🧪 ScanPilot Target Creation Test")
    print("=" * 50)
    
    # Test 1: Database connection
    if not test_database_connection():
        print("❌ Cannot continue without database connection")
        return
    
    # Test 2: API login
    token = test_api_login()
    if not token:
        print("❌ Cannot continue without API token")
        return
    
    # Test 3: Create regular target
    test_api_create_target(token)
    
    # Test 4: Create wildcard target
    test_api_create_wildcard(token)
    
    # Test 5: Verify database
    verify_database_after_creation()
    
    print("\n🎉 Testing completed!")

if __name__ == "__main__":
    main()