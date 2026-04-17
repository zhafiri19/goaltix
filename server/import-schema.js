const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'goaltix'
    });

    try {
        console.log('Connecting to MySQL database...');
        
        // Read schema file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Importing schema...');
        
        // Split by semicolon and filter out empty statements and comments
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'))
            .filter(stmt => stmt.toLowerCase().startsWith('create') || 
                          stmt.toLowerCase().startsWith('insert') || 
                          stmt.toLowerCase().startsWith('alter') ||
                          stmt.toLowerCase().startsWith('drop'));
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        // Disable foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log(`Statement ${i + 1}/${statements.length} executed successfully`);
                } catch (error) {
                    console.log(`Statement ${i + 1} failed (might already exist):`, error.message);
                }
            }
        }
        
        // Re-enable foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('\nSchema import completed successfully!');
        
        // Verify tables were created
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\nTables created:');
        tables.forEach(table => {
            console.log(`- ${Object.values(table)[0]}`);
        });
        
    } catch (error) {
        console.error('Schema import failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run if executed directly
if (require.main === module) {
    importSchema()
        .then(() => {
            console.log('\nDatabase setup completed!');
            console.log('\nSample Admin Login:');
            console.log('- Email: admin@goaltix.com');
            console.log('- Password: password');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}

module.exports = importSchema;
