import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

export default function PostulantesPage() {
  const [postulantes, setPostulantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })

  const fetchPostulantes = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (search) params.search = search
      if (estadoFilter) params.estado = estadoFilter
      const res = await api.get('/postulantes', { params })
      setPostulantes(res.data.data || res.data.postulantes || res.data)
      setTotalPages(res.data.last_page || res.data.total_pages || 1)
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al cargar postulantes' })
    } finally {
      setLoading(false)
    }
  }, [page, search, estadoFilter])

  useEffect(() => { fetchPostulantes() }, [fetchPostulantes])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/postulantes/${deleteTarget.id}`)
      setAlert({ type: 'success', message: 'Postulante eliminado correctamente.' })
      setDeleteTarget(null)
      fetchPostulantes()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al eliminar' })
      setDeleteTarget(null)
    }
  }

  const columns = [
    { key: 'ci', label: 'CI' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'email', label: 'Email' },
    { key: 'carrera_primera_opcion', label: '1ra Opción', render: (val) => val || '—' },
    { key: 'estado', label: 'Estado', render: (val) => {
      const colors = { APROBADO: 'bg-green-100 text-green-800', REPROBADO: 'bg-red-100 text-red-800', PENDIENTE: 'bg-yellow-100 text-yellow-800', INSCRITO: 'bg-blue-100 text-blue-800' }
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-800'}`}>{val}</span>
    }},
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Postulantes</h1>
        <Link to="/postulantes/nuevo" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Nuevo Postulante
        </Link>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por CI o nombre..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
        />
        <select
          value={estadoFilter}
          onChange={(e) => { setEstadoFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="INSCRITO">Inscrito</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="APROBADO">Aprobado</option>
          <option value="REPROBADO">Reprobado</option>
        </select>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={postulantes}
          loading={loading}
          searchable={false}
          onView={(row) => `/postulantes/${row.id}`}
          onEdit={(row) => `/postulantes/${row.id}/editar`}
          onDelete={(row) => setDeleteTarget(row)}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Postulante"
        message={`¿Está seguro de eliminar a ${deleteTarget?.nombres} ${deleteTarget?.apellidos}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
