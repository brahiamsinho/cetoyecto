import { useState } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  UsersIcon, CheckCircleIcon, XCircleIcon, UserGroupIcon,
  BriefcaseIcon, AcademicCapIcon, BookOpenIcon, ClockIcon,
  BuildingOfficeIcon, ArrowPathIcon, ChartBarIcon, SparklesIcon,
} from '@heroicons/react/24/outline'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

// ─── Admin dashboard helpers ──────────────────────────────────────────────────
const PALETTE = {
  blue:   { ring: 'ring-blue-200',    bg: 'bg-blue-600',    light: 'bg-blue-50',    text: 'text-blue-700'    },
  green:  { ring: 'ring-emerald-200', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
  red:    { ring: 'ring-red-200',     bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-700'     },
  teal:   { ring: 'ring-teal-200',    bg: 'bg-teal-500',    light: 'bg-teal-50',    text: 'text-teal-700'    },
  purple: { ring: 'ring-violet-200',  bg: 'bg-violet-500',  light: 'bg-violet-50',  text: 'text-violet-700'  },
  indigo: { ring: 'ring-indigo-200',  bg: 'bg-indigo-500',  light: 'bg-indigo-50',  text: 'text-indigo-700'  },
}
const TT = { borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }
const PIE_COLORS  = ['#10b981', '#ef4444']
const SEXO_COLORS = ['#3b82f6', '#ec4899']

function KpiCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const c = PALETTE[color] || PALETTE.blue
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

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * R)
  const y = cy + r * Math.sin(-midAngle * R)
  return percent > 0.05
    ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>
    : null
}

