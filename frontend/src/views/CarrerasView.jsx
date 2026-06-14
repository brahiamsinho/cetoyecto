import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'
import { TrophyIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function CarrerasView({ state, handlers }) {
  const { carreras, loading, showForm, editTarget, deleteTarget, alert, form, saving, resolving, meritos } = state
  const { openCreate, openEdit, setForm, setShowForm, handleSave, handleDelete, setDeleteTarget, setAlert, handleResolverMerito, setMeritos } = handlers

  const columns = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'cupo_maximo', label: 'Cupo Máximo' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Carreras y Cupos</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResolverMerito}
            disabled={resolving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <TrophyIcon className="h-4 w-4" />
            {resolving ? 'Procesando...' : 'Resolver por Mérito'}
          </button>
          <button onClick={openCreate} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            + Nueva Carrera
          </button>
        </div>
      </div>

      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={carreras}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar carrera..."
          onEditClick={(row) => openEdit(row)}
          onDelete={(row) => setDeleteTarget(row)}
        />
      </div>

      {/* Merit resolution result modal */}
      {meritos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setMeritos(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-amber-100 rounded-xl p-2">
                <TrophyIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Resolución por Mérito</h3>
                <p className="text-xs text-slate-500">Cupos asignados según promedio final descendente</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{meritos.total_admitidos}</p>
                <p className="text-xs text-green-600 mt-0.5">Admitidos</p>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{meritos.total_rechazados}</p>
                <p className="text-xs text-red-600 mt-0.5">Rechazados</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                <p className="text-2xl font-bold text-slate-700">{meritos.total_reprobados_sin_cupo}</p>
                <p className="text-xs text-slate-500 mt-0.5">Reprobados</p>
              </div>
            </div>

            <div className="space-y-2">
              {meritos.por_carrera.map((c) => (
                <div key={c.carrera} className="rounded-lg border border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-slate-800">{c.carrera}</p>
                    <span className="text-xs text-slate-500">Cupo máx: {c.cupo_maximo}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs mb-2">
                    <span className="flex items-center gap-1 text-green-700">
                      <CheckCircleIcon className="h-3.5 w-3.5" /> {c.admitidos} admitidos
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <XCircleIcon className="h-3.5 w-3.5 text-slate-400" /> {c.disponibles} disponibles
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (c.admitidos / c.cupo_maximo) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setMeritos(null)}
              className="mt-5 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit form modal */}
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
