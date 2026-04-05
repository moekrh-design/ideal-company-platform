import React from 'react';

export function DataTable({ columns, rows, emptyMessage = "لا توجد بيانات حالياً" }) {
  return (
    <div className="overflow-auto rounded-2xl ring-1 ring-slate-200">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row.id ?? index} className="border-t border-slate-100 hover:bg-slate-50/70">
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 align-top text-slate-700">
                    {typeof col.render === "function" ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
