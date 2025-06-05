from flask import Blueprint, jsonify, request
from ..database import get_db_connection
from psycopg2.extras import RealDictCursor

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id, username, role FROM \"user\"")
        users = cur.fetchall()
        return jsonify({
            'status': 'success',
            'data': users
        })
    finally:
        cur.close()
        conn.close()

@user_bp.route('/users', methods=['POST'])
def add_user():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Password sudah dalam bentuk MD5 dari frontend
        cur.execute("""
            INSERT INTO \"user\" (username, password, role)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (data['username'], data['password'], data['role']))
        
        conn.commit()
        return jsonify({
            'status': 'success',
            'message': 'User berhasil ditambahkan'
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    finally:
        cur.close()
        conn.close()

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM \"user\" WHERE id = %s", (user_id,))
        if cur.rowcount == 0:
            return jsonify({
                'status': 'error',
                'message': 'User tidak ditemukan'
            }), 404
            
        conn.commit()
        return jsonify({
            'status': 'success',
            'message': 'User berhasil dihapus'
        })
    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    finally:
        cur.close()
        conn.close() 