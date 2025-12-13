const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/db');

// Model Importları
const Project = require('./models/Project');
const Employee = require('./models/Employee');
const Role = require('./models/Role')
const Activity = require('./models/Activity');
const { Flashlight } = require('lucide-react');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// İLİŞKİ TANIMLARI (ASSOCIATIONS)
Project.hasMany(Employee, { foreignKey: 'ProjectId', onDelete: 'SET NULL' });
Employee.belongsTo(Project, { foreignKey: 'ProjectId' });

Role.hasMany(Employee, { foreignKey: 'RoleId' });
Employee.belongsTo(Role, { foreignKey: 'RoleId' });


// Rotalar
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/roles', require('./routes/roles'));

const PORT = process.env.PORT || 5000;

// Veritabanı Bağlantısı ve Başlatma
connectDB().then(() => {
    sequelize.sync({ force: false }).then(() => {
        console.log('Tablolar senkronize edildi (SQL Server).');
        app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
    });
});