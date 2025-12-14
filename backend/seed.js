// backend/seed.js - Örnek Veri Yükleme Scripti
const { sequelize } = require('./config/db');
const bcrypt = require('bcryptjs');
const models = require('./models');

const {
    User,
    Project,
    Employee,
    Role,
    Attendance,
    Expense,
    Supplier,
    Material,
    Equipment
} = models;

async function seedDatabase() {
    try {
        console.log('🌱 Seed işlemi başlatılıyor...');

        // Admin kullanıcı kontrolü
        let adminUser = await User.findOne({ where: { email: 'admin@insaat.com' } });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            adminUser = await User.create({
                name: 'Admin',
                username: 'admin',
                email: 'admin@insaat.com',
                password: hashedPassword
            });
            console.log('✅ Admin kullanıcı oluşturuldu');
        }

        // ==================== ROLLER ====================
        const roles = [
            { name: 'Şantiye Şefi', default_daily_rate: 850, userId: adminUser.id },
            { name: 'Mimar', default_daily_rate: 750, userId: adminUser.id },
            { name: 'İnşaat Mühendisi', default_daily_rate: 700, userId: adminUser.id },
            { name: 'Elektrik Ustası', default_daily_rate: 600, userId: adminUser.id },
            { name: 'Sıhhi Tesisat Ustası', default_daily_rate: 550, userId: adminUser.id },
            { name: 'Kalıpçı Ustası', default_daily_rate: 500, userId: adminUser.id },
            { name: 'Demir Ustası', default_daily_rate: 480, userId: adminUser.id },
            { name: 'Duvarcı', default_daily_rate: 450, userId: adminUser.id },
            { name: 'Sıvacı', default_daily_rate: 420, userId: adminUser.id },
            { name: 'Boyacı', default_daily_rate: 400, userId: adminUser.id },
            { name: 'İşçi', default_daily_rate: 350, userId: adminUser.id },
            { name: 'Güvenlik Görevlisi', default_daily_rate: 380, userId: adminUser.id },
            { name: 'Temizlik Görevlisi', default_daily_rate: 320, userId: adminUser.id }
        ];

        const createdRoles = [];
        for (const roleData of roles) {
            const [role] = await Role.findOrCreate({
                where: { name: roleData.name },
                defaults: roleData
            });
            createdRoles.push(role);
        }
        console.log(`✅ ${createdRoles.length} rol oluşturuldu/kontrol edildi`);

        // ==================== PROJELER ====================
        const projects = [
            {
                name: 'Lale Residence Konut Projesi',
                description: 'Kadıköy bölgesinde 8 katlı, 32 daireli lüks konut projesi',
                city: 'İstanbul',
                district: 'Kadıköy',
                address: 'Caferağa Mahallesi, Moda Caddesi No: 45',
                budget: 18500000,
                start_date: new Date('2024-06-01'),
                end_date: new Date('2026-03-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Boğaz View İş Merkezi',
                description: '20 katlı A+ ofis binası, Boğaz manzaralı',
                city: 'İstanbul',
                district: 'Beşiktaş',
                address: 'Levent Mahallesi, Büyükdere Caddesi No: 201',
                budget: 45000000,
                start_date: new Date('2024-03-15'),
                end_date: new Date('2027-12-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Sarıyer Villaları',
                description: '12 adet müstakil villa projesi',
                city: 'İstanbul',
                district: 'Sarıyer',
                address: 'Tarabya Mahallesi, Kireçburnu Yolu No: 34',
                budget: 28000000,
                start_date: new Date('2023-09-01'),
                end_date: new Date('2025-08-30'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Gümüş Plaza İş Merkezi',
                description: '15 katlı modern ofis binası',
                city: 'Ankara',
                district: 'Çankaya',
                address: 'Kavaklıdere Mahallesi, Atatürk Bulvarı No: 120',
                budget: 22000000,
                start_date: new Date('2024-09-15'),
                end_date: new Date('2027-06-30'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Eryaman Yeşiltepe Sitesi',
                description: '5 blok, toplam 120 daireli konut sitesi',
                city: 'Ankara',
                district: 'Etimesgut',
                address: 'Eryaman Mahallesi, 312. Cadde No: 78',
                budget: 16500000,
                start_date: new Date('2023-03-01'),
                end_date: new Date('2025-06-30'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Karşıyaka Sahil Evleri',
                description: 'Deniz manzaralı 6 katlı butik konut',
                city: 'İzmir',
                district: 'Karşıyaka',
                address: 'Bostanlı Mahallesi, Cemal Gürsel Caddesi No: 156',
                budget: 14000000,
                start_date: new Date('2024-04-20'),
                end_date: new Date('2026-02-28'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Bornova Teknokent Binası',
                description: 'Ege Üniversitesi Teknoloji Geliştirme Bölgesi - Ofis',
                city: 'İzmir',
                district: 'Bornova',
                address: 'Kazımdirik Mahallesi, İnönü Caddesi No: 89',
                budget: 19500000,
                start_date: new Date('2024-01-10'),
                end_date: new Date('2025-12-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            },
            {
                name: 'Nilüfer AVM Yenileme',
                description: 'Mevcut alışveriş merkezinin modernizasyon çalışması',
                city: 'Bursa',
                district: 'Nilüfer',
                address: 'Ataevler Mahallesi, Ankara Yolu Caddesi No: 250',
                budget: 9800000,
                start_date: new Date('2024-02-01'),
                end_date: new Date('2024-11-30'),
                status: 'Tamamlandı',
                userId: adminUser.id
            },
            {
                name: 'Muratpaşa Eğitim Kampüsü',
                description: '32 derslikli ilköğretim okulu + spor salonu',
                city: 'Antalya',
                district: 'Muratpaşa',
                address: 'Meltem Mahallesi, Dumlupınar Bulvarı No: 67',
                budget: 12300000,
                start_date: new Date('2024-02-01'),
                end_date: new Date('2025-08-31'),
                status: 'Devam Ediyor',
                userId: adminUser.id
            }
        ];

        const createdProjects = [];
        for (const projectData of projects) {
            const [project] = await Project.findOrCreate({
                where: { name: projectData.name },
                defaults: projectData
            });
            createdProjects.push(project);
        }
        console.log(`✅ ${createdProjects.length} proje oluşturuldu`);

        // ==================== ÇALIŞANLAR ====================
        const employees = [
            { name: 'Mehmet Yılmaz', phone: '0532 111 2233', address: 'Çankaya/Ankara', status: 'Aktif', RoleId: createdRoles[0].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Ayşe Kara', phone: '0533 222 3344', address: 'Kızılay/Ankara', status: 'Aktif', RoleId: createdRoles[1].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Ahmet Demir', phone: '0534 333 4455', address: 'Keçiören/Ankara', status: 'Aktif', RoleId: createdRoles[2].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Fatma Aydın', phone: '0535 444 5566', address: 'Eryaman/Ankara', status: 'Aktif', RoleId: createdRoles[2].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Ali Şahin', phone: '0536 555 6677', address: 'Ulus/Ankara', status: 'Aktif', RoleId: createdRoles[3].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Zeynep Çelik', phone: '0537 666 7788', address: 'Çankaya/Ankara', status: 'Aktif', RoleId: createdRoles[4].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Mustafa Arslan', phone: '0538 777 8899', address: 'Kızılay/Ankara', status: 'Aktif', RoleId: createdRoles[5].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Elif Özkan', phone: '0539 888 9900', address: 'Keçiören/Ankara', status: 'Aktif', RoleId: createdRoles[6].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Hasan Yıldız', phone: '0532 999 0011', address: 'Eryaman/Ankara', status: 'Aktif', RoleId: createdRoles[7].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Merve Koç', phone: '0533 000 1122', address: 'Ulus/Ankara', status: 'Aktif', RoleId: createdRoles[8].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Emre Aksoy', phone: '0534 111 2233', address: 'Çankaya/Ankara', status: 'Aktif', RoleId: createdRoles[9].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Selin Güneş', phone: '0535 222 3344', address: 'Kızılay/Ankara', status: 'Aktif', RoleId: createdRoles[10].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Burak Tekin', phone: '0536 333 4455', address: 'Keçiören/Ankara', status: 'Aktif', RoleId: createdRoles[10].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Deniz Polat', phone: '0537 444 5566', address: 'Eryaman/Ankara', status: 'Aktif', RoleId: createdRoles[10].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Can Erdem', phone: '0538 555 6677', address: 'Ulus/Ankara', status: 'Aktif', RoleId: createdRoles[10].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Gizem Acar', phone: '0539 666 7788', address: 'Çankaya/Ankara', status: 'Aktif', RoleId: createdRoles[11].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Oğuz Eren', phone: '0532 777 8899', address: 'Kızılay/Ankara', status: 'Aktif', RoleId: createdRoles[11].id, ProjectId: createdProjects[1].id, userId: adminUser.id },
            { name: 'Ece Yavuz', phone: '0533 888 9900', address: 'Keçiören/Ankara', status: 'Aktif', RoleId: createdRoles[12].id, ProjectId: createdProjects[2].id, userId: adminUser.id },
            { name: 'Barış Öztürk', phone: '0534 999 0011', address: 'Eryaman/Ankara', status: 'İzinli', RoleId: createdRoles[10].id, ProjectId: createdProjects[0].id, userId: adminUser.id },
            { name: 'Seda Kurt', phone: '0535 000 1122', address: 'Ulus/Ankara', status: 'Pasif', RoleId: createdRoles[10].id, ProjectId: null, userId: adminUser.id }
        ];

        const createdEmployees = [];
        for (const empData of employees) {
            const [employee] = await Employee.findOrCreate({
                where: { phone: empData.phone },
                defaults: empData
            });
            createdEmployees.push(employee);
        }
        console.log(`✅ ${createdEmployees.length} çalışan oluşturuldu`);

        // ==================== TEDARİKÇİLER ====================
        const suppliers = [
            { name: 'Akçelik İnşaat Malzemeleri', contact_person: 'İbrahim Akçelik', phone: '0312 444 5566', email: 'info@akcelik.com', address: 'Ostim/Ankara', userId: adminUser.id },
            { name: 'Demirtaş Hırdavat', contact_person: 'Hakan Demirtaş', phone: '0312 555 6677', email: 'demirtas@hirdavat.com', address: 'İvedik/Ankara', userId: adminUser.id },
            { name: 'Bayrak Elektrik', contact_person: 'Mehmet Bayrak', phone: '0312 666 7788', email: 'bayrak@elektrik.com', address: 'Demetevler/Ankara', userId: adminUser.id }
        ];

        const createdSuppliers = [];
        for (const supplierData of suppliers) {
            const [supplier] = await Supplier.findOrCreate({
                where: { name: supplierData.name },
                defaults: supplierData
            });
            createdSuppliers.push(supplier);
        }
        console.log(`✅ ${createdSuppliers.length} tedarikçi oluşturuldu`);

        // ==================== MALZEMELER ====================
        const materials = [
            { name: 'Çimento (50kg)', unit: 'Çuval', unit_price: 185.50, stock_quantity: 500, SupplierId: createdSuppliers[0].id, userId: adminUser.id },
            { name: 'Demir (Ø12)', unit: 'Ton', unit_price: 22500, stock_quantity: 15, SupplierId: createdSuppliers[0].id, userId: adminUser.id },
            { name: 'Tuğla (Delikli)', unit: 'Adet', unit_price: 4.75, stock_quantity: 12000, SupplierId: createdSuppliers[0].id, userId: adminUser.id },
            { name: 'Elektrik Kablosu (2.5mm)', unit: 'Metre', unit_price: 12.30, stock_quantity: 2500, SupplierId: createdSuppliers[2].id, userId: adminUser.id },
            { name: 'PVC Boru (110mm)', unit: 'Metre', unit_price: 45.80, stock_quantity: 800, SupplierId: createdSuppliers[1].id, userId: adminUser.id }
        ];

        const createdMaterials = [];
        for (const materialData of materials) {
            const [material] = await Material.findOrCreate({
                where: { name: materialData.name },
                defaults: materialData
            });
            createdMaterials.push(material);
        }
        console.log(`✅ ${createdMaterials.length} malzeme oluşturuldu`);

        // ==================== EKİPMANLAR ====================
        const equipments = [
            { name: 'Kazıcı Kepçe', model: 'CAT 320D', serial_number: 'CAT2024001', purchase_date: new Date('2023-05-15'), status: 'Çalışıyor', userId: adminUser.id },
            { name: 'Vinç (20 Ton)', model: 'Liebherr LTM', serial_number: 'LIE2023045', purchase_date: new Date('2022-11-20'), status: 'Çalışıyor', userId: adminUser.id },
            { name: 'Beton Mikseri', model: 'Zoomlion ZM60', serial_number: 'ZOO2024012', purchase_date: new Date('2024-01-10'), status: 'Çalışıyor', userId: adminUser.id },
            { name: 'Jeneratör (100kW)', model: 'Cummins C100D5', serial_number: 'CUM2023089', purchase_date: new Date('2023-08-05'), status: 'Bakımda', userId: adminUser.id }
        ];

        const createdEquipments = [];
        for (const equipData of equipments) {
            const [equipment] = await Equipment.findOrCreate({
                where: { serial_number: equipData.serial_number },
                defaults: equipData
            });
            createdEquipments.push(equipment);
        }
        console.log(`✅ ${createdEquipments.length} ekipman oluşturuldu`);

        // ==================== YOKLAMA KAYITLARI ====================
        const attendanceRecords = [];
        const today = new Date();
        
        // Son 30 gün için yoklama kayıtları
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            for (let j = 0; j < Math.min(15, createdEmployees.length); j++) {
                const employee = createdEmployees[j];
                if (!employee.ProjectId) continue;

                const statuses = ['Geldi', 'Geldi', 'Geldi', 'Geldi', 'Gelmedi', 'İzinli'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                attendanceRecords.push({
                    EmployeeId: employee.id,
                    ProjectId: employee.ProjectId,
                    date: dateStr,
                    status: randomStatus,
                    worked_hours: randomStatus === 'Geldi' ? (8 + Math.floor(Math.random() * 3)) : 0,
                    overtime_hours: randomStatus === 'Geldi' && Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
                    userId: adminUser.id
                });
            }
        }

        await Attendance.bulkCreate(attendanceRecords, { ignoreDuplicates: true });
        console.log(`✅ ${attendanceRecords.length} yoklama kaydı oluşturuldu`);

        // ==================== HARCAMALAR ====================
        const expenses = [
            { ProjectId: createdProjects[0].id, category: 'Malzeme', description: 'Çimento ve demir tedariki', amount: 125000, expense_date: new Date('2024-10-15'), payment_method: 'Havale', status: 'Ödendi', userId: adminUser.id },
            { ProjectId: createdProjects[0].id, category: 'Maaş', description: 'Ekim ayı personel maaşları', amount: 85000, expense_date: new Date('2024-11-01'), payment_method: 'Havale', status: 'Ödendi', userId: adminUser.id },
            { ProjectId: createdProjects[1].id, category: 'Ekipman', description: 'Vinç kiralama (aylık)', amount: 45000, expense_date: new Date('2024-11-10'), payment_method: 'Çek', status: 'Ödendi', userId: adminUser.id },
            { ProjectId: createdProjects[1].id, category: 'Malzeme', description: 'Elektrik malzemeleri', amount: 32000, expense_date: new Date('2024-11-20'), payment_method: 'Kredi Kartı', status: 'Ödendi', userId: adminUser.id },
            { ProjectId: createdProjects[2].id, category: 'Ulaşım', description: 'Malzeme nakliyesi', amount: 12500, expense_date: new Date('2024-11-25'), payment_method: 'Nakit', status: 'Ödendi', userId: adminUser.id },
            { ProjectId: createdProjects[2].id, category: 'Maaş', description: 'Kasım ayı maaşları', amount: 95000, expense_date: new Date('2024-12-01'), payment_method: 'Havale', status: 'Ödendi', userId: adminUser.id },
            { ProjectId: createdProjects[0].id, category: 'Yemek', description: 'Personel yemek hizmeti', amount: 8500, expense_date: new Date('2024-12-05'), payment_method: 'Nakit', status: 'Ödendi', userId: adminUser.id },
            { ProjectId: createdProjects[1].id, category: 'Diğer', description: 'Ofis sarf malzemeleri', amount: 3200, expense_date: new Date('2024-12-08'), payment_method: 'Kredi Kartı', status: 'Onaylandı', userId: adminUser.id },
            { ProjectId: createdProjects[2].id, category: 'Malzeme', description: 'Sıva ve boya malzemeleri', amount: 28000, expense_date: new Date('2024-12-10'), payment_method: 'Havale', status: 'Beklemede', userId: adminUser.id },
            { ProjectId: createdProjects[3].id, category: 'Ekipman', description: 'Alet bakım ve onarım', amount: 15500, expense_date: new Date('2024-12-12'), payment_method: 'Çek', status: 'Beklemede', userId: adminUser.id }
        ];

        await Expense.bulkCreate(expenses, { ignoreDuplicates: true });
        console.log(`✅ ${expenses.length} harcama kaydı oluşturuldu`);

        console.log('\n🎉 Seed işlemi başarıyla tamamlandı!\n');
        console.log('📊 Oluşturulan Veriler:');
        console.log(`   - ${createdRoles.length} Rol`);
        console.log(`   - ${createdProjects.length} Proje`);
        console.log(`   - ${createdEmployees.length} Çalışan`);
        console.log(`   - ${createdSuppliers.length} Tedarikçi`);
        console.log(`   - ${createdMaterials.length} Malzeme`);
        console.log(`   - ${createdEquipments.length} Ekipman`);
        console.log(`   - ${attendanceRecords.length} Yoklama Kaydı`);
        console.log(`   - ${expenses.length} Harcama Kaydı\n`);

    } catch (error) {
        console.error('❌ Seed hatası:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Script çalıştır
seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
