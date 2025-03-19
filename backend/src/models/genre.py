from .db import db

# Fix association table - add schema and full references
media_genres = db.Table('media_genres',
    db.Column('media_id', db.Integer, db.ForeignKey('public.media.id'), primary_key=True),
    db.Column('genre_id', db.Integer, db.ForeignKey('public.genres.id'), primary_key=True),
    schema='public'  # Add schema specification here
)

class Genre(db.Model):
    __tablename__ = 'genres'
    __table_args__ = {'schema': 'public'}  # Add schema specification here
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    media_type = db.Column(db.String(20))
    
    # Fix secondary reference to include schema
    media = db.relationship('Media', secondary=media_genres, back_populates='genres')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'media_type': self.media_type
        }