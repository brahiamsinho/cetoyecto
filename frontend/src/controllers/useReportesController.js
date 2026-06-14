import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

const reportConfigs = [
  { key: 'postulantes', label: 'Postulantes', icon: '📋', desc: 'Lista completa de postulantes' },
  { key: 'promedios', label: 'Promedios', icon: '📊', desc: 'Promedios generales' },
  { key: 'gemini', label: 'Reporte con IA', icon: '🤖', desc: 'Reporte personalizado con inteligencia artificial', isGemini: true },
]

export function useReportesController() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [dateRange, setDateRange] = useState({ desde: '', hasta: '' })
  const [estadoFilter, setEstadoFilter] = useState('')
  const [geminiPrompt, setGeminiPrompt] = useState('')
  const [geminiResult, setGeminiResult] = useState(null)
  const [geminiLoading, setGeminiLoading] = useState(false)
  const [iaReportId, setIaReportId] = useState(null)
  const [exporting, setExporting] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef(null)

  // Verificar soporte de Speech Recognition al montar
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.lang = 'es-BO'
      recognition.continuous = true
      recognition.interimResults = true
      
      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setGeminiPrompt(transcript)
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setAlert({ type: 'error', message: 'Error en el reconocimiento de voz: ' + event.error })
        setIsListening(false)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current = recognition
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error('Error starting recognition:', err)
        setAlert({ type: 'error', message: 'No se pudo iniciar el reconocimiento de voz.' })
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const downloadFile = async (url, fileName) => {
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href)
    } catch (err) {
      console.error('Error downloading file:', err)
      setAlert({ type: 'error', message: 'Error al descargar el archivo.' })
    }
  }

  const handleExport = async (reportKey, format) => {
    setExporting(`${reportKey}-${format}`)
    try {
      const fileName = `reporte_${reportKey}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      await downloadFile(`/reportes/exportar/${reportKey}/${format}`, fileName)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al exportar el reporte.' })
    } finally {
      setExporting(null)
    }
  }

  const handleExportIa = async (format) => {
    if (!iaReportId) return
    setExporting(format)
    try {
      const fileName = `reporte_ia_${iaReportId}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      await downloadFile(`/reportes/ia/${iaReportId}/${format}`, fileName)
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al exportar el reporte IA.' })
    } finally {
      setExporting(null)
    }
  }

  const generarReporteIa = async () => {
    if (!geminiPrompt.trim()) {
      setAlert({ type: 'error', message: 'Debes escribir un prompt para generar el reporte.' })
      return
    }

    setGeminiLoading(true)
    setAlert({ type: '', message: '' })
    setGeminiResult(null)
    setIaReportId(null)
    try {
      const res = await api.post('/reportes/ia/generar', {
        prompt: geminiPrompt,
      })
      
      if (res.data.success) {
        setGeminiResult(res.data.data)
        setIaReportId(res.data.data.id)
        setAlert({ type: 'success', message: res.data.message || 'Reporte generado correctamente.' })
      } else {
        setAlert({ type: 'error', message: res.data.message || 'Error al generar reporte.' })
      }
    } catch (err) {
      console.error('Error generando reporte con IA:', err)
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al generar reporte con IA.' })
    } finally {
      setGeminiLoading(false)
    }
  }

  const loadReport = async (key, estado = null) => {
    setSelectedReport(key)
    setGeminiResult(null)
    setIaReportId(null)
    
    // Si es el reporte de IA, no hacer llamada API
    if (key === 'gemini') {
      setLoading(false)
      setData(null)
      return
    }
    
    setLoading(true)
    setAlert({ type: '', message: '' })
    try {
      const params = {}
      if (key === 'asistencia-docente') {
        if (dateRange.desde) params.desde = dateRange.desde
        if (dateRange.hasta) params.hasta = dateRange.hasta
      }
      if (key === 'postulantes' && estado) {
        params.estado_promedio = estado
      }
      const res = await api.get(`/reportes/${key}`, { params })
      console.log('Reporte API response:', res.data)
      const reportData = res.data.data || res.data.reportes || res.data
      setData(reportData)
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al cargar reporte' })
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    setSelectedReport(null)
    setData(null)
    setGeminiResult(null)
    setIaReportId(null)
  }

  return {
    state: { 
      selectedReport, data, loading, alert, dateRange, reportConfigs, estadoFilter,
      geminiPrompt, geminiResult, geminiLoading, iaReportId, exporting,
      isListening, speechSupported,
    },
    handlers: { 
      loadReport, goBack, setDateRange, setAlert, setEstadoFilter,
      setGeminiPrompt, generarReporteIa, handleExport, handleExportIa,
      toggleListening,
    },
  }
}
