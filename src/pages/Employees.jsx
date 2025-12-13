import { useState, useEffect } from 'react'
import { UserPlus, Phone, Briefcase, X, Search, Trash2, Edit2, AlertCircle, Loader2, HardHat, PlusCircle } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Skeleton from '../components/ui/Skeleton'

export default function Employees() {
    const [employees, setEmployees] = useState([])
    const [projects, setProjects] = useState([])
    const [roles, setRoles] = useState([])
    
    const [showModal, setShowModal] = useState(false)
    const [showRoleInput, setShowRoleInput] = useState(false)
    const [newRoleName, setNewRoleName] = useState('')
    
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)
    
    // role (string) yerine RoleId (int) kullanıyoruz
    const [formData, setFormData] = useState({ name: '', RoleId: '', ProjectId: '', phone: '', daily_rate: '' })
    
    const { showToast } = useToast()

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setIsLoading(true)
        try {
            // 3 farklı veriyi paralel çekiyoruz: Çalışanlar, Projeler, Roller
            const [empRes, projRes, roleRes] = await Promise.all([
                api.get('/employees'),
                api.get('/projects'),
                api.get('/roles') // Yeni rota
            ])
            setEmployees(empRes.data)
            setProjects(projRes.data)
            setRoles(roleRes.data)
        } catch (error) {
            console.error("Veri yükleme hatası:", error)
            showToast('Veriler yüklenirken hata oluştu.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({ name: '', RoleId: '', ProjectId: '', phone: '', daily_rate: '' })
        setIsEditing(false)
        setEditId(null)
        setShowRoleInput(false)
    }

    const handleEditClick = (employee) => {
        setFormData({
            name: employee.name,
            RoleId: employee.RoleId || '', // Backend'den gelen ID
            ProjectId: employee.ProjectId || '',
            phone: employee.phone || '',
            daily_rate: employee.daily_rate || ''
        })
        setEditId(employee.id)
        setIsEditing(true)
        setShowModal(true)
    }

    // --- YENİ ROL EKLEME FONKSİYONU ---
    const handleAddRole = async () => {
        if (!newRoleName.trim()) return;
        
        try {
            const res = await api.post('/roles', { name: newRoleName });
            setRoles([...roles, res.data]); // Listeye ekle
            setFormData({ ...formData, RoleId: res.data.id }); // Formda otomatik seç
            setNewRoleName('');
            setShowRoleInput(false);
            showToast('Yeni görev tanımı eklendi.', 'success');
        } catch (error) {
            showToast('Bu görev zaten mevcut olabilir.', 'warning');
        }
    }
    // ----------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return;

        // Validasyon: RoleId ve ProjectId boşsa null gönderilmeli (Veritabanı ilişkisi için)
        const payload = {
            ...formData,
            ProjectId: formData.ProjectId === '' ? null : formData.ProjectId,
            RoleId: formData.RoleId === '' ? null : formData.RoleId
        }

        if (!payload.RoleId) {
            showToast('Lütfen bir görev (rol) seçiniz.', 'warning');
            return;
        }

        setIsSubmitting(true)
        try {
            if (isEditing) {
                await api.put(`/employees/${editId}`, payload)
                showToast('Personel güncellendi.', 'success')
            } else {
                await api.post('/employees', payload)
                showToast('Personel eklendi.', 'success')
            }
            fetchInitialData() // Listeyi tazelemek en garantisi
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
        if (window.confirm('Bu çalışanı silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/employees/${id}`)
                setEmployees(employees.filter(emp => emp.id !== id))
                showToast('Personel silindi.', 'info')
            } catch (err) {
                showToast('Silme işlemi başarısız.', 'error')
            }
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Çalışan Ekibi</h1>
                    <p className="text-slate-500 mt-1">Personel listesi, görevler ve projeler</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setShowModal(true) }} 
                    className="btn-primary shadow-xl shadow-primary-500/20"
                >
                    <UserPlus size={20} /> Yeni Çalışan Ekle
                </button>
            </div>

            <div className="card border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden p-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="İsim, rol veya proje ara..." className="input-field pl-10 bg-white" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">İsim</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Görevi (Rol)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proje</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefon</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Günlük Ücret</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 ml-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></td>
                                    </tr>
                                ))
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle size={32} className="text-slate-300" />
                                            <p>Henüz kayıtlı çalışan yok.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shadow-inner group-hover:from-primary-100 group-hover:to-primary-200 group-hover:text-primary-700 transition-all">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{emp.name}</div>
                                                <div className="text-xs text-slate-400">ID: #{emp.id}</div>
                                            </div>
                                        </td>
                                        
                                        {/* ROL GÖSTERİMİ (Normalize edilmiş veri) */}
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="flex items-center gap-2 bg-slate-100 w-fit px-3 py-1 rounded-full text-xs font-medium text-slate-700 border border-slate-200">
                                                <Briefcase size={12} className="text-slate-400" /> 
                                                {/* Backend'den emp.Role.name geliyor */}
                                                {emp.Role ? emp.Role.name : 'Tanımsız'}
                                            </span>
                                        </td>

                                        {/* PROJE GÖSTERİMİ */}
                                        <td className="px-6 py-4 text-slate-600">
                                            {emp.Project ? (
                                                <span className="flex items-center gap-2 text-primary-700 font-medium bg-primary-50 px-3 py-1 rounded-lg text-xs border border-primary-100">
                                                    <HardHat size={12} /> {emp.Project.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Atanmadı</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex items-center gap-2 font-mono text-sm text-slate-500">
                                                <Phone size={14} className="text-slate-400" /> {emp.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-700">
                                            {emp.daily_rate ? `₺${Number(emp.daily_rate).toLocaleString('tr-TR')}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditClick(emp)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />

                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-black/5">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Düzenle' : 'Yeni Kayıt'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                    <input type="text" placeholder="Örn: Ahmet Yılmaz" className="input-field"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>

                                {/* GÖREVİ (ROL) SEÇİMİ VE EKLEME */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Görevi</label>
                                    {!showRoleInput ? (
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <select 
                                                    className="input-field appearance-none"
                                                    value={formData.RoleId}
                                                    onChange={e => setFormData({ ...formData, RoleId: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Görev Seçiniz</option>
                                                    {roles.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowRoleInput(true)}
                                                className="px-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 border border-primary-200"
                                                title="Yeni Görev Tanımı Ekle"
                                            >
                                                <PlusCircle size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 animate-fade-in">
                                            <input 
                                                type="text" 
                                                placeholder="Yeni Görev Adı (Örn: Formen)" 
                                                className="input-field flex-1"
                                                value={newRoleName}
                                                onChange={e => setNewRoleName(e.target.value)}
                                                autoFocus
                                            />
                                            <button type="button" onClick={handleAddRole} className="btn-primary py-2 px-4 text-sm">Ekle</button>
                                            <button type="button" onClick={() => setShowRoleInput(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
                                        </div>
                                    )}
                                </div>

                                {/* PROJE SEÇİMİ */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Proje</label>
                                    <div className="relative">
                                        <select 
                                            className="input-field appearance-none"
                                            value={formData.ProjectId}
                                            onChange={e => setFormData({ ...formData, ProjectId: e.target.value })}
                                        >
                                            <option value="">Proje Seçiniz (İsteğe Bağlı)</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>{project.name}</option>
                                            ))}
                                        </select>
                                        <HardHat className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                        <input type="tel" placeholder="05XX..." className="input-field"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Günlük (₺)</label>
                                        <input type="number" placeholder="0.00" className="input-field"
                                            value={formData.daily_rate} onChange={e => setFormData({ ...formData, daily_rate: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">İptal</button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                                    {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Kaydediliyor...</> : <>{isEditing ? 'Güncelle' : 'Kaydet ve Ekle'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}