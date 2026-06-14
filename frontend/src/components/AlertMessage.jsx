import { useEffect, useState } from 'react'

export default function AlertMessage({ type, message, onClose, autoDismiss = 5000 }) {
  const [visible, setVisible] = useState(!!message)

  useEffect(() => {
    setVisible(!!message)
  }, [message])

  useEffect(() => {
    if (!visible || !autoDismiss || !onClose) return
    const timer = setTimeout(() => {
      setVisible(false)
      onClose()
    }, autoDismiss)
    return () => clearTimeout(timer)
  }, [visible, autoDismiss, onClose])

  if (!visible || !message) return null

  const styles = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
  }

  return (
    <div className={`border-l-4 p-4 rounded mb-4 flex items-center justify-between ${styles[type] || styles.info}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={() => { setVisible(false); onClose() }} className="ml-4 text-lg leading-none font-bold opacity-60 hover:opacity-100">&times;</button>
      )}
    </div>
  )
}
