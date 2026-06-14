import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'

export default function PostulanteDetallePage() {
  const { id } = useParams()
  const [postulante, setPostulante] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [requisitos, setRequisitos] = useState([])
  const [pago, setPago] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [postulanteRes, requisitosRes, pagoRes] = await Promise.all([
          api.get(`/postulantes/${id}`),
          api.get(`/postulantes/${id}/requisitos`).catch(() => ({ data: { data: [] } })),
          api.get(`/postulantes/${id}/pago`).catch(() => ({ data: { data: null } })),
        ])
        setPostulante(postulanteRes.data.data || postulanteRes.data.postulante || postulanteRes.data)
        setRequisitos(requisitosRes.data.data || requisitosRes.data.requisitos || [])
        setPago(pagoRes.data.data || pagoRes.data.pago || null)
      } catch (err) {
        setAlert({ type: 'error', message: 'Error al cargar datos' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const toggleRequisito = async (reqId) => {
    try {
      const res = await api.patch(`/requisitos/${reqId}/toggle`)
      const updated = res.data.data
      setRequisitos((prev) => prev.map((r) => r.id === reqId ? { ...r, cumplido: updated.cumplido } : r))
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al actualizar requisito' })
    }
  }

  const simularPago = async () => {
    try {
      const res = await api.post(`/postulantes/${id}/pago/simular`)
      setPago(res.data.data || res.data.pago || res.data)
      setAlert({ type: 'success', message: 'Pago registrado correctamente.' })
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al procesar pago' })
    }
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (!postulante) return <div className="text-red-600">Postulante no encontrado.</div>

  const estadoColors = {
    APROBADO: 'bg-green-100 text-green-800', REPROBADO: 'bg-red-100 text-red-800',
    PENDIENTE: 'bg-yellow-100 text-yellow-800', INSCRITO: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{postulante.nombres} {postulante.apellidos}</h1>
        <div className="flex gap-2">
          <Link to={`/postulantes/${id}/editar`} className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50">Editar</Link>
          <Link to="/postulantes" className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50">Volver</Link>
        </div>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Información General</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                ['CI', postulante.ci], ['Nombres', postulante.nombres], ['Apellidos', postulante.apellidos],
                ['Email', postulante.email], ['Teléfono', postulante.telefono], ['Sexo', postulante.sexo === 'M' ? 'Masculino' : 'Femenino'],
                ['Fecha de Nacimiento', postulante.fecha_nacimiento?.split('T')[0]], ['Dirección', postulante.direccion],
                ['Ciudad', postulante.ciudad], ['Colegio', postulante.colegio_procedencia],
                ['Carrera 1ra Opción', postulante.carrera_primera_opcion], ['Carrera 2da Opción', postulante.carrera_segunda_opcion || '—'],
                ['Gestión', postulante.gestion],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-medium text-slate-500">{label}</dt>
                  <dd className="mt-0.5 text-slate-800">{value || '—'}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoColors[postulante.estado] || 'bg-slate-100 text-slate-800'}`}>
                {postulante.estado}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Requisitos</h2>
            {requisitos.length === 0 ? (
              <p className="text-sm text-slate-500">No hay requisitos registrados.</p>
            ) : (
              <ul className="space-y-2">
                {requisitos.map((req) => (
                  <li key={req.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!req.cumplido}
                      onChange={() => toggleRequisito(req.id)}
                      className="h-4 w-4 text-blue-600 rounded border-slate-300"
                    />
                    <span className={`text-sm ${req.cumplido ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {req.nombre || req.tipo_requisito}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Pago</h2>
            {pago ? (
              <div className="text-sm space-y-2">
                <p><span className="font-medium text-slate-500">Estado:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pago.estado === 'PAGADO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{pago.estado}</span></p>
                <p><span className="font-medium text-slate-500">Monto:</span> {pago.monto ? `Bs. ${pago.monto}` : '—'}</p>
                <p><span className="font-medium text-slate-500">Fecha:</span> {pago.fecha?.split('T')[0] || '—'}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mb-4">No registra pago.</p>
            )}
            {(!pago || pago.estado !== 'PAGADO') && (
              <button onClick={simularPago} className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                Simular Pago
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Notas</h2>
            <Link to={`/notas/${id}`} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Ver / Gestionar Notas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
