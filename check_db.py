import sqlite3

def check_database():
    conn = sqlite3.connect('backend/scanpilot.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name, domain, wildcard_pattern, is_wildcard, status, created_at FROM targets')
    rows = cursor.fetchall()
    
    print('🗄️  Database Content - Targets Table')
    print('=' * 80)
    print(f'{"ID":<3} | {"Name":<20} | {"Domain":<20} | {"Wildcard Pattern":<20} | {"IsWild":<6} | {"Status":<8} | {"Created":<19}')
    print('-' * 80)
    
    for row in rows:
        print(f'{row[0]:<3} | {(row[1] or "")[:20]:<20} | {(row[2] or "NULL")[:20]:<20} | {(row[3] or "NULL")[:20]:<20} | {str(row[4]):<6} | {(row[5] or "")[:8]:<8} | {(row[6] or "")[:19]:<19}')
    
    print('-' * 80)
    print(f'Total targets: {len(rows)}')
    
    conn.close()

if __name__ == "__main__":
    check_database()