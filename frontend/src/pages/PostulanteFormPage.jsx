import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import AlertMessage from '../components/AlertMessage'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PostulanteFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({
    ci: '', nombres: '', apellidos: '', fecha_nacimiento: '', sexo: '',
    direccion: '', telefono: '', email: '', colegio_procedencia: '',
    ciudad: '', carrera_primera_id: '', carrera_segunda_id: '', gestion_id: '',
  })
  const [files, setFiles] = useState({
    carnet_identidad: null,
    foto: null,
    diploma_bachiller: null,
  })
  const [filePreview, setFilePreview] = useState(null)
  const [carreras, setCarreras] = useState([])
  const [gestiones, setGestiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [carrerasRes, gestionesRes] = await Promise.all([
          api.get('/carreras?all=true'),
          api.get('/gestiones'),
        ])
        setCarreras(carrerasRes.data.data || carrerasRes.data.carreras || carrerasRes.data || [])
        setGestiones(gestionesRes.data.data || gestionesRes.data.gestiones || gestionesRes.data || [])
        if (isEdit) {
          const res = await api.get(`/postulantes/${id}`)
          const p = res.data.data || res.data.postulante || res.data
          setForm({
            ci: p.ci || '', nombres: p.nombres || '', apellidos: p.apellidos || '',
            fecha_nacimiento: p.fecha_nacimiento?.split('T')[0] || '', sexo: p.sexo || '',
            direccion: p.direccion || '', telefono: p.telefono || '', email: p.email || '',
            colegio_procedencia: p.colegio_procedencia || '', ciudad: p.ciudad || '',
            carrera_primera_id: p.carrera_primera_id || p.carrera_primera_opcion || '',
            carrera_segunda_id: p.carrera_segunda_id || p.carrera_segunda_opcion || '',
            gestion_id: p.gestion_id || p.gestion || '',
          })
        }
      } catch (err) {
        setAlert({ type: 'error', message: 'Error al cargar datos' })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, isEdit])

  const validate = () => {
    const errs = {}
    if (!form.ci || !/^\d+$/.test(form.ci)) errs.ci = 'CI debe ser solo números'
    if (!form.nombres.trim()) errs.nombres = 'Campo obligatorio'
    if (!form.apellidos.trim()) errs.apellidos = 'Campo obligatorio'
    if (!form.fecha_nacimiento) errs.fecha_nacimiento = 'Campo obligatorio'
    if (!form.sexo) errs.sexo = 'Seleccione una opción'
    if (!form.email.trim()) errs.email = 'Campo obligatorio'
    if (!form.carrera_primera_id) errs.carrera_primera_id = 'Seleccione una carrera'
    if (!form.gestion_id) errs.gestion_id = 'Seleccione una gestión'
    if (!isEdit) {
      if (!files.carnet_identidad) errs.carnet_identidad = 'Campo obligatorio'
      if (!files.foto) errs.foto = 'Campo obligatorio'
      if (!files.diploma_bachiller) errs.diploma_bachiller = 'Campo obligatorio'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, type } = e.target
    if (type === 'file') {
      const file = e.target.files[0]
      setFiles((prev) => ({ ...prev, [name]: file }))
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
      if (name === 'foto' && file) {
        const reader = new FileReader()
        reader.onloadend = () => setFilePreview(reader.result)
        reader.readAsDataURL(file)
      }
    } else {
      const { value } = e.target
      setForm((prev) => ({ ...prev, [name]: value }))
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setAlert({ type: '', message: '' })
    try {
      if (isEdit) {
        await api.put(`/postulantes/${id}`, form)
      } else {
        const formData = new FormData()
        Object.entries(form).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            formData.append(key, value)
          }
        })
        Object.entries(files).forEach(([key, file]) => {
          if (file) formData.append(key, file)
        })
        await api.post('/postulantes', formData)
      }
      navigate('/postulantes')
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || err.response?.data?.error || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  const inputClass = (name) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[name] ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'
    }`

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? 'Editar Postulante' : 'Nuevo Postulante'}</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CI *</label>
              <input type="text" name="ci" value={form.ci} onChange={handleChange} className={inputClass('ci')} />
              {errors.ci && <p className="text-xs text-red-500 mt-1">{errors.ci}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
              <input type="text" name="nombres" value={form.nombres} onChange={handleChange} className={inputClass('nombres')} />
              {errors.nombres && <p className="text-xs text-red-500 mt-1">{errors.nombres}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
              <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} className={inputClass('apellidos')} />
              {errors.apellidos && <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento *</label>
              <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className={inputClass('fecha_nacimiento')} />
              {errors.fecha_nacimiento && <p className="text-xs text-red-500 mt-1">{errors.fecha_nacimiento}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sexo *</label>
              <select name="sexo" value={form.sexo} onChange={handleChange} className={inputClass('sexo')}>
                <option value="">Seleccione...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {errors.sexo && <p className="text-xs text-red-500 mt-1">{errors.sexo}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <textarea name="direccion" value={form.direccion} onChange={handleChange} rows={2} className={inputClass('direccion')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input type="text" name="telefono" value={form.telefono} onChange={handleChange} className={inputClass('telefono')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
              <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={inputClass('ciudad')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Colegio de Procedencia</label>
              <input type="text" name="colegio_procedencia" value={form.colegio_procedencia} onChange={handleChange} className={inputClass('colegio_procedencia')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gestión *</label>
              <select name="gestion_id" value={form.gestion_id} onChange={handleChange} className={inputClass('gestion_id')}>
                <option value="">Seleccione...</option>
                {gestiones.map((g) => (
                  <option key={g.id} value={g.id}>{g.anio} - {g.periodo}</option>
                ))}
              </select>
              {errors.gestion_id && <p className="text-xs text-red-500 mt-1">{errors.gestion_id}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrera 1ra Opción *</label>
              <select name="carrera_primera_id" value={form.carrera_primera_id} onChange={handleChange} className={inputClass('carrera_primera_id')}>
                <option value="">Seleccione...</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {errors.carrera_primera_id && <p className="text-xs text-red-500 mt-1">{errors.carrera_primera_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrera 2da Opción</label>
              <select name="carrera_segunda_id" value={form.carrera_segunda_id} onChange={handleChange} className={inputClass('carrera_segunda_id')}>
                <option value="">Seleccione...</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {!isEdit && (
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Documentos Requeridos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Carnet de Identidad *</label>
                  <input
                    type="file"
                    name="carnet_identidad"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleChange}
                    className={inputClass('carnet_identidad')}
                  />
                  {files.carnet_identidad && (
                    <p className="text-xs text-slate-500 mt-1">{files.carnet_identidad.name}</p>
                  )}
                  {errors.carnet_identidad && <p className="text-xs text-red-500 mt-1">{errors.carnet_identidad}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Foto *</label>
                  <input
                    type="file"
                    name="foto"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleChange}
                    className={inputClass('foto')}
                  />
                  {files.foto && (
                    <p className="text-xs text-slate-500 mt-1">{files.foto.name}</p>
                  )}
                  {filePreview && (
                    <img src={filePreview} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded border border-slate-200" />
                  )}
                  {errors.foto && <p className="text-xs text-red-500 mt-1">{errors.foto}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diploma de Bachiller *</label>
                  <input
                    type="file"
                    name="diploma_bachiller"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleChange}
                    className={inputClass('diploma_bachiller')}
                  />
                  {files.diploma_bachiller && (
                    <p className="text-xs text-slate-500 mt-1">{files.diploma_bachiller.name}</p>
                  )}
                  {errors.diploma_bachiller && <p className="text-xs text-red-500 mt-1">{errors.diploma_bachiller}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors">
              {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Postulante')}
            </button>
            <button type="button" onClick={() => navigate('/postulantes')} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
