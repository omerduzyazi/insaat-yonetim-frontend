import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const location = useLocation()
    const [date, setDate] = useState(new Date())

    const { user } = useAuth() 

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar /> 
            
            <main className="flex-1 overflow-hidden flex flex-col relative">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                            Hoş Geldiniz, {user?.name || 'Misafir'} 👋
                        </h2>
                        <span className="text-xs text-slate-500 font-medium">
                            Bugün: {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border border-primary-200 shadow-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-6 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}