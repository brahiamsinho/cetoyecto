import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'

export default function BitacoraPage() {
  const [bitacora, setBitacora] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ modulo: '', accion: '', desde: '', hasta: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (filters.modulo) params.modulo = filters.modulo
      if (filters.accion) params.accion = filters.accion
      if (filters.desde) params.desde = filters.desde
      if (filters.hasta) params.hasta = filters.hasta
      const res = await api.get('/bitacora', { params })
      setBitacora(res.data.data || res.data.bitacora || res.data.registros || [])
      setTotalPages(res.data.last_page || res.data.total_pages || 1)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al cargar bitácora' })
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchData() }, [fetchData])

  const columns = [
    { key: 'usuario', label: 'Usuario', render: (val) => val || '—' },
    { key: 'action', label: 'Acción', render: (val) => <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{val}</span> },
    { key: 'module', label: 'Módulo', render: (val) => val || '—' },
    { key: 'description', label: 'Descripción', render: (val) => val || '—' },
    { key: 'ip_address', label: 'IP', render: (val) => val || '—' },
    { key: 'created_at', label: 'Fecha', render: (val) => val ? new Date(val).toLocaleString() : '—' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Bitácora</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Módulo</label>
            <select value={filters.modulo} onChange={(e) => { setFilters({ ...filters, modulo: e.target.value }); setPage(1) }} className="px-3 py-1.5 border border-slate-300 rounded text-sm">
              <option value="">Todos</option>
              <option value="postulantes">Postulantes</option>
              <option value="notas">Notas</option>
              <option value="carreras">Carreras</option>
              <option value="grupos">Grupos</option>
              <option value="docentes">Docentes</option>
              <option value="auth">Autenticación</option>
              <option value="usuarios">Usuarios</option>
              <option value="importaciones">Importaciones</option>
              <option value="asistencias">Asistencias</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Acción</label>
            <select value={filters.accion} onChange={(e) => { setFilters({ ...filters, accion: e.target.value }); setPage(1) }} className="px-3 py-1.5 border border-slate-300 rounded text-sm">
              <option value="">Todas</option>
              <option value="CREATE">Crear</option>
              <option value="READ">Leer</option>
              <option value="UPDATE">Actualizar</option>
              <option value="DELETE">Eliminar</option>
              <option value="LOGIN">Inicio Sesión</option>
              <option value="LOGOUT">Cierre Sesión</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Desde</label>
            <input type="date" value={filters.desde} onChange={(e) => { setFilters({ ...filters, desde: e.target.value }); setPage(1) }} className="px-3 py-1.5 border border-slate-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
            <input type="date" value={filters.hasta} onChange={(e) => { setFilters({ ...filters, hasta: e.target.value }); setPage(1) }} className="px-3 py-1.5 border border-slate-300 rounded text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={bitacora}
          loading={loading}
          searchable={false}
          actions={false}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="No hay registros en la bitácora."
        />
      </div>
    </div>
  )
}
