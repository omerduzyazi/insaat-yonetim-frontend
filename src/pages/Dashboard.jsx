import { useState, useEffect } from 'react'
import { Building, Users, DollarSign, Activity, TrendingUp, Bell, Briefcase, Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts'
import { useNavigate } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function Dashboard() {
    const navigate = useNavigate()
    const [showNotifications, setShowNotifications] = useState(false)
    const [loading, setLoading] = useState(true)
    const { showToast } = useToast()
    
    const [dashboardData, setDashboardData] = useState({
        projects: { total: 0, active: 0, completed: 0 },
        employees: { total: 0, active: 0 },
        expenses: { total: 0, byCategory: [] },
        attendance: { present: 0, absent: 0, leave: 0 },
        roles: { total: 0 },
        recentActivities: []
    })

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const [projectsRes, employeesRes, expensesRes, attendanceRes, rolesRes] = await Promise.all([
                api.get('/projects'),
                api.get('/employees'),
                api.get('/expenses'),
                api.get('/attendance'),
                api.get('/roles')
            ])

            const projects = projectsRes.data
            const employees = employeesRes.data
            const expenses = expensesRes.data
            const attendance = attendanceRes.data
            const roles = rolesRes.data

            // Harcama kategorilerine göre gruplama
            const expensesByCategory = expenses.reduce((acc, exp) => {
                const existing = acc.find(item => item.name === exp.category)
                if (existing) {
                    existing.value += parseFloat(exp.amount || 0)
                } else {
                    acc.push({ name: exp.category, value: parseFloat(exp.amount || 0) })
                }
                return acc
            }, [])

            // Yoklama durumları
            const today = new Date().toISOString().split('T')[0]
            const todayAttendance = attendance.filter(a => a.attendance_date === today)
            const attendanceStats = {
                present: todayAttendance.filter(a => a.status === 'Geldi').length,
                absent: todayAttendance.filter(a => a.status === 'Gelmedi').length,
                leave: todayAttendance.filter(a => a.status === 'İzinli' || a.status === 'Raporlu').length
            }

            setDashboardData({
                projects: {
                    total: projects.length,
                    active: projects.filter(p => p.status === 'Devam Ediyor').length,
                    completed: projects.filter(p => p.status === 'Tamamlandı').length
                },
                employees: {
                    total: employees.length,
                    active: employees.filter(e => e.status === 'Aktif').length
                },
                expenses: {
                    total: expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
                    byCategory: expensesByCategory
                },
                attendance: attendanceStats,
                roles: { total: roles.length },
                recentActivities: attendance.slice(0, 5).map(a => ({
                    id: a.id,
                    content: `${a.Employee?.name || 'Bilinmeyen'} - ${a.status}`,
                    type: a.status === 'Geldi' ? 'success' : 'warning',
                    createdAt: a.createdAt
                }))
            })
        } catch (error) {
            console.error('Dashboard data fetch error:', error)
            showToast('Veriler yüklenirken hata oluştu.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    const handleDownloadReport = () => {
        showToast('Rapor indirme özelliği yakında eklenecek!', 'info')
    }
    
    const getActivityColor = (type) => {
        switch(type) {
            case 'success': return 'bg-emerald-500';
            case 'danger': return 'bg-red-500';
            case 'warning': return 'bg-amber-500';
            default: return 'bg-blue-500';
        }
    }

    const statsCards = [
        {
            label: 'Toplam Proje',
            value: dashboardData.projects.total,
            subValue: `${dashboardData.projects.active} Aktif`,
            icon: Building,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            onClick: () => navigate('/projects')
        },
        {
            label: 'Toplam Çalışan',
            value: dashboardData.employees.total,
            subValue: `${dashboardData.employees.active} Aktif`,
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            onClick: () => navigate('/employees')
        },
        {
            label: 'Toplam Harcama',
            value: `${dashboardData.expenses.total.toLocaleString('tr-TR')} ₺`,
            subValue: `${dashboardData.expenses.byCategory.length} Kategori`,
            icon: DollarSign,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            border: 'border-violet-200',
            onClick: () => navigate('/expenses')
        },
        {
            label: 'Roller',
            value: dashboardData.roles.total,
            subValue: 'Pozisyon',
            icon: Briefcase,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            onClick: () => navigate('/roles')
        }
    ]

    return (
        <div className="space-y-8 relative animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kontrol Paneli</h1>
                    <p className="text-slate-500 mt-1">Şantiye verileri ve günlük özetler</p>
                </div>
                <div className="flex gap-3 relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`btn-secondary flex items-center gap-2 relative ${showNotifications ? 'bg-slate-100' : ''}`}
                    >
                        <Bell size={18} />
                        <span className="hidden sm:inline">Bildirimler</span>
                        {dashboardData.recentActivities.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-fade-in overflow-hidden">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Son Hareketler</h3>
                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">{dashboardData.recentActivities.length}</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {dashboardData.recentActivities.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 text-sm">Henüz işlem yok.</div>
                                ) : (
                                    dashboardData.recentActivities.map((act) => (
                                        <div key={act.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3">
                                            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${getActivityColor(act.type)}`} />
                                            <div>
                                                <p className="text-sm text-slate-700 leading-snug">{act.content}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {new Date(act.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <button onClick={handleDownloadReport} className="btn-primary shadow-xl shadow-primary-500/20 active:scale-95 transition-transform">
                        <TrendingUp size={18} /> Rapor İndir
                    </button>
                </div>
            </div>

            {/* İSTATİSTİK KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="card border-l-4 border-slate-200">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <Skeleton className="h-12 w-12 rounded-xl" />
                            </div>
                        </div>
                    ))
                ) : (
                    statsCards.map((stat, index) => (
                        <div
                            key={index}
                            onClick={stat.onClick}
                            className={`card border-l-4 ${stat.border} hover:scale-105 transition-all duration-300 cursor-pointer group`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h3>
                                    <p className="text-xs text-slate-500">{stat.subValue}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center text-xs text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Detayları Gör</span>
                                <ArrowRight size={14} className="ml-1" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* BUGÜNKÜ YOKLAMA DURUMU */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div
                    onClick={() => navigate('/attendance')}
                    className="card bg-gradient-to-br from-emerald-50 to-white border-emerald-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-emerald-600" />
                            Bugün Geldi
                        </h3>
                        <span className="text-2xl font-bold text-emerald-600">{dashboardData.attendance.present}</span>
                    </div>
                    <div className="text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <span>Yoklamayı Gör</span>
                        <ArrowRight size={14} className="ml-1" />
                    </div>
                </div>

                <div
                    onClick={() => navigate('/attendance')}
                    className="card bg-gradient-to-br from-amber-50 to-white border-amber-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={20} className="text-amber-600" />
                            İzinli/Raporlu
                        </h3>
                        <span className="text-2xl font-bold text-amber-600">{dashboardData.attendance.leave}</span>
                    </div>
                    <div className="text-xs text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <span>Detayları Gör</span>
                        <ArrowRight size={14} className="ml-1" />
                    </div>
                </div>

                <div
                    onClick={() => navigate('/attendance')}
                    className="card bg-gradient-to-br from-red-50 to-white border-red-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-600" />
                            Gelmedi
                        </h3>
                        <span className="text-2xl font-bold text-red-600">{dashboardData.attendance.absent}</span>
                    </div>
                    <div className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <span>Devamsızlığı Gör</span>
                        <ArrowRight size={14} className="ml-1" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* HARCAMA GRAFİĞİ */}
                <div className="card">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Kategori Bazlı Harcamalar</h3>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : dashboardData.expenses.byCategory.length === 0 ? (
                        <div className="h-64 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-slate-400">
                            <DollarSign size={32} className="text-slate-300 mb-2" />
                            <p>Henüz harcama kaydı yok</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={dashboardData.expenses.byCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {dashboardData.expenses.byCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toLocaleString('tr-TR')} ₺`} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* PROJE DURUMU GRAFİĞİ */}
                <div className="card">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Proje Durumu</h3>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={[
                                { name: 'Aktif', value: dashboardData.projects.active, fill: '#3b82f6' },
                                { name: 'Tamamlanan', value: dashboardData.projects.completed, fill: '#10b981' },
                                { name: 'Toplam', value: dashboardData.projects.total, fill: '#8b5cf6' }
                            ]}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* SON İŞLEMLER */}
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800">Son Yoklama Kayıtları</h3>
                    <button
                        onClick={() => navigate('/attendance')}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-semibold"
                    >
                        Tümünü Gör <ArrowRight size={16} />
                    </button>
                </div>
                <div className="space-y-4">
                    {loading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : dashboardData.recentActivities.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">Henüz kayıt yok.</p>
                    ) : (
                        dashboardData.recentActivities.map((act) => (
                            <div key={act.id} className="flex gap-4 items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50 p-3 rounded-lg transition-colors">
                                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${getActivityColor(act.type)}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">{act.content}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {new Date(act.createdAt).toLocaleString('tr-TR')}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}