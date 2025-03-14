-- Foreign key indexes (automatically created in some databases)
CREATE INDEX idx_user_media_user ON User_Media(user_id);
CREATE INDEX idx_user_media_media ON User_Media(media_id);
CREATE INDEX idx_media_genres_media ON Media_Genres(media_id);
CREATE INDEX idx_media_genres_genre ON Media_Genres(genre_id);

-- Frequently queried fields
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_media_external_id ON Media(external_id);

-- Composite indexes
CREATE INDEX idx_user_media_composite ON User_Media(user_id, media_id);
CREATE INDEX idx_media_genres_composite ON Media_Genres(media_id, genre_id);