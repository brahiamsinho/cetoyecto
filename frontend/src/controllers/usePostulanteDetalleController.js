import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export function usePostulanteDetalleController() {
  const { id } = useParams()
  const [postulante, setPostulante] = useState(null)
  const [notas, setNotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [showPayment, setShowPayment] = useState(false)

  const load = useCallback(async () => {
    try {
      const [postulanteRes, notasRes] = await Promise.all([
        api.get(`/postulantes/${id}`),
        api.get(`/postulantes/${id}/notas`).catch(() => ({ data: { data: [] } })),
      ])
      const postulanteData = postulanteRes.data.data || postulanteRes.data.postulante || postulanteRes.data
      setPostulante(postulanteData)
      setNotas(notasRes.data.data || notasRes.data.notas || postulanteData?.notas || [])
    } catch {
      setAlert({ type: 'error', message: 'Error al cargar datos' })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handlePaymentSuccess = (pago) => {
    setShowPayment(false)
    setAlert({ type: 'success', message: `Pago de Bs. ${pago?.monto ?? 700} registrado correctamente.` })
    load()
  }

  return {
    state: { postulante, notas, loading, alert, showPayment },
    handlers: { setAlert, setShowPayment, handlePaymentSuccess },
  }
}
