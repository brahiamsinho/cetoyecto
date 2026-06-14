import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export function useGrupoDetalleController() {
  const { id } = useParams()
  const [grupo, setGrupo] = useState(null)
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const [grupoRes, estudiantesRes] = await Promise.all([
          api.get(`/grupos/${id}`),
          api.get(`/grupos/${id}/estudiantes`).catch(() => ({ data: { data: [] } })),
        ])
        setGrupo(grupoRes.data.data || grupoRes.data.grupo || grupoRes.data)
        setEstudiantes(estudiantesRes.data.data || estudiantesRes.data.estudiantes || [])
      } catch (err) {
        setAlert({ type: 'error', message: 'Error al cargar datos del grupo' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return {
    state: { grupo, estudiantes, loading, alert },
    handlers: { setAlert },
  }
}
