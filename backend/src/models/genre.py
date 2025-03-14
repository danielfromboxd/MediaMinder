from .db import db

# Association table
media_genres = db.Table('media_genres',
    db.Column('media_id', db.Integer, db.ForeignKey('media.id'), primary_key=True),
    db.Column('genre_id', db.Integer, db.ForeignKey('genres.id'), primary_key=True)
)

class Genre(db.Model):
    __tablename__ = 'genres'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    media_type = db.Column(db.String(20))
    
    # Relationship
    media = db.relationship('Media', secondary=media_genres, back_populates='genres')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'media_type': self.media_type
        }