import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'
import StripePaymentForm from '../components/StripePaymentForm'
import { usePostulanteDetalleController } from '../controllers/usePostulanteDetalleController'

const asArray = (value) => (Array.isArray(value) ? value : [])

const formatEntity = (entity, fallback = '—') => {
  if (typeof entity === 'string') return entity || fallback
  if (!entity || typeof entity !== 'object') return fallback

  const fullName = [entity.nombres, entity.apellidos].filter(Boolean).join(' ').trim()
  return fullName || entity.nombre || entity.codigo || entity.label || fallback
}

const formatSchedule = (carga) => {
  if (carga?.horario_display) return carga.horario_display
  if (carga?.horario_descripcion) return carga.horario_descripcion

  const horario = carga?.horario
  if (!horario || typeof horario !== 'object') return '—'

  const inicio = horario.hora_inicio || horario.horaInicio
  const fin = horario.hora_fin || horario.horaFin
  if (!inicio || !fin) return horario.dia || '—'

  return `${horario.dia || 'Horario'} ${inicio}-${fin}`
}

const formatGrade = (nota) => {
  const value = nota?.promedio_final ?? nota?.promedio ?? nota?.nota_final ?? nota?.final ?? nota?.calificacion
  if (value === null || value === undefined || value === '') return '—'

  const numeric = Number(value)
  return Number.isNaN(numeric) ? String(value) : numeric.toFixed(2)
}

const getNumericGrade = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const formatAverage = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric.toFixed(2) : (value ?? '—')
}

export default function PostulanteDetalleView({ state, handlers }) {
  const { postulante, notas, loading, alert, showPayment } = state
  const { setAlert, setShowPayment, handlePaymentSuccess } = handlers

  if (loading) return <LoadingSpinner size="lg" />
  if (!postulante) return <div className="text-red-600">Postulante no encontrado.</div>

  const pagoRealizado = !!(
    postulante?.pago_estado === 'PAGADO'
    || postulante?.pago?.estado === 'PAGADO'
    || postulante?.pago_id
    || postulante?.pago?.id
  )

  const estadoColors = {
    APROBADO: 'bg-green-100 text-green-800', REPROBADO: 'bg-red-100 text-red-800',
    PENDIENTE: 'bg-yellow-100 text-yellow-800', INSCRITO: 'bg-blue-100 text-blue-800',
  }

  const grupos = asArray(postulante?.grupos)
  const materias = grupos.flatMap((grupo) => {
    const grupoNombre = formatEntity(grupo, 'Grupo')
    const cargas = asArray(grupo?.cargas_horarias)

    if (cargas.length > 0) {
      return cargas.map((carga, index) => ({
        key: `${grupo?.id || grupoNombre}-${carga?.id || carga?.materia?.id || index}`,
        grupo: grupoNombre,
        materia: formatEntity(carga?.materia || carga?.materia_nombre || carga?.materia_codigo),
        docente: formatEntity(carga?.docente || carga?.docente_nombre),
        horario: formatSchedule(carga),
        aula: formatEntity(carga?.aula || carga?.aula_display || carga?.aula_nombre),
      }))
    }

    return asArray(grupo?.materias).map((materia, index) => ({
      key: `${grupo?.id || grupoNombre}-materia-${materia?.id || index}`,
      grupo: grupoNombre,
      materia: formatEntity(materia),
      docente: formatEntity(materia?.docente || materia?.docenteAsignado || materia?.docente_nombre),
      horario: formatSchedule(materia),
      aula: formatEntity(materia?.aula || materia?.aula_display || materia?.aula_nombre),
    }))
  })

  const notasFinales = asArray(notas).map((nota, index) => {
    const promedioFinal = formatGrade(nota)
    const numericPromedio = Number(promedioFinal)
    const estado = nota?.estado
      || (Number.isNaN(numericPromedio)
        ? 'PENDIENTE'
        : numericPromedio >= 60 ? 'APROBADO' : 'REPROBADO')

    return {
      key: nota?.id || nota?.materia_id || index,
      materia: formatEntity(nota?.materia || nota?.materia_nombre || nota?.materia_codigo),
      promedioFinal,
      estado,
    }
  })

  const notaValues = notasFinales
    .map((nota) => getNumericGrade(nota.promedioFinal))
    .filter((value) => value !== null)
  const promedioGeneral = notaValues.length > 0
    ? (notaValues.reduce((sum, value) => sum + value, 0) / notaValues.length).toFixed(2)
    : formatAverage(postulante?.promedio_final ?? postulante?.promedio)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{postulante.nombres} {postulante.apellidos}</h1>
          <p className="text-slate-500 text-sm mt-1">Resumen académico</p>
        </div>
        <div className="flex items-center gap-2">
          {pagoRealizado ? (
            <span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-sm font-medium border border-green-200">
              Pago registrado — Bs. {postulante.pago?.monto ?? postulante.monto_pago ?? 700}
            </span>
          ) : (
            <button
              onClick={() => setShowPayment(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
            >
              Registrar Pago
            </button>
          )}
          <Link to="/postulantes" className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50">Volver</Link>
        </div>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Grupo(s) inscritos</h2>
          {grupos.length === 0 ? (
            <p className="text-sm text-slate-500">No hay grupos inscritos.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {grupos.map((grupo, index) => (
                <span key={grupo?.id || index} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                  {formatEntity(grupo)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Promedio general</h2>
          <p className="text-sm text-slate-500">Promedio final del postulante calculado a partir de sus notas registradas.</p>
          <div className="mt-4 inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-2xl font-bold text-slate-800">{promedioGeneral}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Materias, horarios, aulas y docentes</h2>
          {materias.length === 0 ? (
            <p className="text-sm text-slate-500">No hay materias asignadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Grupo</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Materia</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Docente</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Horario</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Aula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {materias.map((row) => (
                    <tr key={row.key} className="hover:bg-blue-50/50">
                      <td className="px-4 py-3 text-slate-700">{row.grupo}</td>
                      <td className="px-4 py-3 text-slate-700">{row.materia}</td>
                      <td className="px-4 py-3 text-slate-700">{row.docente}</td>
                      <td className="px-4 py-3 text-slate-700">{row.horario}</td>
                      <td className="px-4 py-3 text-slate-700">{row.aula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Notas finales</h2>
          {notasFinales.length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no hay notas finales registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Materia</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Nota final</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {notasFinales.map((row) => (
                    <tr key={row.key} className="hover:bg-blue-50/50">
                      <td className="px-4 py-3 text-slate-700">{row.materia}</td>
                      <td className="px-4 py-3 text-slate-700">{row.promedioFinal}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColors[row.estado] || 'bg-slate-100 text-slate-800'}`}>
                          {row.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showPayment && (
        <StripePaymentForm
          postulanteId={postulante.id}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  )
}

export function PostulanteDetalleWrapper() {
  const props = usePostulanteDetalleController()
  return <PostulanteDetalleView {...props} />
}
