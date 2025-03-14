-- Foreign key indexes (automatically created in some databases)
CREATE INDEX idx_user_media_user ON user_media(user_id);
CREATE INDEX idx_user_media_media ON user_media(media_id);
CREATE INDEX idx_media_genres_media ON media_genres(media_id);
CREATE INDEX idx_media_genres_genre ON media_genres(genre_id);

-- Frequently queried fields
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_media_external_id ON media(external_id);

-- Composite indexes
CREATE INDEX idx_user_media_composite ON user_media(user_id, media_id);
CREATE INDEX idx_media_genres_composite ON media_genres(media_id, genre_id);