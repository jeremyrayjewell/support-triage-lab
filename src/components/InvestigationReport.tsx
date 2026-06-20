"use client";

import { useState } from "react";
import { InvestigationReport as InvestigationReportType } from "@/lib/types";

export function InvestigationReport({
  report,
  markdown,
}: {
  report: InvestigationReportType;
  markdown: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(report.title)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-panel">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Generate investigation report</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{report.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            A support investigation note built from the current ticket context, related telemetry, and saved investigation patterns.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            {copied ? "Copied" : "Copy as Markdown"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Download Markdown
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <ReportBlock title="Issue summary" body={report.issueSummary} />
        <ReportBlock title="Severity and SLA risk" body={report.severityAndSlaRisk} />
        <ReportBlock title="Affected account/user" body={report.affectedAccountUser} />
        <ListBlock title="Evidence reviewed" items={report.evidenceReviewed} />
        <ListBlock
          title="Related SQL investigations"
          items={report.relatedSqlInvestigations.map((item) => `${item.title}: ${item.reason}`)}
        />
        <ListBlock title="Findings" items={report.findings} />
        <ReportBlock title="Likely root cause" body={report.likelyRootCause} />
        <PreBlock title="Customer-facing reply" body={report.customerFacingReply} />
        <PreBlock title="Internal engineering escalation" body={report.internalEngineeringEscalation} />
        <ReportBlock title="Recommended next action" body={report.recommendedNextAction} />
        <ReportBlock title="Suggested documentation update" body={report.suggestedDocumentationUpdate} />
      </div>
    </section>
  );
}

function ReportBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{body}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
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

function PreBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{body}</pre>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
