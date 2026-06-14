import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

export default function UsuariosPage() {
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
      setUsuarios(usersRes.data.data || usersRes.data.users || usersRes.data || [])
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

  const columns = [
    { key: 'name', label: 'Nombre' }, { key: 'email', label: 'Email' },
    { key: 'rol', label: 'Rol', render: (val) => <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{val?.nombre || val}</span> },
    { key: 'activo', label: 'Activo', render: (val) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{val ? 'Sí' : 'No'}</span> },
    { key: 'toggle', label: 'Acción', render: (_, row) => row.activo ? (
      <button onClick={() => toggleActivo(row)} className="text-red-600 hover:text-red-800 text-sm font-medium">Desactivar</button>
    ) : (
      <button onClick={() => toggleActivo(row)} className="text-green-600 hover:text-green-800 text-sm font-medium">Activar</button>
    ) },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios y Roles</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Nuevo Usuario</button>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable columns={columns} data={usuarios} loading={loading} searchable={true} searchPlaceholder="Buscar usuario..." onEdit={(row) => openEdit(row)} emptyMessage="No hay usuarios registrados." />
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{editTarget ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{editTarget ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select value={form.rol_id} onChange={(e) => setForm({ ...form, rol_id: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Seleccione...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded border border-slate-300 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
