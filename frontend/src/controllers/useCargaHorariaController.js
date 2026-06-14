import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
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

export function useCargaHorariaController() {
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

      if (matchedDocente) {
        setDocentes(Array.isArray(docentesData) ? docentesData : [])
        setAsignaciones(data.filter((a) => sameId(a.docente_id, matchedDocente.id) || sameId(a.docente?.id, matchedDocente.id)))
      } else {
        setDocentes(Array.isArray(docentesData) ? docentesData : [])
        setAsignaciones(data)
      }

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
      await fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al regenerar la carga horaria.' })
    } finally {
      setRegenerating(false)
    }
  }

  return {
    state: { asignaciones, loading, showForm, deleteTarget, alert, form, saving, regenerating, regenerationSummary, docentes, grupos, materias, aulas, horarios, user },
    handlers: { openCreate, setForm, setShowForm, handleSave, handleDelete, handleRegenerateDataset, setDeleteTarget, setAlert },
  }
}
