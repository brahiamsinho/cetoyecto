import { Link } from 'react-router-dom'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

export default function PostulantesView({ state, handlers }) {
  const { postulantes, loading, generating, completing, search, page, totalPages, deleteTarget, alert } = state
  const { setSearch, setPage, setDeleteTarget, setAlert, handleDelete, generarAleatorios, completarDatos } = handlers

  const columns = [
    { key: 'ci', label: 'CI' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'email', label: 'Email' },
    { key: 'carrera_primera', label: '1ra Opción', render: (val, row) => val?.nombre || row.carrera_primera_id || '—' },
    { key: 'carrera_segunda', label: '2da Opción', render: (val, row) => val?.nombre || row.carrera_segunda_id || '—' },
    { key: 'promedio_final', label: 'Promedio Final', render: (val) => val != null ? parseFloat(val).toFixed(2) : '—' },
    { key: 'estado_promedio', label: 'Estado', render: (val) => {
      const colors = { APROBADO: 'bg-green-100 text-green-800', REPROBADO: 'bg-red-100 text-red-800', null: 'bg-slate-100 text-slate-800', undefined: 'bg-slate-100 text-slate-800' }
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-800'}`}>{val || '—'}</span>
    }},
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Postulantes</h1>
        <div className="flex gap-2">
          <button
            onClick={completarDatos}
            disabled={loading || completing}
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:bg-violet-400 transition-colors"
          >
            {completing ? 'Completando...' : 'Completar Datos'}
          </button>
          <button
            onClick={generarAleatorios}
            disabled={loading || generating}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors"
          >
            {generating ? 'Generando 60...' : '+ Generar 60 Aleatorios'}
          </button>
          <Link to="/postulantes/nuevo" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            + Nuevo Postulante
          </Link>
        </div>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por CI o nombre..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
        />
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={postulantes}
          loading={loading}
          searchable={false}
          onView={(row) => `/postulantes/${row.id}`}
          onEdit={(row) => `/postulantes/${row.id}/editar`}
          onDelete={(row) => setDeleteTarget(row)}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Postulante"
        message={`¿Está seguro de eliminar a ${deleteTarget?.nombres} ${deleteTarget?.apellidos}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
