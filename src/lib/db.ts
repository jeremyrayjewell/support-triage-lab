import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { SQLInputValue } from "node:sqlite";
import { accounts, apiRequests, appEvents, loginAttempts, seededAt, subscriptions, tickets, users } from "@/lib/mock-data";
import { getInvestigationsByIds, savedInvestigations } from "@/lib/investigations";
import { reportToMarkdown } from "@/lib/report-markdown";
import { CuratedCaseStudy, InvestigationReport, QueryResultRow, RelatedInvestigation, TicketArtifactBundle } from "@/lib/types";

const dataDir = path.join(process.cwd(), ".data");
const dbPath = path.join(dataDir, "supportops.db");

declare global {
  // eslint-disable-next-line no-var
  var __supportOpsDb: DatabaseSync | undefined;
}

function getDb() {
  if (!global.__supportOpsDb) {
    fs.mkdirSync(dataDir, { recursive: true });
    global.__supportOpsDb = new DatabaseSync(dbPath);
    initialize(global.__supportOpsDb);
  }

  return global.__supportOpsDb;
}

function initialize(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      plan TEXT NOT NULL,
      industry TEXT NOT NULL,
      region TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      mrr INTEGER NOT NULL,
      health_score INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      account_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      browser TEXT NOT NULL,
      timezone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY,
      account_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      severity TEXT NOT NULL,
      category TEXT NOT NULL,
      channel TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      first_response_due_at TEXT NOT NULL,
      resolution_due_at TEXT NOT NULL,
      issue_key TEXT NOT NULL,
      summary TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      attempted_at TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      status TEXT NOT NULL,
      failure_reason TEXT,
      mfa_required INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_events (
      id INTEGER PRIMARY KEY,
      account_id INTEGER NOT NULL,
      user_id INTEGER,
      ticket_id INTEGER,
      event_type TEXT NOT NULL,
      event_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      page TEXT,
      browser TEXT,
      metadata_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_requests (
      id INTEGER PRIMARY KEY,
      account_id INTEGER NOT NULL,
      user_id INTEGER,
      ticket_id INTEGER,
      happened_at TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      latency_ms INTEGER NOT NULL,
      request_id TEXT NOT NULL,
      error_code TEXT
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY,
      account_id INTEGER NOT NULL,
      plan_name TEXT NOT NULL,
      status TEXT NOT NULL,
      seats_purchased INTEGER NOT NULL,
      seats_in_use INTEGER NOT NULL,
      renewal_date TEXT NOT NULL,
      billing_status TEXT NOT NULL,
      last_invoice_status TEXT NOT NULL,
      payment_processor TEXT NOT NULL
    );
  `);

  const meta = db.prepare("SELECT value FROM meta WHERE key = 'seeded_at'").get() as { value?: string } | undefined;
  if (meta?.value === seededAt) {
    return;
  }

  db.exec(`
    DELETE FROM meta;
    DELETE FROM accounts;
    DELETE FROM users;
    DELETE FROM tickets;
    DELETE FROM login_attempts;
    DELETE FROM app_events;
    DELETE FROM api_requests;
    DELETE FROM subscriptions;
  `);

  const insertAccount = db.prepare(`
    INSERT INTO accounts (id, name, plan, industry, region, owner_name, mrr, health_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const account of accounts) {
    insertAccount.run(
      account.id,
      account.name,
      account.plan,
      account.industry,
      account.region,
      account.owner_name,
      account.mrr,
      account.health_score,
    );
  }

  const insertUser = db.prepare(`
    INSERT INTO users (id, account_id, name, email, role, browser, timezone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const user of users) {
    insertUser.run(user.id, user.account_id, user.name, user.email, user.role, user.browser, user.timezone);
  }

  const insertTicket = db.prepare(`
    INSERT INTO tickets (
      id, account_id, user_id, title, status, severity, category, channel, source,
      created_at, updated_at, first_response_due_at, resolution_due_at, issue_key, summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const ticket of tickets) {
    insertTicket.run(
      ticket.id,
      ticket.account_id,
      ticket.user_id,
      ticket.title,
      ticket.status,
      ticket.severity,
      ticket.category,
      ticket.channel,
      ticket.source,
      ticket.created_at,
      ticket.updated_at,
      ticket.first_response_due_at,
      ticket.resolution_due_at,
      ticket.issue_key,
      ticket.summary,
    );
  }

  const insertLogin = db.prepare(`
    INSERT INTO login_attempts (id, user_id, account_id, attempted_at, ip_address, status, failure_reason, mfa_required)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of loginAttempts) {
    insertLogin.run(item.id, item.user_id, item.account_id, item.attempted_at, item.ip_address, item.status, item.failure_reason, item.mfa_required);
  }

  const insertEvent = db.prepare(`
    INSERT INTO app_events (id, account_id, user_id, ticket_id, event_type, event_name, created_at, page, browser, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of appEvents) {
    insertEvent.run(
      item.id,
      item.account_id,
      item.user_id,
      item.ticket_id,
      item.event_type,
      item.event_name,
      item.created_at,
      item.page,
      item.browser,
      item.metadata_json,
    );
  }

  const insertApi = db.prepare(`
    INSERT INTO api_requests (id, account_id, user_id, ticket_id, happened_at, endpoint, method, status_code, latency_ms, request_id, error_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of apiRequests) {
    insertApi.run(
      item.id,
      item.account_id,
      item.user_id,
      item.ticket_id,
      item.happened_at,
      item.endpoint,
      item.method,
      item.status_code,
      item.latency_ms,
      item.request_id,
      item.error_code,
    );
  }

  const insertSubscription = db.prepare(`
    INSERT INTO subscriptions (id, account_id, plan_name, status, seats_purchased, seats_in_use, renewal_date, billing_status, last_invoice_status, payment_processor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of subscriptions) {
    insertSubscription.run(
      item.id,
      item.account_id,
      item.plan_name,
      item.status,
      item.seats_purchased,
      item.seats_in_use,
      item.renewal_date,
      item.billing_status,
      item.last_invoice_status,
      item.payment_processor,
    );
  }

  db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)").run("seeded_at", seededAt);
}

function rows(sql: string, params: SQLInputValue[] = []) {
  return getDb().prepare(sql).all(...params) as QueryResultRow[];
}

function first(sql: string, params: SQLInputValue[] = []) {
  return (getDb().prepare(sql).get(...params) ?? null) as QueryResultRow | null;
}

export function getDashboardData() {
  return {
    severityCounts: rows(`
      SELECT severity, COUNT(*) AS count
      FROM tickets
      WHERE status <> 'closed'
      GROUP BY severity
      ORDER BY severity ASC
    `),
    topErrorCodes: rows(`
      SELECT COALESCE(error_code, 'none') AS error_code, COUNT(*) AS count
      FROM api_requests
      WHERE happened_at >= '2026-06-12T00:00:00Z'
        AND error_code IS NOT NULL
      GROUP BY error_code
      ORDER BY count DESC
      LIMIT 5
    `),
    slaBreaches: rows(`
      SELECT t.id, t.title, t.severity, a.name AS account, t.resolution_due_at
      FROM tickets t
      JOIN accounts a ON a.id = t.account_id
      WHERE t.status <> 'closed'
        AND t.resolution_due_at < '2026-06-19T22:00:00Z'
      ORDER BY t.resolution_due_at ASC
    `),
    affectedAccounts: rows(`
      SELECT a.name, COUNT(DISTINCT t.id) AS open_tickets, MAX(t.severity) AS highest_severity
      FROM tickets t
      JOIN accounts a ON a.id = t.account_id
      WHERE t.status <> 'closed'
      GROUP BY a.name
      ORDER BY open_tickets DESC, highest_severity ASC
    `),
    loginFailures: rows(`
      SELECT la.attempted_at, a.name AS account, u.email, la.failure_reason
      FROM login_attempts la
      JOIN accounts a ON a.id = la.account_id
      JOIN users u ON u.id = la.user_id
      WHERE la.status = 'failed'
      ORDER BY la.attempted_at DESC
      LIMIT 6
    `),
    apiSpikes: rows(`
      SELECT endpoint,
        SUM(CASE WHEN status_code = 401 THEN 1 ELSE 0 END) AS auth_401,
        SUM(CASE WHEN status_code = 403 THEN 1 ELSE 0 END) AS authz_403,
        SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) AS server_5xx
      FROM api_requests
      WHERE happened_at >= '2026-06-18T00:00:00Z'
      GROUP BY endpoint
      HAVING auth_401 > 0 OR authz_403 > 0 OR server_5xx > 0
      ORDER BY server_5xx DESC, authz_403 DESC, auth_401 DESC
    `),
    tickets: rows(`
      SELECT t.id, t.title, t.status, t.severity, t.category, a.name AS account, t.updated_at
      FROM tickets t
      JOIN accounts a ON a.id = t.account_id
      WHERE t.status <> 'closed'
      ORDER BY
        CASE t.severity
          WHEN 'sev-1' THEN 1
          WHEN 'sev-2' THEN 2
          WHEN 'sev-3' THEN 3
          ELSE 4
        END,
        t.updated_at DESC
    `),
  };
}

export function getOpenTickets() {
  return rows(`
    SELECT t.id, t.title, t.status, t.severity, t.category, a.name AS account, t.updated_at, t.summary
    FROM tickets t
    JOIN accounts a ON a.id = t.account_id
    WHERE t.status <> 'closed'
    ORDER BY
      CASE t.severity
        WHEN 'sev-1' THEN 1
        WHEN 'sev-2' THEN 2
        WHEN 'sev-3' THEN 3
        ELSE 4
      END,
      t.updated_at DESC
  `);
}

export function getTicketDetail(ticketId: number) {
  const ticket = first(`
    SELECT
      t.*,
      a.name AS account_name,
      a.plan,
      a.industry,
      a.region,
      a.owner_name,
      a.mrr,
      a.health_score,
      u.name AS user_name,
      u.email,
      u.role,
      u.browser,
      u.timezone,
      s.status AS subscription_status,
      s.billing_status,
      s.last_invoice_status,
      s.seats_purchased,
      s.seats_in_use
    FROM tickets t
    JOIN accounts a ON a.id = t.account_id
    JOIN users u ON u.id = t.user_id
    JOIN subscriptions s ON s.account_id = t.account_id
    WHERE t.id = ?
  `, [ticketId]);

  if (!ticket) {
    return null;
  }

  return {
    ticket,
    loginAttempts: rows(`
      SELECT attempted_at, ip_address, status, failure_reason, mfa_required
      FROM login_attempts
      WHERE account_id = ?
      ORDER BY attempted_at DESC
      LIMIT 8
    `, [ticket.account_id as number]),
    apiErrors: rows(`
      SELECT happened_at, endpoint, method, status_code, latency_ms, error_code, request_id
      FROM api_requests
      WHERE account_id = ?
        AND (ticket_id = ? OR status_code >= 400)
      ORDER BY happened_at DESC
      LIMIT 10
    `, [ticket.account_id as number, ticketId]),
    appEvents: rows(`
      SELECT created_at, event_type, event_name, page, browser, metadata_json
      FROM app_events
      WHERE account_id = ?
        AND (ticket_id = ? OR ticket_id IS NULL)
      ORDER BY created_at DESC
      LIMIT 10
    `, [ticket.account_id as number, ticketId]),
    artifactBundle: buildArtifacts(ticket),
    accountOpenTickets: rows(`
      SELECT id, title, severity, status, issue_key
      FROM tickets
      WHERE account_id = ?
        AND status <> 'closed'
        AND id <> ?
      ORDER BY created_at DESC
    `, [ticket.account_id as number, ticketId]),
  };
}

function buildArtifacts(ticket: QueryResultRow): TicketArtifactBundle {
  const issueKey = String(ticket.issue_key);
  const base = {
    customerReply: `Hi ${ticket.user_name},\n\nThanks for flagging this. We’ve confirmed the issue on the ${ticket.account_name} workspace and are actively investigating the related signals in auth, API, and application telemetry. I’ll keep this case updated with the next checkpoint within 30 minutes, even if the investigation is still in progress.\n\nCurrent focus: ${ticket.summary}\n\nBest,\nSupportOps`,
    escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nImpact: ${ticket.summary}\nBusiness context: ${ticket.plan} plan, ${ticket.region}, MRR $${ticket.mrr}\nAsk: Please review the correlated logs and confirm whether the most recent deploy or cache state matches the observed failure pattern.`,
    checklist: [
      "Confirm scope: single user, cohort, or whole account.",
      "Validate whether the issue started after a deploy, role change, config change, or billing event.",
      "Review correlated login, API, and app-event telemetry for the same time window.",
      "Check for duplicate reports or broader account impact before updating severity.",
      "Document customer-safe status and internal next action before handoff.",
    ],
    rootCause: "Preliminary triage summary pending investigation outcome.",
    severity: ticket.severity as TicketArtifactBundle["severity"],
    nextStep: "Collect timeline evidence and share an internal checkpoint update.",
  };

  if (issueKey === "auth-mfa-reset") {
    return {
      ...base,
      rootCause: "Likely mismatch between freshly reset MFA state and the cached authentication policy applied to privileged users.",
      nextStep: "Invalidate auth policy cache for the account and have engineering confirm the MFA reset job output.",
      escalationNote: `${base.escalationNote}\nSuspicion: MFA reset completed at 16:54 UTC, followed by repeated 401s and login failures with policy mismatch.`,
    };
  }

  if (issueKey === "api-500-route-sync") {
    return {
      ...base,
      rootCause: "Route sync worker appears to be timing out after the latest background job deploy, producing repeated 500s on POST /v1/routes/sync.",
      nextStep: "Compare current worker release against the last known-good build and inspect queue saturation for the route sync job.",
    };
  }

  if (issueKey === "frontend-blank-dashboard") {
    return {
      ...base,
      rootCause: "Chrome 126 users are hitting a blank dashboard render path tied to the current nav redesign flag and widget state handling.",
      nextStep: "Roll back or disable the nav redesign flag for affected accounts while frontend engineering validates the render regression.",
    };
  }

  if (issueKey === "authz-role-change") {
    return {
      ...base,
      rootCause: "Role updates are not propagating cleanly to authorization caches, so newly changed users retain stale permissions and hit 403s.",
      nextStep: "Flush the affected authorization cache entries and confirm whether project settings permissions are recalculated after role writes.",
    };
  }

  if (issueKey === "webhook-delays") {
    return {
      ...base,
      rootCause: "Webhook backlog suggests a stalled delivery queue rather than a customer-side endpoint failure.",
      nextStep: "Measure queue delay, inspect the worker health for delivery processors, and share a mitigation ETA with the customer.",
    };
  }

  if (issueKey === "billing-subscription-mismatch") {
    return {
      ...base,
      rootCause: "Billing state is inconsistent: subscription access remains active while the latest invoice failed and seat count exceeds entitlement.",
      nextStep: "Reconcile invoice status, verify dunning rules, and decide whether access should remain active pending payment retry.",
    };
  }

  return base;
}

export function runSavedInvestigations() {
  return savedInvestigations.map((investigation) => ({
    ...investigation,
    rows: rows(investigation.sql),
  }));
}

export function getSavedInvestigations() {
  return savedInvestigations;
}

export function getCuratedCaseStudies(): CuratedCaseStudy[] {
  const curated = [
    { ticketId: 102, label: "API 500 spike" },
    { ticketId: 101, label: "MFA/login failure" },
    { ticketId: 105, label: "Webhook delivery delay" },
  ];

  return curated.flatMap((item) => {
    const detail = getTicketDetail(item.ticketId);
    if (!detail) {
      return [];
    }

    const report = buildInvestigationReport(detail);
    const sqlInvestigations = getInvestigationsByIds(report.relatedSqlInvestigations.map((investigation) => investigation.id));

    return [{
      ticketId: item.ticketId,
      label: item.label,
      reportTitle: report.title,
      report,
      markdown: reportToMarkdown(report),
      sqlInvestigations,
    }];
  });
}

export function buildInvestigationReport(detail: NonNullable<ReturnType<typeof getTicketDetail>>): InvestigationReport {
  const { ticket, loginAttempts, apiErrors, appEvents, artifactBundle, accountOpenTickets } = detail;
  const relatedSqlInvestigations = getRelatedInvestigations(ticket);

  const failedLoginCount = loginAttempts.filter((attempt) => String(attempt.status) === "failed").length;
  const authFailures = apiErrors.filter((request) => Number(request.status_code) === 401).length;
  const authzFailures = apiErrors.filter((request) => Number(request.status_code) === 403).length;
  const serverFailures = apiErrors.filter((request) => Number(request.status_code) >= 500).length;
  const duplicateTicketCount = accountOpenTickets.filter((openTicket) => String(openTicket.issue_key ?? "") === String(ticket.issue_key)).length;

  return {
    title: `Investigation Report: Ticket #${ticket.id} - ${String(ticket.title)}`,
    issueSummary: `${String(ticket.summary)} The case is currently ${String(ticket.status).replace(/-/g, " ")} and mapped to ${String(ticket.category)} for ${String(ticket.account_name)}.`,
    severityAndSlaRisk: buildSeverityRisk(ticket),
    affectedAccountUser: `${String(ticket.account_name)} (${String(ticket.plan)} plan, ${String(ticket.industry)}, owner ${String(ticket.owner_name)}) with primary reporter ${String(ticket.user_name)} (${String(ticket.email)}), role ${String(ticket.role)}, browser ${String(ticket.browser)}, timezone ${String(ticket.timezone)}.`,
    evidenceReviewed: [
      `Ticket timeline reviewed from ${String(ticket.created_at)} through ${String(ticket.updated_at)} with response target ${String(ticket.first_response_due_at)} and resolution target ${String(ticket.resolution_due_at)}.`,
      `${loginAttempts.length} related login attempts reviewed, including ${failedLoginCount} failures.`,
      `${apiErrors.length} related API requests reviewed, including ${authFailures} HTTP 401s, ${authzFailures} HTTP 403s, and ${serverFailures} HTTP 5xx responses.`,
      `${appEvents.length} related application events reviewed for deploy, UI, role-change, or integration signals.`,
      `Subscription context checked: ${String(ticket.subscription_status)} subscription, billing ${String(ticket.billing_status)}, last invoice ${String(ticket.last_invoice_status)}, seats ${String(ticket.seats_in_use)}/${String(ticket.seats_purchased)}.`,
    ],
    relatedSqlInvestigations,
    findings: buildFindings(ticket, {
      failedLoginCount,
      authFailures,
      authzFailures,
      serverFailures,
      duplicateTicketCount,
      appEventCount: appEvents.length,
    }),
    likelyRootCause: artifactBundle.rootCause,
    customerFacingReply: artifactBundle.customerReply,
    internalEngineeringEscalation: artifactBundle.escalationNote,
    recommendedNextAction: artifactBundle.nextStep,
    suggestedDocumentationUpdate: buildDocUpdate(ticket),
  };
}

function buildSeverityRisk(ticket: QueryResultRow) {
  const resolutionDue = new Date(String(ticket.resolution_due_at)).getTime();
  const firstResponseDue = new Date(String(ticket.first_response_due_at)).getTime();
  const now = new Date("2026-06-19T22:00:00Z").getTime();

  if (resolutionDue < now) {
    return `${String(ticket.severity).toUpperCase()} with active SLA risk: the resolution target has already passed, so this case should be treated as a breach candidate and updated with a clear mitigation path immediately.`;
  }

  if (firstResponseDue < now) {
    return `${String(ticket.severity).toUpperCase()} with response SLA risk: first response is overdue even though the resolution target is still open.`;
  }

  return `${String(ticket.severity).toUpperCase()} and currently within SLA, but still high-priority because the symptoms suggest customer-facing impact and cross-system investigation.`;
}

function getRelatedInvestigations(ticket: QueryResultRow): RelatedInvestigation[] {
  const issueKey = String(ticket.issue_key);
  const idsByIssue: Record<string, string[]> = {
    "auth-mfa-reset": ["failed-logins-by-account", "sla-breach-candidates"],
    "api-500-route-sync": ["api-500-spike-by-endpoint", "sla-breach-candidates"],
    "frontend-blank-dashboard": ["browser-specific-blank-dashboard", "duplicate-reports"],
    "authz-role-change": ["permission-denied-after-role-change", "sla-breach-candidates"],
    "webhook-delays": ["webhook-delivery-delays", "sla-breach-candidates"],
    "billing-subscription-mismatch": ["subscription-payment-mismatch", "sla-breach-candidates"],
  };

  const reasonsById: Record<string, string> = {
    "failed-logins-by-account": "Useful for validating whether login failures are clustered at the account level rather than isolated to one user.",
    "api-500-spike-by-endpoint": "Useful for confirming whether backend failures are concentrated on one endpoint and whether latency is rising alongside the error volume.",
    "browser-specific-blank-dashboard": "Useful for tying the symptom to a browser/version-specific UI regression and affected user cohort.",
    "sla-breach-candidates": "Useful for showing operational urgency and whether the case needs immediate ownership or escalation.",
    "duplicate-reports": "Useful for checking whether multiple contacts are reporting the same underlying product issue.",
    "subscription-payment-mismatch": "Useful for reconciling customer-visible access state with billing and entitlement data.",
    "permission-denied-after-role-change": "Useful for validating the timing between role mutations and permission-denied behavior.",
    "webhook-delivery-delays": "Useful for measuring backlog severity and identifying delayed downstream automation impact.",
  };

  return getInvestigationsByIds(idsByIssue[issueKey] ?? ["sla-breach-candidates"]).map((investigation) => ({
    id: investigation.id,
    title: investigation.title,
    reason: reasonsById[investigation.id] ?? "Relevant to the current support investigation.",
  }));
}

function buildFindings(
  ticket: QueryResultRow,
  metrics: {
    failedLoginCount: number;
    authFailures: number;
    authzFailures: number;
    serverFailures: number;
    duplicateTicketCount: number;
    appEventCount: number;
  },
) {
  const issueKey = String(ticket.issue_key);
  const shared = [
    `The report includes correlated signals across ticket history, account context, and ${metrics.appEventCount} application events rather than relying on the customer narrative alone.`,
    `Business context matters here: ${String(ticket.account_name)} is on the ${String(ticket.plan)} plan with MRR $${String(ticket.mrr)} and health score ${String(ticket.health_score)}.`,
  ];

  if (issueKey === "auth-mfa-reset") {
    return [
      `Observed ${metrics.failedLoginCount} failed login attempts and ${metrics.authFailures} HTTP 401 responses shortly after the MFA reset event.`,
      "The error pattern points to policy validation rather than a general password failure, which narrows the blast radius toward authentication state handling.",
      ...shared,
    ];
  }

  if (issueKey === "api-500-route-sync") {
    return [
      `Observed ${metrics.serverFailures} HTTP 5xx responses on route-sync traffic, with the same endpoint recurring across the related API evidence.`,
      "A deploy marker for the route-sync worker appears in the event stream before the customer-facing failures, which makes release correlation a strong lead.",
      ...shared,
    ];
  }

  if (issueKey === "frontend-blank-dashboard") {
    return [
      `The account has ${metrics.duplicateTicketCount + 1} active report(s) associated with the same issue pattern, which suggests this is not a single-user problem.`,
      "App events point to blank dashboard renders on Chrome 126, supporting a browser-specific regression hypothesis.",
      ...shared,
    ];
  }

  if (issueKey === "authz-role-change") {
    return [
      `Observed ${metrics.authzFailures} HTTP 403 responses after a role-change event, which points to authorization propagation rather than missing product access.`,
      "The failure appears immediately after membership changes, making stale cache or delayed permission recomputation more likely than manual misconfiguration.",
      ...shared,
    ];
  }

  if (issueKey === "webhook-delays") {
    return [
      "The event stream shows backlog detection rather than customer endpoint rejection, which shifts focus to internal queue health.",
      `Observed ${metrics.serverFailures} HTTP 5xx response(s) in related delivery traffic, supporting an internal processing stall scenario.`,
      ...shared,
    ];
  }

  if (issueKey === "billing-subscription-mismatch") {
    return [
      "Billing evidence shows the subscription still looks active to the customer while invoice state and seat usage are out of sync.",
      "This case requires both technical validation and an operational decision about entitlement enforcement or grace-period behavior.",
      ...shared,
    ];
  }

  return shared;
}

function buildDocUpdate(ticket: QueryResultRow) {
  const issueKey = String(ticket.issue_key);

  if (issueKey === "auth-mfa-reset") {
    return "Add a support runbook section covering post-MFA-reset validation, including cache invalidation checks and expected login telemetry after bulk security changes.";
  }

  if (issueKey === "api-500-route-sync") {
    return "Document a route-sync API incident checklist with release-correlation steps, key SQL queries, and the primary logs to inspect before escalating.";
  }

  if (issueKey === "frontend-blank-dashboard") {
    return "Add a known-issues note for browser-specific blank-dashboard regressions, including how to confirm feature-flag exposure and affected browser versions.";
  }

  if (issueKey === "authz-role-change") {
    return "Expand the permissions troubleshooting guide with a role-change propagation section and explicit steps for validating stale authorization caches.";
  }

  if (issueKey === "webhook-delays") {
    return "Add a webhook delay playbook with queue-lag thresholds, customer messaging guidance, and the quickest way to verify worker backlog.";
  }

  if (issueKey === "billing-subscription-mismatch") {
    return "Document the billing/subscription mismatch workflow so support can reconcile invoice failures, seat overages, and access-state exceptions consistently.";
  }

  return "Capture this issue pattern in the support runbook with the evidence sources, SQL checks, and escalation criteria used during triage.";
}
