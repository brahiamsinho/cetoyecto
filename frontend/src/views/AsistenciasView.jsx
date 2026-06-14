import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'

const formatDisplayValue = (value) => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' || typeof value === 'number') return value
  if (Array.isArray(value)) {
    const items = value.map((item) => formatDisplayValue(item)).filter((item) => item && item !== '—')
    return items.length ? items.join(', ') : '—'
  }
  if (typeof value === 'object') {
    const nombreCompleto = [value.nombres, value.apellidos].filter(Boolean).join(' ').trim()
    return nombreCompleto || value.nombre || value.codigo || value.label || '—'
  }
  return String(value)
}

export default function AsistenciasView({ state, handlers }) {
  const { asistencias, docentes, loading, alert, saving, filters, form, comboOptions, comboNotice } = state
  const { setFilters, setForm, updateComboField, handleSubmit, setAlert } = handlers
  const safeAsistencias = Array.isArray(asistencias) ? asistencias : []
  const safeDocentes = Array.isArray(docentes) ? docentes : []
  const safeGrupos = Array.isArray(comboOptions?.grupos) ? comboOptions.grupos : []
  const safeMaterias = Array.isArray(comboOptions?.materias) ? comboOptions.materias : []
  const safeHorarios = Array.isArray(comboOptions?.horarios) ? comboOptions.horarios : []
  const comboDisabled = !form.docente_id || safeGrupos.length === 0 || safeMaterias.length === 0 || safeHorarios.length === 0

  const summaryCards = [
    { label: 'Asistencias', value: safeAsistencias.length },
    { label: 'Docentes', value: new Set(safeAsistencias.map((a) => a.docente_id || a.docente)).size },
    { label: 'Grupos', value: new Set(safeAsistencias.map((a) => a.grupo_id || a.grupo)).size },
    { label: 'Materias', value: new Set(safeAsistencias.map((a) => a.materia_id || a.materia)).size },
  ]

  const docenteBreakdown = Object.values(safeAsistencias.reduce((acc, row) => {
    const docenteId = formatDisplayValue(row.docente_id || row.docente || 'sin-docente')
    const docenteName = formatDisplayValue(row.docente_nombre || row.docente || 'Sin docente')
    if (!acc[docenteId]) {
      acc[docenteId] = { name: docenteName, materias: new Set(), grupos: new Set(), total: 0 }
    }
    acc[docenteId].materias.add(formatDisplayValue(row.materia_id || row.materia || row.materia_nombre))
    acc[docenteId].grupos.add(formatDisplayValue(row.grupo_id || row.grupo || row.grupo_nombre))
    acc[docenteId].total++
    return acc
  }, {})).sort((a, b) => b.total - a.total).slice(0, 6)

  const columns = [
    { key: 'fecha', label: 'Fecha', render: (val) => val?.split('T')[0] || val || '—' },
    { key: 'docente', label: 'Docente', render: (val, row) => formatDisplayValue(row.docente_nombre || row.docente || val) },
    { key: 'grupo', label: 'Grupo', render: (val, row) => formatDisplayValue(row.grupo_nombre || row.grupo || val) },
    { key: 'materia', label: 'Materia', render: (val, row) => formatDisplayValue(row.materia_nombre || row.materia || val) },
    { key: 'estado', label: 'Estado', render: (val) => {
      const colors = { presente: 'bg-green-100 text-green-800', atraso: 'bg-yellow-100 text-yellow-800', falta: 'bg-red-100 text-red-800', justificado: 'bg-blue-100 text-blue-800' }
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-800'}`}>{val}</span>
    }},
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Asistencias</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="mb-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{card.label}</div>
            <div className="text-2xl font-bold text-slate-800">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {docenteBreakdown.map((item) => (
          <div key={String(item.name)} className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="font-semibold text-slate-800">{formatDisplayValue(item.name)}</div>
            <div className="text-sm text-slate-600">{item.total} asistencias</div>
            <div className="text-xs text-slate-500 mt-1">
              {item.materias.size} materias · {item.grupos.size} grupos
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Registrar Asistencia</h2>
        <p className="mb-4 text-sm text-slate-600">{comboNotice}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Docente</label>
            <select value={form.docente_id} onChange={(e) => updateComboField('docente_id', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="">Seleccione...</option>
              {safeDocentes.map((d) => <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Grupo</label>
            <select value={form.grupo_id} onChange={(e) => updateComboField('grupo_id', e.target.value)} disabled={comboDisabled} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100">
              <option value="">Seleccione...</option>
              {safeGrupos.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Materia</label>
            <select value={form.materia_id} onChange={(e) => updateComboField('materia_id', e.target.value)} disabled={comboDisabled} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100">
              <option value="">Seleccione...</option>
              {safeMaterias.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Horario</label>
            <select value={form.horario_id} onChange={(e) => updateComboField('horario_id', e.target.value)} disabled={comboDisabled} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100">
              <option value="">Seleccione...</option>
              {safeHorarios.map((h) => <option key={h.id} value={h.id}>{h.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="presente">Presente</option>
              <option value="atraso">Atraso</option>
              <option value="falta">Falta</option>
              <option value="justificado">Justificado</option>
            </select>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving || comboDisabled} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {saving ? 'Registrando...' : 'Registrar Asistencia'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Filtros</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Fecha</label>
            <input type="date" value={filters.fecha} onChange={(e) => setFilters({ ...filters, fecha: e.target.value })} className="px-3 py-1.5 border border-slate-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Docente</label>
            <select value={filters.docente_id} onChange={(e) => setFilters({ ...filters, docente_id: e.target.value })} className="px-3 py-1.5 border border-slate-300 rounded text-sm">
              <option value="">Todos</option>
              {safeDocentes.map((d) => <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Grupo</label>
            <select value={filters.grupo_id} onChange={(e) => setFilters({ ...filters, grupo_id: e.target.value })} className="px-3 py-1.5 border border-slate-300 rounded text-sm">
              <option value="">Todos</option>
              {safeGrupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable columns={columns} data={safeAsistencias} loading={loading} searchable={false} emptyMessage="No hay asistencias registradas." actions={false} />
      </div>
    </div>
  )
}
