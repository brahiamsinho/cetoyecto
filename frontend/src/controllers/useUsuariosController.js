import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useUsuariosController() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [form, setForm] = useState({ name: '', email: '', password: '', rol_id: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
      ])
      const items = usersRes.data.data?.data || usersRes.data.data || usersRes.data.users || usersRes.data || []
      setUsuarios(Array.isArray(items) ? items : [])
      setRoles(rolesRes.data.data || rolesRes.data.roles || rolesRes.data || [])
    } catch (err) { setAlert({ type: 'error', message: 'Error al cargar datos' }) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditTarget(null); setForm({ name: '', email: '', password: '', rol_id: roles[0]?.id || '' }); setShowForm(true) }
  const openEdit = (row) => { setEditTarget(row); setForm({ name: row.name || '', email: row.email || '', password: '', rol_id: row.rol_id || row.rol?.id || '' }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.name || !form.email) { setAlert({ type: 'error', message: 'Nombre y email son obligatorios.' }); return }
    if (!editTarget && !form.password) { setAlert({ type: 'error', message: 'Contraseña es obligatoria para nuevos usuarios.' }); return }
    setSaving(true)
    try {
      const payload = { name: form.name, email: form.email, rol_id: form.rol_id }
      if (form.password) payload.password = form.password
      if (editTarget) { await api.put(`/users/${editTarget.id}`, payload) } else { await api.post('/users', payload) }
      setAlert({ type: 'success', message: `Usuario ${editTarget ? 'actualizado' : 'creado'}.` }); setShowForm(false); fetchData()
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar' }) }
    finally { setSaving(false) }
  }

  const toggleActivo = async (usuario) => {
    try {
      if (usuario.activo) {
        await api.delete(`/users/${usuario.id}`)
        setAlert({ type: 'success', message: 'Usuario desactivado.' })
      } else {
        await api.put(`/users/${usuario.id}/activate`)
        setAlert({ type: 'success', message: 'Usuario activado.' })
      }
      fetchData()
    }
    catch (err) { setAlert({ type: 'error', message: 'Error al cambiar estado' }) }
  }

  return {
    state: { usuarios, roles, loading, showForm, editTarget, alert, form, saving },
    handlers: { openCreate, openEdit, setForm, setShowForm, handleSave, toggleActivo, setAlert, setEditTarget },
  }
}
