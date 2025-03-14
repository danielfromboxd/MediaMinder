-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Media table
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK(type IN ('movie', 'series', 'book')),
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(50),
    release_date DATE,
    image_url VARCHAR(255),
    director VARCHAR(100),
    runtime INTEGER,
    creator VARCHAR(100),
    number_of_seasons INTEGER,
    episodes_per_season INTEGER,
    author VARCHAR(100),
    page_count INTEGER,
    publisher VARCHAR(100)
);

-- Create UserMedia table
CREATE TABLE user_media (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    media_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK(status IN ('want_to_view', 'in_progress', 'finished')),
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    review TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (media_id) REFERENCES media(id),
    UNIQUE(user_id, media_id)
);

-- Create Genres table
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    media_type VARCHAR(20) CHECK(media_type IN ('movie', 'tvshow', 'book'))
);

-- Create Media_Genres table
CREATE TABLE media_genres (
    media_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (media_id, genre_id),
    FOREIGN KEY (media_id) REFERENCES media(id),
    FOREIGN KEY (genre_id) REFERENCES genres(id)
);