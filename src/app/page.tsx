import Link from "next/link";
import { generateNewTicketAction } from "@/app/actions";
import { Badge } from "@/components/Badge";
import { Panel } from "@/components/Panel";
import { formatDateTime } from "@/lib/format";
import { getDashboardData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const data = getDashboardData();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/80 bg-slate-950 px-6 py-7 text-white shadow-panel">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Live queue simulation</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">SupportOps Triage Lab</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              A local support-engineering workspace for triaging SaaS incidents, correlating SQL evidence, and drafting customer-safe updates.
            </p>
            <form action={generateNewTicketAction} className="mt-4">
              <button
                type="submit"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Generate New Ticket
              </button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {data.severityCounts.map((row) => (
              <div key={String(row.severity)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-slate-400">{String(row.severity).toUpperCase()}</p>
                <p className="mt-2 text-2xl font-semibold">{String(row.count)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <Panel title="Open Ticket Queue" subtitle="The landing screen stays anchored in active support work.">
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
                  {data.tickets.map((ticket) => (
                    <tr key={String(ticket.id)} className="align-top">
                      <td className="px-3 py-3">
                        <Link href={`/tickets/${ticket.id}`} className="font-medium text-slate-950 hover:text-orange-600">
                          #{ticket.id} {ticket.title}
                        </Link>
                        <div className="mt-2">
                          <Badge tone={String(ticket.severity)}>{String(ticket.severity).toUpperCase()}</Badge>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{String(ticket.account)}</td>
                      <td className="px-3 py-3 text-slate-700">{String(ticket.category)}</td>
                      <td className="px-3 py-3">
                        <Badge tone={String(ticket.status)}>{String(ticket.status).replace(/[-_]/g, " ")}</Badge>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{formatDateTime(ticket.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Top Error Codes This Week">
              <div className="space-y-3">
                {data.topErrorCodes.map((row) => (
                  <div key={String(row.error_code)} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="font-medium text-slate-800">{String(row.error_code)}</span>
                    <span className="text-sm text-slate-500">{String(row.count)} hits</span>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Affected Accounts">
              <div className="space-y-3">
                {data.affectedAccounts.map((row) => (
                  <div key={String(row.name)} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-slate-800">{String(row.name)}</span>
                      <span className="text-sm text-slate-500">{String(row.open_tickets)} open</span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                      Highest severity {String(row.highest_severity)}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Tickets Breaching SLA" subtitle="Resolution target already elapsed.">
            <div className="space-y-3">
              {data.slaBreaches.map((ticket) => (
                <div key={String(ticket.id)} className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/tickets/${ticket.id}`} className="font-medium text-slate-950 hover:text-red-700">
                      #{ticket.id} {ticket.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600">{String(ticket.account)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={String(ticket.severity)}>{String(ticket.severity).toUpperCase()}</Badge>
                    <span className="text-sm text-red-700">Due {formatDateTime(ticket.resolution_due_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Recent Login Failures" subtitle="Good for fast auth triage.">
            <div className="space-y-3">
              {data.loginFailures.map((row, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-slate-800">{String(row.account)}</span>
                    <span className="text-xs text-slate-500">{formatDateTime(row.attempted_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{String(row.email)}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-red-600">{String(row.failure_reason)}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="API 401 / 403 / 500 Spikes"
            subtitle="Grouped by endpoint for quick escalation decisions."
            action={
              <Link href="/investigations" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                View saved SQL
              </Link>
            }
          >
            <div className="space-y-3">
              {data.apiSpikes.map((row) => (
                <div key={String(row.endpoint)} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="font-medium text-slate-900">{String(row.endpoint)}</div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-slate-400">401</p>
                      <p className="mt-1 font-semibold text-slate-800">{String(row.auth_401)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-slate-400">403</p>
                      <p className="mt-1 font-semibold text-slate-800">{String(row.authz_403)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-slate-400">500</p>
                      <p className="mt-1 font-semibold text-slate-800">{String(row.server_5xx)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
