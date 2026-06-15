import { Link } from 'react-router-dom'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import AlertMessage from '../components/AlertMessage'

export default function LoginView({ state, handlers }) {
  const { email, password, error, loading } = state
  const { setEmail, setPassword, setError, handleSubmit } = handlers

  const demoAccounts = [
    {
      role: 'Admin / CPD',
      email: 'admin@ficct.edu.bo',
      password: 'password',
    },
    {
      role: 'Docente',
      email: 'cmendoza@ficct.edu.bo',
      password: 'carlos123',
    },
    {
      role: 'Estudiante / Postulante',
      email: 'postulante2@example.test',
      password: 'bruno123',
    },
  ]

  const handleAutofill = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <AcademicCapIcon className="h-8 w-8 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Sistema de Admisión</h1>
          <p className="text-slate-500 mt-1">Ingrese sus credenciales</p>
        </div>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
            ¿Olvidó su contraseña?
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Cuentas de prueba</p>
          <div className="space-y-3 text-sm">
            {demoAccounts.map((account) => (
              <div key={account.role} className="rounded-lg bg-white border border-slate-200 p-3">
                <div className="font-medium text-slate-800">{account.role}</div>
                <div className="text-slate-600">Email: {account.email}</div>
                <div className="text-slate-600">Contraseña: {account.password}</div>
                <button
                  type="button"
                  onClick={() => handleAutofill(account)}
                  className="mt-3 inline-flex rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                >
                  Usar estas credenciales
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
