from flask import Flask, jsonify
from flask_cors import CORS
from src import create_app
from src.models.db import db
import logging
from sqlalchemy import text
import os

# Set logging level based on environment
is_production = os.environ.get('FLASK_ENV') == 'production'
logging.basicConfig(level=logging.INFO if is_production else logging.DEBUG)
logger = logging.getLogger(__name__)

app = create_app()

# Configure CORS for your frontend
frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:8080')
CORS(app, 
     resources={r"/api/*": {"origins": [
         "https://media-minder-frontend.vercel.app",
         frontend_url, 
         "http://localhost:8080"
     ]}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])

# Only enable SQL echo in development
app.config['SQLALCHEMY_ECHO'] = not is_production

# Initialize SQLAlchemy with the Flask app
db.init_app(app)

# Check database connection
with app.app_context():
    try:
        # Clear any cached connections
        db.engine.dispose()
        
        # Explicitly set search path
        db.session.execute(text("SET search_path TO public"))
        db.session.commit()
        
        # Test connection with actual table
        result = db.session.execute(text("SELECT COUNT(*) FROM public.users")).scalar()
        logger.info(f"Database connection successful. Found {result} users.")
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        # Try to get more detailed info
        try:
            schemas = db.session.execute(text("SELECT schema_name FROM information_schema.schemata")).fetchall()
            logger.info(f"Available schemas: {[s[0] for s in schemas]}")
            
            tables = db.session.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")).fetchall()
            logger.info(f"Tables in public schema: {[t[0] for t in tables]}")
        except Exception as inner_e:
            logger.error(f"Could not fetch schema info: {inner_e}")

# Register routes
from src.routes.user_controller import user_bp
from src.routes.auth import auth_bp
from src.routes.media import media_bp

app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(media_bp, url_prefix='/api/media')

# Add error handler to ensure CORS headers are added to error responses
@app.errorhandler(500)
def handle_500_error(e):
    response = jsonify({"error": "Internal server error"})
    return response, 500

if __name__ == '__main__':
    # Run with debug mode only in development
    debug_mode = not is_production
    app.run(debug=debug_mode, port=5000)