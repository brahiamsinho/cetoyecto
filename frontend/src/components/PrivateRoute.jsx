import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function PrivateRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) return <LoadingSpinner size="lg" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.rol?.nombre || user?.rol)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Acceso Denegado</h2>
          <p className="text-slate-500 mt-2">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }
  return children
}
