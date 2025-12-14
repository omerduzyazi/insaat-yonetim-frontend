// routes/reports.js - Pure SQL Raporlama Endpoint'leri (Final Dökümantasyonu için)
const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

// ==================== SQL SORGU 1: Proje Bazlı Toplam Harcama ====================
// JOIN, SUM, GROUP BY kullanımı
router.get('/project-expenses', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.name AS project_name,
                p.location,
                COUNT(e.id) AS expense_count,
                COALESCE(SUM(e.amount), 0) AS total_expenses
            FROM "Projects" p
            LEFT JOIN "Expenses" e ON p.id = e."ProjectId"
            GROUP BY p.id, p.name, p.location
            ORDER BY total_expenses DESC
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 2: Kategori Bazlı Harcama Analizi ====================
// GROUP BY, HAVING, aggregate functions
router.get('/expense-by-category', async (req, res) => {
    try {
        const query = `
            SELECT 
                category,
                COUNT(*) AS transaction_count,
                SUM(amount) AS total_amount,
                AVG(amount) AS average_amount,
                MIN(amount) AS min_amount,
                MAX(amount) AS max_amount
            FROM "Expenses"
            GROUP BY category
            HAVING SUM(amount) > 1000
            ORDER BY total_amount DESC
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 3: Çalışan Yoklama İstatistikleri ====================
// Multiple JOINs, COUNT, GROUP BY
router.get('/employee-attendance-stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id,
                e.name AS employee_name,
                r.title AS role_title,
                COUNT(CASE WHEN a.status = 'Geldi' THEN 1 END) AS days_present,
                COUNT(CASE WHEN a.status = 'Gelmedi' THEN 1 END) AS days_absent,
                COUNT(CASE WHEN a.status = 'İzinli' THEN 1 END) AS days_leave,
                COUNT(a.id) AS total_records
            FROM "Employees" e
            LEFT JOIN "Roles" r ON e."RoleId" = r.id
            LEFT JOIN "Attendances" a ON e.id = a."EmployeeId"
            GROUP BY e.id, e.name, r.title
            ORDER BY days_present DESC
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 4: Proje Detay Raporu ====================
// Complex JOIN, subquery simulation
router.get('/project-details/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const query = `
            SELECT 
                p.id,
                p.name,
                p.location,
                p.budget,
                p.start_date,
                p.end_date,
                p.status,
                COUNT(DISTINCT e.id) AS employee_count,
                COUNT(DISTINCT ex.id) AS expense_count,
                COALESCE(SUM(ex.amount), 0) AS total_spent,
                (p.budget - COALESCE(SUM(ex.amount), 0)) AS remaining_budget
            FROM "Projects" p
            LEFT JOIN "Employees" e ON p.id = e."ProjectId"
            LEFT JOIN "Expenses" ex ON p.id = ex."ProjectId"
            WHERE p.id = :projectId
            GROUP BY p.id, p.name, p.location, p.budget, p.start_date, p.end_date, p.status
        `;
        
        const results = await sequelize.query(query, { 
            replacements: { projectId },
            type: QueryTypes.SELECT 
        });
        res.json(results[0] || {});
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 5: Aylık Harcama Trendi ====================
// DATE functions, GROUP BY with date formatting
router.get('/monthly-expenses', async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(expense_date, 'YYYY-MM') AS month,
                COUNT(*) AS transaction_count,
                SUM(amount) AS total_amount,
                category
            FROM "Expenses"
            WHERE expense_date >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY TO_CHAR(expense_date, 'YYYY-MM'), category
            ORDER BY month DESC, total_amount DESC
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 6: En Aktif Çalışanlar ====================
// Subquery, ORDER BY, LIMIT
router.get('/top-active-employees', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id,
                e.name,
                e.phone,
                r.title AS role,
                COUNT(a.id) AS attendance_count,
                ROUND(
                    (COUNT(CASE WHEN a.status = 'Geldi' THEN 1 END)::numeric / 
                    NULLIF(COUNT(a.id), 0)) * 100, 
                    2
                ) AS attendance_rate
            FROM "Employees" e
            LEFT JOIN "Roles" r ON e."RoleId" = r.id
            LEFT JOIN "Attendances" a ON e.id = a."EmployeeId"
            WHERE e.status = 'Aktif'
            GROUP BY e.id, e.name, e.phone, r.title
            HAVING COUNT(a.id) > 0
            ORDER BY attendance_rate DESC
            LIMIT 10
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 7: Rol Bazlı Maaş Analizi ====================
// JOIN, AVG, GROUP BY
router.get('/role-salary-analysis', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.title AS role_title,
                r.daily_rate,
                COUNT(e.id) AS employee_count,
                r.daily_rate * 30 AS estimated_monthly_cost_per_employee,
                (r.daily_rate * 30 * COUNT(e.id)) AS total_monthly_cost
            FROM "Roles" r
            LEFT JOIN "Employees" e ON r.id = e."RoleId" AND e.status = 'Aktif'
            GROUP BY r.id, r.title, r.daily_rate
            ORDER BY total_monthly_cost DESC
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 8: Geciken Ödemeler ====================
// WHERE, CASE, date comparison
router.get('/pending-expenses', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id,
                e.description,
                e.amount,
                e.category,
                e.expense_date,
                e.status,
                p.name AS project_name,
                CURRENT_DATE - e.expense_date AS days_pending,
                CASE 
                    WHEN CURRENT_DATE - e.expense_date > 30 THEN 'Kritik'
                    WHEN CURRENT_DATE - e.expense_date > 15 THEN 'Uyarı'
                    ELSE 'Normal'
                END AS priority_level
            FROM "Expenses" e
            INNER JOIN "Projects" p ON e."ProjectId" = p.id
            WHERE e.status IN ('Beklemede', 'Onaylandı')
            ORDER BY days_pending DESC
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 9: Proje Performans Karşılaştırması ====================
// Multiple aggregations, complex calculations
router.get('/project-performance', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.name AS project_name,
                p.status,
                p.budget,
                COALESCE(SUM(e.amount), 0) AS total_expenses,
                ROUND((COALESCE(SUM(e.amount), 0) / NULLIF(p.budget, 0)) * 100, 2) AS budget_usage_percentage,
                COUNT(DISTINCT emp.id) AS team_size,
                COUNT(DISTINCT e.id) AS expense_transactions,
                CASE 
                    WHEN p.end_date < CURRENT_DATE AND p.status != 'Tamamlandı' THEN 'Gecikmiş'
                    WHEN p.status = 'Tamamlandı' THEN 'Tamamlandı'
                    ELSE 'Zamanında'
                END AS timeline_status
            FROM "Projects" p
            LEFT JOIN "Expenses" e ON p.id = e."ProjectId"
            LEFT JOIN "Employees" emp ON p.id = emp."ProjectId"
            GROUP BY p.id, p.name, p.status, p.budget, p.end_date
            ORDER BY budget_usage_percentage DESC
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 10: Haftalık Yoklama Özeti ====================
// Date functions, aggregation by week
router.get('/weekly-attendance', async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(attendance_date, 'IYYY-IW') AS week,
                COUNT(*) AS total_records,
                COUNT(CASE WHEN status = 'Geldi' THEN 1 END) AS present_count,
                COUNT(CASE WHEN status = 'Gelmedi' THEN 1 END) AS absent_count,
                COUNT(CASE WHEN status = 'İzinli' THEN 1 END) AS leave_count,
                ROUND(
                    (COUNT(CASE WHEN status = 'Geldi' THEN 1 END)::numeric / 
                    NULLIF(COUNT(*), 0)) * 100, 
                    2
                ) AS attendance_percentage
            FROM "Attendances"
            WHERE attendance_date >= CURRENT_DATE - INTERVAL '8 weeks'
            GROUP BY TO_CHAR(attendance_date, 'IYYY-IW')
            ORDER BY week DESC
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 11: En Pahalı Projeler (BONUS) ====================
// Nested query simulation, TOP N
router.get('/most-expensive-projects', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.budget,
                COALESCE(SUM(e.amount), 0) AS total_spent,
                COUNT(e.id) AS expense_count,
                COALESCE(SUM(e.amount), 0) / NULLIF(COUNT(e.id), 0) AS avg_expense
            FROM "Projects" p
            LEFT JOIN "Expenses" e ON p.id = e."ProjectId"
            GROUP BY p.id, p.name, p.budget
            HAVING COALESCE(SUM(e.amount), 0) > 0
            ORDER BY total_spent DESC
            LIMIT 5
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

// ==================== SQL SORGU 12: Çalışan Maliyet Raporu (BONUS) ====================
// Complex calculation with multiple tables
router.get('/employee-cost-report', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id,
                e.name AS employee_name,
                r.title AS role,
                r.daily_rate,
                COUNT(a.id) FILTER (WHERE a.status = 'Geldi') AS days_worked,
                SUM(a.worked_hours) AS total_hours,
                (r.daily_rate * COUNT(a.id) FILTER (WHERE a.status = 'Geldi')) AS total_cost
            FROM "Employees" e
            INNER JOIN "Roles" r ON e."RoleId" = r.id
            LEFT JOIN "Attendances" a ON e.id = a."EmployeeId"
            WHERE e.status = 'Aktif'
            GROUP BY e.id, e.name, r.title, r.daily_rate
            HAVING COUNT(a.id) FILTER (WHERE a.status = 'Geldi') > 0
            ORDER BY total_cost DESC
        `;
        
        const results = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.json(results);
    } catch (error) {
        console.error('SQL Query Error:', error);
        res.status(500).json({ message: 'Sorgu hatası', error: error.message });
    }
});

module.exports = router;
