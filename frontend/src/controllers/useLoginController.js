import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function useLoginController() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Credenciales inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return {
    state: { email, password, error, loading },
    handlers: { setEmail, setPassword, setError, handleSubmit },
  }
}
