import sqlite3
import os

# Vercel's read-only file system allows writing only to /tmp
DATABASE = '/tmp/music.sqlite' if os.getenv('VERCEL') else 'music.sqlite'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    schema = """
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS Users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        profile_img TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Posts Table
    CREATE TABLE IF NOT EXISTS Posts (
        post_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title VARCHAR(200) NOT NULL,
        song_name VARCHAR(200) NOT NULL,
        artist_name VARCHAR(100) NOT NULL,
        genre VARCHAR(50),
        content TEXT,
        youtube_url TEXT,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );

    -- 3. Comments Table
    CREATE TABLE IF NOT EXISTS Comments (
        comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );

    -- 4. Post_Likes Table
    CREATE TABLE IF NOT EXISTS Post_Likes (
        like_id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        UNIQUE(post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );
    """
    
    conn = get_db()
    try:
        conn.executescript(schema)
        # Create a dummy user if none exists
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM Users")
        if cursor.fetchone()['count'] == 0:
            cursor.execute("INSERT INTO Users (username, email) VALUES ('GuestUser', 'guest@music.connect')")
        conn.commit()
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
