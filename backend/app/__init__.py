from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from .routes import user, ont, auth

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Inisialisasi CORS
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(user.user_bp, url_prefix='/api')
    app.register_blueprint(ont.ont_bp, url_prefix='/api')
    app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
    
    return app 