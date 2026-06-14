import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function usePromediosController() {
  const [postulantes, setPostulantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [alert, setAlert] = useState({ type: '', message: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/postulantes', { params: { per_page: 100 } })
      const items = res.data.data?.data || res.data.data || res.data.postulantes || res.data
      const data = Array.isArray(items) ? items : []
      setPostulantes(data.filter((p) => p.promedio_final != null))
    } catch {
      setAlert({ type: 'error', message: 'Error al cargar promedios' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return {
    state: { postulantes, loading, search, alert },
    handlers: { setSearch, setAlert },
  }
}
