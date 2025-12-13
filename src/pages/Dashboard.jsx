import { useState, useEffect } from 'react'
import { Building, Users, DollarSign, Activity, TrendingUp, Bell } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function Dashboard() {
    const [showNotifications, setShowNotifications] = useState(false)
    const [stats, setStats] = useState([])
    const [recentActivities, setRecentActivities] = useState([]) // YENİ: Hareketler State'i
    const [loading, setLoading] = useState(true)
    const { showToast } = useToast()

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats');
                const data = response.data;

                // İstatistik Kartları
                setStats([
                    { label: 'Aktif Projeler', value: data.activeProjects || '0', icon: Building, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'Toplam Personel', value: data.totalEmployees || '0', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                    { label: 'Toplam Bütçe', value: `₺${Number(data.totalBudget || 0).toLocaleString('tr-TR')}`, icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                    { label: 'Tamamlanma', value: `%${data.completionRate || '0'}`, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                ])

                // Son Hareketler
                setRecentActivities(data.activities || []);

            } catch (error) {
                console.error("Stats hatası:", error);
                showToast("Güncel veriler yüklenemedi", "error");
            } finally {
                setLoading(false);
            }
        }

        fetchStats()
    }, [showToast])

    const handleDownloadReport = () => {
        // ekleme yapılacak
    }
    
    // Rengi belirleyen yardımcı fonksiyon
    const getActivityColor = (type) => {
        switch(type) {
            case 'success': return 'bg-emerald-500';
            case 'danger': return 'bg-red-500';
            case 'warning': return 'bg-amber-500';
            default: return 'bg-blue-500'; // info
        }
    }

    return (
        <div className="space-y-8 relative animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kontrol Paneli</h1>
                    <p className="text-slate-500 mt-1">Şantiye verileri ve günlük özetler</p>
                </div>
                <div className="flex gap-3 relative">
                    {/* BİLDİRİMLER BUTONU */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`btn-secondary flex items-center gap-2 relative ${showNotifications ? 'bg-slate-100' : ''}`}
                    >
                        <Bell size={18} />
                        <span className="hidden sm:inline">Bildirimler</span>
                        {recentActivities.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {/* BİLDİRİMLER POPUP */}
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-fade-in overflow-hidden">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Son Hareketler</h3>
                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">{recentActivities.length} Yeni</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {recentActivities.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 text-sm">Henüz işlem yok.</div>
                                ) : (
                                    recentActivities.map((act) => (
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

            {/* KARTLAR */}
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
                    stats.map((stat, index) => (
                        <div key={index} className={`card border-l-4 ${stat.border} hover:scale-105 transition-transform duration-300`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SOL TARAF: GRAFİK (Şimdilik Boş) */}
                <div className="lg:col-span-2 card min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Proje İlerlemeleri</h3>
                    </div>
                    <div className="flex-1 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Activity size={32} className="text-slate-300" />
                        <p>Analitik Grafikleri Yakında...</p>
                    </div>
                </div>

                {/* SAĞ TARAF: SON İŞLEMLER LİSTESİ */}
                <div className="card flex flex-col">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Son İşlemler</h3>
                    <div className="space-y-6">
                        {loading ? (
                            <Skeleton className="h-20 w-full" />
                        ) : recentActivities.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center">Henüz bir işlem yapılmadı.</p>
                        ) : (
                            recentActivities.slice(0, 5).map((act) => (
                                <div key={act.id} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${getActivityColor(act.type)}`} />
                                    <div>
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
        </div>
    )
}