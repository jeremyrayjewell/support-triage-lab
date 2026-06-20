import { DataTable } from "@/components/DataTable";
import { Panel } from "@/components/Panel";
import { runSavedInvestigations } from "@/lib/db";

export default function InvestigationsPage() {
  const investigations = runSavedInvestigations();

  return (
    <div className="space-y-6">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Saved investigations</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">SQL investigation panel</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Each investigation shows the exact query and a local result table so you can talk through hypothesis-driven support debugging in interviews.
        </p>
      </section>

      <div className="space-y-5">
        {investigations.map((investigation) => (
          <Panel key={investigation.id} title={investigation.title} subtitle={investigation.description}>
            <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono leading-6">{investigation.sql}</pre>
            </div>
            <div className="mt-4">
              <DataTable rows={investigation.rows} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
