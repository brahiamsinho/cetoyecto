import DataTable from '../components/DataTable'
import AlertMessage from '../components/AlertMessage'

export default function UsuariosView({ state, handlers }) {
  const { usuarios, roles, loading, showForm, editTarget, alert, form, saving } = state
  const { openCreate, openEdit, setForm, setShowForm, handleSave, toggleActivo, setAlert } = handlers

  const columns = [
    { key: 'name', label: 'Nombre' }, { key: 'email', label: 'Email' },
    { key: 'rol', label: 'Rol', render: (val) => <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{val?.nombre || val}</span> },
    { key: 'activo', label: 'Activo', render: (val) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{val ? 'Sí' : 'No'}</span> },
    { key: 'toggle', label: 'Acción', render: (_, row) => row.activo ? (
      <button onClick={() => toggleActivo(row)} className="text-red-600 hover:text-red-800 text-sm font-medium">Desactivar</button>
    ) : (
      <button onClick={() => toggleActivo(row)} className="text-green-600 hover:text-green-800 text-sm font-medium">Activar</button>
    ) },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios y Roles</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Nuevo Usuario</button>
      </div>
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <DataTable columns={columns} data={usuarios} loading={loading} searchable={true} searchPlaceholder="Buscar usuario..." onEditClick={(row) => openEdit(row)} emptyMessage="No hay usuarios registrados." />
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{editTarget ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{editTarget ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select value={form.rol_id} onChange={(e) => setForm({ ...form, rol_id: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="">Seleccione...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded border border-slate-300 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
