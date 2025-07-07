from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from werkzeug.security import check_password_hash
from app.database import get_db_connection
import jwt
from datetime import datetime, timedelta
from functools import wraps
import os
from psycopg2.extras import RealDictCursor

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token tidak valid'}), 401

        if not token:
            return jsonify({'message': 'Token tidak ditemukan'}), 401

        try:
            data = jwt.decode(token, os.getenv('JWT_SECRET_KEY', 'your-secret-key'), algorithms=["HS256"])
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT * FROM \"user\" WHERE id = %s', (data['user_id'],))
            current_user = cur.fetchone()
            cur.close()
            conn.close()
            
            if not current_user:
                return jsonify({'message': 'User tidak ditemukan'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token telah kadaluarsa'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token tidak valid'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

@auth_bp.route('/login', methods=['POST'])
@cross_origin()
def login():
    print("Received login request")
    data = request.get_json()
    print("Login data:", data)
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username dan password diperlukan'}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM \"user\" WHERE username = %s', (data['username'],))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    print("User lookup result:", user)
    
    if not user:
        print("User not found")
        return jsonify({'message': 'Username atau password salah'}), 401

    # Verifikasi password menggunakan MD5
    if user['password'] != data['password']:  # Password sudah dalam bentuk MD5
        print("Password mismatch")
        print("Expected:", user['password'])
        print("Received:", data['password'])
        return jsonify({'message': 'Username atau password salah'}), 401

    print("Login successful")
    # Buat token JWT
    token = jwt.encode({
        'user_id': user['id'],
        'username': user['username'],
        'exp': datetime.utcnow() + timedelta(days=1)  # Token berlaku 1 hari
    }, os.getenv('JWT_SECRET_KEY', 'your-secret-key'))

    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username']
        }
    })

@auth_bp.route('/verify', methods=['GET'])
@cross_origin()
@token_required
def verify_token(current_user):
    return jsonify({
        'message': 'Token valid',
        'user': {
            'id': current_user['id'],
            'username': current_user['username']
        }
    }) 