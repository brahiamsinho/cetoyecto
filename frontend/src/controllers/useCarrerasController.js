import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useCarrerasController() {
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [form, setForm] = useState({ codigo: '', nombre: '', cupo_maximo: '' })
  const [saving, setSaving] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [meritos, setMeritos] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/carreras')
      setCarreras(res.data.data || res.data.carreras || res.data)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al cargar carreras' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ codigo: '', nombre: '', cupo_maximo: '' })
    setShowForm(true)
  }

  const openEdit = (row) => {
    setEditTarget(row)
    setForm({ codigo: row.codigo || '', nombre: row.nombre || '', cupo_maximo: row.cupo_maximo || '' })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.codigo || !form.nombre || !form.cupo_maximo) {
      setAlert({ type: 'error', message: 'Todos los campos son obligatorios.' })
      return
    }
    setSaving(true)
    try {
      if (editTarget) {
        await api.put(`/carreras/${editTarget.id}`, form)
      } else {
        await api.post('/carreras', form)
      }
      setAlert({ type: 'success', message: `Carrera ${editTarget ? 'actualizada' : 'creada'} correctamente.` })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/carreras/${deleteTarget.id}`)
      setAlert({ type: 'success', message: 'Carrera eliminada.' })
      setDeleteTarget(null)
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al eliminar' })
      setDeleteTarget(null)
    }
  }

  const handleResolverMerito = async () => {
    setResolving(true)
    setMeritos(null)
    try {
      const res = await api.post('/cupos/resolver-merito')
      setMeritos(res.data.data)
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al resolver cupos por mérito.' })
    } finally {
      setResolving(false)
    }
  }

  return {
    state: { carreras, loading, showForm, editTarget, deleteTarget, alert, form, saving, resolving, meritos },
    handlers: { openCreate, openEdit, setForm, setShowForm, handleSave, handleDelete, setDeleteTarget, setAlert, setEditTarget, handleResolverMerito, setMeritos },
  }
}
