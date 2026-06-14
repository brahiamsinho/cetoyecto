import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'

export default function NotasView({ state, handlers }) {
  const { postulantes, loading, search, alert } = state
  const { setSearch, setAlert } = handlers

  const columns = [
    { key: 'ci', label: 'CI' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'promedio_final', label: 'Promedio Final', render: (val) => val != null ? parseFloat(val).toFixed(2) : '—' },
    { key: 'estado_promedio', label: 'Estado', render: (val) => {
      const colors = { APROBADO: 'bg-green-100 text-green-800', REPROBADO: 'bg-red-100 text-red-800', PENDIENTE: 'bg-yellow-100 text-yellow-800', null: 'bg-slate-100 text-slate-800', undefined: 'bg-slate-100 text-slate-800' }
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-800'}`}>{val || '—'}</span>
    }},
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Notas y Promedios</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={postulantes}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar postulante..."
          searchValue={search}
          onSearch={setSearch}
          onView={(row) => `/notas/${row.id}`}
          emptyMessage="No se encontraron postulantes."
        />
      </div>
    </div>
  )
}
