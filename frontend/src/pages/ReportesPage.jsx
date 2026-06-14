import { useState, useEffect } from 'react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'
import AlertMessage from '../components/AlertMessage'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const reportConfigs = [
  { key: 'postulantes', label: 'Postulantes', icon: '📋', desc: 'Lista completa de postulantes' },
  { key: 'aprobados', label: 'Aprobados', icon: '✅', desc: 'Postulantes aprobados' },
  { key: 'reprobados', label: 'Reprobados', icon: '❌', desc: 'Postulantes reprobados' },
  { key: 'promedios', label: 'Promedios', icon: '📊', desc: 'Promedios generales' },
  { key: 'grupos', label: 'Grupos', icon: '👥', desc: 'Lista de grupos' },
  { key: 'estadisticas-materia', label: 'Estadísticas por Materia', icon: '📚', desc: 'Rendimiento por materia' },
  { key: 'docentes-grupos', label: 'Docentes por Grupos', icon: '🧑‍🏫', desc: 'Asignación docente-grupo' },
  { key: 'grupos-mas-aprobados', label: 'Grupos más Aprobados', icon: '🏆', desc: 'Grupos con mayor aprobación' },
  { key: 'asistencia-docente', label: 'Asistencia Docente', icon: '⏰', desc: 'Reporte de asistencia por docente', hasDateRange: true },
  { key: 'cupos-carrera', label: 'Cupos por Carrera', icon: '🎯', desc: 'Ocupación de cupos por carrera' },
  { key: 'gemini', label: 'Reporte con Gemini', icon: '🤖', desc: 'Reporte personalizado con IA', isGemini: true },
]

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#0891b2', '#db2777', '#ea580c']

