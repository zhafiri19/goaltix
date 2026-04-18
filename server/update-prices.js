const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePricesToRupiah() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'goaltix'
    });

    try {
        console.log('Updating ticket prices to Rupiah...');
        
        // Update all ticket prices to Rupiah (1 USD = 15,000 IDR)
        const [result] = await connection.execute(`
            UPDATE tickets 
            SET price = price * 15000
        `);
        
        console.log(`Updated ${result.affectedRows} ticket prices to Rupiah`);
        
        // Show updated prices
        const [tickets] = await connection.execute(`
            SELECT id, match_id, category, price, stock 
            FROM tickets 
            ORDER BY match_id, category
        `);
        
        console.log('\nUpdated Ticket Prices:');
        console.log('=====================================');
        tickets.forEach(ticket => {
            console.log(`Match ${ticket.match_id} - ${ticket.category}: Rp ${ticket.price.toLocaleString('id-ID')}`);
        });
        
        console.log('\nPrices updated successfully to Indonesian Rupiah!');
        
    } catch (error) {
        console.error('Error updating prices:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run if executed directly
if (require.main === module) {
    updatePricesToRupiah()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = updatePricesToRupiah;
