import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export function usePostulanteFormController() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({
    ci: '', nombres: '', apellidos: '', fecha_nacimiento: '', sexo: '',
    direccion: '', telefono: '', email: '', colegio_procedencia: '',
    ciudad: '', carrera_primera_id: '', carrera_segunda_id: '', gestion_id: '',
    tiene_carnet_identidad: false, tiene_foto: false, tiene_diploma_bachiller: false,
  })
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
          api.get('/carreras'),
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
            tiene_carnet_identidad: p.tiene_carnet_identidad || false,
            tiene_foto: p.tiene_foto || false,
            tiene_diploma_bachiller: p.tiene_diploma_bachiller || false,
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
    if (!form.colegio_procedencia.trim()) errs.colegio_procedencia = 'Campo obligatorio'
    if (!form.ciudad.trim()) errs.ciudad = 'Campo obligatorio'
    if (!form.carrera_primera_id) errs.carrera_primera_id = 'Seleccione una carrera'
    if (!form.gestion_id) errs.gestion_id = 'Seleccione una gestión'
    if (!form.tiene_carnet_identidad) errs.tiene_carnet_identidad = 'Debe confirmar que tiene el carnet de identidad'
    if (!form.tiene_foto) errs.tiene_foto = 'Debe confirmar que tiene la foto'
    if (!form.tiene_diploma_bachiller) errs.tiene_diploma_bachiller = 'Debe confirmar que tiene el diploma de bachiller'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, type, checked } = e.target
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else {
      const { value } = e.target
      setForm((prev) => ({ ...prev, [name]: value }))
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setAlert({ type: '', message: '' })
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      )
      if (isEdit) {
        await api.put(`/postulantes/${id}`, payload)
      } else {
        await api.post('/postulantes', payload)
      }
      navigate('/postulantes')
    } catch (err) {
      const backendErrors = err.response?.data?.errors
      if (backendErrors) {
        const messages = Object.values(backendErrors).flat().join('. ')
        setAlert({ type: 'error', message: messages })
      } else {
        setAlert({ type: 'error', message: err.response?.data?.message || err.response?.data?.error || 'Error al guardar' })
      }
    } finally {
      setSaving(false)
    }
  }

  return {
    state: { form, carreras, gestiones, loading, saving, alert, errors, isEdit },
    handlers: { handleChange, handleSubmit, setAlert, setErrors },
  }
}
