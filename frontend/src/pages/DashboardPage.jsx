import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  UsersIcon, CheckCircleIcon, XCircleIcon, UserGroupIcon,
  BriefcaseIcon, AcademicCapIcon, ArrowPathIcon, ChartBarIcon,
} from '@heroicons/react/24/outline'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  blue:   { ring: 'ring-blue-200',   bg: 'bg-blue-600',    light: 'bg-blue-50',    text: 'text-blue-700'   },
  green:  { ring: 'ring-emerald-200', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
  red:    { ring: 'ring-red-200',     bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-700'    },
  teal:   { ring: 'ring-teal-200',    bg: 'bg-teal-500',    light: 'bg-teal-50',    text: 'text-teal-700'   },
  purple: { ring: 'ring-violet-200',  bg: 'bg-violet-500',  light: 'bg-violet-50',  text: 'text-violet-700' },
  indigo: { ring: 'ring-indigo-200',  bg: 'bg-indigo-500',  light: 'bg-indigo-50',  text: 'text-indigo-700' },
}

const CHART_TOOLTIP = { borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const c = C[color] || C.blue
  return (
    <div className={`rounded-xl ring-1 ${c.ring} ${c.light} p-5 flex items-center gap-4`}>
      <div className={`${c.bg} rounded-xl p-3 flex-shrink-0 shadow-sm`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wide ${c.text} opacity-70 truncate`}>{label}</p>
        <p className={`text-3xl font-extrabold ${c.text} leading-tight`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Card wrapper ──────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Pie label ────────────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * R)
  const y = cy + r * Math.sin(-midAngle * R)
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shortCarrera(nombre = '') {
  return nombre.replace('Ingeniería', 'Ing.').replace('Ingenieria', 'Ing.')
}

function Legend2({ items }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-3">
      {items.map(({ label, color, value }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-xs text-slate-500">{label}{value != null ? ` (${value})` : ''}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true); setError('')
    api.get('/dashboard/stats')
      .then(r => setData(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Error al cargar'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingSpinner size="lg" />
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={load} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Reintentar</button>
    </div>
  )

  const tasa = data?.tasa_aprobacion ?? 0

  const barCarrera = (data?.admitidos_por_carrera ?? []).map(i => ({
    name: shortCarrera(i.nombre),
    Inscritos: i.total_postulantes,
    Aprobados: i.total_admitidos,
    Reprobados: i.total_reprobados,
  }))

  const pieGeneral = [
    { name: 'Aprobados',  value: data?.total_aprobados  ?? 0 },
    { name: 'Reprobados', value: data?.total_reprobados ?? 0 },
  ]
  const pieColors = ['#10b981', '#ef4444']

  const pieSexo = (data?.distribucion_sexo ?? []).map(i => ({ name: i.sexo, value: i.total }))
  const sexoColors = ['#3b82f6', '#ec4899']

  const radarData = (data?.promedio_por_materia ?? []).map(i => ({
    materia: i.nombre,
    Promedio: i.promedio_avg,
    Aprobación: i.tasa_aprobacion,
  }))

  const barMateria = (data?.promedio_por_materia ?? []).map(i => ({
    name: i.nombre,
    Aprobados: i.aprobados,
    Reprobados: i.reprobados,
    'Promedio': i.promedio_avg,
  }))

  const barGrupos = (data?.postulantes_por_grupo ?? []).map(i => ({
    name: i.grupo,
    Estudiantes: i.total,
    Capacidad: i.capacidad,
  }))

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-sm text-slate-400 mt-0.5">Estadísticas del proceso de admisión</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowPathIcon className="h-3.5 w-3.5" /> Actualizar
        </button>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={UsersIcon}       label="Total Inscritos" value={data?.total_inscritos}  color="blue" />
        <KpiCard icon={CheckCircleIcon} label="Aprobados"       value={data?.total_aprobados}  color="green" sub={`${tasa}% tasa de aprobación`} />
        <KpiCard icon={XCircleIcon}     label="Reprobados"      value={data?.total_reprobados} color="red" />
        <KpiCard icon={ChartBarIcon}    label="Tasa Aprobación" value={`${tasa}%`}             color="teal" sub="sobre postulantes con notas" />
      </div>

      {/* KPIs secundarios */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard icon={UserGroupIcon}   label="Grupos activos" value={data?.total_grupos}   color="purple" />
        <KpiCard icon={AcademicCapIcon} label="Docentes"       value={data?.total_docentes} color="indigo" />
        <KpiCard icon={BriefcaseIcon}   label="Carreras"       value={data?.total_carreras} color="blue" />
      </div>

      {/* Fila 1: Postulantes por Carrera + Distribución general */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <ChartCard title="Postulantes por Carrera" subtitle="Primera opción — inscritos, aprobados y reprobados" className="xl:col-span-3">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barCarrera} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Bar dataKey="Inscritos"  fill="#3b82f6" radius={[3,3,0,0]} />
              <Bar dataKey="Aprobados"  fill="#10b981" radius={[3,3,0,0]} />
              <Bar dataKey="Reprobados" fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Resultado General" subtitle="Distribución aprobados vs reprobados" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieGeneral} cx="50%" cy="50%" innerRadius={52} outerRadius={88}
                dataKey="value" labelLine={false} label={<PieLabel />}>
                {pieGeneral.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={CHART_TOOLTIP} />
            </PieChart>
          </ResponsiveContainer>
          <Legend2 items={pieGeneral.map((e, i) => ({ label: e.name, color: pieColors[i], value: e.value }))} />
        </ChartCard>
      </div>

      {/* Fila 2: Rendimiento por Materia + Grupos + Sexo */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Radar — rendimiento por materia */}
        <ChartCard title="Rendimiento por Materia" subtitle="Promedio y tasa de aprobación (%)">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="materia" tick={{ fontSize: 10, fill: '#64748b' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <Radar name="Promedio"   dataKey="Promedio"   stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              <Radar name="Aprobación%" dataKey="Aprobación" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bar — estudiantes por grupo */}
        <ChartCard title="Ocupación por Grupo" subtitle="Estudiantes asignados vs capacidad máxima">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barGrupos} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 80]} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Capacidad', fill: '#f59e0b', fontSize: 10 }} />
              <Bar dataKey="Estudiantes" fill="#6366f1" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie — distribución por sexo + bar aprobados por materia */}
        <div className="flex flex-col gap-4">
          <ChartCard title="Distribución por Sexo">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={pieSexo} cx="50%" cy="50%" innerRadius={35} outerRadius={58}
                  dataKey="value" labelLine={false} label={<PieLabel />}>
                  {pieSexo.map((_, i) => <Cell key={i} fill={sexoColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <Legend2 items={pieSexo.map((e, i) => ({ label: e.name, color: sexoColors[i], value: e.value }))} />
          </ChartCard>

          <ChartCard title="Aprobados por Materia" subtitle="Cantidad por asignatura">
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={barMateria} layout="vertical" margin={{ top: 0, right: 8, left: 50, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} width={48} />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Bar dataKey="Aprobados"  fill="#10b981" radius={[0,3,3,0]} stackId="a" />
                <Bar dataKey="Reprobados" fill="#fca5a5" radius={[0,3,3,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      </div>
    </div>
  )
}
