from flask import Flask, jsonify
from flask_cors import CORS
from src import create_app
from src.models.db import db
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = create_app()

# Configure CORS properly to allow requests from your frontend
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

app.config['SQLALCHEMY_ECHO'] = True  # Print all SQL queries

# Initialize SQLAlchemy with the Flask app
db.init_app(app)

# Create tables if they don't exist
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")

# Add error handler to ensure CORS headers are added to error responses
@app.errorhandler(500)
def handle_500_error(e):
    response = jsonify({"error": "Internal server error"})
    return response, 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)