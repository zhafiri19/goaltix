-- GOALTIX World Cup 2026 Ticket Booking Database Schema

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stadiums Table
CREATE TABLE stadiums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches Table
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_team_code VARCHAR(3) NOT NULL,
    away_team_code VARCHAR(3) NOT NULL,
    stadium_id INT NOT NULL,
    match_date DATETIME NOT NULL,
    status ENUM('upcoming', 'live', 'finished') DEFAULT 'upcoming',
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stadium_id) REFERENCES stadiums(id)
);

-- Tickets Table
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    category ENUM('VIP', 'Premium', 'Regular', 'Economy') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transaction Items Table
CREATE TABLE transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    ticket_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

-- Insert Sample Stadiums (World Cup 2026 Venues)
INSERT INTO stadiums (name, city, country, capacity) VALUES
('MetLife Stadium', 'New York', 'USA', 82500),
('AT&T Stadium', 'Dallas', 'USA', 80000),
('SoFi Stadium', 'Los Angeles', 'USA', 70000),
('Gillette Stadium', 'Boston', 'USA', 66400),
('Lincoln Financial Field', 'Philadelphia', 'USA', 69300),
('Hard Rock Stadium', 'Miami', 'USA', 65000),
('NRG Stadium', 'Houston', 'USA', 72000),
('Lumen Field', 'Seattle', 'USA', 68000),
('Levi\'s Stadium', 'San Francisco', 'USA', 68500),
('State Farm Stadium', 'Phoenix', 'USA', 63000),
('BMO Field', 'Toronto', 'Canada', 30000),
('Olympic Stadium', 'Montreal', 'Canada', 56000),
('BC Place', 'Vancouver', 'Canada', 54000),
('Estadio Akron', 'Guadalajara', 'Mexico', 48000),
('Estadio BBVA', 'Monterrey', 'Mexico', 53000),
('Estadio Azteca', 'Mexico City', 'Mexico', 87000);

-- Insert Sample Admin User
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@goaltix.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert Sample Matches
INSERT INTO matches (home_team_code, away_team_code, stadium_id, match_date) VALUES
('US', 'CA', '1', '2026-06-11 20:00:00'),
('MX', 'BR', '15', '2026-06-12 19:00:00'),
('AR', 'DE', '2', '2026-06-13 21:00:00'),
('FR', 'ES', '3', '2026-06-14 20:30:00'),
('GB', 'IT', '4', '2026-06-15 18:00:00'),
('JP', 'KR', '5', '2026-06-16 19:30:00'),
('AU', 'NL', '6', '2026-06-17 20:00:00'),
('PT', 'UR', '7', '2026-06-18 18:30:00'),
('BE', 'CH', '8', '2026-06-19 21:00:00'),
('CR', 'PA', '9', '2026-06-20 19:00:00');

-- Insert Sample Tickets for Each Match
INSERT INTO tickets (match_id, category, price, stock) VALUES
(1, 'VIP', 299.99, 100),
(1, 'Premium', 199.99, 500),
(1, 'Regular', 99.99, 1000),
(1, 'Economy', 49.99, 2000),
(2, 'VIP', 349.99, 80),
(2, 'Premium', 229.99, 400),
(2, 'Regular', 119.99, 800),
(2, 'Economy', 59.99, 1500),
(3, 'VIP', 399.99, 120),
(3, 'Premium', 259.99, 600),
(3, 'Regular', 139.99, 1200),
(3, 'Economy', 69.99, 2500),
(4, 'VIP', 379.99, 100),
(4, 'Premium', 249.99, 500),
(4, 'Regular', 129.99, 1000),
(4, 'Economy', 64.99, 2000),
(5, 'VIP', 359.99, 90),
(5, 'Premium', 239.99, 450),
(5, 'Regular', 124.99, 900),
(5, 'Economy', 62.99, 1800),
(6, 'VIP', 329.99, 85),
(6, 'Premium', 219.99, 425),
(6, 'Regular', 114.99, 850),
(6, 'Economy', 57.99, 1700),
(7, 'VIP', 309.99, 95),
(7, 'Premium', 209.99, 475),
(7, 'Regular', 109.99, 950),
(7, 'Economy', 54.99, 1900),
(8, 'VIP', 339.99, 88),
(8, 'Premium', 224.99, 440),
(8, 'Regular', 117.99, 880),
(8, 'Economy', 58.99, 1760),
(9, 'VIP', 319.99, 92),
(9, 'Premium', 214.99, 460),
(9, 'Regular', 112.99, 920),
(9, 'Economy', 56.99, 1840),
(10, 'VIP', 289.99, 98),
(10, 'Premium', 194.99, 490),
(10, 'Regular', 104.99, 980),
(10, 'Economy', 52.99, 1960);

-- Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_matches_stadium ON matches(stadium_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_tickets_match ON tickets(match_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_ticket ON transaction_items(ticket_id);
