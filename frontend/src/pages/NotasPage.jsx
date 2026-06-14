import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'

export default function NotasPage() {
  const [postulantes, setPostulantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [alert, setAlert] = useState({ type: '', message: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/postulantes', { params: { per_page: 100 } })
      setPostulantes(res.data.data || res.data.postulantes || res.data)
    } catch {
      setAlert({ type: 'error', message: 'Error al cargar postulantes' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const columns = [
    { key: 'ci', label: 'CI' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'promedio_final', label: 'Promedio Final', render: (val) => val != null ? parseFloat(val).toFixed(2) : '—' },
    { key: 'estado', label: 'Estado', render: (val) => {
      const colors = { APROBADO: 'bg-green-100 text-green-800', REPROBADO: 'bg-red-100 text-red-800', PENDIENTE: 'bg-yellow-100 text-yellow-800', INSCRITO: 'bg-blue-100 text-blue-800' }
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[val] || 'bg-slate-100 text-slate-800'}`}>{val}</span>
    }},
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Notas y Promedios</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={postulantes}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar postulante..."
          searchValue={search}
          onSearch={setSearch}
          onView={(row) => `/notas/${row.id}`}
          emptyMessage="No se encontraron postulantes."
        />
      </div>
    </div>
  )
}
