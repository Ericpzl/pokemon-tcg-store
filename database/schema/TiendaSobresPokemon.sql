CREATE DATABASE IF NOT EXISTS pokemon_tcg_db;
USE pokemon_tcg_db;

-- Users Table
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    balance INT DEFAULT 500,
    language ENUM('ES', 'EN') DEFAULT 'ES',
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expansions Table 
CREATE TABLE Expansions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    release_date DATE,
    pack_price INT NOT NULL,
    cover_image VARCHAR(255)
);

-- Master Cards Table
CREATE TABLE Cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expansion_id INT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    rarity VARCHAR(50),
    hp INT,
    image_url VARCHAR(255),
    FOREIGN KEY (expansion_id) REFERENCES Expansions(id) ON DELETE CASCADE
);

-- Closed packs inventory 
CREATE TABLE Pack_Inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    expansion_id INT,
    quantity INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (expansion_id) REFERENCES Expansions(id) ON DELETE CASCADE
);

-- Collection Album 
CREATE TABLE Collection_Album (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    card_id INT,
    quantity INT DEFAULT 1,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES Cards(id) ON DELETE CASCADE
);

CREATE TABLE Transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT
    expansion_id INT,
    quantity INT,
    total_price INT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (expansion_id) REFERENCES Expansions(id)
);