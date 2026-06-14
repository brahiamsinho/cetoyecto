import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'
import { useAuth } from '../context/AuthContext'

const normalizeText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim()

const normalizeId = (value) => (value === null || value === undefined ? '' : String(value))

const sameId = (left, right) => normalizeId(left) === normalizeId(right)

const getPersonName = (entity) => {
  if (!entity || typeof entity !== 'object') return ''
  return [entity.nombres, entity.apellidos].filter(Boolean).join(' ').trim() || entity.nombre || entity.name || ''
}

const findReliableDocenteMatch = (docentes, user) => {
  if (!Array.isArray(docentes) || docentes.length === 0 || !user) return null

  const matchBy = (predicate) => {
    const matches = docentes.filter(predicate)
    return matches.length === 1 ? matches[0] : null
  }

  const userDocenteId = user?.docente?.id ?? user?.docente_id ?? user?.docenteId ?? ''
  const userId = user?.id ?? ''
  const userEmail = normalizeText(user?.email)
  const userName = normalizeText(getPersonName(user) || user?.nombre || user?.name)

  return (
    matchBy((docente) => sameId(docente.id, userDocenteId))
    || matchBy((docente) => sameId(docente.user_id, userId))
    || (userEmail ? matchBy((docente) => normalizeText(docente.email) === userEmail) : null)
    || (userName ? matchBy((docente) => normalizeText(getPersonName(docente)) === userName) : null)
  )
}

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

export default function CargaHorariaPage() {
  const { user } = useAuth()
  const roleName = user?.rol?.nombre || user?.rol
  const [asignaciones, setAsignaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [form, setForm] = useState({ docente_id: '', grupo_id: '', materia_id: '', aula_id: '', horario_id: '' })
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [regenerationSummary, setRegenerationSummary] = useState(null)

  const [docentes, setDocentes] = useState([])
  const [grupos, setGrupos] = useState([])
  const [materias, setMaterias] = useState([])
  const [aulas, setAulas] = useState([])
  const [horarios, setHorarios] = useState([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [cargaHorariaResult, docentesResult] = await Promise.allSettled([
        api.get('/carga-horaria'),
        api.get('/docentes'),
      ])

      const rawData = cargaHorariaResult.status === 'fulfilled'
        ? (cargaHorariaResult.value.data?.data ?? cargaHorariaResult.value.data?.asignaciones ?? cargaHorariaResult.value.data)
        : []
      const docentesData = docentesResult.status === 'fulfilled'
        ? (docentesResult.value.data?.data || docentesResult.value.data?.docentes || docentesResult.value.data || [])
        : []

      const data = Array.isArray(rawData) ? rawData : []
      const matchedDocente = roleName === 'Docente' ? findReliableDocenteMatch(Array.isArray(docentesData) ? docentesData : [], user) : null

      setDocentes(Array.isArray(docentesData) ? docentesData : [])
      setAsignaciones(matchedDocente
        ? data.filter((a) => sameId(a.docente_id, matchedDocente.id) || sameId(a.docente?.id, matchedDocente.id))
        : data)

      if (cargaHorariaResult.status !== 'fulfilled') {
        throw new Error('carga-horaria')
      }
    } catch {
      setAsignaciones([])
      setAlert({ type: 'error', message: 'Error al cargar carga horaria' })
    } finally {
      setLoading(false)
    }
  }, [roleName, user])

  useEffect(() => {
    const load = async () => {
      await fetchData()
    }

    void load()
  }, [fetchData])

  const openCreate = async () => {
    try {
      const [docentesRes, gruposRes, materiasRes, aulasRes, horariosRes] = await Promise.all([
        api.get('/docentes'), api.get('/grupos'), api.get('/materias'), api.get('/aulas'), api.get('/horarios'),
      ])
      setDocentes(docentesRes.data.data || docentesRes.data.docentes || [])
      setGrupos(gruposRes.data.data || gruposRes.data.grupos || [])
      setMaterias(materiasRes.data.data || materiasRes.data.materias || [])
      setAulas(aulasRes.data.data || aulasRes.data.aulas || [])
      setHorarios(horariosRes.data.data || horariosRes.data.horarios || [])
    } catch {
      // keep the form usable even if a lookup fails
    }
    setForm({ docente_id: '', grupo_id: '', materia_id: '', aula_id: '', horario_id: '' })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.docente_id || !form.grupo_id || !form.materia_id || !form.aula_id || !form.horario_id) {
      setAlert({ type: 'error', message: 'Todos los campos son obligatorios.' })
      return
    }
    setSaving(true)
    try {
      await api.post('/carga-horaria', form)
      setAlert({ type: 'success', message: 'Asignación creada correctamente.' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al crear asignación (posible conflicto de horario).' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/carga-horaria/${deleteTarget.id}`)
      setAlert({ type: 'success', message: 'Asignación eliminada.' })
      setDeleteTarget(null)
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al eliminar' })
      setDeleteTarget(null)
    }
  }

  const handleRegenerateDataset = async () => {
    setRegenerating(true)
    setAlert({ type: '', message: '' })
    try {
      const res = await api.post('/carga-horaria/regenerar')
      setAlert({ type: 'success', message: res.data?.message || 'Carga horaria y asistencias regeneradas correctamente.' })
      setRegenerationSummary(res.data?.data || null)
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al regenerar la carga horaria.' })
    } finally {
      setRegenerating(false)
    }
  }

  const aulaCounts = Array.isArray(asignaciones) ? asignaciones.reduce((acc, row) => {
    const key = row.aula_display || row.aula_nombre || row.aula?.nombre || 'Sin aula'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {}) : {}

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
            <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              + Nueva Asignación
            </button>
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
        <DataTable columns={columns} data={Array.isArray(asignaciones) ? asignaciones : []} loading={loading} searchable={true} searchPlaceholder="Buscar asignación..." onDelete={roleName !== 'Docente' ? (row) => setDeleteTarget(row) : null} actions={false} emptyMessage="No hay asignaciones registradas." />
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
