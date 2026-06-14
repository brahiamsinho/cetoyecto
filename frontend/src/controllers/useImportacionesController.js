import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'

export function useImportacionesController() {
  const [importaciones, setImportaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/importaciones'); setImportaciones(res.data.data || res.data.importaciones || res.data) }
    catch (err) { setAlert({ type: 'error', message: 'Error al cargar importaciones' }) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setResult(null)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setAlert({ type: '', message: '' })
    const formData = new FormData()
    formData.append('archivo', file)
    try {
      const res = await api.post('/importaciones/usuarios', formData)
      const d = res.data.data || res.data
      const r = d.resultados || d
      setResult(r)
      setAlert({ type: 'success', message: res.data.message || 'Importación completada.' })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al importar' })
    } finally {
      setImporting(false)
    }
  }

  return {
    state: { importaciones, loading, alert, file, importing, result },
    handlers: { handleFileChange, handleImport, setAlert, fileInputRef },
  }
}
