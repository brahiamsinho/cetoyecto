import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

export default function DocentesPage() {
  const [docentes, setDocentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alert, setAlert] = useState({ type: '', message: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/docentes')
      setDocentes(res.data.data || res.data.docentes || res.data)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al cargar docentes' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/docentes/${deleteTarget.id}`)
      setAlert({ type: 'success', message: 'Docente eliminado.' })
      setDeleteTarget(null)
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al eliminar' })
      setDeleteTarget(null)
    }
  }

  const validarRequisitos = async (docente) => {
    try {
      const res = await api.post(`/docentes/${docente.id}/validar-requisitos`)
      setAlert({ type: 'success', message: res.data.message || `Requisitos validados: ${res.data.estado || 'OK'}` })
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al validar requisitos' })
    }
  }

  const columns = [
    { key: 'ci', label: 'CI' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'email', label: 'Email' },
    { key: 'profesion', label: 'Profesión', render: (val) => val || '—' },
    { key: 'contratado', label: 'Contratado', render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {val ? 'Sí' : 'No'}
      </span>
    )},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <button onClick={() => validarRequisitos(row)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
        Validar Requisitos
      </button>
    )},
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Docentes</h1>
        <Link to="/docentes/nuevo" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          + Nuevo Docente
        </Link>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable
          columns={columns}
          data={docentes}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar docente..."
          onEdit={(row) => `/docentes/nuevo?id=${row.id}`}
          onDelete={(row) => setDeleteTarget(row)}
          actions={true}
        />
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Eliminar Docente" message={`¿Está seguro de eliminar a ${deleteTarget?.nombres} ${deleteTarget?.apellidos}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
