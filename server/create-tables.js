const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'goaltix'
    });

    try {
        console.log('Creating database tables...');
        
        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created');

        // Create stadiums table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS stadiums (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL,
                country VARCHAR(255) NOT NULL,
                capacity INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Stadiums table created');

        // Create matches table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS matches (
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
            )
        `);
        console.log('Matches table created');

        // Create tickets table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                match_id INT NOT NULL,
                category ENUM('VIP', 'Premium', 'Regular', 'Economy') NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                stock INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
            )
        `);
        console.log('Tickets table created');

        // Create transactions table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                total DECIMAL(10, 2) NOT NULL,
                status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
                payment_method VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('Transactions table created');

        // Create transaction_items table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS transaction_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_id INT NOT NULL,
                ticket_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id)
            )
        `);
        console.log('Transaction items table created');

        console.log('\nAll tables created successfully!');
        
        // Insert sample data
        await insertSampleData(connection);
        
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

async function insertSampleData(connection) {
    console.log('\nInserting sample data...');
    
    // Insert admin user
    await connection.execute(`
        INSERT IGNORE INTO users (name, email, password, role) VALUES 
        ('Admin', 'admin@goaltix.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
    `);
    console.log('Admin user inserted');

    // Insert stadiums
    const stadiums = [
        ['MetLife Stadium', 'New York', 'USA', 82500],
        ['AT&T Stadium', 'Dallas', 'USA', 80000],
        ['SoFi Stadium', 'Los Angeles', 'USA', 70000],
        ['Gillette Stadium', 'Boston', 'USA', 66400],
        ['Lincoln Financial Field', 'Philadelphia', 'USA', 69300],
        ['Hard Rock Stadium', 'Miami', 'USA', 65000],
        ['NRG Stadium', 'Houston', 'USA', 72000],
        ['Lumen Field', 'Seattle', 'USA', 68000],
        ['Levi\'s Stadium', 'San Francisco', 'USA', 68500],
        ['State Farm Stadium', 'Phoenix', 'USA', 63000],
        ['BMO Field', 'Toronto', 'Canada', 30000],
        ['Olympic Stadium', 'Montreal', 'Canada', 56000],
        ['BC Place', 'Vancouver', 'Canada', 54000],
        ['Estadio Akron', 'Guadalajara', 'Mexico', 48000],
        ['Estadio BBVA', 'Monterrey', 'Mexico', 53000],
        ['Estadio Azteca', 'Mexico City', 'Mexico', 87000]
    ];

    for (const stadium of stadiums) {
        await connection.execute(`
            INSERT IGNORE INTO stadiums (name, city, country, capacity) VALUES (?, ?, ?, ?)
        `, stadium);
    }
    console.log('Stadiums inserted');

    // Insert matches
    const matches = [
        ['US', 'CA', 1, '2026-06-11 20:00:00'],
        ['MX', 'BR', 15, '2026-06-12 19:00:00'],
        ['AR', 'DE', 2, '2026-06-13 21:00:00'],
        ['FR', 'ES', 3, '2026-06-14 20:30:00'],
        ['GB', 'IT', 4, '2026-06-15 18:00:00'],
        ['JP', 'KR', 5, '2026-06-16 19:30:00'],
        ['AU', 'NL', 6, '2026-06-17 20:00:00'],
        ['PT', 'UR', 7, '2026-06-18 18:30:00'],
        ['BE', 'CH', 8, '2026-06-19 21:00:00'],
        ['CR', 'PA', 9, '2026-06-20 19:00:00']
    ];

    for (const match of matches) {
        await connection.execute(`
            INSERT IGNORE INTO matches (home_team_code, away_team_code, stadium_id, match_date) VALUES (?, ?, ?, ?)
        `, match);
    }
    console.log('Matches inserted');

    // Insert tickets for each match
    for (let matchId = 1; matchId <= 10; matchId++) {
        const tickets = [
            [matchId, 'VIP', 299.99 + (matchId * 10), 100],
            [matchId, 'Premium', 199.99 + (matchId * 5), 500],
            [matchId, 'Regular', 99.99 + matchId, 1000],
            [matchId, 'Economy', 49.99 + (matchId * 2), 2000]
        ];

        for (const ticket of tickets) {
            await connection.execute(`
                INSERT IGNORE INTO tickets (match_id, category, price, stock) VALUES (?, ?, ?, ?)
            `, ticket);
        }
    }
    console.log('Tickets inserted');

    // Create indexes (try without IF NOT EXISTS for MySQL compatibility)
    const indexes = [
        'CREATE INDEX idx_users_email ON users(email)',
        'CREATE INDEX idx_matches_stadium ON matches(stadium_id)',
        'CREATE INDEX idx_matches_date ON matches(match_date)',
        'CREATE INDEX idx_tickets_match ON tickets(match_id)',
        'CREATE INDEX idx_transactions_user ON transactions(user_id)',
        'CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id)',
        'CREATE INDEX idx_transaction_items_ticket ON transaction_items(ticket_id)'
    ];

    for (const index of indexes) {
        try {
            await connection.execute(index);
        } catch (error) {
            console.log(`Index creation failed (might already exist): ${error.message}`);
        }
    }
    console.log('Indexes created');

    // Show summary
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [stadiumCount] = await connection.execute('SELECT COUNT(*) as count FROM stadiums');
    const [matchCount] = await connection.execute('SELECT COUNT(*) as count FROM matches');
    const [ticketCount] = await connection.execute('SELECT COUNT(*) as count FROM tickets');

    console.log('\nDatabase Setup Complete!');
    console.log('========================');
    console.log(`Users: ${userCount[0].count}`);
    console.log(`Stadiums: ${stadiumCount[0].count}`);
    console.log(`Matches: ${matchCount[0].count}`);
    console.log(`Tickets: ${ticketCount[0].count}`);
    
    console.log('\nSample Admin Login:');
    console.log('Email: admin@goaltix.com');
    console.log('Password: password');
}

// Run if executed directly
if (require.main === module) {
    createTables()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = createTables;
