import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useBitacoraController() {
  const [bitacora, setBitacora] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ desde: '', hasta: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (filters.desde) params.fecha_desde = filters.desde
      if (filters.hasta) params.fecha_hasta = filters.hasta
      const res = await api.get('/bitacora', { params })
      const items = res.data.data?.data || res.data.data || res.data.bitacora || res.data.registros || []
      setBitacora(Array.isArray(items) ? items : [])
      setTotalPages(res.data.data?.last_page || res.data.last_page || res.data.total_pages || 1)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al cargar bitácora' })
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchData() }, [fetchData])

  return {
    state: { bitacora, loading, alert, page, totalPages, filters },
    handlers: { setPage, setFilters, setAlert },
  }
}
