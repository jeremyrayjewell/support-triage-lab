import { ReactNode } from "react";

const styles: Record<string, string> = {
  "sev-1": "bg-red-100 text-red-700 ring-red-200",
  "sev-2": "bg-orange-100 text-orange-700 ring-orange-200",
  "sev-3": "bg-amber-100 text-amber-700 ring-amber-200",
  "sev-4": "bg-slate-200 text-slate-700 ring-slate-300",
  open: "bg-sky-100 text-sky-700 ring-sky-200",
  investigating: "bg-violet-100 text-violet-700 ring-violet-200",
  "waiting-on-eng": "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200",
  default: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[tone] ?? styles.default}`}>
      {children}
    </span>
  );
}
