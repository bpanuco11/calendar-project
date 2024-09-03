CREATE DATABASE user_auth;
USE user_auth;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique identifier for each user
    username VARCHAR(50) NOT NULL UNIQUE,  -- User's username, must be unique
    password VARCHAR(255) NOT NULL,  -- Encrypted password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of when the user was created
);