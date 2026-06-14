import AlertMessage from '../components/AlertMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import { usePostulanteFormController } from '../controllers/usePostulanteFormController'

export default function PostulanteFormView({ state, handlers }) {
  const { form, carreras, gestiones, loading, saving, alert, errors, isEdit } = state
  const { handleChange, handleSubmit, setAlert } = handlers

  if (loading) return <LoadingSpinner size="lg" />

  const inputClass = (name) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[name] ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'
    }`

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? 'Editar Postulante' : 'Nuevo Postulante'}</h1>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CI *</label>
              <input type="text" name="ci" value={form.ci} onChange={handleChange} className={inputClass('ci')} />
              {errors.ci && <p className="text-xs text-red-500 mt-1">{errors.ci}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
              <input type="text" name="nombres" value={form.nombres} onChange={handleChange} className={inputClass('nombres')} />
              {errors.nombres && <p className="text-xs text-red-500 mt-1">{errors.nombres}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
              <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} className={inputClass('apellidos')} />
              {errors.apellidos && <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento *</label>
              <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className={inputClass('fecha_nacimiento')} />
              {errors.fecha_nacimiento && <p className="text-xs text-red-500 mt-1">{errors.fecha_nacimiento}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sexo *</label>
              <select name="sexo" value={form.sexo} onChange={handleChange} className={inputClass('sexo')}>
                <option value="">Seleccione...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {errors.sexo && <p className="text-xs text-red-500 mt-1">{errors.sexo}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <textarea name="direccion" value={form.direccion} onChange={handleChange} rows={2} className={inputClass('direccion')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input type="text" name="telefono" value={form.telefono} onChange={handleChange} className={inputClass('telefono')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad *</label>
              <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={inputClass('ciudad')} />
              {errors.ciudad && <p className="text-xs text-red-500 mt-1">{errors.ciudad}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Colegio de Procedencia *</label>
              <input type="text" name="colegio_procedencia" value={form.colegio_procedencia} onChange={handleChange} className={inputClass('colegio_procedencia')} />
              {errors.colegio_procedencia && <p className="text-xs text-red-500 mt-1">{errors.colegio_procedencia}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gestión *</label>
              <select name="gestion_id" value={form.gestion_id} onChange={handleChange} className={inputClass('gestion_id')}>
                <option value="">Seleccione...</option>
                {gestiones.map((g) => (
                  <option key={g.id} value={g.id}>{g.anio} - {g.periodo}</option>
                ))}
              </select>
              {errors.gestion_id && <p className="text-xs text-red-500 mt-1">{errors.gestion_id}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrera 1ra Opción *</label>
              <select name="carrera_primera_id" value={form.carrera_primera_id} onChange={handleChange} className={inputClass('carrera_primera_id')}>
                <option value="">Seleccione...</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {errors.carrera_primera_id && <p className="text-xs text-red-500 mt-1">{errors.carrera_primera_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrera 2da Opción</label>
              <select name="carrera_segunda_id" value={form.carrera_segunda_id} onChange={handleChange} className={inputClass('carrera_segunda_id')}>
                <option value="">Seleccione...</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Documentos Requeridos</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="tiene_carnet_identidad"
                  checked={form.tiene_carnet_identidad || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Carnet de Identidad</span>
              </label>
              {errors.tiene_carnet_identidad && <p className="text-xs text-red-500 ml-7">{errors.tiene_carnet_identidad}</p>}
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="tiene_foto"
                  checked={form.tiene_foto || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Foto</span>
              </label>
              {errors.tiene_foto && <p className="text-xs text-red-500 ml-7">{errors.tiene_foto}</p>}
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="tiene_diploma_bachiller"
                  checked={form.tiene_diploma_bachiller || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Diploma de Bachiller</span>
              </label>
              {errors.tiene_diploma_bachiller && <p className="text-xs text-red-500 ml-7">{errors.tiene_diploma_bachiller}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors">
              {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Postulante')}
            </button>
            <button type="button" onClick={() => window.history.back()} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function PostulanteFormWrapper() {
  const props = usePostulanteFormController()
  return <PostulanteFormView {...props} />
}
