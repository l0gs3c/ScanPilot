import sqlite3
import os

def check_all_databases():
    db_files = [
        'scanpilot.db',
        'backend/scanpilot.db'
    ]
    
    for db_file in db_files:
        if os.path.exists(db_file):
            print(f'\n🗄️  Database: {db_file}')
            print('=' * 60)
            
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            
            # Check if targets table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='targets'")
            table_exists = cursor.fetchone()
            
            if table_exists:
                cursor.execute('SELECT id, name, domain, wildcard_pattern, is_wildcard, status, created_at FROM targets')
                rows = cursor.fetchall()
                
                if rows:
                    print(f'{"ID":<3} | {"Name":<20} | {"Domain":<15} | {"Wildcard":<15} | {"Wild":<4} | {"Status":<8}')
                    print('-' * 60)
                    
                    for row in rows:
                        print(f'{row[0]:<3} | {(row[1] or "")[:20]:<20} | {(row[2] or "NULL")[:15]:<15} | {(row[3] or "NULL")[:15]:<15} | {str(row[4]):<4} | {(row[5] or "")[:8]:<8}')
                    
                    print(f'\nTotal targets: {len(rows)}')
                else:
                    print('✅ Table exists but is empty')
            else:
                print('❌ Targets table does not exist')
            
            conn.close()
        else:
            print(f'\n❌ Database file not found: {db_file}')

if __name__ == "__main__":
    print('🔍 Checking all database files...')
    check_all_databases()