export default function ReportesPage() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [renderError, setRenderError] = useState(null)
  const [dateRange, setDateRange] = useState({ desde: '', hasta: '' })
  const [geminiPrompt, setGeminiPrompt] = useState('')
  const [geminiFormats, setGeminiFormats] = useState(['html'])
  const [geminiResult, setGeminiResult] = useState(null)
  const [geminiLoading, setGeminiLoading] = useState(false)
  const [exporting, setExporting] = useState(null) // 'excel' | 'pdf' | null
  const [iaReportId, setIaReportId] = useState(null)

  const downloadFile = async (url, fileName) => {
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href)
    } catch (err) {
      console.error('Error downloading file:', err)
      setAlert({ type: 'error', message: 'Error al descargar el archivo.' })
    }
  }

  const handleExport = async (format) => {
    if (!selectedReport) return
    setExporting(format)
    try {
      const params = {}
      if (selectedReport === 'asistencia-docente') {
        if (dateRange.desde) params.desde = dateRange.desde
        if (dateRange.hasta) params.hasta = dateRange.hasta
      }
      const queryString = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : ''
      const fileName = `reporte_${selectedReport}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      await downloadFile(`/reportes/exportar/${selectedReport}/${format}${queryString}`, fileName)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al exportar el reporte.' })
    } finally {
      setExporting(null)
    }
  }

  const handleExportCard = async (reportKey, format) => {
    setExporting(`${reportKey}-${format}`)
    try {
      const fileName = `reporte_${reportKey}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      await downloadFile(`/reportes/exportar/${reportKey}/${format}`, fileName)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al exportar el reporte.' })
    } finally {
      setExporting(null)
    }
  }

  const handleExportIa = async (format) => {
    if (!iaReportId) return
    setExporting(format)
    try {
      const fileName = `reporte_ia_${iaReportId}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      await downloadFile(`/reportes/ia/${iaReportId}/${format}`, fileName)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al exportar el reporte IA.' })
    } finally {
      setExporting(null)
    }
  }

  const loadReport = async (key) => {
    setSelectedReport(key)
    setLoading(true)
    setAlert({ type: '', message: '' })
    setRenderError(null)
    setGeminiResult(null)
    try {
      const params = {}
      if (key === 'asistencia-docente') {
        if (dateRange.desde) params.desde = dateRange.desde
        if (dateRange.hasta) params.hasta = dateRange.hasta
      }
      const res = await api.get(`/reportes/${key}`, { params })
      console.log('Reporte response:', res.data)
      let reportData = res.data.data || res.data.reportes || res.data
      if (key === 'aprobados' || key === 'reprobados') {
        reportData = reportData.data || reportData
      }
      setData(reportData)
    } catch (err) {
      console.error('Error loading report:', err)
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al cargar reporte' })
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const generarReporteGemini = async () => {
    if (!geminiPrompt.trim()) {
      setAlert({ type: 'error', message: 'Debes escribir un prompt para generar el reporte.' })
      return
    }

    setGeminiLoading(true)
    setAlert({ type: '', message: '' })
    setGeminiResult(null)
    setIaReportId(null)
    try {
      const res = await api.post('/reportes/ia/generar', {
        prompt: geminiPrompt,
      })
      
      if (res.data.success) {
        setGeminiResult(res.data.data)
        setIaReportId(res.data.data.id)
        setAlert({ type: 'success', message: res.data.message || 'Reporte generado correctamente.' })
      } else {
        setAlert({ type: 'error', message: res.data.message || 'Error al generar reporte.' })
      }
    } catch (err) {
      console.error('Error generando reporte con IA:', err)
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al generar reporte con IA.' })
    } finally {
      setGeminiLoading(false)
    }
  }

  const renderReportContent = () => {
    if (!selectedReport) return null
    if (loading) return <LoadingSpinner size="lg" />
    if (renderError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Error al renderizar el reporte:</p>
          <p className="text-red-600 text-sm mt-1">{renderError}</p>
          <p className="text-slate-500 text-xs mt-2">Por favor, abra la consola del navegador (F12) para más detalles.</p>
        </div>
      )
    }

    const config = reportConfigs.find((r) => r.key === selectedReport)
    
    // Renderizado especial para Gemini/IA
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
              <textarea
                value={geminiPrompt}
                onChange={(e) => setGeminiPrompt(e.target.value)}
                placeholder="Ej: Genera un reporte de los postulantes aprobados por carrera con análisis de rendimiento..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[100px] resize-y"
                disabled={geminiLoading}
              />
              <p className="text-xs text-slate-500 mt-1">Mínimo 10 caracteres, máximo 2000.</p>
            </div>

            <button
              onClick={generarReporteGemini}
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

    if (!data) return <div className="text-slate-500 text-center py-8">Cargando datos...</div>

    try {
      if (Array.isArray(data) && data.length > 0) {
        const keys = Object.keys(data[0])
        const columns = keys.map((k) => ({
          key: k,
          label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          render: (val) => {
            if (typeof val === 'number') return val.toFixed ? val.toFixed(2) : val
            if (val === null || val === undefined) return '—'
            if (typeof val === 'object') {
              if (Array.isArray(val)) {
                if (val.length === 0) return '—'
                const first = val[0]
                if (typeof first === 'object') return first.nombre || first.name || first.codigo || JSON.stringify(first)
                return String(first)
              }
              return val.nombre || val.name || val.codigo || val.label || JSON.stringify(val)
            }
            return String(val)
          },
        }))

        const showChart = ['promedios', 'estadisticas-materia', 'cupos-carrera', 'grupos-mas-aprobados'].includes(selectedReport)

        return (
          <div>
            {showChart && data.length <= 20 && (
              <div className="mb-6 bg-white rounded-lg border p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={keys[0]} tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={keys[1]} fill="#2563eb" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <DataTable columns={columns} data={data} loading={false} searchable={true} actions={false} />
            </div>
          </div>
        )
      }

      return <div className="text-slate-500 text-center py-8">No hay datos disponibles para este reporte.</div>
    } catch (err) {
      console.error('Render error:', err)
      setRenderError(err.message || 'Error desconocido al renderizar')
      return null
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
                    onClick={() => handleExportCard(r.key, 'excel')}
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
                    onClick={() => handleExportCard(r.key, 'pdf')}
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
            <button onClick={() => { setSelectedReport(null); setData(null) }} className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50">← Volver</button>
            <h2 className="text-lg font-semibold text-slate-800">{reportConfigs.find((r) => r.key === selectedReport)?.label}</h2>
            {!config?.isGemini && selectedReport && (
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => handleExport('excel')}
                  disabled={exporting !== null}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {exporting === 'excel' ? (
                    <><LoadingSpinner size="sm" /> Exportando...</>
                  ) : (
                    <>📊 Excel</>
                  )}
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting !== null}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {exporting === 'pdf' ? (
                    <><LoadingSpinner size="sm" /> Exportando...</>
                  ) : (
                    <> PDF</>
                  )}
                </button>
              </div>
            )}
          </div>
          {renderReportContent()}
        </div>
      )}
    </div>
  )
}
