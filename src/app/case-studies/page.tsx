import Link from "next/link";
import { Panel } from "@/components/Panel";
import { getCuratedCaseStudies } from "@/lib/db";

export default function CaseStudiesPage() {
  const caseStudies = getCuratedCaseStudies();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/80 bg-slate-950 px-6 py-7 text-white shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Selected cases</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Selected support investigation case studies</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Three sample cases showing ticket triage, SQL evidence, customer updates, and engineering escalation for technical support work.
        </p>
      </section>

      <div className="space-y-6">
        {caseStudies.map((caseStudy) => (
          <Panel
            key={caseStudy.ticketId}
            title={caseStudy.label}
            subtitle={`Curated from ticket #${caseStudy.ticketId} using the same investigation and markdown-report workflow as the main ticket pages.`}
            action={
              <Link href={`/tickets/${caseStudy.ticketId}`} className="text-sm font-medium text-orange-600 hover:text-orange-700">
                Open ticket
              </Link>
            }
          >
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <StudySection title="Situation" body={caseStudy.report.issueSummary} />
                <StudySection title="Severity / SLA risk" body={caseStudy.report.severityAndSlaRisk} />
                <StudyList title="Evidence reviewed" items={caseStudy.report.evidenceReviewed} />
                <div className="rounded-3xl bg-slate-50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">SQL used</p>
                  <div className="mt-3 space-y-4">
                    {caseStudy.sqlInvestigations.map((investigation) => (
                      <div key={investigation.id} className="rounded-2xl bg-white px-4 py-4">
                        <p className="font-medium text-slate-900">{investigation.title}</p>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-700">
                          {investigation.sql}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
                <StudyList title="Findings" items={caseStudy.report.findings} />
              </div>

              <div className="space-y-4">
                <StudySection title="Customer reply" body={caseStudy.report.customerFacingReply} preformatted />
                <StudySection title="Internal engineering escalation" body={caseStudy.report.internalEngineeringEscalation} preformatted />
                <StudySection title="Recommended next action" body={caseStudy.report.recommendedNextAction} />
                <StudySection title="Documentation update" body={caseStudy.report.suggestedDocumentationUpdate} />
                <div className="rounded-3xl bg-slate-50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Markdown export</p>
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-700">
                    {caseStudy.markdown}
                  </pre>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function StudySection({ title, body, preformatted = false }: { title: string; body: string; preformatted?: boolean }) {
  return (
    <div className="rounded-3xl bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      {preformatted ? (
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{body}</pre>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
      )}
    </div>
  );
}

function StudyList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-white px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
