import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

export default function HorariosPage() {
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

  const columns = [
    { key: 'dia', label: 'Día' }, { key: 'hora_inicio', label: 'Hora Inicio' }, { key: 'hora_fin', label: 'Hora Fin' },
    { key: 'turno', label: 'Turno', render: (val) => val || '—' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Horarios</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Nuevo Horario</button>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable columns={columns} data={horarios} loading={loading} searchable={true} searchPlaceholder="Buscar horario..." onEdit={(row) => openEdit(row)} onDelete={(row) => setDeleteTarget(row)} />
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{editTarget ? 'Editar Horario' : 'Nuevo Horario'}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Día</label>
                <select value={form.dia} onChange={(e) => setForm({ ...form, dia: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Seleccione...</option>
                  {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio</label><input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Hora Fin</label><input type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Turno</label><input type="text" value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Mañana/Tarde/Noche" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded border border-slate-300 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteTarget} title="Eliminar Horario" message="¿Está seguro?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
