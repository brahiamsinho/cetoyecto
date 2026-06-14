import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'
import { useAuth } from '../context/AuthContext'

export default function GruposView({ state, handlers }) {
  const { grupos, loading, generating, alert } = state
  const { generarGrupos, setAlert } = handlers
  const { user } = useAuth()
  const canGenerate = (user?.rol?.nombre || user?.rol) === 'CPD'
  const capacidadGrupo = grupos[0]?.capacidad_grupo ?? grupos[0]?.cupo_maximo ?? 70
  const gruposVisibles = Array.isArray(grupos) ? grupos.filter((grupo) => grupo.habilitado) : []

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
    { key: 'estudiantes_count', label: 'Inscritos', render: (val) => val ?? 0 },
    { key: 'habilitado', label: 'Estado', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${val ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
        {val ? 'Habilitado' : 'Bloqueado'}
      </span>
    ) },
    { key: 'cupo_disponible', label: 'Disponible', render: (val, row) => {
      const inscritos = row.estudiantes_count || 0
      const capacidad = row.capacidad_grupo ?? row.cupo_maximo ?? capacidadGrupo
      const disponible = val ?? capacidad - inscritos
      const pct = capacidad > 0 ? (inscritos / capacidad) * 100 : 0
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-200 rounded-full h-2 w-24">
            <div className={`h-2 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-xs font-medium">{disponible}</span>
        </div>
      )
    }},
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Grupos</h1>
        {canGenerate && (
          <button
            onClick={generarGrupos}
            disabled={generating}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            {generating ? 'Generando...' : 'Generar Grupos'}
          </button>
        )}
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={gruposVisibles}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar grupo..."
          onView={(row) => (row.habilitado ? `/grupos/${row.id}` : null)}
          emptyMessage="No hay grupos habilitados todavía."
        />
      </div>
    </div>
  )
}
