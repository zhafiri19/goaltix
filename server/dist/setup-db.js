"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function setupDatabase() {
    const connection = await promise_1.default.createConnection({
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
        const schemaPath = path_1.default.join(__dirname, '../../database/schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
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
                }
                catch (error) {
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
    }
    catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
    finally {
        await connection.end();
    }
}
// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
exports.default = setupDatabase;
