import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from './LoadingSpinner'
import Pagination from './Pagination'

const normalizeText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

const toSearchableText = (value) => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(toSearchableText).join(' ')
  if (typeof value === 'object') return Object.values(value).map(toSearchableText).join(' ')
  return String(value)
}

export default function DataTable({
  columns,
  data,
  loading,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearch,
  onView,
  onEdit,
  onEditClick,
  onDelete,
  actions = true,
  emptyMessage = 'No se encontraron registros.',
  page,
  totalPages,
  onPageChange,
}) {
  const [localSearch, setLocalSearch] = useState('')

  const currentSearch = searchValue !== undefined ? searchValue : localSearch

  const handleSearch = (e) => {
    const val = e.target.value
    if (onSearch) {
      onSearch(val)
    } else {
      setLocalSearch(val)
    }
  }

  const filteredData = useMemo(() => {
    if (!currentSearch || currentSearch.length === 0) return data
    const term = normalizeText(currentSearch)
    return data.filter((row) =>
      columns.some((col) => {
        const str = toSearchableText(row[col.key])
        return normalizeText(str).includes(term)
      })
    )
  }, [currentSearch, data, columns])

  return (
    <div>
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={handleSearch}
            className="w-full sm:w-80 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-semibold text-slate-700 whitespace-nowrap">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row.id || row._id || idx} className="even:bg-slate-50 hover:bg-blue-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {(() => {
                        if (col.render) {
                          return col.render(row[col.key], row)
                        }
                        const val = row[col.key] ?? '—'
                        if (val === null || val === undefined) return '—'
                        if (typeof val === 'object') {
                          if (Array.isArray(val) && val.length > 0) {
                            const first = val[0]
                            return first.nombre || first.name || first.codigo || String(first)
                          }
                          return val.nombre || val.name || val.codigo || val.label || String(val)
                        }
                        return val
                      })()}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (() => {
                          const viewTo = typeof onView === 'function' ? onView(row) : '#'
                          if (!viewTo) {
                            return <span className="text-slate-400 text-sm font-medium">Ver</span>
                          }

                          return (
                            <Link to={viewTo} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Ver
                            </Link>
                          )
                        })()}
                        {onEdit && (
                          <Link to={typeof onEdit === 'function' ? onEdit(row) : (onEdit || '#')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            Editar
                          </Link>
                        )}
                        {onEditClick && (
                          <button onClick={() => onEditClick(row)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            Editar
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {page !== undefined && totalPages !== undefined && onPageChange && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  )
}
