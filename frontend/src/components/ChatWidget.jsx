import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'

const WELCOME = 'Hola! Soy el Asistente FICCT 👋\n¿En qué puedo ayudarte hoy?'

function BotText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : p
      )}
    </p>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'model', text: WELCOME },
  ])
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  const history = messages
    .filter(m => m.text !== WELCOME)
    .slice(-12)
    .map(m => ({ role: m.role, text: m.text }))

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/chatbot/message', { message: text, history })
      setMessages(prev => [...prev, { role: 'model', text: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: err.response?.data?.message || 'Error al conectar con el asistente. Intentá de nuevo.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white"
          style={{ maxHeight: '70vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-semibold text-white">Asistente FICCT</span>
              <span className="text-xs text-blue-200">· Gemini AI</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                }`}>
                  {m.role === 'model' ? <BotText text={m.text} /> : <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 px-3 py-2 border-t border-slate-200 bg-white">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Escribí tu consulta..."
              disabled={loading}
              className="flex-1 resize-none text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 max-h-24"
              style={{ lineHeight: '1.4' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 py-1 bg-white">Powered by Gemini 2.5 Flash</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-4 right-4 z-50 w-13 h-13 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        style={{ width: 52, height: 52 }}
        title="Asistente FICCT"
      >
        {open
          ? <XMarkIcon className="h-6 w-6" />
          : <ChatBubbleLeftRightIcon className="h-6 w-6" />
        }
      </button>
    </>
  )
}
