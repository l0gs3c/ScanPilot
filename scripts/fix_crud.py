import re

def fix_crud_references():
    with open('backend/app/api/v1/targets.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace all instances of crud_target.target. with crud_target.
    fixed_content = re.sub(r'crud_target\.target\.', 'crud_target.', content)
    
    with open('backend/app/api/v1/targets.py', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print("Fixed all CRUD references in targets.py")

if __name__ == "__main__":
    fix_crud_references()