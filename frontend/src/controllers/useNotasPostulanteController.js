import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export function useNotasPostulanteController() {
  const { postulanteId } = useParams()
  const [postulante, setPostulante] = useState(null)
  const [materias, setMaterias] = useState([])
  const [notas, setNotas] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [serverPromedio, setServerPromedio] = useState(null) // { promedio_final, estado } from backend

  useEffect(() => {
    const load = async () => {
      try {
        const [postulanteRes, notasRes, materiasRes] = await Promise.all([
          api.get(`/postulantes/${postulanteId}`),
          api.get(`/postulantes/${postulanteId}/notas`).catch(() => ({ data: { data: [] } })),
          api.get('/materias'),
        ])
        const p = postulanteRes.data.data || postulanteRes.data.postulante || postulanteRes.data
        setPostulante(p)

        const todasMaterias = materiasRes.data.data || materiasRes.data.materias || materiasRes.data || []
        const notasExistentes = notasRes.data.data || notasRes.data.notas || []

        const notasMap = {}
        notasExistentes.forEach((n) => {
          const key = n.materia_id || n.materia?.id
          if (key) {
            notasMap[key] = {
              nota1: n.nota1 ?? '', nota2: n.nota2 ?? '', nota3: n.nota3 ?? '',
            }
          }
        })

        // Initialize empty notas for materias without existing notas
        todasMaterias.forEach((m) => {
          const key = m.id
          if (!notasMap[key]) {
            notasMap[key] = { nota1: '', nota2: '', nota3: '' }
          }
        })

        setNotas(notasMap)
        setMaterias(todasMaterias.length > 0 ? todasMaterias : [
          { id: 1, nombre: 'Materia 1' }, { id: 2, nombre: 'Materia 2' },
          { id: 3, nombre: 'Materia 3' }, { id: 4, nombre: 'Materia 4' },
        ])
      } catch (err) {
        setAlert({ type: 'error', message: 'Error al cargar datos' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [postulanteId])

  const handleNotaChange = (materiaId, campo, value) => {
    if (value !== '' && (isNaN(value) || value < 0 || value > 100)) return
    setNotas((prev) => ({
      ...prev,
      [materiaId]: { ...prev[materiaId], [campo]: value === '' ? '' : parseFloat(value) },
    }))
  }

  const calcularPromedio = (materiaId) => {
    const n = notas[materiaId]
    if (!n) return null
    const n1 = parseFloat(n.nota1), n2 = parseFloat(n.nota2), n3 = parseFloat(n.nota3)
    if (isNaN(n1) || isNaN(n2) || isNaN(n3)) return null
    return ((n1 + n2 + n3) / 3).toFixed(2)
  }

  const calcularPromedioFinal = () => {
    const promedios = materias.map((m) => parseFloat(calcularPromedio(m.id))).filter((v) => v !== null && !isNaN(v))
    if (promedios.length === 0) return null
    return (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(2)
  }

  const handleSubmit = async () => {
    setSaving(true)
    setAlert({ type: '', message: '' })
    try {
      const payload = Object.entries(notas).map(([materiaId, n]) => ({
        materia_id: parseInt(materiaId),
        nota1: parseFloat(n.nota1) || 0,
        nota2: parseFloat(n.nota2) || 0,
        nota3: parseFloat(n.nota3) || 0,
      }))
      await Promise.all(payload.map((p) =>
        api.post(`/postulantes/${postulanteId}/notas`, p)
      ))
      // Re-fetch server-computed promedio_final and estado
      try {
        const promRes = await api.get(`/postulantes/${postulanteId}/promedios`)
        const data = promRes.data.data || promRes.data
        setServerPromedio({ promedio_final: data.promedio_final, estado: data.estado })
      } catch {
        setServerPromedio(null)
      }
      setAlert({ type: 'success', message: 'Notas guardadas correctamente.' })
    } catch (err) {
      const backendErrors = err.response?.data?.errors
      if (backendErrors) {
        const messages = Object.values(backendErrors).flat().join('. ')
        setAlert({ type: 'error', message: messages })
      } else {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar notas' })
      }
    } finally {
      setSaving(false)
    }
  }

  return {
    state: { postulante, materias, notas, loading, saving, alert, serverPromedio },
    handlers: { handleNotaChange, calcularPromedio, calcularPromedioFinal, handleSubmit, setAlert },
  }
}
