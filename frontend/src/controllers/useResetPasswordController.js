import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'

export function useResetPasswordController() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!token || !email) {
      setError('El enlace de recuperación es inválido.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setSuccess(true)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.password?.[0] ||
        'El enlace es inválido o expiró.'
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    state: { password, passwordConfirmation, message, error, loading, success, showPassword },
    handlers: { setPassword, setPasswordConfirmation, setMessage, setError, setShowPassword, handleSubmit },
  }
}
