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
const simulationStart = Date.parse("2026-06-20T09:00:00Z");

const validStatuses = ["open", "investigating", "waiting_on_customer", "escalated", "resolved"] as const;

type TicketStatus = (typeof validStatuses)[number];

type ScenarioTemplate = {
  issueKey: string;
  title: string;
  summary: string;
  severity: "sev-1" | "sev-2" | "sev-3" | "sev-4";
  category: string;
  channel: string;
  source: string;
  accountId: number;
  userId: number;
  createEvidence: (context: ScenarioContext) => ScenarioEvidence;
};

type ScenarioContext = {
  ticketId: number;
  count: number;
  createdAt: string;
  updatedAt: string;
  accountId: number;
  userId: number;
};

type ScenarioEvidence = {
  loginAttempts?: Array<{
    attempted_at: string;
    ip_address: string;
    status: string;
    failure_reason: string | null;
    mfa_required: number;
  }>;
  apiRequests?: Array<{
    happened_at: string;
    endpoint: string;
    method: string;
    status_code: number;
    latency_ms: number;
    request_id: string;
    error_code: string | null;
  }>;
  appEvents?: Array<{
    event_type: string;
    event_name: string;
    created_at: string;
    page: string | null;
    browser: string | null;
    metadata_json: string;
  }>;
};

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
    ensureMetaDefaults(db);
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

  setMetaValue(db, "seeded_at", seededAt);
  ensureMetaDefaults(db);
}

function ensureMetaDefaults(db: DatabaseSync) {
  if (getMetaValue("simulation_template_index") === null) {
    setMetaValue(db, "simulation_template_index", "0");
  }
  if (getMetaValue("generated_ticket_count") === null) {
    setMetaValue(db, "generated_ticket_count", "0");
  }
}

function setMetaValue(db: DatabaseSync, key: string, value: string) {
  db.prepare(`
    INSERT INTO meta (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

function getMetaValue(key: string) {
  const row = getDb().prepare("SELECT value FROM meta WHERE key = ?").get(key) as { value?: string } | undefined;
  return row?.value ?? null;
}

function getMetaInt(key: string, fallback: number) {
  const value = getMetaValue(key);
  return value === null ? fallback : Number.parseInt(value, 10);
}

function nextId(table: "tickets" | "login_attempts" | "api_requests" | "app_events") {
  const row = getDb().prepare(`SELECT COALESCE(MAX(id), 0) AS max_id FROM ${table}`).get() as { max_id: number };
  return row.max_id + 1;
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
      WHERE status <> 'resolved'
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
      WHERE t.status <> 'resolved'
        AND t.resolution_due_at < '2026-06-19T22:00:00Z'
      ORDER BY t.resolution_due_at ASC
    `),
    affectedAccounts: rows(`
      SELECT a.name, COUNT(DISTINCT t.id) AS open_tickets, MAX(t.severity) AS highest_severity
      FROM tickets t
      JOIN accounts a ON a.id = t.account_id
      WHERE t.status <> 'resolved'
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
      WHERE t.status <> 'resolved'
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
    WHERE t.status <> 'resolved'
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
        AND status <> 'resolved'
        AND id <> ?
      ORDER BY created_at DESC
    `, [ticket.account_id as number, ticketId]),
  };
}

export function updateTicketStatus(ticketId: number, status: TicketStatus) {
  if (!validStatuses.includes(status)) {
    throw new Error(`Unsupported ticket status: ${status}`);
  }

  getDb().prepare(`
    UPDATE tickets
    SET status = ?, updated_at = ?
    WHERE id = ?
  `).run(status, new Date().toISOString(), ticketId);
}

