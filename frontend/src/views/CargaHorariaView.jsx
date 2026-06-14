import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

const formatDisplayValue = (value) => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' || typeof value === 'number') return value
  if (Array.isArray(value)) {
    const items = value
      .map((item) => formatDisplayValue(item))
      .filter((item) => item && item !== '—')
    if (items.length === 0) return '—'
    return items.join(', ')
  }
  if (typeof value === 'object') {
    if (value.dia && value.hora_inicio && value.hora_fin) {
      return `${value.dia} ${value.hora_inicio}-${value.hora_fin}`
    }
    const nombreCompleto = [value.nombres, value.apellidos].filter(Boolean).join(' ').trim()
    return nombreCompleto || value.nombre || value.codigo || '—'
  }
  return String(value)
}

const formatSchedulePattern = (horario) => {
  if (!horario || typeof horario !== 'object') return null

  const dia = String(horario.dia || '').toLowerCase()
  const inicio = horario.hora_inicio || horario.horaInicio
  const fin = horario.hora_fin || horario.horaFin

  if (!inicio || !fin) return null

  if (['lunes', 'miercoles', 'miércoles', 'viernes'].includes(dia)) {
    return `Lunes, Miércoles y Viernes ${inicio}-${fin}`
  }

  if (['martes', 'jueves'].includes(dia)) {
    return `Martes y Jueves ${inicio}-${fin}`
  }

  if (dia === 'sabado' || dia === 'sábado') {
    return `Sábado ${inicio}-${fin}`
  }

  return `${horario.dia} ${inicio}-${fin}`
}

export default function CargaHorariaView({ state, handlers }) {
  const { asignaciones, loading, showForm, deleteTarget, alert, form, saving, regenerating, regenerationSummary, docentes, grupos, materias, aulas, horarios, user } = state
  const { openCreate, setForm, setShowForm, handleSave, handleDelete, handleRegenerateDataset, setDeleteTarget, setAlert } = handlers
  const roleName = user?.rol?.nombre || user?.rol
  const safeAsignaciones = Array.isArray(asignaciones) ? asignaciones : []

  const aulaCounts = safeAsignaciones.reduce((acc, row) => {
    const key = row.aula_display || row.aula_nombre || row.aula?.nombre || 'Sin aula'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const columns = [
    { key: 'docente', label: 'Docente', render: (val, row) => formatDisplayValue(row.docente_nombre || val) },
    { key: 'grupo', label: 'Grupo', render: (val, row) => formatDisplayValue(row.grupo_nombre || val) },
    { key: 'materia', label: 'Materia', render: (val, row) => formatDisplayValue(row.materia_nombre || val) },
    { key: 'aula', label: 'Aula', render: (val, row) => formatDisplayValue(row.aula_display || row.aula_nombre || val) },
    { key: 'horario', label: 'Horario', render: (val, row) => formatDisplayValue(row.horario_display || row.horario_descripcion || formatSchedulePattern(row.horario) || val) },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Carga Horaria</h1>
        <div className="flex flex-wrap gap-2">
          {roleName !== 'Docente' && (
            <>
              <button
                onClick={handleRegenerateDataset}
                disabled={regenerating}
                className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                {regenerating ? 'Regenerando...' : '↺ Regenerar'}
              </button>
              <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                + Nueva Asignación
              </button>
            </>
          )}
        </div>
      </div>
      {regenerationSummary && (
        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">Cargas: {regenerationSummary.carga_horaria_total}</span>
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800">Asistencias: {regenerationSummary.asistencias_total}</span>
        </div>
      )}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(aulaCounts).map(([aula, count]) => (
          <div key={aula} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Aula</div>
            <div className="text-sm font-semibold text-slate-800">{aula}</div>
            <div className="text-lg font-bold text-slate-700">{count} usos</div>
          </div>
        ))}
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable columns={columns} data={safeAsignaciones} loading={loading} searchable={true} searchPlaceholder="Buscar asignación..." onDelete={roleName !== 'Docente' ? (row) => setDeleteTarget(row) : null} actions={false} emptyMessage="No hay asignaciones registradas." />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Nueva Asignación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Docente</label>
                <select value={form.docente_id} onChange={(e) => setForm({ ...form, docente_id: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Seleccione...</option>
                  {docentes.map((d) => <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grupo</label>
                <select value={form.grupo_id} onChange={(e) => setForm({ ...form, grupo_id: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Seleccione...</option>
                  {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Materia</label>
                <select value={form.materia_id} onChange={(e) => setForm({ ...form, materia_id: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Seleccione...</option>
                  {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aula</label>
                <select value={form.aula_id} onChange={(e) => setForm({ ...form, aula_id: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Seleccione...</option>
                  {aulas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horario</label>
                <select value={form.horario_id} onChange={(e) => setForm({ ...form, horario_id: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Seleccione...</option>
                  {horarios.map((h) => <option key={h.id} value={h.id}>{h.dia} {h.hora_inicio}-{h.hora_fin}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded border border-slate-300 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Eliminar Asignación" message="¿Está seguro de eliminar esta asignación?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
