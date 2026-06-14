import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import AlertMessage from '../components/AlertMessage'

export default function MateriasView({ state, handlers }) {
  const { materias, loading, showForm, editTarget, deleteTarget, alert, form, saving } = state
  const { openCreate, openEdit, setForm, setShowForm, handleSave, handleDelete, setDeleteTarget, setAlert } = handlers

  const columns = [
    { key: 'codigo', label: 'Código' }, { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción', render: (val) => val || '—' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Materias</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Nueva Materia</button>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable columns={columns} data={materias} loading={loading} searchable={true} searchPlaceholder="Buscar materia..." onEditClick={(row) => openEdit(row)} onDelete={(row) => setDeleteTarget(row)} />
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{editTarget ? 'Editar Materia' : 'Nueva Materia'}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Código</label><input type="text" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label><input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label><textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded border border-slate-300 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteTarget} title="Eliminar Materia" message="¿Está seguro?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
