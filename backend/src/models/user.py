from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from .db import db

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'public'}
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_private = db.Column(db.Boolean, default=True)
    
    # Relationship with user_media items
    user_media = db.relationship('UserMedia', back_populates='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        print(f"Setting password for user {self.username}")
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        result = check_password_hash(self.password_hash, password)
        print(f"Password check for {self.username}: {'Success' if result else 'Failed'}")
        return result
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_private': self.is_private,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }