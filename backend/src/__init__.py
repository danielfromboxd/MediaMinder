from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    
    # Load configuration with correct path
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'config.py')
    app.config.from_pyfile(config_path)
    
    # Setup JWT
    jwt = JWTManager(app)
    
    # Register blueprints (routes)
    from .routes.auth import auth_bp
    from .routes.media import media_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(media_bp, url_prefix='/api/media')
    
    return app