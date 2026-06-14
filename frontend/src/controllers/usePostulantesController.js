import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const normalizeText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

export function usePostulantesController() {
  const [postulantes, setPostulantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })

  const refreshPostulantes = useCallback(async ({ pageOverride, searchOverride } = {}) => {
    setLoading(true)
    setAlert({ type: '', message: '' })
    try {
      const params = { page: pageOverride ?? page, per_page: 15 }
      const activeSearch = searchOverride ?? search
      const res = await api.get('/postulantes', { params })
      const items = res.data.data?.data || res.data.data || res.data.postulantes || res.data
      const list = Array.isArray(items) ? items : []
      const filtered = activeSearch
        ? list.filter((item) => {
          const haystack = normalizeText([item.ci, item.nombres, item.apellidos, item.email].filter(Boolean).join(' '))
          return haystack.includes(normalizeText(activeSearch))
        })
        : list
      setPostulantes(filtered)
      setTotalPages(res.data.data?.last_page || res.data.last_page || res.data.total_pages || 1)
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al cargar postulantes' })
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const load = async () => {
      await refreshPostulantes()
    }

    void load()
  }, [refreshPostulantes])

  const generarAleatorios = async () => {
    setGenerating(true)
    setAlert({ type: '', message: '' })

    try {
      const res = await api.post('/postulantes/generar-aleatorios')
      setAlert({ type: 'success', message: res.data.message || 'Postulantes aleatorios generados correctamente.' })
      setPage(1)
      await refreshPostulantes({ pageOverride: 1 })
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al generar postulantes aleatorios' })
    } finally {
      setGenerating(false)
    }
  }

  const completarDatos = async () => {
    setCompleting(true)
    setAlert({ type: '', message: '' })

    try {
      const res = await api.post('/postulantes/completar-datos')
      setAlert({ type: 'success', message: res.data.message || 'Datos completados correctamente.' })
      await refreshPostulantes()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al completar datos' })
    } finally {
      setCompleting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/postulantes/${deleteTarget.id}`)
      setAlert({ type: 'success', message: 'Postulante eliminado correctamente.' })
      setDeleteTarget(null)
      await refreshPostulantes()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al eliminar' })
      setDeleteTarget(null)
    }
  }

  return {
    state: { postulantes, loading, generating, completing, search, page, totalPages, deleteTarget, alert },
    handlers: { setSearch, setPage, setDeleteTarget, setAlert, handleDelete, refreshPostulantes, generarAleatorios, completarDatos },
  }
}
