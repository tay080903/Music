from flask import Flask, jsonify, request, render_template
import re
from database import init_db, get_db

app = Flask(__name__)

# Initialize database on startup
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/posts', methods=['GET'])
def get_posts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT p.*, u.username as author_name 
        FROM Posts p
        LEFT JOIN Users u ON p.user_id = u.user_id
        ORDER BY p.created_at DESC
    ''')
    posts = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(posts)

@app.route('/api/posts', methods=['POST'])
def create_post():
    data = request.json
    
    # Simple validation
    if not all([data.get('title'), data.get('song_name'), data.get('artist_name')]):
        return jsonify({"error": "Missing required fields"}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            '''INSERT INTO Posts (user_id, title, song_name, artist_name, genre, content, youtube_url)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (1, data.get('title'), data.get('song_name'), data.get('artist_name'), 
             data.get('genre', ''), data.get('content', ''), data.get('youtube_url', ''))
        )
        conn.commit()
        last_id = cursor.lastrowid
        
        cursor.execute('''
            SELECT p.*, u.username as author_name 
            FROM Posts p
            LEFT JOIN Users u ON p.user_id = u.user_id
            WHERE p.post_id = ?
        ''', (last_id,))
        new_post = dict(cursor.fetchone())
        return jsonify(new_post), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/posts/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        # Increase like count for dummy implementation
        cursor.execute('UPDATE Posts SET likes_count = likes_count + 1 WHERE post_id = ?', (post_id,))
        conn.commit()
        
        cursor.execute('SELECT likes_count FROM Posts WHERE post_id = ?', (post_id,))
        likes = cursor.fetchone()['likes_count']
        return jsonify({"likes_count": likes}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=3001)
