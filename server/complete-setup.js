const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function completeSetup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'goaltix'
    });

    try {
        console.log('Starting complete database setup...');
        
        // Read schema file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon and clean up
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
            .filter(stmt => !stmt.startsWith('/*') && !stmt.endsWith('*/'));
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        // Disable foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // Execute each statement
        let successCount = 0;
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    successCount++;
                    console.log(`Statement ${i + 1}/${statements.length} executed successfully`);
                } catch (error) {
                    console.log(`Statement ${i + 1} failed:`, error.message);
                }
            }
        }
        
        // Re-enable foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log(`\nSetup completed! ${successCount}/${statements.length} statements executed`);
        
        // Verify data
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const [stadiumCount] = await connection.execute('SELECT COUNT(*) as count FROM stadiums');
        const [matchCount] = await connection.execute('SELECT COUNT(*) as count FROM matches');
        const [ticketCount] = await connection.execute('SELECT COUNT(*) as count FROM tickets');
        
        console.log('\nDatabase Summary:');
        console.log(`- Users: ${userCount[0].count}`);
        console.log(`- Stadiums: ${stadiumCount[0].count}`);
        console.log(`- Matches: ${matchCount[0].count}`);
        console.log(`- Tickets: ${ticketCount[0].count}`);
        
        console.log('\nSample Admin Login:');
        console.log('- Email: admin@goaltix.com');
        console.log('- Password: password');
        
    } catch (error) {
        console.error('Setup failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run if executed directly
if (require.main === module) {
    completeSetup()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = completeSetup;
