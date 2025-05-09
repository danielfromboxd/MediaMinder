import os
from dotenv import load_dotenv
from pathlib import Path
import re
import sys
print(f"Python default encoding: {sys.getdefaultencoding()}")


# Determine the correct path to your .env file
env_path = Path(__file__).parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

# Database configuration with safe fallbacks
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "neondb")

# Convert pooled connection to unpooled by removing "-pooler" part
if "-pooler" in DB_HOST:
    DB_HOST = DB_HOST.replace("-pooler", "")

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)

# Flask configuration
DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"

# SQLAlchemy configuration
SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?client_encoding=utf8&sslmode=require"
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Print connection string (for debugging) - hide the password
print(f"Connecting to database: postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}")