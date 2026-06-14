import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useMateriasController() {
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [form, setForm] = useState({ codigo: '', nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/materias'); setMaterias(res.data.data || res.data.materias || res.data) }
    catch (err) { setAlert({ type: 'error', message: 'Error al cargar materias' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditTarget(null); setForm({ codigo: '', nombre: '', descripcion: '' }); setShowForm(true) }
  const openEdit = (row) => { setEditTarget(row); setForm({ codigo: row.codigo || '', nombre: row.nombre || '', descripcion: row.descripcion || '' }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.codigo || !form.nombre) { setAlert({ type: 'error', message: 'Código y nombre son obligatorios.' }); return }
    setSaving(true)
    try {
      if (editTarget) { await api.put(`/materias/${editTarget.id}`, form) } else { await api.post('/materias', form) }
      setAlert({ type: 'success', message: `Materia ${editTarget ? 'actualizada' : 'creada'}.` }); setShowForm(false); fetchData()
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/materias/${deleteTarget.id}`); setAlert({ type: 'success', message: 'Materia eliminada.' }); setDeleteTarget(null); fetchData() }
    catch (err) { setAlert({ type: 'error', message: 'Error al eliminar' }); setDeleteTarget(null) }
  }

  return {
    state: { materias, loading, showForm, editTarget, deleteTarget, alert, form, saving },
    handlers: { openCreate, openEdit, setForm, setShowForm, handleSave, handleDelete, setDeleteTarget, setAlert, setEditTarget },
  }
}
