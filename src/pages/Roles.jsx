import { useState, useEffect } from 'react'
import { Briefcase, PlusCircle, Edit2, Trash2, DollarSign, Search, Loader2 } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function Roles() {
    const [roles, setRoles] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    
    const [formData, setFormData] = useState({
        name: '',
        default_daily_rate: ''
    })
    
    const { showToast } = useToast()

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/roles')
            setRoles(res.data)
        } catch (error) {
            console.error('Roles fetch error:', error)
            showToast('Roller yüklenirken hata oluştu.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({ name: '', default_daily_rate: '' })
        setIsEditing(false)
        setEditId(null)
    }

    const handleEditClick = (role) => {
        setFormData({
            name: role.name,
            default_daily_rate: role.default_daily_rate || ''
        })
        setEditId(role.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return

        if (!formData.name.trim()) {
            showToast('Rol adı zorunludur.', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            if (isEditing) {
                const res = await api.put(`/roles/${editId}`, formData)
                setRoles(roles.map(r => r.id === editId ? res.data : r))
                showToast('Rol güncellendi.', 'success')
            } else {
                const res = await api.post('/roles', formData)
                setRoles([...roles, res.data])
                showToast('Yeni rol eklendi.', 'success')
            }
            setShowModal(false)
            resetForm()
        } catch (error) {
            console.error('Role submit error:', error)
            showToast(error.response?.data?.message || 'İşlem başarısız.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bu rolü silmek istediğinizden emin misiniz?')) return

        try {
            await api.delete(`/roles/${id}`)
            setRoles(roles.filter(r => r.id !== id))
            showToast('Rol silindi.', 'success')
        } catch (error) {
            console.error('Role delete error:', error)
            showToast('Rol silinirken hata oluştu.', 'error')
        }
    }

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Briefcase className="text-primary-600" size={32} />
                        Roller & Pozisyonlar
                    </h1>
                    <p className="text-slate-600 mt-1">Çalışan görev tanımları ve ücretleri</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true) }}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-600/30"
                >
                    <PlusCircle size={20} />
                    Yeni Rol Ekle
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Rol ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            {/* Roles List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
                            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filteredRoles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <Briefcase className="mx-auto text-slate-300 mb-4" size={64} />
                    <p className="text-slate-500 text-lg">Henüz rol bulunmuyor</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoles.map(role => (
                        <div key={role.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <Briefcase className="text-primary-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{role.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                                            <DollarSign size={14} />
                                            <span>{role.default_daily_rate || 0} ₺/gün</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditClick(role)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Düzenle
                                </button>
                                <button
                                    onClick={() => handleDelete(role.id)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Sil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">
                            {isEditing ? 'Rol Düzenle' : 'Yeni Rol Ekle'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Rol Adı *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Örn: Ustabaşı, Mühendis, İşçi"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Varsayılan Günlük Ücret (₺)</label>
                                <input
                                    type="number"
                                    value={formData.default_daily_rate}
                                    onChange={(e) => setFormData({ ...formData, default_daily_rate: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm() }}
                                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
                                    disabled={isSubmitting}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-600/30 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : isEditing ? 'Güncelle' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
