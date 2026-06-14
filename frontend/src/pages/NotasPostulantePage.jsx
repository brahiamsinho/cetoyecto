import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'

export default function NotasPostulantePage() {
  const { postulanteId } = useParams()
  const [postulante, setPostulante] = useState(null)
  const [materias, setMaterias] = useState([])
  const [notas, setNotas] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const [postulanteRes, materiasRes] = await Promise.all([
          api.get(`/postulantes/${postulanteId}`),
          api.get(`/postulantes/${postulanteId}/notas`).catch(() => ({ data: { data: [] } })),
        ])
        const p = postulanteRes.data.data || postulanteRes.data.postulante || postulanteRes.data
        setPostulante(p)

        const materiasList = materiasRes.data.data || materiasRes.data.materias || []
        const notasMap = {}
        materiasList.forEach((m) => {
          notasMap[m.id || m.materia_id] = {
            nota1: m.nota1 ?? '', nota2: m.nota2 ?? '', nota3: m.nota3 ?? '',
          }
        })
        setNotas(notasMap)
        setMaterias(materiasList.length > 0 ? materiasList : [
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
      [materiaId]: { ...prev[materiaId], [campo]: value },
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
      setAlert({ type: 'success', message: 'Notas guardadas correctamente.' })
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar notas' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (!postulante) return <div className="text-red-600">Postulante no encontrado.</div>

  const promedioFinal = calcularPromedioFinal()
  const estado = promedioFinal && parseFloat(promedioFinal) >= 60 ? 'APROBADO' : (promedioFinal ? 'REPROBADO' : 'PENDIENTE')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Notas</h1>
          <p className="text-slate-500">{postulante.nombres} {postulante.apellidos} — CI: {postulante.ci}</p>
        </div>
        <Link to="/notas" className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50">Volver</Link>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Materia</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Nota 1</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Nota 2</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Nota 3</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {materias.map((m) => {
              const prom = calcularPromedio(m.id)
              return (
                <tr key={m.id} className="even:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{m.nombre}</td>
                  <td className="px-4 py-3 text-center">
                    <input type="number" min="0" max="100" value={notas[m.id]?.nota1 ?? ''} onChange={(e) => handleNotaChange(m.id, 'nota1', e.target.value)} className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center text-sm" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="number" min="0" max="100" value={notas[m.id]?.nota2 ?? ''} onChange={(e) => handleNotaChange(m.id, 'nota2', e.target.value)} className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center text-sm" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="number" min="0" max="100" value={notas[m.id]?.nota3 ?? ''} onChange={(e) => handleNotaChange(m.id, 'nota3', e.target.value)} className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center text-sm" />
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{prom || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {promedioFinal && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Promedio Final</h3>
              <p className="text-3xl font-bold mt-1">{promedioFinal}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${estado === 'APROBADO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {estado}
            </span>
          </div>
        </div>
      )}

      <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors">
        {saving ? 'Guardando...' : 'Guardar Notas'}
      </button>
    </div>
  )
}