export function generateSimulatedTicket() {
  const db = getDb();
  const scenarioIndex = getMetaInt("simulation_template_index", 0);
  const generatedCount = getMetaInt("generated_ticket_count", 0);
  const template = scenarioTemplates[scenarioIndex % scenarioTemplates.length];
  const ticketId = nextId("tickets");
  const createdAt = new Date(simulationStart + generatedCount * 17 * 60 * 1000).toISOString();
  const updatedAt = new Date(Date.parse(createdAt) + 8 * 60 * 1000).toISOString();
  const firstResponseDueAt = new Date(Date.parse(createdAt) + getFirstResponseMinutes(template.severity) * 60 * 1000).toISOString();
  const resolutionDueAt = new Date(Date.parse(createdAt) + getResolutionMinutes(template.severity) * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO tickets (
      id, account_id, user_id, title, status, severity, category, channel, source,
      created_at, updated_at, first_response_due_at, resolution_due_at, issue_key, summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ticketId,
    template.accountId,
    template.userId,
    template.title,
    "open",
    template.severity,
    template.category,
    template.channel,
    template.source,
    createdAt,
    updatedAt,
    firstResponseDueAt,
    resolutionDueAt,
    template.issueKey,
    template.summary,
  );

  const context: ScenarioContext = {
    ticketId,
    count: generatedCount,
    createdAt,
    updatedAt,
    accountId: template.accountId,
    userId: template.userId,
  };

  insertScenarioEvidence(db, context, template.createEvidence(context));
  setMetaValue(db, "simulation_template_index", String((scenarioIndex + 1) % scenarioTemplates.length));
  setMetaValue(db, "generated_ticket_count", String(generatedCount + 1));

  return ticketId;
}

function insertScenarioEvidence(db: DatabaseSync, context: ScenarioContext, evidence: ScenarioEvidence) {
  const insertLogin = db.prepare(`
    INSERT INTO login_attempts (id, user_id, account_id, attempted_at, ip_address, status, failure_reason, mfa_required)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of evidence.loginAttempts ?? []) {
    insertLogin.run(
      nextId("login_attempts"),
      context.userId,
      context.accountId,
      item.attempted_at,
      item.ip_address,
      item.status,
      item.failure_reason,
      item.mfa_required,
    );
  }

  const insertApi = db.prepare(`
    INSERT INTO api_requests (id, account_id, user_id, ticket_id, happened_at, endpoint, method, status_code, latency_ms, request_id, error_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of evidence.apiRequests ?? []) {
    insertApi.run(
      nextId("api_requests"),
      context.accountId,
      context.userId,
      context.ticketId,
      item.happened_at,
      item.endpoint,
      item.method,
      item.status_code,
      item.latency_ms,
      item.request_id,
      item.error_code,
    );
  }

  const insertEvent = db.prepare(`
    INSERT INTO app_events (id, account_id, user_id, ticket_id, event_type, event_name, created_at, page, browser, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of evidence.appEvents ?? []) {
    insertEvent.run(
      nextId("app_events"),
      context.accountId,
      context.userId,
      context.ticketId,
      item.event_type,
      item.event_name,
      item.created_at,
      item.page,
      item.browser,
      item.metadata_json,
    );
  }
}

function getFirstResponseMinutes(severity: TicketStatus | "sev-1" | "sev-2" | "sev-3" | "sev-4") {
  if (severity === "sev-1") return 15;
  if (severity === "sev-2") return 30;
  if (severity === "sev-3") return 60;
  return 240;
}

function getResolutionMinutes(severity: "sev-1" | "sev-2" | "sev-3" | "sev-4") {
  if (severity === "sev-1") return 120;
  if (severity === "sev-2") return 480;
  if (severity === "sev-3") return 720;
  return 1440;
}

const scenarioTemplates: ScenarioTemplate[] = [
  {
    issueKey: "auth-mfa-reset",
    title: "Admins locked out after MFA reset",
    summary: "Northstar reports repeated failed logins for privileged users after a forced MFA reset during onboarding cleanup.",
    severity: "sev-1",
    category: "Authentication",
    channel: "Email",
    source: "Zendesk",
    accountId: 1,
    userId: 1,
    createEvidence: ({ count, createdAt }) => ({
      loginAttempts: [
        {
          attempted_at: createdAt,
          ip_address: `54.84.22.${30 + count}`,
          status: "failed",
          failure_reason: "mfa_token_rejected",
          mfa_required: 1,
        },
        {
          attempted_at: new Date(Date.parse(createdAt) + 3 * 60 * 1000).toISOString(),
          ip_address: `54.84.22.${31 + count}`,
          status: "failed",
          failure_reason: "account_policy_mismatch",
          mfa_required: 1,
        },
      ],
      apiRequests: [
        {
          happened_at: new Date(Date.parse(createdAt) + 4 * 60 * 1000).toISOString(),
          endpoint: "/v1/auth/mfa/verify",
          method: "POST",
          status_code: 401,
          latency_ms: 162,
          request_id: `req_auth_sim_${count}_1`,
          error_code: "MFA_INVALID",
        },
      ],
      appEvents: [
        {
          event_type: "auth",
          event_name: "mfa_reset_completed",
          created_at: new Date(Date.parse(createdAt) - 12 * 60 * 1000).toISOString(),
          page: "/settings/security",
          browser: "Chrome 126",
          metadata_json: "{\"reset_by\":\"support_ops_simulation\"}",
        },
      ],
    }),
  },
  {
    issueKey: "api-500-route-sync",
    title: "Dispatch API returning 500 on route sync",
    summary: "Pioneer Logistics sees retries and failures on POST /v1/routes/sync after the latest backend rollout.",
    severity: "sev-2",
    category: "API",
    channel: "Slack",
    source: "Shared Channel",
    accountId: 3,
    userId: 5,
    createEvidence: ({ count, createdAt }) => ({
      apiRequests: [
        {
          happened_at: createdAt,
          endpoint: "/v1/routes/sync",
          method: "POST",
          status_code: 500,
          latency_ms: 4300 + count * 10,
          request_id: `req_route_sim_${count}_1`,
          error_code: "ROUTE_SYNC_TIMEOUT",
        },
        {
          happened_at: new Date(Date.parse(createdAt) + 3 * 60 * 1000).toISOString(),
          endpoint: "/v1/routes/sync",
          method: "POST",
          status_code: 500,
          latency_ms: 4470 + count * 10,
          request_id: `req_route_sim_${count}_2`,
          error_code: "ROUTE_SYNC_TIMEOUT",
        },
      ],
      appEvents: [
        {
          event_type: "release",
          event_name: "background_job_deployed",
          created_at: new Date(Date.parse(createdAt) - 16 * 60 * 1000).toISOString(),
          page: null,
          browser: null,
          metadata_json: "{\"service\":\"route-sync-worker\",\"release\":\"2026.24.0-sim\"}",
        },
        {
          event_type: "integration",
          event_name: "route_sync_retry_exhausted",
          created_at: new Date(Date.parse(createdAt) + 5 * 60 * 1000).toISOString(),
          page: "/integrations/routes",
          browser: "Firefox 127",
          metadata_json: "{\"job_id\":\"job_sim_route\",\"endpoint\":\"/v1/routes/sync\"}",
        },
      ],
    }),
  },
  {
    issueKey: "webhook-delays",
    title: "Webhook deliveries delayed by 20+ minutes",
    summary: "Kepler reports delayed invoice.created webhooks and stale downstream automations since this morning.",
    severity: "sev-3",
    category: "Integrations",
    channel: "Slack",
    source: "Shared Channel",
    accountId: 6,
    userId: 11,
    createEvidence: ({ count, createdAt }) => ({
      apiRequests: [
        {
          happened_at: createdAt,
          endpoint: "/v1/webhooks/deliveries",
          method: "POST",
          status_code: 500,
          latency_ms: 5030 + count * 7,
          request_id: `req_hook_sim_${count}_1`,
          error_code: "WEBHOOK_QUEUE_STALL",
        },
      ],
      appEvents: [
        {
          event_type: "integration",
          event_name: "webhook_backlog_detected",
          created_at: new Date(Date.parse(createdAt) - 4 * 60 * 1000).toISOString(),
          page: null,
          browser: null,
          metadata_json: "{\"queue_delay_seconds\":1440,\"event\":\"invoice.created\"}",
        },
      ],
    }),
  },
  {
    issueKey: "billing-subscription-mismatch",
    title: "Subscription shows active but payment marked failed",
    summary: "Atlas Learning sees active seat access while the latest invoice is still marked failed in billing.",
    severity: "sev-3",
    category: "Billing",
    channel: "Email",
    source: "Billing Queue",
    accountId: 5,
    userId: 9,
    createEvidence: ({ count, createdAt }) => ({
      apiRequests: [
        {
          happened_at: createdAt,
          endpoint: "/v1/billing/subscription",
          method: "GET",
          status_code: 200,
          latency_ms: 92,
          request_id: `req_bill_sim_${count}_1`,
          error_code: null,
        },
      ],
      appEvents: [
        {
          event_type: "billing",
          event_name: "invoice_payment_failed",
          created_at: new Date(Date.parse(createdAt) - 10 * 60 * 1000).toISOString(),
          page: "/billing",
          browser: "Safari 17",
          metadata_json: "{\"invoice_id\":\"inv_sim_failed\",\"attempt\":3}",
        },
      ],
    }),
  },
  {
    issueKey: "frontend-blank-dashboard",
    title: "Chrome users see blank dashboard after login",
    summary: "Beacon users report a white screen after login that reproduces on Chrome 126.",
    severity: "sev-2",
    category: "Frontend",
    channel: "Email",
    source: "HubSpot",
    accountId: 2,
    userId: 3,
    createEvidence: ({ createdAt }) => ({
      apiRequests: [
        {
          happened_at: new Date(Date.parse(createdAt) + 2 * 60 * 1000).toISOString(),
          endpoint: "/v1/dashboard/widgets",
          method: "GET",
          status_code: 500,
          latency_ms: 988,
          request_id: "req_dash_sim_1",
          error_code: "WIDGET_STATE_NULL",
        },
      ],
      appEvents: [
        {
          event_type: "ui_error",
          event_name: "blank_dashboard_render",
          created_at: new Date(Date.parse(createdAt) + 3 * 60 * 1000).toISOString(),
          page: "/dashboard",
          browser: "Chrome 126",
          metadata_json: "{\"build\":\"2026.24.1\",\"feature_flag\":\"nav-redesign\"}",
        },
      ],
    }),
  },
  {
    issueKey: "authz-role-change",
    title: "Permission denied after manager role change",
    summary: "LumenPay changed a user role and immediately hit 403s on project settings and export endpoints.",
    severity: "sev-2",
    category: "Authorization",
    channel: "Email",
    source: "Zendesk",
    accountId: 4,
    userId: 7,
    createEvidence: ({ createdAt }) => ({
      apiRequests: [
        {
          happened_at: new Date(Date.parse(createdAt) + 1 * 60 * 1000).toISOString(),
          endpoint: "/v1/projects/export",
          method: "GET",
          status_code: 403,
          latency_ms: 185,
          request_id: "req_authz_sim_1",
          error_code: "PERMISSION_DENIED",
        },
      ],
      appEvents: [
        {
          event_type: "role_change",
          event_name: "user_role_updated",
          created_at: new Date(Date.parse(createdAt) - 5 * 60 * 1000).toISOString(),
          page: "/settings/members",
          browser: "Chrome 126",
          metadata_json: "{\"from_role\":\"admin\",\"to_role\":\"manager\"}",
        },
        {
          event_type: "authz_error",
          event_name: "permission_denied",
          created_at: new Date(Date.parse(createdAt) + 2 * 60 * 1000).toISOString(),
          page: "/settings/projects",
          browser: "Chrome 126",
          metadata_json: "{\"permission\":\"project.settings.write\",\"cache_version\":\"stale\"}",
        },
      ],
    }),
  },
  {
    issueKey: "csv-import-validation",
    title: "CSV import failing on validation after template update",
    summary: "Atlas Learning cannot complete a CSV import because the file is rejected on row validation after a template update.",
    severity: "sev-3",
    category: "Data Import",
    channel: "Chat",
    source: "In-app",
    accountId: 5,
    userId: 10,
    createEvidence: ({ count, createdAt }) => ({
      apiRequests: [
        {
          happened_at: createdAt,
          endpoint: "/v1/imports/csv",
          method: "POST",
          status_code: 422,
          latency_ms: 610,
          request_id: `req_csv_sim_${count}_1`,
          error_code: "IMPORT_VALIDATION_FAILED",
        },
      ],
      appEvents: [
        {
          event_type: "import",
          event_name: "csv_validation_failed",
          created_at: new Date(Date.parse(createdAt) + 2 * 60 * 1000).toISOString(),
          page: "/imports",
          browser: "Chrome 125",
          metadata_json: "{\"field\":\"seat_limit\",\"row\":17}",
        },
      ],
    }),
  },
  {
    issueKey: "login-policy-change",
    title: "Login failures after account policy change",
    summary: "Northstar users started failing login after an account policy change that tightened password and session requirements.",
    severity: "sev-2",
    category: "Authentication",
    channel: "Email",
    source: "Zendesk",
    accountId: 1,
    userId: 2,
    createEvidence: ({ count, createdAt }) => ({
      loginAttempts: [
        {
          attempted_at: createdAt,
          ip_address: `54.84.23.${40 + count}`,
          status: "failed",
          failure_reason: "account_policy_mismatch",
          mfa_required: 1,
        },
        {
          attempted_at: new Date(Date.parse(createdAt) + 4 * 60 * 1000).toISOString(),
          ip_address: `54.84.23.${41 + count}`,
          status: "failed",
          failure_reason: "password_policy_rejected",
          mfa_required: 1,
        },
      ],
      apiRequests: [
        {
          happened_at: new Date(Date.parse(createdAt) + 3 * 60 * 1000).toISOString(),
          endpoint: "/v1/auth/login",
          method: "POST",
          status_code: 401,
          latency_ms: 138,
          request_id: `req_policy_sim_${count}_1`,
          error_code: "POLICY_MISMATCH",
        },
      ],
      appEvents: [
        {
          event_type: "auth",
          event_name: "account_policy_updated",
          created_at: new Date(Date.parse(createdAt) - 9 * 60 * 1000).toISOString(),
          page: "/settings/security",
          browser: "Edge 126",
          metadata_json: "{\"policy_change\":\"password_length_and_session_tightened\"}",
        },
      ],
    }),
  },
];

function buildArtifacts(ticket: QueryResultRow): TicketArtifactBundle {
  const issueKey = String(ticket.issue_key);
  const base = {
    customerReply: `Hi ${ticket.user_name},\n\nThanks for flagging this. We've confirmed the issue on the ${ticket.account_name} workspace and are reviewing auth, API, and app-event data now. The likely cause is not yet confirmed. I'll send the next update within 30 minutes, even if the investigation is still in progress.\n\nCurrent focus: ${ticket.summary}\n\nBest,\nSupportOps`,
    escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nUrgency: Active customer impact. Please review in the current support window.\nImpact: ${ticket.summary}\nSupport checked: ticket timeline, account context, login attempts, related API requests, and app events.\nEngineering ask: confirm whether recent deploys, cache state, or backend job failures match this pattern.\nUnknowns: exact trigger and full blast radius still need engineering verification.`,
    checklist: [
      "Confirm scope: single user, cohort, or whole account.",
      "Validate whether the issue started after a deploy, role change, config change, or billing event.",
      "Review login, API, and app-event telemetry for the same time window.",
      "Check for duplicate reports or broader account impact before updating severity.",
      "Document customer-safe status and internal next action before handoff.",
    ],
    rootCause: "Likely cause not yet confirmed.",
    severity: ticket.severity as TicketArtifactBundle["severity"],
    nextStep: "Collect the timeline, post a customer-safe update, and get engineering confirmation on the leading theory.",
  };

  if (issueKey === "auth-mfa-reset") {
    return {
      ...base,
      rootCause: "Evidence suggests a mismatch between the MFA reset state and cached auth policy for privileged users, but support cannot confirm that without engineering review.",
      nextStep: "Ask engineering to verify the MFA reset job output, confirm whether auth policy cache is stale, and advise whether support can safely clear account-level cache.",
      escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nUrgency: Login issue affecting privileged users. Please review now.\nImpact: ${ticket.summary}\nSupport checked: repeated failed logins, 401 responses, and the MFA reset event at 16:54 UTC.\nEngineering ask: verify whether the MFA reset job completed cleanly and whether auth policy cache for this account is stale.\nUnknowns: whether the issue is limited to admins or affects all users with recent MFA changes.`,
    };
  }

  if (issueKey === "api-500-route-sync") {
    return {
      ...base,
      rootCause: "Evidence suggests the route sync worker may be timing out after the latest background job deploy, but that still needs engineering verification.",
      nextStep: "Have engineering compare the current worker release with the last known-good build and confirm whether queue saturation or a deploy regression is driving the 500s.",
      escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nUrgency: Customer workflow impact; retries are failing.\nImpact: ${ticket.summary}\nSupport checked: repeated 500s on POST /v1/routes/sync, latency increase, and route-sync-worker deploy marker before failures.\nEngineering ask: review route-sync-worker logs, confirm whether the latest deploy introduced timeouts, and advise on rollback versus mitigation.\nUnknowns: whether failures are isolated to this account or reflect a broader worker issue.`,
    };
  }

  if (issueKey === "frontend-blank-dashboard") {
    return {
      ...base,
      rootCause: "Evidence suggests Chrome 126 is hitting a blank dashboard render path tied to the current nav redesign flag or widget state handling. Support cannot confirm which path is primary yet.",
      nextStep: "Ask frontend engineering to confirm whether the nav redesign flag should be disabled for affected accounts while they verify the render regression.",
      escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nUrgency: Users can log in but cannot use the dashboard.\nImpact: ${ticket.summary}\nSupport checked: duplicate reports on the same account, successful login flow, and blank dashboard events on Chrome 126.\nEngineering ask: review frontend errors for the current dashboard build and confirm whether the nav redesign flag should be disabled.\nUnknowns: whether the issue is limited to Chrome 126 or any account on the current feature flag exposure.`,
    };
  }

  if (issueKey === "authz-role-change") {
    return {
      ...base,
      rootCause: "Evidence suggests role changes are not propagating cleanly to authorization caches, so users may be hitting stale permission checks. Engineering still needs to confirm that path.",
      nextStep: "Have engineering verify permission recalculation after role writes and confirm whether support can clear affected authorization cache entries.",
      escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nUrgency: Access regression after role change.\nImpact: ${ticket.summary}\nSupport checked: role-change event followed by repeated 403s on settings and export endpoints.\nEngineering ask: confirm whether role changes are leaving stale cache entries and whether permission recompute failed after write.\nUnknowns: whether this is limited to the reported users or all recent role changes on the account.`,
    };
  }

  if (issueKey === "webhook-delays") {
    return {
      ...base,
      rootCause: "Evidence suggests a stalled delivery queue rather than a customer endpoint failure, but support cannot rule out mixed causes until engineering reviews worker health.",
      nextStep: "Ask engineering to confirm queue delay, check delivery worker health, and provide a mitigation ETA or replay plan for delayed events.",
      escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nUrgency: Delayed downstream automations; customer impact is ongoing.\nImpact: ${ticket.summary}\nSupport checked: webhook backlog event, delivery timing, and related 5xx response in webhook traffic.\nEngineering ask: verify queue health, confirm whether deliveries are stalled or partially processing, and advise on replay steps.\nUnknowns: how many events are delayed and whether any were dropped versus only queued.`,
    };
  }

  if (issueKey === "billing-subscription-mismatch") {
    return {
      ...base,
      rootCause: "Evidence suggests billing state is out of sync: access remains active while the latest invoice failed and seat usage exceeds entitlement. Support cannot confirm whether this is expected grace-period behavior.",
      nextStep: "Have engineering or billing operations confirm whether access should remain active, reconcile invoice state, and verify current dunning behavior for this account.",
      escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nUrgency: Billing inconsistency with customer-visible access state.\nImpact: ${ticket.summary}\nSupport checked: subscription status, invoice status, and seat usage against entitlement.\nEngineering ask: confirm whether billing sync or dunning rules are lagging and whether access should remain active during payment retry.\nUnknowns: whether the mismatch is isolated to this account or part of a broader billing sync issue.`,
    };
  }

  if (issueKey === "csv-import-validation") {
    return {
      ...base,
      rootCause: "Evidence suggests the current CSV template or validation rules no longer match what the importer expects, but support cannot confirm whether the break is template-side or backend validation logic.",
      nextStep: "Have engineering verify the latest importer validation rules and confirm whether the CSV template needs correction or the validator needs a fix.",
      escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nUrgency: Customer cannot complete import workflow.\nImpact: ${ticket.summary}\nSupport checked: import endpoint response, validation failure event, and the affected field noted in the import error.\nEngineering ask: confirm whether validation rules changed and whether the importer is rejecting valid customer input.\nUnknowns: whether this affects only the updated template or any CSV upload on the current build.`,
    };
  }

  if (issueKey === "login-policy-change") {
    return {
      ...base,
      rootCause: "Evidence suggests the account policy change tightened validation beyond what current users can satisfy, but support cannot yet confirm whether the issue is policy configuration or auth service behavior.",
      nextStep: "Ask engineering to verify the policy change output, confirm whether auth is enforcing the intended rules, and advise whether support can roll back the policy safely.",
      escalationNote: `Account: ${ticket.account_name}\nTicket: #${ticket.id} ${ticket.title}\nSeverity: ${ticket.severity}\nUrgency: Multiple users may be blocked from login after a policy update.\nImpact: ${ticket.summary}\nSupport checked: failed login attempts, 401 login responses, and the policy update event before the failures.\nEngineering ask: confirm whether the new policy is behaving as intended and whether rollback or cache refresh is the safer mitigation.\nUnknowns: whether the issue is limited to specific users or any user on the updated account policy.`,
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
    issueSummary: `${String(ticket.summary)} The case is currently ${String(ticket.status).replace(/_/g, " ")} and mapped to ${String(ticket.category)} for ${String(ticket.account_name)}.`,
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
  const now = Date.now();

  if (resolutionDue < now) {
    return `${String(ticket.severity).toUpperCase()} with active SLA risk. The resolution target has already passed, so support should keep this case in active follow-up until engineering confirms the mitigation path.`;
  }

  if (firstResponseDue < now) {
    return `${String(ticket.severity).toUpperCase()} with response SLA risk. First response is overdue even though the resolution target is still open.`;
  }

  return `${String(ticket.severity).toUpperCase()} and still within SLA. Customer impact is visible, so the case still needs active support follow-up and engineering verification of the likely cause.`;
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
    "csv-import-validation": ["sla-breach-candidates"],
    "login-policy-change": ["failed-logins-by-account", "sla-breach-candidates"],
  };

  const reasonsById: Record<string, string> = {
    "failed-logins-by-account": "Checked to see whether failed logins are clustered at the account level or limited to one user.",
    "api-500-spike-by-endpoint": "Checked to confirm whether 500s are concentrated on one endpoint and whether latency is rising with the failures.",
    "browser-specific-blank-dashboard": "Checked to tie the symptom to a browser/version-specific UI issue and identify the affected user cohort.",
    "sla-breach-candidates": "Checked to confirm urgency and whether the case needs immediate ownership or escalation.",
    "duplicate-reports": "Checked to see whether multiple contacts are reporting the same underlying issue.",
    "subscription-payment-mismatch": "Checked to reconcile customer-visible access state with billing and entitlement data.",
    "permission-denied-after-role-change": "Checked to validate the timing between role changes and permission-denied behavior.",
    "webhook-delivery-delays": "Checked to measure backlog severity and delayed downstream automation impact.",
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
    `Support reviewed the ticket timeline, account context, and ${metrics.appEventCount} related application events instead of relying only on the customer report.`,
    `${String(ticket.account_name)} is on the ${String(ticket.plan)} plan with MRR $${String(ticket.mrr)} and health score ${String(ticket.health_score)}. That increases urgency, but the likely cause still needs engineering verification.`,
  ];

  if (issueKey === "auth-mfa-reset") {
    return [
      `Observed ${metrics.failedLoginCount} failed login attempts and ${metrics.authFailures} HTTP 401 responses shortly after the MFA reset event.`,
      "The error pattern points more toward policy validation than a general password failure, but support is unable to rule out a broader auth state issue without engineering review.",
      ...shared,
    ];
  }

  if (issueKey === "api-500-route-sync") {
    return [
      `Observed ${metrics.serverFailures} HTTP 5xx responses on route-sync traffic, with the same endpoint recurring across the related API evidence.`,
      "A route-sync worker deploy marker appears before the customer-facing failures. Evidence suggests release correlation, but support cannot confirm causation yet.",
      ...shared,
    ];
  }

  if (issueKey === "frontend-blank-dashboard") {
    return [
      `The account has ${metrics.duplicateTicketCount + 1} active report(s) associated with the same issue pattern, which suggests this is not a single-user problem.`,
      "App events point to blank dashboard renders on Chrome 126. Evidence suggests a browser-specific regression, but support has not yet ruled out a feature-flag or account-specific factor.",
      ...shared,
    ];
  }

  if (issueKey === "authz-role-change") {
    return [
      `Observed ${metrics.authzFailures} HTTP 403 responses after a role-change event, which points to authorization propagation rather than missing product access.`,
      "The failure appears immediately after membership changes. Evidence suggests stale cache or delayed permission recomputation, though support cannot confirm which path is failing.",
      ...shared,
    ];
  }

  if (issueKey === "webhook-delays") {
    return [
      "The event stream shows backlog detection rather than clear customer endpoint rejection. Support is still unable to rule out a mixed queue and endpoint issue.",
      `Observed ${metrics.serverFailures} HTTP 5xx response(s) in related delivery traffic, supporting an internal processing stall scenario.`,
      ...shared,
    ];
  }

  if (issueKey === "billing-subscription-mismatch") {
    return [
      "Billing evidence shows the subscription still looks active to the customer while invoice state and seat usage are out of sync.",
      "Support still needs engineering or billing operations to confirm whether this reflects an expected grace period, a billing sync lag, or an entitlement bug.",
      ...shared,
    ];
  }

  if (issueKey === "csv-import-validation") {
    return [
      "The importer is rejecting the file on validation rather than transport or auth.",
      "Evidence suggests a template or validation-rule mismatch, but support cannot confirm whether the issue is in the file format or the current importer logic.",
      ...shared,
    ];
  }

  if (issueKey === "login-policy-change") {
    return [
      `Observed ${metrics.failedLoginCount} failed login attempts and ${metrics.authFailures} HTTP 401 responses after the account policy update.`,
      "Evidence suggests the policy change tightened validation beyond what current users can satisfy, but support cannot confirm whether the issue is policy configuration or auth service behavior.",
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

  if (issueKey === "csv-import-validation") {
    return "Add a CSV import troubleshooting note covering validation failures, sample bad fields, and what support should capture before escalating.";
  }

  if (issueKey === "login-policy-change") {
    return "Add an auth policy change note covering rollback criteria, common login failure patterns, and what support should verify before escalating.";
  }

  return "Capture this issue pattern in the support runbook with the evidence sources, SQL checks, and escalation criteria used during triage.";
}
