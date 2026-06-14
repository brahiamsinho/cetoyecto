import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import AlertMessage from '../components/AlertMessage'
import { AcademicCapIcon } from '@heroicons/react/24/outline'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email.trim()) {
      setError('Ingrese su correo electrónico.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setMessage('Se ha enviado un enlace de recuperación a su correo.')
      setEmail('')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al procesar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <AcademicCapIcon className="h-8 w-8 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Recuperar Contraseña</h1>
          <p className="text-slate-500 mt-1">Ingrese su correo para recibir instrucciones</p>
        </div>
        <AlertMessage type="success" message={message} onClose={() => setMessage('')} />
        <AlertMessage type="error" message={error} onClose={() => setError('')} />
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
