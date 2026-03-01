import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.scan_service import PROJECT_ROOT, SCANS_JSON_PATH, TARGETS_BASE_PATH

print("=== PATH VERIFICATION ===")
print(f"PROJECT_ROOT: {PROJECT_ROOT}")
print(f"SCANS_JSON_PATH: {SCANS_JSON_PATH}")
print(f"TARGETS_BASE_PATH: {TARGETS_BASE_PATH}")
print(f"\n=== FILE EXISTENCE ===")
print(f"scans.json exists: {SCANS_JSON_PATH.exists()}")
print(f"targets.json exists: {(TARGETS_BASE_PATH / 'targets.json').exists()}")
print(f"\n=== PROJECT_ROOT CONTENTS ===")
if PROJECT_ROOT.exists():
    for item in PROJECT_ROOT.iterdir():
        print(f"  {item.name}")
