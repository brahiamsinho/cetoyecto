export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
      >
        Anterior
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1.5 text-sm rounded border border-slate-300 hover:bg-slate-100">1</button>
          {start > 2 && <span className="px-2 text-slate-400">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 text-sm rounded border ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 hover:bg-slate-100'}`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-slate-400">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 text-sm rounded border border-slate-300 hover:bg-slate-100">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
      >
        Siguiente
      </button>
    </div>
  )
}
