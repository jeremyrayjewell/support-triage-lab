import { QueryResultRow } from "@/lib/types";
import { titleCase } from "@/lib/format";

export function DataTable({ rows }: { rows: QueryResultRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">No rows returned.</p>;
  }

  const headers = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 text-left font-semibold text-slate-500">
                {titleCase(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={index} className="align-top">
              {headers.map((header) => (
                <td key={header} className="whitespace-nowrap px-3 py-2 text-slate-700">
                  {row[header] === null ? "null" : String(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
