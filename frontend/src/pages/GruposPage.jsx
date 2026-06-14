import { useState, useEffect } from 'react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'

export default function GruposPage() {
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const gruposVisibles = Array.isArray(grupos) ? grupos.filter((grupo) => grupo.habilitado) : []

  const refreshGroups = async () => {
    setLoading(true)
    try {
      const res = await api.get('/grupos', { params: { visible: 1 } })
      setGrupos(res.data.data || res.data.grupos || res.data)
    } catch {
      setAlert({ type: 'error', message: 'Error al cargar grupos' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/grupos', { params: { visible: 1 } })
        setGrupos(res.data.data || res.data.grupos || res.data)
      } catch {
        setAlert({ type: 'error', message: 'Error al cargar grupos' })
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const generarGrupos = async () => {
    setGenerating(true)
    setAlert({ type: '', message: '' })
    try {
      const res = await api.post('/grupos/generar')
      setAlert({ type: 'success', message: res.data.message || 'Grupos generados correctamente.' })
      refreshGroups()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al generar grupos' })
    } finally {
      setGenerating(false)
    }
  }

  const formatMaterias = (materias) => {
    if (!Array.isArray(materias) || materias.length === 0) return '—'
    return materias
      .map((materia) => materia?.nombre || materia?.codigo || materia)
      .filter(Boolean)
      .join(', ')
  }

  const columns = [
    { key: 'nombre', label: 'Grupo' },
    { key: 'materias', label: 'Materias', render: (val) => formatMaterias(val) },
    { key: 'habilitado', label: 'Estado', render: (val) => val ? 'Habilitado' : 'Bloqueado' },
    { key: 'estudiantes_count', label: 'Estudiantes', render: (val) => val ?? 0 },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Grupos</h1>
        <button
          onClick={generarGrupos}
          disabled={generating}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
        >
          {generating ? 'Generando...' : 'Generar Grupos'}
        </button>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={gruposVisibles}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar grupo..."
          onView={(row) => row.habilitado ? `/grupos/${row.id}` : null}
          emptyMessage="No hay grupos habilitados todavía."
        />
      </div>
    </div>
  )
}
