import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useAulasController() {
  const [aulas, setAulas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [form, setForm] = useState({ codigo: '', nombre: '', capacidad: '', ubicacion: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/aulas'); setAulas(res.data.data || res.data.aulas || res.data) }
    catch (err) { setAlert({ type: 'error', message: 'Error al cargar aulas' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditTarget(null); setForm({ codigo: '', nombre: '', capacidad: '', ubicacion: '' }); setShowForm(true) }
  const openEdit = (row) => { setEditTarget(row); setForm({ codigo: row.codigo || '', nombre: row.nombre || '', capacidad: row.capacidad || '', ubicacion: row.ubicacion || '' }); setShowForm(true) }

  const normalizeForm = (currentForm) => ({
    codigo: String(currentForm.codigo ?? '').trim(),
    nombre: String(currentForm.nombre ?? '').trim(),
    capacidad: currentForm.capacidad === '' || currentForm.capacidad === null ? '' : Number(currentForm.capacidad),
    ubicacion: String(currentForm.ubicacion ?? '').trim(),
  })

  const handleSave = async () => {
    if (!form.codigo || !form.nombre) { setAlert({ type: 'error', message: 'Código y nombre son obligatorios.' }); return }
    setSaving(true)
    try {
      const payload = normalizeForm(form)
      if (editTarget) { await api.put(`/aulas/${editTarget.id}`, payload) } else { await api.post('/aulas', payload) }
      setAlert({ type: 'success', message: `Aula ${editTarget ? 'actualizada' : 'creada'}.` }); setShowForm(false); fetchData()
    } catch (err) {
      const validationErrors = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : ''
      setAlert({ type: 'error', message: validationErrors || err.response?.data?.message || 'Error al guardar' })
    }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/aulas/${deleteTarget.id}`); setAlert({ type: 'success', message: 'Aula eliminada.' }); setDeleteTarget(null); fetchData() }
    catch (err) { setAlert({ type: 'error', message: 'Error al eliminar' }); setDeleteTarget(null) }
  }

  return {
    state: { aulas, loading, showForm, editTarget, deleteTarget, alert, form, saving },
    handlers: { openCreate, openEdit, setForm, setShowForm, handleSave, handleDelete, setDeleteTarget, setAlert, setEditTarget },
  }
}
