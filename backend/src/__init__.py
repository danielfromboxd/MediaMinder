from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)  # Enable CORS for all routes
    
    # Load configuration with correct path
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'config.py')
    app.config.from_pyfile(config_path)
    
    # Add these lines for better error handling
    app.config['PROPAGATE_EXCEPTIONS'] = True
    app.config['JWT_ERROR_MESSAGE_KEY'] = 'error'
    
    # Setup JWT
    jwt = JWTManager(app)
    
    # Add JWT error handlers for better debugging
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print("TOKEN EXPIRED:", jwt_payload)
        return {"error": "Token has expired"}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        print("INVALID TOKEN:", error_string)
        return {"error": f"Invalid token: {error_string}"}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        print("MISSING TOKEN:", error_string)
        return {"error": f"Missing token: {error_string}"}, 401
    
    # Register blueprints (routes)
    from .routes.auth import auth_bp
    from .routes.media import media_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(media_bp, url_prefix='/api/media')
    
    @app.errorhandler(500)
    def handle_500_error(e):
        response = jsonify({"error": "Internal server error"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response, 500
    
    return app