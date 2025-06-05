from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'Koneksi ke backend berhasil!',
        'status': 'success'
    })

@main_bp.route('/data', methods=['GET'])
def get_data():
    return jsonify({
        'items': [
            {'id': 1, 'name': 'Item 1'},
            {'id': 2, 'name': 'Item 2'},
            {'id': 3, 'name': 'Item 3'}
        ]
    })

@main_bp.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'Flask API berjalan',
        'status': 'success'
    }) 