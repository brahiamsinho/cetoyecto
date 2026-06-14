import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'

export function useForgotPasswordController() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const emailFromUrl = searchParams.get('email') ?? ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmitEmail = async (e) => {
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
      setError(err.response?.data?.message || 'Error al procesar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReset = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        email: emailFromUrl,
        password,
        password_confirmation: passwordConfirmation,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'El enlace es inválido o ya expiró.')
    } finally {
      setLoading(false)
    }
  }

  return {
    state: {
      email, password, passwordConfirmation, showPassword,
      message, error, loading, success,
      isResetMode: !!token,
      emailFromUrl,
    },
    handlers: {
      setEmail, setPassword, setPasswordConfirmation, setShowPassword,
      setMessage, setError,
      handleSubmitEmail, handleSubmitReset,
    },
  }
}
