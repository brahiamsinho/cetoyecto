import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowUpTrayIcon,
  ArchiveBoxIcon,
  XMarkIcon,
  ChevronDownIcon,
  LockClosedIcon,
  ChartBarIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const menuPackages = [
  {
    id: 'acceso',
    label: 'Gestión de Acceso y Seguridad',
    icon: LockClosedIcon,
    items: [
      { label: 'Usuarios',                    path: '/usuarios',             icon: ShieldCheckIcon,         roles: ['CPD'] },
      { label: 'Importar cuentas (Excel/CSV)',path: '/importaciones',        icon: ArrowUpTrayIcon,         roles: ['CPD'] },
    ],
  },
  {
    id: 'bitacora',
    label: 'Gestión de Bitácora y Auditoría',
    icon: ArchiveBoxIcon,
    items: [
      { label: 'Bitácora', path: '/bitacora', icon: ArchiveBoxIcon, roles: ['CPD'] },
    ],
  },
  {
    id: 'postulantes',
    label: 'Gestión de Postulantes e Inscripción',
    icon: UsersIcon,
    items: [
      { label: 'Postulantes', path: '/postulantes', icon: UsersIcon, roles: ['CPD', 'Jefatura'] },
    ],
  },
  {
    id: 'docente',
    label: 'Gestión Docente y Asignación Académica',
    icon: ClipboardDocumentCheckIcon,
    items: [
      { label: 'Docentes',      path: '/docentes',      icon: ClipboardDocumentCheckIcon, roles: ['CPD', 'Jefatura'] },
      { label: 'Materias',      path: '/materias',      icon: BookOpenIcon,               roles: ['CPD', 'Jefatura'] },
      { label: 'Horarios',      path: '/horarios',      icon: ClockIcon,                  roles: ['CPD', 'Jefatura'] },
      { label: 'Carga Horaria', path: '/carga-horaria', icon: CalendarIcon,               roles: ['CPD', 'Jefatura', 'Docente'] },
      { label: 'Asistencias',   path: '/asistencias',   icon: ClockIcon,                  roles: ['CPD', 'Jefatura', 'Docente'] },
    ],
  },
  {
    id: 'admision',
    label: 'Gestión de Admisión, Cupos y Grupos',
    icon: BuildingOfficeIcon,
    items: [
      { label: 'Carreras', path: '/carreras', icon: BriefcaseIcon,      roles: ['CPD', 'Jefatura'] },
      { label: 'Aulas',    path: '/aulas',    icon: BuildingOfficeIcon, roles: ['CPD', 'Jefatura'] },
      { label: 'Grupos',   path: '/grupos',   icon: UserGroupIcon,      roles: ['CPD', 'Jefatura', 'Docente'] },
    ],
  },
  {
    id: 'evaluacion',
    label: 'Gestión de Evaluación Académica',
    icon: AcademicCapIcon,
    items: [
      { label: 'Notas y Promedios', path: '/notas', icon: AcademicCapIcon, roles: ['Jefatura', 'Docente'] },
    ],
  },
  {
    id: 'dashboard',
    label: 'Gestión de Dashboard y Reportes Inteligentes',
    icon: ChartBarIcon,
    items: [
      { label: 'Dashboard',        path: '/',          icon: HomeIcon,                roles: ['CPD', 'Jefatura', 'Autoridad'] },
      { label: 'Portal académico', path: '/',          icon: HomeIcon,                roles: ['Postulante'] },
      { label: 'Reportes con IA',  path: '/reportes',  icon: MicrophoneIcon,          roles: ['CPD', 'Jefatura', 'Autoridad'] },
    ],
  },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const userRole = user?.rol?.nombre || user?.rol

  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(menuPackages.map((p) => [p.id, true]))
  )

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white
          transform transition-transform duration-200 ease-in-out overflow-y-auto
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Sistema de</h1>
              <h1 className="text-lg font-bold leading-tight">Admisión</h1>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {menuPackages.map((pkg) => {
            const visibleItems = pkg.items.filter((item) => item.roles.includes(userRole))
            if (visibleItems.length === 0) return null
            const isOpen = expanded[pkg.id]

            return (
              <div key={pkg.id}>
                <button
                  onClick={() => toggle(pkg.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <pkg.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{pkg.label}</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-700 pl-2">
                    {visibleItems.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.path}
                        end={item.path === '/'}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
