import React from "react";

export default function AdminTable({ columns, data = [], actions = [] }) {
  if (!data.length)
    return (
      <div className="text-center text-gray-500 py-8">Aucune donnée disponible</div>
    );

  return (
    <div className="overflow-auto border rounded-xl bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-3 py-2 font-semibold text-slate-600 whitespace-nowrap"
              >
                {col.Header}
              </th>
            ))}
            {actions.length > 0 && <th className="px-3 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.accessor} className="px-3 py-2 whitespace-nowrap">
                  {row[col.accessor]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-3 py-2 whitespace-nowrap text-right">
                  {actions.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => a.onClick(row)}
                      className={`px-2 py-1 border rounded-lg hover:bg-[#bad5b7]/30 ml-1`}
                    >
                      {a.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
