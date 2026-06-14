import { useState, useEffect, useCallback, useMemo } from 'react'
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

const getPersonLabel = (entity, fallback = '—') => {
  if (!entity || typeof entity !== 'object') return fallback

  const fullName = [entity.nombres, entity.apellidos].filter(Boolean).join(' ').trim()
  return fullName || entity.nombre || entity.codigo || entity.label || fallback
}

const getScheduleLabel = (row) => {
  const horario = row?.horario
  if (row?.horario_display) return row.horario_display
  if (row?.horario_descripcion) return row.horario_descripcion
  if (!horario || typeof horario !== 'object') return '—'

  const inicio = horario.hora_inicio || horario.horaInicio
  const fin = horario.hora_fin || horario.horaFin
  if (!inicio || !fin) return horario.dia || '—'

  return `${horario.dia} ${inicio}-${fin}`
}

const buildOptions = (rows, getId, getLabel) => {
  const seen = new Map()

  rows.forEach((row) => {
    const id = normalizeId(getId(row))
    if (!id || seen.has(id)) return
    seen.set(id, { id, label: getLabel(row) })
  })

  return [...seen.values()]
}

export function useAsistenciasController() {
  const { user } = useAuth()
  const roleName = user?.rol?.nombre || user?.rol
  const [asistencias, setAsistencias] = useState([])
  const [cargaHoraria, setCargaHoraria] = useState([])
  const [docentes, setDocentes] = useState([])
  const [grupos, setGrupos] = useState([])
  const [materias, setMaterias] = useState([])
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [saving, setSaving] = useState(false)

  const [filters, setFilters] = useState({ fecha: '', docente_id: '', grupo_id: '' })
  const [form, setForm] = useState({ docente_id: '', grupo_id: '', materia_id: '', horario_id: '', fecha: new Date().toISOString().split('T')[0], estado: 'presente' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.fecha) params.fecha_desde = filters.fecha
      if (filters.fecha) params.fecha_hasta = filters.fecha
      if (filters.docente_id) params.docente_id = filters.docente_id
      if (filters.grupo_id) params.grupo_id = filters.grupo_id
      const [asistenciasResult, docentesResult] = await Promise.allSettled([
        api.get('/asistencias', { params }),
        api.get('/docentes'),
      ])

      if (asistenciasResult.status !== 'fulfilled') {
        throw new Error('asistencias')
      }

      const docentesData = docentesResult.status === 'fulfilled'
        ? (docentesResult.value.data?.data || docentesResult.value.data?.docentes || docentesResult.value.data || [])
        : []

      const res = asistenciasResult.value
      let items = res.data.data?.data || res.data.data || res.data.asistencias || res.data
      if (!Array.isArray(items) && Array.isArray(items?.data)) {
        items = items.data
      }
      items = Array.isArray(items) ? items : []
      const matchedDocente = roleName === 'Docente' ? findReliableDocenteMatch(Array.isArray(docentesData) ? docentesData : [], user) : null
      if (matchedDocente) {
        items = items.filter((a) => sameId(a.docente_id, matchedDocente.id) || sameId(a.docente?.id, matchedDocente.id))
      }
      setAsistencias(items)
    } catch {
      setAlert({ type: 'error', message: 'Error al cargar asistencias' })
    } finally {
      setLoading(false)
    }
  }, [filters, roleName, user])

  useEffect(() => {
    Promise.resolve().then(() => { void fetchData() })
  }, [fetchData])

  const loadFormData = useCallback(async () => {
    try {
      const [docentesRes, gruposRes, materiasRes, horariosRes, cargaHorariaRes] = await Promise.all([
        api.get('/docentes'), api.get('/grupos'), api.get('/materias'), api.get('/horarios'), api.get('/carga-horaria'),
      ])
      let docentesData = docentesRes.data.data || docentesRes.data.docentes || []
      let cargaHorariaData = cargaHorariaRes.data.data || cargaHorariaRes.data.asignaciones || cargaHorariaRes.data || []
      const matchedDocente = roleName === 'Docente' ? findReliableDocenteMatch(Array.isArray(docentesData) ? docentesData : [], user) : null

      if (matchedDocente) {
        docentesData = docentesData.filter((d) => sameId(d.id, matchedDocente.id) || sameId(d.user_id, matchedDocente.user_id))
        cargaHorariaData = cargaHorariaData.filter((row) => sameId(row.docente_id, matchedDocente.id) || sameId(row.docente?.id, matchedDocente.id))
      }

      setDocentes(docentesData)
      setGrupos(gruposRes.data.data || gruposRes.data.grupos || [])
      setMaterias(materiasRes.data.data || materiasRes.data.materias || [])
      setHorarios(horariosRes.data.data || horariosRes.data.horarios || [])
      setCargaHoraria(Array.isArray(cargaHorariaData) ? cargaHorariaData : [])

      const currentDocenteId = normalizeId(form.docente_id)
      const currentAssignments = currentDocenteId
        ? cargaHorariaData.filter((row) => sameId(row.docente_id, currentDocenteId))
        : []

      if (currentAssignments.length > 0) {
        const currentComboValid = currentAssignments.some((row) => sameId(row.grupo_id, form.grupo_id)
          && sameId(row.materia_id, form.materia_id)
          && sameId(row.horario_id, form.horario_id))

        if (!currentComboValid) {
          const first = currentAssignments[0]
          setForm((current) => ({
            ...current,
            docente_id: currentDocenteId,
            grupo_id: normalizeId(first.grupo_id),
            materia_id: normalizeId(first.materia_id),
            horario_id: normalizeId(first.horario_id),
          }))
        }
      }

      if (docentesData.length === 1) {
        const onlyDocenteId = normalizeId(docentesData[0].id)
        setForm((current) => (sameId(current.docente_id, onlyDocenteId)
          ? current
          : { ...current, docente_id: onlyDocenteId, grupo_id: '', materia_id: '', horario_id: '' }))
      }
    } catch {
      return
    }
  }, [form.docente_id, form.grupo_id, form.materia_id, form.horario_id, roleName, user])

  useEffect(() => {
    Promise.resolve().then(() => { void loadFormData() })
  }, [loadFormData])

  const selectedDocenteAssignments = useMemo(() => {
    if (!form.docente_id) return []
    return cargaHoraria.filter((row) => sameId(row.docente_id, form.docente_id))
  }, [cargaHoraria, form.docente_id])

  const selectedAssignment = useMemo(() => {
    if (!form.docente_id || !form.grupo_id || !form.materia_id || !form.horario_id) return null
    return selectedDocenteAssignments.find((row) => sameId(row.grupo_id, form.grupo_id)
      && sameId(row.materia_id, form.materia_id)
      && sameId(row.horario_id, form.horario_id)) || null
  }, [form.docente_id, form.grupo_id, form.materia_id, form.horario_id, selectedDocenteAssignments])

  const comboOptions = useMemo(() => ({
    grupos: buildOptions(selectedDocenteAssignments, (row) => row.grupo_id ?? row.grupo?.id ?? row.grupo, (row) => row.grupo?.nombre || row.grupo_nombre || row.grupo?.codigo || `Grupo ${normalizeId(row.grupo_id ?? row.grupo?.id ?? row.grupo)}`),
    materias: buildOptions(selectedDocenteAssignments, (row) => row.materia_id ?? row.materia?.id ?? row.materia, (row) => row.materia?.nombre || row.materia_nombre || row.materia?.codigo || `Materia ${normalizeId(row.materia_id ?? row.materia?.id ?? row.materia)}`),
    horarios: buildOptions(selectedDocenteAssignments, (row) => row.horario_id ?? row.horario?.id ?? row.horario, (row) => getScheduleLabel(row)),
  }), [selectedDocenteAssignments])

  const comboNotice = useMemo(() => {
    if (!form.docente_id) return 'Selecciona un docente para ver sus opciones válidas.'
    if (selectedDocenteAssignments.length === 0) return 'Ese docente no tiene carga horaria registrada.'
    return `Opciones válidas cargadas: ${selectedDocenteAssignments.length}.`
  }, [form.docente_id, selectedDocenteAssignments.length])

  const updateComboField = useCallback((field, value) => {
    const nextValue = normalizeId(value)

    setForm((current) => {
      if (field === 'docente_id') {
        if (!nextValue) {
          return { ...current, docente_id: '', grupo_id: '', materia_id: '', horario_id: '' }
        }

        const assignments = cargaHoraria.filter((row) => sameId(row.docente_id, nextValue))
        const first = assignments[0]

        if (!first) {
          return { ...current, docente_id: nextValue, grupo_id: '', materia_id: '', horario_id: '' }
        }

        return {
          ...current,
          docente_id: nextValue,
          grupo_id: normalizeId(first.grupo_id),
          materia_id: normalizeId(first.materia_id),
          horario_id: normalizeId(first.horario_id),
        }
      }

      if (!current.docente_id) {
        return { ...current, [field]: nextValue }
      }

      if (!nextValue) {
        return { ...current, grupo_id: '', materia_id: '', horario_id: '' }
      }

      const assignments = cargaHoraria.filter((row) => sameId(row.docente_id, current.docente_id))
      const match = assignments.find((row) => sameId(row[field], nextValue))

      if (!match) {
        return { ...current, [field]: nextValue }
      }

      return {
        ...current,
        docente_id: normalizeId(match.docente_id),
        grupo_id: normalizeId(match.grupo_id),
        materia_id: normalizeId(match.materia_id),
        horario_id: normalizeId(match.horario_id),
      }
    })
  }, [cargaHoraria])

  const handleSubmit = async () => {
    if (!form.docente_id || !form.grupo_id || !form.materia_id || !form.horario_id || !form.fecha) {
      setAlert({ type: 'error', message: 'Complete todos los campos.' })
      return
    }

    if (!selectedAssignment) {
      const docenteNombre = getPersonLabel(selectedDocenteAssignments[0]?.docente || docentes.find((d) => sameId(d.id, form.docente_id)))
      setAlert({
        type: 'error',
        message: docenteNombre && docenteNombre !== '—'
          ? `La combinación seleccionada no existe en la carga horaria de ${docenteNombre}. Elige un grupo, materia y horario válidos.`
          : 'La combinación seleccionada no existe en la carga horaria. Elige un grupo, materia y horario válidos.',
      })
      return
    }

    setSaving(true)
    try {
      await api.post('/asistencias', form)
      setAlert({ type: 'success', message: 'Asistencia registrada.' })
      setForm({ ...form, estado: 'presente' })
      fetchData()
    } catch (err) {
      const backendMessage = err.response?.data?.message || Object.values(err.response?.data?.errors || {})[0]?.[0]
      setAlert({
        type: 'error',
        message: backendMessage || 'No se pudo registrar la asistencia. Verifica que la combinación exista en la carga horaria del docente.',
      })
    } finally {
      setSaving(false)
    }
  }

  return {
    state: {
      asistencias,
      cargaHoraria,
      docentes,
      grupos,
      materias,
      horarios,
      loading,
      alert,
      saving,
      filters,
      form,
      user,
      selectedDocenteAssignments,
      selectedAssignment,
      comboOptions,
      comboNotice,
    },
    handlers: {
      setFilters,
      setForm,
      updateComboField,
      handleSubmit,
      setAlert,
    },
  }
}
