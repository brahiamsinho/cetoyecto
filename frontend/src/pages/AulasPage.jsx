import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

const getFloorLabel = (ubicacion) => {
  const match = String(ubicacion || '').match(/piso\s*(\d+)/i)
  return match ? `Piso ${match[1]}` : 'Sin piso'
}

export default function AulasPage() {
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

  const handleSave = async () => {
    if (!form.codigo || !form.nombre) { setAlert({ type: 'error', message: 'Código y nombre son obligatorios.' }); return }
    setSaving(true)
    try {
      if (editTarget) { await api.put(`/aulas/${editTarget.id}`, form) } else { await api.post('/aulas', form) }
      setAlert({ type: 'success', message: `Aula ${editTarget ? 'actualizada' : 'creada'}.` }); setShowForm(false); fetchData()
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/aulas/${deleteTarget.id}`); setAlert({ type: 'success', message: 'Aula eliminada.' }); setDeleteTarget(null); fetchData() }
    catch (err) { setAlert({ type: 'error', message: 'Error al eliminar' }); setDeleteTarget(null) }
  }

  const columns = [
    { key: 'codigo', label: 'Código' }, { key: 'nombre', label: 'Nombre' },
    { key: 'capacidad', label: 'Capacidad', render: (val) => val ?? '—' },
    { key: 'ubicacion', label: 'Ubicación', render: (val) => val || '—' },
  ]

  const floorCounts = aulas.reduce((acc, aula) => {
    const floor = getFloorLabel(aula.ubicacion)
    acc[floor] = (acc[floor] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Aulas</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Nueva Aula</button>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(floorCounts).sort(([a], [b]) => a.localeCompare(b)).map(([floor, count]) => (
          <div key={floor} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{floor}</div>
            <div className="text-xl font-semibold text-slate-800">{count} aulas</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable columns={columns} data={aulas} loading={loading} searchable={true} searchPlaceholder="Buscar aula..." onEdit={(row) => openEdit(row)} onDelete={(row) => setDeleteTarget(row)} />
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{editTarget ? 'Editar Aula' : 'Nueva Aula'}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Código</label><input type="text" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label><input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Capacidad</label><input type="number" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label><input type="text" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded border border-slate-300 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteTarget} title="Eliminar Aula" message="¿Está seguro?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
