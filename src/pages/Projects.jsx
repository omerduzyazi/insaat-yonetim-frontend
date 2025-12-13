import { useState, useEffect } from 'react'
import { Plus, MapPin, Calendar, X, Search, Edit2, Trash2, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Skeleton from '../components/ui/Skeleton'

export default function Projects() {
    const [projects, setProjects] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const [formData, setFormData] = useState({ 
        name: '', 
        location: '', 
        budget: '', 
        status: 'Planlama', 
        start_date: new Date().toISOString().substring(0, 10) 
    })

    const { showToast } = useToast()

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const res = await api.get('/projects');
            setProjects(res.data)
        } catch (err) {
            console.error("API Hatası:", err)
            // Hata durumunda mock data kullanmayı bırakıp, kullanıcıya hata bildirimi gösteriyoruz.
            showToast('Projeler yüklenemedi. Sunucu bağlantınızı kontrol edin.', 'error')
            setProjects([]) // Veri yoksa boş liste göster
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({ 
            name: '', 
            location: '', 
            budget: '', 
            status: 'Planlama', 
            start_date: new Date().toISOString().substring(0, 10) 
        })
        setIsEditing(false)
        setEditId(null)
    }

    const handleEditClick = (project) => {
        setFormData({
            name: project.name,
            location: project.location,
            budget: project.budget || '',
            status: project.status,
            // Tarih formatını uyumlu hale getiriyoruz
            start_date: project.start_date ? new Date(project.start_date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)
        })
        setEditId(project.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (isSubmitting) return;

        setIsSubmitting(true)

        try {
            const dataToSend = {
                ...formData,
                // Bütçeyi API'ye number olarak gönder
                budget: parseFloat(formData.budget) || 0, 
            };

            if (isEditing) {
                const res = await api.put(`/projects/${editId}`, dataToSend)
                setProjects(projects.map(proj => proj.id === editId ? res.data : proj))
                showToast('Proje bilgileri güncellendi.', 'success')
            } else {
                const res = await api.post('/projects', dataToSend)
                // Yeni projeyi listenin başına ekle
                setProjects([res.data, ...projects])
                showToast('Yeni proje başarıyla oluşturuldu.', 'success')
            }
            setShowModal(false)
            resetForm()
        } catch (err) {
            const msg = err.response?.data?.message || 'İşlem başarısız.'
            showToast(msg, 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/projects/${id}`)
                setProjects(projects.filter(proj => proj.id !== id))
                showToast('Proje başarıyla silindi.', 'info')
            } catch (err) {
                showToast('Silme işlemi başarısız.', 'error')
            }
        }
    }
    
    // Proje durumuna göre stil belirleme fonksiyonu
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Tamamlandı':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Devam Ediyor':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Planlama':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projeler</h1>
                    <p className="text-slate-500 mt-1">{projects.length} Aktif ve Tamamlanmış Proje</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setShowModal(true) }} 
                    className="btn-primary shadow-xl shadow-primary-500/20"
                >
                    <Plus size={20} /> Yeni Proje Oluştur
                </button>
            </div>

            <div className="card border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden p-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Proje adı veya konumu ara..." className="input-field pl-10 bg-white" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proje Adı</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Başlangıç</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Bütçe (₺)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-32 ml-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></td>
                                    </tr>
                                ))
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle size={32} className="text-slate-300" />
                                            <p>Henüz kayıtlı proje yok.</p>
                                            <button 
                                                onClick={() => { resetForm(); setShowModal(true) }} 
                                                className="mt-4 btn-secondary"
                                            >
                                                İlk Projenizi Oluşturun
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                projects.map((proj) => (
                                    <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <div className="font-semibold">{proj.name}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <MapPin size={12} className="text-slate-400" /> {proj.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(proj.status)}`}>
                                                {proj.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" /> 
                                                {proj.start_date ? new Date(proj.start_date).toLocaleDateString('tr-TR') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-primary-700">
                                            {proj.budget ? `₺${Number(proj.budget).toLocaleString('tr-TR')}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEditClick(proj)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(proj.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />

                    <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-black/5">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">
                                {isEditing ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-2 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Proje Adı</label>
                                    <input type="text" placeholder="Örn: Vadi Konakları" className="input-field"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Konum</label>
                                        <input type="text" placeholder="Örn: İstanbul, Sarıyer" className="input-field"
                                            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Tarihi</label>
                                        <input type="date" className="input-field"
                                            value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Bütçe (₺)</label>
                                        <input type="number" placeholder="5000000" className="input-field"
                                            value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
                                        <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="Planlama">Planlama</option>
                                            <option value="Devam Ediyor">Devam Ediyor</option>
                                            <option value="Tamamlandı">Tamamlandı</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">İptal</button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            {isEditing ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                                        </>
                                    ) : (
                                        <>{isEditing ? 'Güncelle' : 'Projeyi Oluştur'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}