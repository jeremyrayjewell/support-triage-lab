import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import { InvestigationReport } from "@/components/InvestigationReport";
import { Panel } from "@/components/Panel";
import { buildInvestigationReport, getTicketDetail } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { reportToMarkdown } from "@/lib/report-markdown";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getTicketDetail(Number(id));

  if (!detail) {
    notFound();
  }

  const { ticket, loginAttempts, apiErrors, appEvents, artifactBundle, accountOpenTickets } = detail;
  const report = buildInvestigationReport(detail);
  const reportMarkdown = reportToMarkdown(report);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/" className="text-slate-500 hover:text-slate-900">
          Dashboard
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900">Ticket #{ticket.id}</span>
      </div>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={String(ticket.severity)}>{String(ticket.severity).toUpperCase()}</Badge>
              <Badge tone={String(ticket.status)}>{String(ticket.status).replace(/-/g, " ")}</Badge>
              <span className="text-sm uppercase tracking-[0.18em] text-slate-400">{String(ticket.category)}</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{String(ticket.title)}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{String(ticket.summary)}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Suggested next step</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-200">{artifactBundle.nextStep}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Panel title="Ticket metadata">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Meta label="Account" value={String(ticket.account_name)} />
              <Meta label="Reporter" value={`${String(ticket.user_name)} (${String(ticket.email)})`} />
              <Meta label="Role" value={String(ticket.role)} />
              <Meta label="Channel" value={String(ticket.channel)} />
              <Meta label="Source" value={String(ticket.source)} />
              <Meta label="Opened" value={formatDateTime(ticket.created_at)} />
              <Meta label="Updated" value={formatDateTime(ticket.updated_at)} />
              <Meta label="Response due" value={formatDateTime(ticket.first_response_due_at)} />
              <Meta label="Resolution due" value={formatDateTime(ticket.resolution_due_at)} />
            </div>
          </Panel>

          <Panel title="User and account context">
            <div className="grid gap-4 md:grid-cols-2">
              <ContextCard title="Account profile" lines={[
                `${String(ticket.plan)} plan`,
                `${String(ticket.industry)} in ${String(ticket.region)}`,
                `Owner: ${String(ticket.owner_name)}`,
                `MRR: $${String(ticket.mrr)}`,
                `Health score: ${String(ticket.health_score)}`,
              ]} />
              <ContextCard title="User profile" lines={[
                `Role: ${String(ticket.role)}`,
                `Browser: ${String(ticket.browser)}`,
                `Timezone: ${String(ticket.timezone)}`,
                `Subscription: ${String(ticket.subscription_status)}`,
                `Billing: ${String(ticket.billing_status)} / invoice ${String(ticket.last_invoice_status)}`,
              ]} />
            </div>
          </Panel>

          <Panel title="Related login attempts">
            <DataTable rows={loginAttempts} />
          </Panel>

          <Panel title="Related API errors">
            <DataTable rows={apiErrors} />
          </Panel>

          <Panel title="Related app events">
            <DataTable rows={appEvents} />
          </Panel>

          <InvestigationReport report={report} markdown={reportMarkdown} />
        </div>

        <div className="space-y-6">
          <Panel title="Suggested triage" subtitle="Derived from correlated telemetry and ticket theme.">
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Suggested severity</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{artifactBundle.severity.toUpperCase()}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Root-cause summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{artifactBundle.rootCause}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Customer reply draft">
            <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{artifactBundle.customerReply}</pre>
          </Panel>

          <Panel title="Internal engineering escalation note">
            <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{artifactBundle.escalationNote}</pre>
          </Panel>

          <Panel title="Troubleshooting checklist">
            <ul className="space-y-3 text-sm text-slate-700">
              {artifactBundle.checklist.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Other open tickets for this account">
            {accountOpenTickets.length > 0 ? (
              <div className="space-y-3">
                {accountOpenTickets.map((other) => (
                  <Link
                    key={String(other.id)}
                    href={`/tickets/${other.id}`}
                    className="block rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">#{String(other.id)} {String(other.title)}</span>
                      <Badge tone={String(other.severity)}>{String(other.severity).toUpperCase()}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{String(other.status)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No other open tickets for this account.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function ContextCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
