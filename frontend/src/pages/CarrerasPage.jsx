import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

export default function CarrerasPage() {
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [form, setForm] = useState({ codigo: '', nombre: '', cupo_maximo: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/carreras')
      setCarreras(res.data.data || res.data.carreras || res.data)
    } catch {
      setAlert({ type: 'error', message: 'Error al cargar carreras' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      await fetchData()
    }

    void load()
  }, [fetchData])

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

  const columns = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'cupo_maximo', label: 'Cupo Máximo' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Carreras y Cupos</h1>
        <button onClick={openCreate} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          + Nueva Carrera
        </button>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={carreras}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar carrera..."
          onEdit={(row) => openEdit(row)}
          onDelete={(row) => setDeleteTarget(row)}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{editTarget ? 'Editar Carrera' : 'Nueva Carrera'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                <input type="text" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cupo Máximo</label>
                <input type="number" value={form.cupo_maximo} onChange={(e) => setForm({ ...form, cupo_maximo: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded border border-slate-300 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Carrera"
        message={`¿Está seguro de eliminar ${deleteTarget?.nombre}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
