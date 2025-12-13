require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

console.log('Bağlantı bilgileri:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASS);

client.connect()
    .then(() => {
        console.log('\n✓ Bağlantı başarılı!');
        return client.end();
    })
    .catch(err => {
        console.error('\n✗ Bağlantı hatası:', err.message);
        process.exit(1);
    });
