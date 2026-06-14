import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export function useDocenteFormController() {
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
    if (!form.ci || !form.nombres || !form.apellidos || !form.email || !form.profesion) {
      setAlert({ type: 'error', message: 'Complete todos los campos obligatorios (CI, Nombres, Apellidos, Email, Profesión).' })
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
      const errors = err.response?.data?.errors
      const message = errors
        ? Object.values(errors).flat().join(' ')
        : (err.response?.data?.message || 'Error al guardar')
      setAlert({ type: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  return {
    state: { form, loading, saving, alert, isEdit },
    handlers: { handleChange, handleSubmit, setAlert },
  }
}
