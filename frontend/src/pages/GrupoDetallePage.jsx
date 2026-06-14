import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'

export default function GrupoDetallePage() {
  const { id } = useParams()
  const [grupo, setGrupo] = useState(null)
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const [grupoRes, estudiantesRes] = await Promise.all([
          api.get(`/grupos/${id}`),
          api.get(`/grupos/${id}/estudiantes`).catch(() => ({ data: { data: [] } })),
        ])
        setGrupo(grupoRes.data.data || grupoRes.data.grupo || grupoRes.data)
        setEstudiantes(estudiantesRes.data.data || estudiantesRes.data.estudiantes || [])
      } catch (err) {
        setAlert({ type: 'error', message: 'Error al cargar datos del grupo' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <LoadingSpinner size="lg" />
  if (!grupo) return <div className="text-red-600">Grupo no encontrado.</div>

  const materias = Array.isArray(grupo?.materias)
    ? grupo.materias.map((m) => m?.nombre || m?.codigo).filter(Boolean).join(', ')
    : '—'
  const capacidad = grupo.capacidad_grupo ?? grupo.cupo_maximo ?? 70
  const inscritos = grupo.estudiantes_count ?? estudiantes.length
  const disponible = grupo.cupo_disponible ?? Math.max(0, capacidad - inscritos)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{grupo.nombre}</h1>
          <p className="text-slate-500">Materias: {materias}</p>
          <p className="text-sm mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${grupo.habilitado ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
              {grupo.habilitado ? 'Habilitado' : 'Bloqueado'}
            </span>
          </p>
        </div>
        <Link to="/grupos" className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50">Volver</Link>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Información del Grupo</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div><dt className="font-medium text-slate-500">Nombre</dt><dd className="text-slate-800">{grupo.nombre}</dd></div>
          <div><dt className="font-medium text-slate-500">Materias</dt><dd className="text-slate-800">{materias}</dd></div>
          <div><dt className="font-medium text-slate-500">Total Estudiantes</dt><dd className="text-slate-800">{inscritos}</dd></div>
          <div><dt className="font-medium text-slate-500">Capacidad</dt><dd className="text-slate-800">{capacidad}</dd></div>
          <div><dt className="font-medium text-slate-500">Disponible</dt><dd className="text-slate-800">{disponible}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-slate-800 p-6 pb-0">Estudiantes</h2>
        {estudiantes.length === 0 ? (
          <div className="p-6 text-slate-500 text-sm">No hay estudiantes asignados a este grupo.</div>
        ) : (
          <table className="w-full text-sm mt-4">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">CI</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nombres</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Apellidos</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Promedio</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {estudiantes.map((est, idx) => (
                <tr key={est.id || idx} className="even:bg-slate-50 hover:bg-blue-50/50">
                  <td className="px-4 py-3 text-slate-700">{est.ci}</td>
                  <td className="px-4 py-3 text-slate-700">{est.nombres}</td>
                  <td className="px-4 py-3 text-slate-700">{est.apellidos}</td>
                  <td className="px-4 py-3 text-center font-semibold">{est.promedio_final != null ? parseFloat(est.promedio_final).toFixed(2) : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${est.estado === 'APROBADO' ? 'bg-green-100 text-green-800' : est.estado === 'REPROBADO' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {est.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
