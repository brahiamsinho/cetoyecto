import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'

export default function ImportacionesView({ state, handlers }) {
  const { importaciones, loading, alert, file, importing, result } = state
  const { handleFileChange, handleImport, setAlert, fileInputRef } = handlers

  const columns = [
    { key: 'archivo', label: 'Archivo', render: (val) => val || '—' },
    { key: 'tipo', label: 'Tipo', render: (val) => val || '—' },
    { key: 'total_filas', label: 'Total', render: (val) => val ?? '—' },
    { key: 'exitosas', label: 'Exitosos', render: (val) => <span className="text-green-600 font-medium">{val ?? '—'}</span> },
    { key: 'fallidas', label: 'Errores', render: (val) => <span className="text-red-600 font-medium">{val ?? '—'}</span> },
    { key: 'finalizada', label: 'Estado', render: (val) => {
      const color = val ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{val ? 'Completado' : 'Procesando'}</span>
    }},
    { key: 'created_at', label: 'Fecha', render: (val) => val ? new Date(val).toLocaleString() : '—' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Importaciones</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Importar Archivo</h2>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { fileInputRef.current.files = e.dataTransfer.files; handleFileChange({ target: { files: [f] } }) } }}
        >
          <ArrowUpTrayIcon className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600 mb-2">Arrastre un archivo aquí o haga clic para seleccionar</p>
          <p className="text-xs text-slate-400 mb-4">Formatos aceptados: CSV, XLSX</p>
          <p className="text-xs text-slate-500 mb-4">Puede enviar <code>rol_id</code> o <code>rol</code>/<code>role</code>. Use <code>Postulante</code> para ese rol.</p>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-700">
            Seleccionar Archivo
          </label>
          {file && <p className="text-sm text-slate-700 mt-3">Archivo: {file.name}</p>}
        </div>

        {file && (
          <div className="mt-4">
            <button onClick={handleImport} disabled={importing} className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg text-sm">
              {importing ? 'Importando...' : 'Importar Archivo'}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
            <h3 className="font-semibold text-slate-700 mb-2">Resultado</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold text-slate-800">{result.total_filas ?? result.total ?? 0}</p><p className="text-xs text-slate-500">Total</p></div>
              <div><p className="text-2xl font-bold text-green-600">{result.exitosas ?? result.success ?? 0}</p><p className="text-xs text-slate-500">Exitosos</p></div>
              <div><p className="text-2xl font-bold text-red-600">{result.fallidas ?? result.errors ?? 0}</p><p className="text-xs text-slate-500">Errores</p></div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Historial de Importaciones</h2>
        <DataTable columns={columns} data={importaciones} loading={loading} searchable={false} actions={false} emptyMessage="No hay importaciones registradas." />
      </div>
    </div>
  )
}
