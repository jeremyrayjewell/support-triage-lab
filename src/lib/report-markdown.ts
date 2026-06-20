import { InvestigationReport } from "@/lib/types";

export function reportToMarkdown(report: InvestigationReport) {
  return `# ${report.title}

## Issue Summary
${report.issueSummary}

## Severity and SLA Risk
${report.severityAndSlaRisk}

## Affected Account/User
${report.affectedAccountUser}

## Evidence Reviewed
${report.evidenceReviewed.map((item) => `- ${item}`).join("\n")}

## Related SQL Investigations
${report.relatedSqlInvestigations.map((item) => `- **${item.title}**: ${item.reason}`).join("\n")}

## Findings
${report.findings.map((item) => `- ${item}`).join("\n")}

## Likely Root Cause
${report.likelyRootCause}

## Customer-Facing Reply
\`\`\`
${report.customerFacingReply}
\`\`\`

## Internal Engineering Escalation
\`\`\`
${report.internalEngineeringEscalation}
\`\`\`

## Recommended Next Action
${report.recommendedNextAction}

## Suggested Documentation Update
${report.suggestedDocumentationUpdate}
`;
}
