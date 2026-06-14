import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Bars3Icon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import Sidebar from './Sidebar'
import ChatWidget from './ChatWidget'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 shadow-sm px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 hover:text-slate-900">
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">Sistema de Admisión Universitaria</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <UserCircleIcon className="h-6 w-6 text-slate-500" />
              <span className="hidden sm:inline font-medium">{user?.name}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.rol?.nombre || user?.rol}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}