function Leg2({ items }) {
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

function shortCarrera(n = '') { return n.replace('Ingeniería', 'Ing.').replace('Ingenieria', 'Ing.') }

const getGradeValue = (nota) => {
  const value = nota?.promedio_final ?? nota?.promedio ?? nota?.nota_final ?? nota?.final ?? nota?.calificacion
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const formatAverage = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric.toFixed(2) : (value ?? '—')
}

export default function DashboardView({ state }) {
  const { data, loading, error } = state
  const { user } = useAuth()
  const roleName = user?.rol?.nombre || user?.rol
  const [resumen, setResumen]           = useState(null)
  const [resumenLoading, setResumenLoading] = useState(false)
  const [resumenError, setResumenError] = useState(null)

  const generarResumen = async () => {
    setResumenLoading(true)
    setResumenError(null)
    setResumen(null)
    try {
      const res = await api.post('/dashboard/resumen-ia')
      setResumen(res.data.data.resumen)
    } catch (err) {
      setResumenError(err.response?.data?.message || 'Error al generar el resumen.')
    } finally {
      setResumenLoading(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />
  if (error) return <div className="text-red-600 p-4">{error}</div>

  if (roleName === 'Postulante') {
    const postulante = user?.postulante
    const grupos = Array.isArray(postulante?.grupos) ? postulante.grupos : []
    const notas = Array.isArray(postulante?.notas) ? postulante.notas : []

    const carreraAsignada = postulante?.carrera_asignada
    const carreraAsignadaId = postulante?.carrera_asignada_id
    const carreraPrimeraId = postulante?.carrera_primera_id
    const carreraSegundaId = postulante?.carrera_segunda_id
    const opcionCarrera = carreraAsignada
      ? carreraAsignadaId === carreraPrimeraId
        ? '1ª opción'
        : carreraAsignadaId === carreraSegundaId
          ? '2ª opción'
          : null
      : null
    const notaValues = notas.map(getGradeValue).filter((value) => value !== null)
    const promedioGeneral = notaValues.length > 0
      ? (notaValues.reduce((sum, value) => sum + value, 0) / notaValues.length).toFixed(2)
      : formatAverage(postulante?.promedio_final ?? postulante?.promedio)

    const notasPorMateria = notas.reduce((acc, nota) => {
      const materiaId = nota?.materia?.id || nota?.materia_id
      if (!materiaId) return acc
      if (!acc[materiaId]) {
        acc[materiaId] = {
          id: materiaId,
          materia: nota?.materia?.nombre || 'Materia',
          promedio: Number(getGradeValue(nota) ?? 0),
          count: 1,
        }
        return acc
      }
      acc[materiaId].promedio += Number(getGradeValue(nota) ?? 0)
      acc[materiaId].count += 1
      return acc
    }, {})

    const materias = grupos.flatMap((grupo) => {
      const cargas = Array.isArray(grupo?.cargas_horarias)
        ? grupo.cargas_horarias
        : Array.isArray(grupo?.cargasHorarias)
          ? grupo.cargasHorarias
          : []
      return cargas.map((carga) => ({
        grupo: grupo?.nombre || 'Grupo',
        materia: carga?.materia?.nombre || 'Materia',
        docente: carga?.docente ? `${carga.docente.nombres || ''} ${carga.docente.apellidos || ''}`.trim() : '—',
        horario: carga?.horario_descripcion || carga?.horario_display || '—',
        aula: carga?.aula?.nombre || carga?.aula_display || '—',
      }))
    })

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Área académica</h1>
          <p className="text-slate-500">{postulante ? `${postulante.nombres} ${postulante.apellidos}` : 'Estudiante'}</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Grupo inscrito</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{grupos.length > 0 ? grupos.map((g) => g?.nombre).filter(Boolean).join(', ') : '—'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Promedio general</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{promedioGeneral}</p>
            </div>
            <div className={`rounded-lg border px-4 py-3 ${carreraAsignada ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Carrera asignada</p>
              {carreraAsignada ? (
                <div className="mt-1">
                  <p className="text-sm font-medium text-slate-800">{carreraAsignada.nombre}</p>
                  {opcionCarrera && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {opcionCarrera}
                    </span>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-500 italic">Pendiente de asignación</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Grupo inscrito y materias</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Grupo: <span className="font-medium text-slate-800">{grupos.length > 0 ? grupos.map((g) => g?.nombre).filter(Boolean).join(', ') : '—'}</span>
          </p>
          {materias.length === 0 ? (
            <p className="text-sm text-slate-500">No hay materias asignadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Grupo</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Materia</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Docente</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Horario</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Aula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {materias.map((row, idx) => (
                    <tr key={`${row.grupo}-${row.materia}-${idx}`} className="hover:bg-blue-50/50">
                      <td className="px-4 py-3 text-slate-700">{row.grupo}</td>
                      <td className="px-4 py-3 text-slate-700">{row.materia}</td>
                      <td className="px-4 py-3 text-slate-700">{row.docente}</td>
                      <td className="px-4 py-3 text-slate-700">{row.horario}</td>
                      <td className="px-4 py-3 text-slate-700">{row.aula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">Horarios de clases</h2>
            </div>
            <div className="space-y-4 text-sm">
              {grupos.length === 0 ? (
                <p className="text-slate-500">Sin grupos asignados.</p>
              ) : (
                grupos.map((grupo) => (
                  <div key={grupo?.id || grupo?.nombre} className="rounded-lg border border-slate-200 p-4">
                    <p className="font-semibold text-slate-800 mb-2">{grupo?.nombre || 'Grupo'}</p>
                    <div className="space-y-1 text-slate-600">
                      {(Array.isArray(grupo?.cargas_horarias)
                        ? grupo.cargas_horarias
                        : Array.isArray(grupo?.cargasHorarias)
                          ? grupo.cargasHorarias
                          : []
                      ).map((carga, idx) => (
                        <p key={idx}>
                          {carga?.materia?.nombre || 'Materia'} — {carga?.horario_descripcion || carga?.horario_display || '—'} — {carga?.aula?.nombre || carga?.aula_display || '—'}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BuildingOfficeIcon className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-slate-800">Notas finales</h2>
            </div>
            {Object.keys(notasPorMateria).length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay notas registradas.</p>
            ) : (
              <div className="space-y-3">
                {Object.values(notasPorMateria).map((item) => {
                  const promedio = item.count > 0 ? (item.promedio / item.count).toFixed(2) : '—'
                  const aprobado = Number(promedio) >= 60
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{item.materia}</p>
                        <p className="text-xs text-slate-500">Promedio por materia</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${aprobado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {promedio}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

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

  const pieSexo = (data?.distribucion_sexo ?? []).map(i => ({ name: i.sexo, value: i.total }))

  const radarData = (data?.promedio_por_materia ?? []).map(i => ({
    materia: i.nombre,
    Promedio: i.promedio_avg,
    'Aprobación%': i.tasa_aprobacion,
  }))

  const barMateria = (data?.promedio_por_materia ?? []).map(i => ({
    name: i.nombre,
    Aprobados: i.aprobados,
    Reprobados: i.reprobados,
  }))

  const barGrupos = (data?.postulantes_por_grupo ?? []).map(i => ({
    name: i.grupo,
    Estudiantes: i.total,
  }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-sm text-slate-400 mt-0.5">Estadísticas del proceso de admisión</p>
        </div>
        <button
          onClick={generarResumen}
          disabled={resumenLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow hover:shadow-md hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          <SparklesIcon className="h-4 w-4" />
          {resumenLoading ? 'Generando...' : 'Resumen IA'}
        </button>
      </div>

      {/* Panel resumen IA */}
      {(resumen || resumenLoading || resumenError) && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg p-1.5">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-violet-800">Resumen Ejecutivo — Gemini AI</span>
          </div>
          {resumenLoading && (
            <div className="flex items-center gap-2 text-sm text-violet-600">
              <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              Analizando datos del proceso de admisión...
            </div>
          )}
          {resumenError && <p className="text-sm text-red-600">{resumenError}</p>}
          {resumen && (
            <>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{resumen}</p>
              <p className="text-xs text-violet-400 mt-3">Generado por Gemini 2.5 Flash · basado en datos actuales del sistema</p>
            </>
          )}
        </div>
      )}

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

      {/* Fila 1: barras por carrera + dona general */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <ChartCard title="Postulantes por Carrera" subtitle="Primera opción — inscritos, aprobados y reprobados" className="xl:col-span-3">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barCarrera} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={TT} />
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
                {pieGeneral.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={TT} />
            </PieChart>
          </ResponsiveContainer>
          <Leg2 items={pieGeneral.map((e, i) => ({ label: e.name, color: PIE_COLORS[i], value: e.value }))} />
        </ChartCard>
      </div>

      {/* Fila 2: radar materias + grupos + sexo y materia stacked */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        <ChartCard title="Rendimiento por Materia" subtitle="Promedio y tasa de aprobación (%)">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="materia" tick={{ fontSize: 10, fill: '#64748b' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <Radar name="Promedio"    dataKey="Promedio"     stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              <Radar name="Aprobación%" dataKey="Aprobación%"  stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={TT} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ocupación por Grupo" subtitle="Estudiantes asignados (línea = capacidad 70)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barGrupos} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 80]} />
              <Tooltip contentStyle={TT} />
              <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4"
                label={{ value: 'Cap. 70', fill: '#f59e0b', fontSize: 10 }} />
              <Bar dataKey="Estudiantes" fill="#6366f1" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="flex flex-col gap-4">
          <ChartCard title="Distribución por Sexo">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={pieSexo} cx="50%" cy="50%" innerRadius={35} outerRadius={58}
                  dataKey="value" labelLine={false} label={<PieLabel />}>
                  {pieSexo.map((_, i) => <Cell key={i} fill={SEXO_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={TT} />
              </PieChart>
            </ResponsiveContainer>
            <Leg2 items={pieSexo.map((e, i) => ({ label: e.name, color: SEXO_COLORS[i], value: e.value }))} />
          </ChartCard>

          <ChartCard title="Aprobados por Materia" subtitle="Aprobados vs reprobados por asignatura">
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={barMateria} layout="vertical" margin={{ top: 0, right: 8, left: 50, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} width={48} />
                <Tooltip contentStyle={TT} />
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
