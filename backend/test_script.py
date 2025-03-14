from flask import Flask
from src.models.db import db
from src.models.user import User
from src.models.media import Media
from src.models.user_media import UserMedia

app = Flask(__name__)
app.config.from_pyfile('src/config/config.py')
db.init_app(app)

with app.app_context():
    print("\n===== DATABASE CONNECTION TEST =====")
    
    # Test user table
    try:
        users = User.query.all()
        print(f"✅ USERS TABLE: {len(users)} users found")
        for user in users:
            print(f"  - User {user.id}: {user.username}, {user.email}")
    except Exception as e:
        print(f"❌ USERS TABLE ERROR: {str(e)}")
    
    # Test media table
    try:
        media_items = Media.query.all()
        print(f"✅ MEDIA TABLE: {len(media_items)} items found")
        for media in media_items:
            print(f"  - Media {media.id}: {media.title} ({media.type})")
    except Exception as e:
        print(f"❌ MEDIA TABLE ERROR: {str(e)}")
    
    # Test user_media table
    try:
        user_media_items = UserMedia.query.all()
        print(f"✅ USER_MEDIA TABLE: {len(user_media_items)} items found")
        for user_media in user_media_items:
            print(f"  - UserMedia {user_media.id}: User {user_media.user_id}, Media {user_media.media_id}")
    except Exception as e:
        print(f"❌ USER_MEDIA TABLE ERROR: {str(e)}")