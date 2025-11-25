import sqlite3

def upgrade_db():
    conn = sqlite3.connect('hotspots.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE hotspots ADD COLUMN content TEXT")
        print("Added content column")
    except sqlite3.OperationalError:
        print("content column already exists")
        
    try:
        cursor.execute("ALTER TABLE hotspots ADD COLUMN media_paths TEXT")
        print("Added media_paths column")
    except sqlite3.OperationalError:
        print("media_paths column already exists")
        
    try:
        cursor.execute("ALTER TABLE hotspots ADD COLUMN summary TEXT")
        print("Added summary column")
    except sqlite3.OperationalError:
        print("summary column already exists")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    upgrade_db()
