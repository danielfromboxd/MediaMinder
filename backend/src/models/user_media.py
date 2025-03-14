from datetime import datetime
from .db import db

class UserMedia(db.Model):
    __tablename__ = 'user_media'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    media_id = db.Column(db.Integer, db.ForeignKey('media.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    rating = db.Column(db.Integer)
    review = db.Column(db.Text)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define a unique constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'media_id'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'media_id': self.media_id,
            'media': {
                'id': self.media.id,
                'external_id': self.media.external_id,
                'type': self.media.type,
                'title': self.media.title,
                'image_url': self.media.image_url
            },
            'status': self.status,
            'rating': self.rating,
            'review': self.review,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }