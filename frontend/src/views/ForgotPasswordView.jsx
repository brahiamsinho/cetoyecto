import { Link } from 'react-router-dom'
import { AcademicCapIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import AlertMessage from '../components/AlertMessage'

export default function ForgotPasswordView({ state, handlers }) {
  const {
    email, password, passwordConfirmation, showPassword,
    message, error, loading, success, isResetMode, emailFromUrl,
  } = state
  const {
    setEmail, setPassword, setPasswordConfirmation, setShowPassword,
    setMessage, setError,
    handleSubmitEmail, handleSubmitReset,
  } = handlers

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <AcademicCapIcon className="h-8 w-8 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isResetMode ? 'Nueva Contraseña' : 'Recuperar Contraseña'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isResetMode
              ? `Ingresá tu nueva contraseña para ${emailFromUrl}`
              : 'Ingresá tu correo para recibir instrucciones'}
          </p>
        </div>

        <AlertMessage type="success" message={message} onClose={() => setMessage('')} />
        <AlertMessage type="error" message={error} onClose={() => setError('')} />

        {success ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-100">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-slate-700 font-medium">¡Contraseña actualizada correctamente!</p>
            <Link
              to="/login"
              className="block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors text-center"
            >
              Ir al inicio de sesión
            </Link>
          </div>
        ) : isResetMode ? (
          <form onSubmit={handleSubmitReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Repetí la contraseña"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors"
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitEmail} className="space-y-5">
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
        )}

        {!success && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
