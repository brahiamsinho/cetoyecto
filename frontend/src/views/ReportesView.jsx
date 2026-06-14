import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#0891b2', '#db2777', '#ea580c']

export default function ReportesView({ state, handlers }) {
  const { 
    selectedReport, data, loading, alert, dateRange, reportConfigs, estadoFilter,
    geminiPrompt, geminiResult, geminiLoading, iaReportId, exporting,
    isListening, speechSupported,
  } = state
  const { 
    loadReport, goBack, setDateRange, setAlert, setEstadoFilter,
    setGeminiPrompt, generarReporteIa, handleExport, handleExportIa,
    toggleListening,
  } = handlers

  const renderReportContent = () => {
    if (!selectedReport) return null
    
    // Renderizado especial para Gemini/IA
    const config = reportConfigs.find((r) => r.key === selectedReport)
    if (config?.isGemini) {
      return (
        <div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">🤖 Reporte Personalizado con IA</h3>
            <p className="text-sm text-slate-600 mb-4">
              Escribí qué reporte querés generar. La IA analizará los datos del sistema y generará un reporte estructurado.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Solicitud del reporte</label>
              <div className="flex gap-2">
                <textarea
                  value={geminiPrompt}
                  onChange={(e) => setGeminiPrompt(e.target.value)}
                  placeholder="Ej: Genera un reporte de los postulantes aprobados por carrera con análisis de rendimiento..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[100px] resize-y"
                  disabled={geminiLoading}
                />
                {speechSupported && (
                  <button
                    onClick={toggleListening}
                    disabled={geminiLoading}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center min-w-[44px] ${
                      isListening
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                    title={isListening ? 'Detener grabación' : 'Grabar con voz'}
                  >
                    {isListening ? '⏹' : '🎤'}
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-500">Mínimo 10 caracteres, máximo 2000.</p>
                {isListening && (
                  <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Escuchando...
                  </span>
                )}
              </div>
              {!speechSupported && (
                <p className="text-xs text-amber-600 mt-1">⚠ Tu navegador no soporta reconocimiento de voz. Usá Chrome o Edge.</p>
              )}
            </div>

            <button
              onClick={generarReporteIa}
              disabled={geminiLoading || !geminiPrompt.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {geminiLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Generando con IA...
                </span>
              ) : (
                '🤖 Generar Reporte con IA'
              )}
            </button>
          </div>

          {geminiResult && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">{geminiResult.titulo}</h3>
                {iaReportId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportIa('excel')}
                      disabled={exporting !== null}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {exporting === 'excel' ? <><LoadingSpinner size="sm" />...</> : '📊 Excel'}
                    </button>
                    <button
                      onClick={() => handleExportIa('pdf')}
                      disabled={exporting !== null}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {exporting === 'pdf' ? <><LoadingSpinner size="sm" />...</> : '📄 PDF'}
                    </button>
                  </div>
                )}
              </div>
              
              {geminiResult.resumen && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Resumen</h4>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-slate-700 leading-relaxed">{geminiResult.resumen}</p>
                  </div>
                </div>
              )}

              {geminiResult.columnas && geminiResult.columnas.length > 0 && geminiResult.filas && geminiResult.filas.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Datos</h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          {geminiResult.columnas.map((col, idx) => (
                            <th key={idx} className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {geminiResult.filas.map((fila, idx) => (
                          <tr key={idx} className="even:bg-slate-50 hover:bg-blue-50/50 transition-colors">
                            {fila.map((valor, idx2) => (
                              <td key={idx2} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                                {valor !== null && valor !== undefined ? String(valor) : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {geminiResult.conclusiones && geminiResult.conclusiones.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Conclusiones</h4>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <ol className="list-decimal list-inside space-y-2">
                      {geminiResult.conclusiones.map((conclusion, idx) => (
                        <li key={idx} className="text-sm text-slate-700">{conclusion}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {(!geminiResult.columnas || geminiResult.columnas.length === 0) && (!geminiResult.filas || geminiResult.filas.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <p>No existen datos suficientes para generar este reporte.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    if (loading) return <LoadingSpinner size="lg" />
    if (!data) return <div className="text-slate-500 text-center py-8">Cargando datos...</div>

    try {
      if (!Array.isArray(data)) {
        console.error('Report data is not an array:', data)
        return <div className="text-red-600 text-center py-8">Error: Los datos no tienen el formato esperado.</div>
      }

      if (data.length === 0) {
        return <div className="text-slate-500 text-center py-8">No hay datos disponibles para este reporte.</div>
      }

      if (!data[0] || typeof data[0] !== 'object') {
        return <div className="text-slate-500 text-center py-8">No hay datos disponibles para este reporte.</div>
      }

      let columns = []
      
      if (selectedReport === 'postulantes') {
        const postulantesColumns = [
          { key: 'ci', label: 'CI' },
          { key: 'nombres', label: 'Nombres' },
          { key: 'apellidos', label: 'Apellidos' },
          { key: 'fecha_nacimiento', label: 'Fecha Nacimiento', render: (val) => val?.split('T')[0] || val || '—' },
          { key: 'sexo', label: 'Sexo' },
          { key: 'direccion', label: 'Direccion' },
          { key: 'telefono', label: 'Telefono' },
          { key: 'email', label: 'Email' },
          { key: 'colegio_procedencia', label: 'Colegio Procedencia' },
          { key: 'ciudad', label: 'Ciudad' },
          { key: 'promedio_final', label: 'Promedio Final', render: (val) => val ?? '—' },
          { key: 'estado_promedio', label: 'Estado Promedio' },
          { key: 'carrera_primera', label: 'Carrera Primera', render: (val) => val?.nombre || val?.name || '—' },
          { key: 'carrera_segunda', label: 'Carrera Segunda', render: (val) => val?.nombre || val?.name || '—' },
          { key: 'carrera_asignada', label: 'Carrera Asignada', render: (val) => val?.nombre || val?.name || '—' },
        ]
        columns = postulantesColumns
      } else if (selectedReport === 'promedios') {
        const keys = Object.keys(data[0]).filter(k => k !== 'id')
        columns = keys.map((k) => ({
          key: k,
          label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          render: (val) => {
            if (val === null || val === undefined) return '—'
            if (typeof val === 'number') return val.toFixed ? val.toFixed(2) : val
            if (typeof val === 'object') {
              if (Array.isArray(val)) {
                if (val.length === 0) return '—'
                const first = val[0]
                if (typeof first === 'object') return first.nombre || first.name || first.codigo || first.label || '—'
                return String(first)
              }
              return val.nombre || val.name || val.codigo || val.label || JSON.stringify(val)
            }
            return String(val)
          },
        }))
      } else if (selectedReport === 'estadisticas-materia') {
        const keys = Object.keys(data[0]).filter(k => k !== 'materia_id')
        columns = keys.map((k) => ({
          key: k,
          label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          render: (val) => {
            if (val === null || val === undefined) return '—'
            if (typeof val === 'number') return val.toFixed ? val.toFixed(2) : val
            if (typeof val === 'object') {
              if (Array.isArray(val)) {
                if (val.length === 0) return '—'
                const first = val[0]
                if (typeof first === 'object') return first.nombre || first.name || first.codigo || first.label || '—'
                return String(first)
              }
              return val.nombre || val.name || val.codigo || val.label || JSON.stringify(val)
            }
            return String(val)
          },
        }))
      } else if (selectedReport === 'docentes-grupos') {
        const keys = Object.keys(data[0]).filter(k => k !== 'id')
        columns = keys.map((k) => ({
          key: k,
          label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          render: (val) => {
            if (val === null || val === undefined) return '—'
            if (typeof val === 'number') return val.toFixed ? val.toFixed(2) : val
            if (typeof val === 'object') {
              if (Array.isArray(val)) {
                if (val.length === 0) return '—'
                const first = val[0]
                if (typeof first === 'object') return first.nombre || first.name || first.codigo || first.label || '—'
                return String(first)
              }
              return val.nombre || val.name || val.codigo || val.label || JSON.stringify(val)
            }
            return String(val)
          },
        }))
      } else if (selectedReport === 'cupos-carrera') {
        const keys = Object.keys(data[0]).filter(k => k !== 'id')
        columns = keys.map((k) => ({
          key: k,
          label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          render: (val) => {
            if (val === null || val === undefined) return '—'
            if (typeof val === 'number') return val.toFixed ? val.toFixed(2) : val
            if (typeof val === 'object') {
              if (Array.isArray(val)) {
                if (val.length === 0) return '—'
                const first = val[0]
                if (typeof first === 'object') return first.nombre || first.name || first.codigo || first.label || '—'
                return String(first)
              }
              return val.nombre || val.name || val.codigo || val.label || JSON.stringify(val)
            }
            return String(val)
          },
        }))
      } else {
        const keys = Object.keys(data[0])
        columns = keys.map((k) => ({
          key: k,
          label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          render: (val) => {
            if (val === null || val === undefined) return '—'
            if (typeof val === 'number') return val.toFixed ? val.toFixed(2) : val
            if (typeof val === 'object') {
              if (Array.isArray(val)) {
                if (val.length === 0) return '—'
                const first = val[0]
                if (typeof first === 'object') return first.nombre || first.name || first.codigo || first.label || '—'
                return String(first)
              }
              return val.nombre || val.name || val.codigo || val.label || JSON.stringify(val)
            }
            return String(val)
          },
        }))
      }

      const showChart = ['grupos-mas-aprobados'].includes(selectedReport)

      return (
        <div>
          {showChart && data.length <= 20 && (
            <div className="mb-6 bg-white rounded-lg border p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={columns[0].key} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={columns[1].key} fill="#2563eb" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <DataTable columns={columns} data={data} loading={false} searchable={true} actions={false} />
          </div>
        </div>
      )
    } catch (err) {
      console.error('Error rendering report:', err)
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Error al renderizar el reporte:</p>
          <p className="text-red-600 text-sm mt-1">{err.message}</p>
        </div>
      )
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reportes</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {selectedReport && selectedReport === 'asistencia-docente' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Filtrar por fecha</h3>
          <div className="flex gap-4 items-end">
            <div><label className="block text-xs text-slate-500 mb-1">Desde</label><input type="date" value={dateRange.desde} onChange={(e) => setDateRange({ ...dateRange, desde: e.target.value })} className="px-3 py-1.5 border rounded text-sm" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Hasta</label><input type="date" value={dateRange.hasta} onChange={(e) => setDateRange({ ...dateRange, hasta: e.target.value })} className="px-3 py-1.5 border rounded text-sm" /></div>
            <button onClick={() => loadReport(selectedReport)} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Aplicar</button>
          </div>
        </div>
      )}

      {selectedReport && selectedReport === 'postulantes' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Filtrar por estado</h3>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Estado</label>
              <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="px-3 py-1.5 border rounded text-sm">
                <option value="">Todos</option>
                <option value="APROBADO">Aprobado</option>
                <option value="REPROBADO">Reprobado</option>
              </select>
            </div>
            <button onClick={() => loadReport(selectedReport, estadoFilter)} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Aplicar</button>
          </div>
        </div>
      )}

      {!selectedReport ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reportConfigs.map((r) => (
            <div
              key={r.key}
              className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 text-left hover:shadow-md hover:border-blue-300 transition-all"
            >
              <button
                onClick={() => loadReport(r.key)}
                className="w-full text-left"
              >
                <span className="text-2xl">{r.icon}</span>
                <h3 className="font-semibold text-slate-800 mt-2">{r.label}</h3>
                <p className="text-xs text-slate-500 mt-1">{r.desc}</p>
              </button>
              {!r.isGemini && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleExport(r.key, 'excel')}
                    disabled={exporting !== null}
                    className="flex-1 px-2 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {exporting === `${r.key}-excel` ? (
                      <><LoadingSpinner size="sm" />...</>
                    ) : (
                      <>📊 Excel</>
                    )}
                  </button>
                  <button
                    onClick={() => handleExport(r.key, 'pdf')}
                    disabled={exporting !== null}
                    className="flex-1 px-2 py-1.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {exporting === `${r.key}-pdf` ? (
                      <><LoadingSpinner size="sm" />...</>
                    ) : (
                      <>📄 PDF</>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={goBack} className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50">← Volver</button>
            <h2 className="text-lg font-semibold text-slate-800">{reportConfigs.find((r) => r.key === selectedReport)?.label}</h2>
          </div>
          {renderReportContent()}
        </div>
      )}
    </div>
  )
}
