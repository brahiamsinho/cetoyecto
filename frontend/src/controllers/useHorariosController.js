import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useHorariosController() {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [form, setForm] = useState({ dia: '', hora_inicio: '', hora_fin: '', turno: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/horarios'); setHorarios(res.data.data || res.data.horarios || res.data) }
    catch (err) { setAlert({ type: 'error', message: 'Error al cargar horarios' }) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditTarget(null); setForm({ dia: '', hora_inicio: '', hora_fin: '', turno: '' }); setShowForm(true) }
  const openEdit = (row) => { setEditTarget(row); setForm({ dia: row.dia || '', hora_inicio: row.hora_inicio?.substring(0, 5) || '', hora_fin: row.hora_fin?.substring(0, 5) || '', turno: row.turno || '' }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.dia || !form.hora_inicio || !form.hora_fin) { setAlert({ type: 'error', message: 'Día, hora inicio y hora fin son obligatorios.' }); return }
    setSaving(true)
    try {
      if (editTarget) { await api.put(`/horarios/${editTarget.id}`, form) } else { await api.post('/horarios', form) }
      setAlert({ type: 'success', message: `Horario ${editTarget ? 'actualizado' : 'creado'}.` }); setShowForm(false); fetchData()
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/horarios/${deleteTarget.id}`); setAlert({ type: 'success', message: 'Horario eliminado.' }); setDeleteTarget(null); fetchData() }
    catch (err) { setAlert({ type: 'error', message: 'Error al eliminar' }); setDeleteTarget(null) }
  }

  return {
    state: { horarios, loading, showForm, editTarget, deleteTarget, alert, form, saving },
    handlers: { openCreate, openEdit, setForm, setShowForm, handleSave, handleDelete, setDeleteTarget, setAlert, setEditTarget },
  }
}
