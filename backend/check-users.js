const models = require('./models');

const checkUsers = async () => {
    try {
        await models.sequelize.authenticate();
        console.log('Veritabanına bağlandı.\n');

        const users = await models.User.findAll();
        
        console.log(`Toplam kullanıcı sayısı: ${users.length}\n`);
        
        if (users.length > 0) {
            console.log('Kayıtlı kullanıcılar:');
            users.forEach(u => {
                console.log(`ID: ${u.id}`);
                console.log(`  İsim: ${u.name}`);
                console.log(`  Email: ${u.email}`);
                console.log(`  Rol: ${u.role}`);
                console.log(`  Şifre (hash): ${u.password.substring(0, 30)}...`);
                console.log('---');
            });
        } else {
            console.log('❌ Hiç kullanıcı yok! create-admin.js çalıştırın.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
};

checkUsers();
