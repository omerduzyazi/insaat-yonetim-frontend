const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/db');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Veritabanına bağlandı.\n');

        // Mevcut kullanıcıları kontrol et
        const existingUsers = await User.findAll();
        console.log(`Mevcut kullanıcı sayısı: ${existingUsers.length}\n`);

        if (existingUsers.length > 0) {
            console.log('Kayıtlı kullanıcılar:');
            existingUsers.forEach(u => {
                console.log(`  - ${u.name} (${u.email}) - Rol: ${u.role}`);
            });
            console.log('\nYeni kullanıcı oluşturmak ister misiniz? (y/n)');
        }

        // Admin kullanıcı oluştur
        const adminEmail = 'admin@insaat.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log(`\n✓ Admin kullanıcısı zaten mevcut: ${adminEmail}`);
            console.log(`  Şifre: admin123`);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            const admin = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            console.log('\n✓ Admin kullanıcısı oluşturuldu!');
            console.log(`  Email: ${adminEmail}`);
            console.log(`  Şifre: admin123`);
            console.log(`  Rol: ${admin.role}\n`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
};

createAdmin();
