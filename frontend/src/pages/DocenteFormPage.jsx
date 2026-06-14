import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import AlertMessage from '../components/AlertMessage'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DocenteFormPage() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({
    ci: '', nombres: '', apellidos: '', email: '', telefono: '', profesion: '',
    maestria: false, diplomado_educacion_superior: false,
  })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })

  useEffect(() => {
    if (!isEdit) return
    api.get(`/docentes/${id}`)
      .then((res) => {
        const d = res.data.data || res.data.docente || res.data
        setForm({
          ci: d.ci || '', nombres: d.nombres || '', apellidos: d.apellidos || '',
          email: d.email || '', telefono: d.telefono || '', profesion: d.profesion || '',
          maestria: !!d.maestria, diplomado_educacion_superior: !!d.diplomado_educacion_superior,
        })
      })
      .catch(() => setAlert({ type: 'error', message: 'Error al cargar docente' }))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.ci || !form.nombres || !form.apellidos || !form.email) {
      setAlert({ type: 'error', message: 'Complete los campos obligatorios.' })
      return
    }
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/docentes/${id}`, form)
      } else {
        await api.post('/docentes', form)
      }
      navigate('/docentes')
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? 'Editar Docente' : 'Nuevo Docente'}</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CI *</label>
              <input type="text" name="ci" value={form.ci} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
              <input type="text" name="nombres" value={form.nombres} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
              <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input type="text" name="telefono" value={form.telefono} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Profesión</label>
              <input type="text" name="profesion" value={form.profesion} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Formación</label>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="maestria" checked={form.maestria} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span className="text-sm text-slate-700">Maestría</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="diplomado_educacion_superior" checked={form.diplomado_educacion_superior} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded border-slate-300" />
              <span className="text-sm text-slate-700">Diplomado en Educación Superior</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
              {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Docente')}
            </button>
            <button type="button" onClick={() => navigate('/docentes')} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
