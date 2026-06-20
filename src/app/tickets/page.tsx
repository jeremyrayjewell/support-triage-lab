import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Panel } from "@/components/Panel";
import { getOpenTickets } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default function TicketsPage() {
  const tickets = getOpenTickets();

  return (
    <div className="space-y-6">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Ticket queue</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Open support tickets</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          A practical queue view for browsing the simulated support backlog before drilling into ticket evidence and investigation reports.
        </p>
      </section>

      <Panel title="All open tickets" subtitle="Ordered by severity and latest update.">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Ticket</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Account</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={String(ticket.id)} className="align-top">
                  <td className="px-3 py-3">
                    <Link href={`/tickets/${ticket.id}`} className="font-medium text-slate-950 hover:text-orange-600">
                      #{ticket.id} {ticket.title}
                    </Link>
                    <p className="mt-2 max-w-xl text-sm text-slate-500">{String(ticket.summary)}</p>
                    <div className="mt-3">
                      <Badge tone={String(ticket.severity)}>{String(ticket.severity).toUpperCase()}</Badge>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{String(ticket.account)}</td>
                  <td className="px-3 py-3 text-slate-700">{String(ticket.category)}</td>
                  <td className="px-3 py-3">
                    <Badge tone={String(ticket.status)}>{String(ticket.status).replace(/-/g, " ")}</Badge>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{formatDateTime(ticket.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
