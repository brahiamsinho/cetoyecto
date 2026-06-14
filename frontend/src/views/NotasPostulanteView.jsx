import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'
import { useNotasPostulanteController } from '../controllers/useNotasPostulanteController'

export default function NotasPostulanteView({ state, handlers }) {
  const { postulante, materias, notas, loading, saving, alert, serverPromedio } = state
  const { handleNotaChange, calcularPromedio, calcularPromedioFinal, handleSubmit, setAlert } = handlers

  if (loading) return <LoadingSpinner size="lg" />
  if (!postulante) return <div className="text-red-600">Postulante no encontrado.</div>

  // Use server-computed values after save; fall back to local calculation
  const localPromedio = calcularPromedioFinal()
  const promedioFinal = serverPromedio?.promedio_final ?? localPromedio
  const estado = serverPromedio?.estado
    ?? (promedioFinal && parseFloat(promedioFinal) >= 60 ? 'APROBADO' : (promedioFinal ? 'REPROBADO' : 'PENDIENTE'))

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

export function NotasPostulanteWrapper() {
  const props = useNotasPostulanteController()
  return <NotasPostulanteView {...props} />
}
