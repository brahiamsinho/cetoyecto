import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useGruposController() {
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/grupos', { params: { visible: 1 } })
      setGrupos(res.data.data || res.data.grupos || res.data)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al cargar grupos' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const generarGrupos = async () => {
    setGenerating(true)
    setAlert({ type: '', message: '' })
    try {
      const res = await api.post('/grupos/generar')
      setAlert({ type: 'success', message: res.data.message || 'Grupos generados correctamente.' })
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al generar grupos' })
    } finally {
      setGenerating(false)
    }
  }

  return {
    state: { grupos, loading, generating, alert },
    handlers: { generarGrupos, setAlert },
  }
}
