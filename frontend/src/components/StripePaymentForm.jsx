import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../services/api'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

function PaymentFormContent({ postulanteId, onSuccess, onClose }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: intentData } = await api.post(`/postulantes/${postulanteId}/payment-intent`)
      if (!intentData.success) {
        throw new Error(intentData.message || 'Error al crear PaymentIntent')
      }

      // Modo test simulado (sin Stripe real)
      if (intentData.data.test_mode || !stripe || !elements) {
        const mockPaymentIntentId = intentData.data.client_secret?.split('_secret_')[0] || 'pi_test_mock'
        const { data: registerData } = await api.post(`/postulantes/${postulanteId}/pago/simular`, {
          monto: 700.00,
          metodo_pago: 'stripe',
          stripe_payment_intent_id: mockPaymentIntentId,
        })

        if (!registerData.success) {
          throw new Error(registerData.message || 'Error al registrar pago')
        }

        setSuccess(true)
        onSuccess(registerData.data)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.data.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      )

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent.status === 'succeeded') {
        const { data: registerData } = await api.post(`/postulantes/${postulanteId}/pago/simular`, {
          monto: 700.00,
          metodo_pago: 'stripe',
          stripe_payment_intent_id: paymentIntent.id,
        })

        if (!registerData.success) {
          throw new Error(registerData.message || 'Error al registrar pago')
        }

        setSuccess(true)
        onSuccess(registerData.data)
      } else {
        throw new Error('El pago no fue confirmado.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Pago registrado</h3>
        <p className="text-sm text-slate-500 mb-6">El pago se procesó correctamente.</p>
        <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Cerrar
        </button>
      </div>
    )
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        '::placeholder': { color: '#94a3b8' },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
        <label className="block text-sm font-medium text-slate-700 mb-2">Tarjeta de crédito / débito</label>
        <div className="rounded-md border border-slate-300 bg-white p-3">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Usa la tarjeta de prueba: <span className="font-mono font-semibold text-slate-700">4242 4242 4242 4242</span> — cualquier fecha futura, CVC y ZIP.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'Pagar Bs. 700.00'}
        </button>
      </div>
    </form>
  )
}

export default function StripePaymentForm({ postulanteId, onSuccess, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Registrar Pago</h2>
            <p className="text-xs text-amber-600 font-medium mt-0.5">Modo de prueba (Stripe Test)</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Elements stripe={stripePromise}>
          <PaymentFormContent postulanteId={postulanteId} onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  )
}
