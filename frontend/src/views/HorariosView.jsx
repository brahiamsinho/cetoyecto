import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

export default function HorariosView({ state, handlers }) {
  const { horarios, loading, showForm, editTarget, deleteTarget, alert, form, saving } = state
  const { openCreate, openEdit, setForm, setShowForm, handleSave, handleDelete, setDeleteTarget, setAlert } = handlers

  const columns = [
    { key: 'dia', label: 'Día' }, { key: 'hora_inicio', label: 'Hora Inicio' }, { key: 'hora_fin', label: 'Hora Fin' },
    { key: 'turno', label: 'Turno', render: (val) => val || '—' },
    { key: 'grupos', label: 'Grupo(s)', render: (val, row) => {
      const grupos = row.cargas_horarias?.map((ch) => ch.grupo?.nombre).filter(Boolean)
      return grupos?.length ? grupos.join(', ') : '—'
    }},
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Horarios</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Nuevo Horario</button>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable columns={columns} data={horarios} loading={loading} searchable={true} searchPlaceholder="Buscar horario..." onEditClick={(row) => openEdit(row)} onDelete={(row) => setDeleteTarget(row)} />
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{editTarget ? 'Editar Horario' : 'Nuevo Horario'}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Día</label>
                <select value={form.dia} onChange={(e) => setForm({ ...form, dia: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Seleccione...</option>
                  {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio</label><input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Hora Fin</label><input type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Turno</label><input type="text" value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Mañana/Tarde/Noche" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded border border-slate-300 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteTarget} title="Eliminar Horario" message="¿Está seguro?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
