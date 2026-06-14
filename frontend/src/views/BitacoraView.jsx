import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'

function formatBoliviaDate(val) {
  if (!val) return '—'
  const date = new Date(val)
  return date.toLocaleString('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const ACCION_LABELS = {
  CREAR: 'Crear',
  ACTUALIZAR: 'Actualizar',
  ELIMINAR: 'Eliminar',
  DESACTIVAR: 'Desactivar',
  ACTIVAR: 'Activar',
  CAMBIAR_ESTADO: 'Cambiar Estado',
  INICIO_SESION: 'Inicio de Sesión',
  CIERRE_SESION: 'Cierre de Sesión',
  SOLICITUD_RECUPERACION: 'Solicitud de Recuperación',
  GENERAR: 'Generar',
  IMPORTAR: 'Importar',
  TOGGLE: 'Cambiar Estado',
  REGISTRAR_PAGO: 'Registrar Pago',
  ASIGNAR_GRUPO: 'Asignar Grupo',
  VALIDAR_REQUISITOS: 'Validar Requisitos',
  REGISTRAR_ASISTENCIA: 'Registrar Asistencia',
}

function formatAccion(val) {
  return ACCION_LABELS[val] || val || '—'
}

export default function BitacoraView({ state, handlers }) {
  const { bitacora, loading, alert, page, totalPages, filters } = state
  const { setPage, setFilters, setAlert } = handlers

  const columns = [
    { key: 'usuario', label: 'Usuario', render: (_val, row) => row.user?.name || '—' },
    { key: 'action', label: 'Acción', render: (val) => <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{formatAccion(val)}</span> },
    { key: 'module', label: 'Módulo', render: (val) => val || '—' },
    { key: 'created_at', label: 'Fecha y Hora (Bolivia)', render: (val) => formatBoliviaDate(val) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Bitácora</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Desde</label>
            <input type="date" value={filters.desde} onChange={(e) => { setFilters({ ...filters, desde: e.target.value }); setPage(1) }} className="px-3 py-1.5 border border-slate-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
            <input type="date" value={filters.hasta} onChange={(e) => { setFilters({ ...filters, hasta: e.target.value }); setPage(1) }} className="px-3 py-1.5 border border-slate-300 rounded text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={bitacora}
          loading={loading}
          searchable={false}
          actions={false}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="No hay registros en la bitácora."
        />
      </div>
    </div>
  )
}
