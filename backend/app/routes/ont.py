from flask import Blueprint, jsonify, request
from ..database import get_db_connection
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from psycopg2.sql import SQL, Identifier, Placeholder

ont_bp = Blueprint('ont', __name__)

@ont_bp.route('/ont', methods=['GET'])
def get_ont_list():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            WITH latest_pemantauan AS (
                SELECT DISTINCT ON (sn_ont) * 
                FROM pemantauan 
                ORDER BY sn_ont, waktu DESC
            )
            SELECT o.sn_ont, o.id_olt, o.id_pelanggan, o.nama_pelanggan,
                   p.status, p.penyebab, r.nilai_redaman, p.waktu
            FROM ont o
            LEFT JOIN latest_pemantauan p ON o.sn_ont = p.sn_ont
            LEFT JOIN redaman r ON p.id = r.pemantauan_id
            ORDER BY p.waktu DESC
        """)
        result = cur.fetchall()
        return jsonify({
            'status': 'success',
            'data': [{
                'serial_number': row['sn_ont'],
                'id_olt': row['id_olt'],
                'customer_id': row['id_pelanggan'],
                'customer_name': row['nama_pelanggan'],
                'status': row['status'],
                'offline_cause': row['penyebab'] or '-',
                'attenuation': row['nilai_redaman'],
                'timestamp': row['waktu'].isoformat() if row['waktu'] else None
            } for row in result]
        })
    finally:
        cur.close()
        conn.close()

# NEW ENDPOINT: Get Filter Data
@ont_bp.route('/ont/filter-data', methods=['GET'])
def get_filter_data():
    """
    Endpoint untuk mendapatkan data untuk dropdown filter
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Get unique OLT IDs
        cur.execute("SELECT DISTINCT id_olt FROM ont WHERE id_olt IS NOT NULL ORDER BY id_olt")
        olt_list = [row['id_olt'] for row in cur.fetchall()]
        
        # Get unique offline causes
        cur.execute("""
            SELECT DISTINCT penyebab 
            FROM pemantauan 
            WHERE penyebab IS NOT NULL AND penyebab != '' 
            ORDER BY penyebab
        """)
        offline_causes = [row['penyebab'] for row in cur.fetchall()]
        
        # Get latest data date
        cur.execute("SELECT MAX(waktu) FROM pemantauan")
        latest_date_result = cur.fetchone()
        latest_date = latest_date_result['max'] if latest_date_result and latest_date_result['max'] else datetime.now()
        
        return jsonify({
            'status': 'success',
            'data': {
                'olt_list': olt_list,
                'offline_causes': offline_causes,
                'latest_date': latest_date.isoformat() if latest_date else None
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        cur.close()
        conn.close()

@ont_bp.route('/ont', methods=['POST'])
def add_ont():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        print("Data yang diterima:", data)  # Debug print
        
        # Insert ke tabel ont
        cur.execute("""
            INSERT INTO ont (sn_ont, id_olt, id_pelanggan, nama_pelanggan)
            VALUES (%s, %s, %s, %s) RETURNING sn_ont
        """, (data['serial_number'], data['id_olt'], data['customer_id'], data['customer_name']))
        
        sn_ont = cur.fetchone()[0]
        print("ONT berhasil ditambahkan:", sn_ont)  # Debug print
        conn.commit()
        return jsonify({
            'status': 'success',
            'message': 'ONT berhasil ditambahkan'
        }), 201
    except Exception as e:
        conn.rollback()
        print("Error:", str(e))  # Debug print
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    finally:
        cur.close()
        conn.close()

@ont_bp.route('/ont/<sn_ont>', methods=['DELETE'])
def delete_ont(sn_ont):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Hapus data redaman terlebih dahulu (karena foreign key)
        cur.execute("""
            DELETE FROM redaman 
            USING pemantauan
            WHERE redaman.pemantauan_id = pemantauan.id 
            AND pemantauan.sn_ont = %s
        """, (sn_ont,))
        
        # Hapus data pemantauan
        cur.execute("DELETE FROM pemantauan WHERE sn_ont = %s", (sn_ont,))
        
        # Hapus data ONT
        cur.execute("DELETE FROM ont WHERE sn_ont = %s", (sn_ont,))
        
        # Pastikan ada data yang terhapus
        if cur.rowcount == 0:
            return jsonify({
                'status': 'error',
                'message': f'ONT dengan serial number {sn_ont} tidak ditemukan'
            }), 404
        
        conn.commit()
        return jsonify({
            'status': 'success',
            'message': f'ONT dengan serial number {sn_ont} telah dihapus'
        })
    except Exception as e:
        conn.rollback()
        print("Error saat menghapus:", str(e))  # Debug print
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    finally:
        cur.close()
        conn.close()

@ont_bp.route('/ont/history', methods=['GET'])
def get_all_ont_history():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT o.id_olt, o.id_pelanggan, o.nama_pelanggan,
                   p.sn_ont, p.waktu, p.status, p.penyebab, r.nilai_redaman
            FROM pemantauan p
            LEFT JOIN ont o ON p.sn_ont = o.sn_ont
            LEFT JOIN redaman r ON p.id = r.pemantauan_id
            ORDER BY p.waktu DESC
        """)
        rows = cur.fetchall()
        return jsonify({
            'status': 'success',
            'data': [{
                'serial_number': row['sn_ont'],
                'id_olt': row['id_olt'],
                'customer_id': row['id_pelanggan'],
                'customer_name': row['nama_pelanggan'],
                'status': row['status'],
                'attenuation': row['nilai_redaman'],
                'offline_cause': row['penyebab'] or '-',
                'timestamp': row['waktu']
            } for row in rows]
        })
    finally:
        cur.close()
        conn.close()

def get_latest_data_date():
    """
    Mendapatkan tanggal data terbaru dari database
    """
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT MAX(waktu) FROM pemantauan")
        result = cur.fetchone()
        return result[0] if result and result[0] else datetime.now()
    except Exception:
        return datetime.now()
    finally:
        cur.close()
        conn.close()

def build_ont_history_query(params: Dict[str, Any]) -> tuple[str, list[Any]]:
    """
    Membangun query SQL dinamis berdasarkan parameter filter
    """
    conditions = []
    values = []

    # Base query
    base_query = """
        SELECT o.id_olt, o.id_pelanggan, o.nama_pelanggan,
               p.sn_ont, p.waktu, p.status, p.penyebab, r.nilai_redaman
        FROM pemantauan p
        LEFT JOIN ont o ON p.sn_ont = o.sn_ont
        LEFT JOIN redaman r ON p.id = r.pemantauan_id
    """

    # Filter OLT
    if params.get('olt'):
        conditions.append("o.id_olt = %s")
        values.append(params['olt'])

    # Filter status
    if params.get('status'):
        status = params['status'].lower()
        conditions.append("LOWER(p.status) = %s")
        values.append(status)

    # Filter penyebab offline (hanya jika status offline)
    if params.get('offline_cause') and params.get('status', '').lower() == 'offline':
        conditions.append("p.penyebab = %s")
        values.append(params['offline_cause'])

    # Filter redaman (hanya jika status online)
    if params.get('attenuation') is not None and params.get('status', '').lower() == 'online':
        attenuation_value = float(params['attenuation'])
        if attenuation_value == -25:
            # Untuk "< -25"
            conditions.append("r.nilai_redaman < %s")
        else:
            # Untuk "> -25"
            conditions.append("r.nilai_redaman > %s")
        values.append(attenuation_value)

    # Filter waktu
    if params.get('start') and params.get('end'):
        try:
            start_date = datetime.strptime(params['start'], '%Y-%m-%d')
            end_date = datetime.strptime(params['end'], '%Y-%m-%d') + timedelta(days=1)
            conditions.append("p.waktu >= %s AND p.waktu < %s")
            values.extend([start_date, end_date])
        except ValueError:
            pass
    else:
        # Default: 2 hari terakhir berdasarkan data terbaru jika tidak ada filter lain
        if not any([params.get('olt'), params.get('status'), params.get('offline_cause'), params.get('attenuation')]):
            latest_date = get_latest_data_date()
            # Set ke awal hari untuk tanggal terbaru
            end_date = latest_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            start_date = (latest_date - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            conditions.append("p.waktu >= %s AND p.waktu <= %s")
            values.extend([start_date, end_date])

    # Gabungkan semua kondisi
    if conditions:
        base_query += " WHERE " + " AND ".join(conditions)

    # Urutkan berdasarkan waktu terbaru
    base_query += " ORDER BY p.waktu DESC"

    return base_query, values

@ont_bp.route('/ont/histori', methods=['GET'])
def get_ont_history():
    """
    Endpoint untuk mendapatkan histori ONT dengan filter dinamis
    Query parameters:
    - olt: ID OLT
    - status: status ONT (online/offline)
    - offline_cause: penyebab offline
    - attenuation: nilai redaman
    - start: tanggal mulai (YYYY-MM-DD)
    - end: tanggal selesai (YYYY-MM-DD)
    """
    try:
        # Ambil semua parameter query
        params = {
            'olt': request.args.get('olt'),
            'status': request.args.get('status'),
            'offline_cause': request.args.get('offline_cause'),
            'attenuation': request.args.get('attenuation', type=float),
            'start': request.args.get('start'),
            'end': request.args.get('end')
        }

        # Debug print
        print("Filter params:", params)

        # Validasi parameter
        if params['status'] and params['status'].lower() not in ['online', 'offline']:
            return jsonify({
                'status': 'error',
                'message': 'Status harus berupa "online" atau "offline"'
            }), 400

        # Bangun query
        query, values = build_ont_history_query(params)
        
        # Debug print
        print("Generated query:", query)
        print("Query values:", values)

        # Eksekusi query
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(query, values)
            rows = cur.fetchall()

            return jsonify({
                'status': 'success',
                'data': [{
                    'serial_number': row['sn_ont'],
                    'id_olt': row['id_olt'],
                    'customer_id': row['id_pelanggan'],
                    'customer_name': row['nama_pelanggan'],
                    'status': row['status'],
                    'attenuation': row['nilai_redaman'],
                    'offline_cause': row['penyebab'] or '-',
                    'timestamp': row['waktu'].isoformat() if row['waktu'] else None
                } for row in rows]
            })
        finally:
            cur.close()
            conn.close()

    except Exception as e:
        print("Error in get_ont_history:", str(e))  # Debug print
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500