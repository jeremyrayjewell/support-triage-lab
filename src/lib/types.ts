export type Severity = "sev-1" | "sev-2" | "sev-3" | "sev-4";

export type QueryResultRow = Record<string, string | number | null>;

export type SavedInvestigation = {
  id: string;
  title: string;
  description: string;
  sql: string;
};

export type TicketArtifactBundle = {
  customerReply: string;
  escalationNote: string;
  checklist: string[];
  rootCause: string;
  severity: Severity;
  nextStep: string;
};

export type RelatedInvestigation = {
  id: string;
  title: string;
  reason: string;
};

export type CuratedCaseStudy = {
  ticketId: number;
  label: string;
  reportTitle: string;
  report: InvestigationReport;
  markdown: string;
  sqlInvestigations: SavedInvestigation[];
};

export type InvestigationReport = {
  title: string;
  issueSummary: string;
  severityAndSlaRisk: string;
  affectedAccountUser: string;
  evidenceReviewed: string[];
  relatedSqlInvestigations: RelatedInvestigation[];
  findings: string[];
  likelyRootCause: string;
  customerFacingReply: string;
  internalEngineeringEscalation: string;
  recommendedNextAction: string;
  suggestedDocumentationUpdate: string;
};
