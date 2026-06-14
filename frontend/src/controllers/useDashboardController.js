import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export function useDashboardController() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, loading: authLoading } = useAuth()

  const roleName = user?.rol?.nombre || user?.rol

  useEffect(() => {
    if (authLoading) return

    if (roleName === 'Postulante') {
      setLoading(false)
      return
    }

    api.get('/dashboard/stats')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar dashboard'))
      .finally(() => setLoading(false))
  }, [authLoading, roleName])

  return {
    state: { data, loading: authLoading || loading, error },
    handlers: {},
  }
}
