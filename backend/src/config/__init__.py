import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD") 
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY")  
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)

# Flask configuration
DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"

# SQLAlchemy configuration
SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Add error handling for missing critical values
if not all([DB_USER, DB_PASSWORD, DB_NAME, SECRET_KEY]):
    missing = []
    if not DB_USER: missing.append("DB_USER")
    if not DB_PASSWORD: missing.append("DB_PASSWORD")
    if not DB_NAME: missing.append("DB_NAME")
    if not SECRET_KEY: missing.append("SECRET_KEY")
    raise ValueError(f"Missing required environment variables: {', '.join(missing)}")