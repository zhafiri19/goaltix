import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

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
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log('Executing schema statements...');
        
        // Disable foreign key checks temporarily
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                } catch (error: any) {
                    // Ignore errors for existing tables or indexes
                    if (!error.message.includes('already exists') && !error.message.includes('Duplicate')) {
                        throw error;
                    }
                }
            }
        }
        
        // Re-enable foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Database setup completed successfully!');
        console.log('\nDatabase Details:');
        console.log(`- Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`- Database: ${dbName}`);
        console.log(`- User: ${process.env.DB_USER || 'root'}`);
        console.log('\nSample Admin Login:');
        console.log('- Email: admin@goaltix.com');
        console.log('- Password: password');
        
    } catch (error) {
        console.error('Database setup failed:', error);
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

export default setupDatabase;
