"""
Migration script: Merge individual target_*.json files into single targets.json
"""
import json
from pathlib import Path

# Use project root storage/ (not backend/storage/)
TARGETS_DIR = Path(__file__).parent.parent / "storage" / "targets"

def migrate_targets():
    """Merge all target_*.json files into targets.json"""
    
    # Read all individual target files
    targets = []
    old_files = []
    
    for target_file in sorted(TARGETS_DIR.glob("target_*.json")):
        print(f"Reading {target_file.name}...")
        try:
            with open(target_file, 'r', encoding='utf-8') as f:
                target = json.load(f)
                targets.append(target)
                old_files.append(target_file)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"  ERROR: Corrupted file - {str(e)}")
            continue
    
    if not targets:
        print("No targets found to migrate.")
        return
    
    print(f"\nFound {len(targets)} targets to migrate:")
    for target in targets:
        print(f"  - ID {target.get('id')}: {target.get('domain')}:{target.get('port')}")
    
    # Write to new targets.json file
    targets_file = TARGETS_DIR / "targets.json"
    print(f"\nWriting to {targets_file}...")
    with open(targets_file, 'w', encoding='utf-8') as f:
        json.dump(targets, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully created targets.json with {len(targets)} targets")
    
    # Delete old files
    print("\nDeleting old individual target files...")
    for old_file in old_files:
        old_file.unlink()
        print(f"  - Deleted {old_file.name}")
    
    print(f"\n✅ Migration complete! {len(old_files)} old files removed.")

if __name__ == "__main__":
    migrate_targets()
