import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'

export default function PromediosView({ state, handlers }) {
  const { postulantes, loading, search, alert } = state
  const { setSearch, setAlert } = handlers

  const columns = [
    { key: 'ci', label: 'CI' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'carrera_primera_opcion', label: 'Carrera', render: (val) => val || '—' },
    { key: 'promedio_final', label: 'Promedio Final', render: (val, row) => (
      <span className={`font-bold ${parseFloat(val) >= 60 ? 'text-green-600' : 'text-red-600'}`}>
        {parseFloat(val).toFixed(2)}
      </span>
    )},
    { key: 'estado_promedio', label: 'Estado', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${val === 'APROBADO' ? 'bg-green-100 text-green-800' : val === 'REPROBADO' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
        {val || '—'}
      </span>
    )},
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Promedios Finales</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={postulantes}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar por CI o nombre..."
          searchValue={search}
          onSearch={setSearch}
          emptyMessage="No hay postulantes con promedios registrados."
        />
      </div>
    </div>
  )
}
