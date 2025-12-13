const { Sequelize } = require('sequelize');
require('dotenv').config(); // .env dosyasını okumak için

// MSSQL Bağlantı Ayarları
const sequelize = new Sequelize(
    process.env.DB_NAME,     // Veritabanı Adı (insaatyonetim)
    process.env.DB_USER,     // Kullanıcı Adı (Genelde 'sa' veya Windows Auth kullanıyorsanız boş geçilebilir ama Node.js için SQL Auth önerilir)
    process.env.DB_PASS,     // Şifre
    {
        host: process.env.DB_SERVER, // Server adı (localhost)
        dialect: 'mssql',
        logging: false, // Konsolu kirletmemesi için SQL sorgularını gizler
        dialectOptions: {
            options: {
                encrypt: false, // Yerel sunucuda genelde false olur
                trustServerCertificate: true // Sertifika hatası almamak için
            }
        }
    }
);

// Bağlantıyı Test Et
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MSSQL Veritabanı Bağlantısı Başarılı.');
    } catch (error) {
        console.error('Veritabanına bağlanılamadı:', error);
    }
};

module.exports = { sequelize, connectDB };