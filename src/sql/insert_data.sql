-- Insert sample data into Users table
INSERT INTO Users (username, email, password_hash) VALUES
('john_doe', 'john@example.com', 'hashed_password_1'),
('jane_doe', 'jane@example.com', 'hashed_password_2');

-- Insert sample data into Media table
INSERT INTO Media (external_id, type, title, genre, release_date, image_url, director, runtime, creator, number_of_seasons, episodes_per_season, author, page_count, publisher) VALUES
('ext_001', 'movie', 'Inception', 'Sci-Fi', '2010-07-16', 'http://example.com/inception.jpg', 'Christopher Nolan', 148, NULL, NULL, NULL, NULL, NULL, NULL),
('ext_002', 'book', '1984', 'Dystopian', '1949-06-08', 'http://example.com/1984.jpg', NULL, NULL, NULL, NULL, NULL, 'George Orwell', 328, 'Secker & Warburg');

-- Insert sample data into Genres table
INSERT INTO Genres (name, media_type) VALUES
('Sci-Fi', 'movie'),
('Dystopian', 'book');

-- Insert sample data into Media_Genres table
INSERT INTO Media_Genres (media_id, genre_id) VALUES
(1, 1),
(2, 2);