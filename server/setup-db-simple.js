const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || ''
    });

    try {
        console.log('Connecting to MySQL...');
        
        // Create database if not exists
        const dbName = process.env.DB_NAME || 'goaltix';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database '${dbName}' created or already exists`);
        
        // Switch to database
        await connection.query(`USE \`${dbName}\``);
        console.log(`Switched to database '${dbName}'`);
        
        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Executing schema...');
        
        // Execute entire schema at once
        await connection.query(schema);
        
        console.log('Database setup completed successfully!');
        console.log('\nDatabase Details:');
        console.log(`- Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`- Database: ${dbName}`);
        console.log(`- User: ${process.env.DB_USER || 'root'}`);
        console.log('\nSample Admin Login:');
        console.log('- Email: admin@goaltix.com');
        console.log('- Password: password');
        
    } catch (error) {
        console.error('Database setup failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = setupDatabase;
