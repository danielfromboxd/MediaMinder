from .db import db

class Media(db.Model):
    __tablename__ = 'media'
    
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    genre = db.Column(db.String(50))
    release_date = db.Column(db.Date, nullable=True)
    image_url = db.Column(db.String(255))
    
    # Movie-specific fields
    director = db.Column(db.String(100), nullable=True)
    runtime = db.Column(db.Integer, nullable=True)
    
    # Series-specific fields
    creator = db.Column(db.String(100), nullable=True)
    number_of_seasons = db.Column(db.Integer, nullable=True)
    episodes_per_season = db.Column(db.Integer, nullable=True)
    
    # Book-specific fields
    author = db.Column(db.String(100), nullable=True)
    page_count = db.Column(db.Integer, nullable=True)
    publisher = db.Column(db.String(100), nullable=True)
    
    # Relationships
    user_media = db.relationship('UserMedia', backref='media', lazy=True, cascade='all, delete-orphan')
    genres = db.relationship('Genre', secondary='media_genres', back_populates='media')
    
    def to_dict(self):
        result = {
            'id': self.id,
            'external_id': self.external_id,
            'type': self.type,
            'title': self.title,
            'image_url': self.image_url,
            'release_date': self.release_date.isoformat() if self.release_date else None,
        }
        
        # Add type-specific fields
        if self.type == 'movie':
            result.update({
                'director': self.director,
                'runtime': self.runtime
            })
        elif self.type == 'series':
            result.update({
                'creator': self.creator,
                'number_of_seasons': self.number_of_seasons,
                'episodes_per_season': self.episodes_per_season
            })
        elif self.type == 'book':
            result.update({
                'author': self.author,
                'page_count': self.page_count,
                'publisher': self.publisher
            })
            
        return result