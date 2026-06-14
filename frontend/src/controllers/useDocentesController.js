import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useDocentesController() {
  const [docentes, setDocentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/docentes')
      setDocentes(res.data.data || res.data.docentes || res.data)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al cargar docentes' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/docentes/${deleteTarget.id}`)
      setAlert({ type: 'success', message: 'Docente eliminado.' })
      setDeleteTarget(null)
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al eliminar' })
      setDeleteTarget(null)
    }
  }

  const validarRequisitos = async (docente) => {
    try {
      const res = await api.post(`/docentes/${docente.id}/validar-requisitos`)
      setAlert({ type: 'success', message: res.data.message || `Requisitos validados: ${res.data.estado || 'OK'}` })
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al validar requisitos' })
    }
  }

  return {
    state: { docentes, loading, deleteTarget, alert },
    handlers: { handleDelete, validarRequisitos, setDeleteTarget, setAlert },
  }
}
