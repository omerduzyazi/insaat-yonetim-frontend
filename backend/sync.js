const { sequelize } = require('./config/db');
// Modelleri çağırmazsak Sequelize onları tabloya dönüştürmez!
const Project = require('./models/Project');
const Employee = require('./models/Employee');
const Role = require('./models/Role'); 

// İlişkileri burada da tanımlayalım ki Foreign Keyler oluşsun
Project.hasMany(Employee, { foreignKey: 'ProjectId', onDelete: 'SET NULL' });
Employee.belongsTo(Project, { foreignKey: 'ProjectId' });

Role.hasMany(Employee, { foreignKey: 'RoleId' });
Employee.belongsTo(Role, { foreignKey: 'RoleId' });

const syncDatabase = async () => {
    try {
        console.log('Veritabanına bağlanılıyor...');
        await sequelize.authenticate();
        console.log('Bağlantı başarılı. Tablolar silinip yeniden oluşturuluyor...');
        
        // force: true -> Her şeyi sil ve baştan yarat
        await sequelize.sync({ force: true });
        
        console.log('BAŞARILI! Roles, Projects ve Employees tabloları oluşturuldu.');
        process.exit(0);
    } catch (error) {
        console.error('HATA OLUŞTU:', error);
        process.exit(1);
    }
};

syncDatabase();