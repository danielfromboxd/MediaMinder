import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration with FALLBACK VALUES
DB_USER = os.getenv("DB_USER", "postgres")  # Add "postgres" as fallback
DB_PASSWORD = os.getenv("DB_PASSWORD", ***REMOVED***)  # Add password as fallback
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "mediaminder")  # Add DB name as fallback

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key-change-in-production")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)

# Flask configuration
DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"

# SQLAlchemy configuration
SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Print connection string (for debugging)
print(f"Connecting to database: postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}")