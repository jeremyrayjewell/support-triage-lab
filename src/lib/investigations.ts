import { SavedInvestigation } from "@/lib/types";

export const savedInvestigations: SavedInvestigation[] = [
  {
    id: "failed-logins-by-account",
    title: "Failed logins by account",
    description: "Spot account-level authentication issues and quickly see where login failures are clustering.",
    sql: `SELECT a.name AS account,
  COUNT(*) AS failed_logins,
  GROUP_CONCAT(DISTINCT la.failure_reason) AS failure_reasons
FROM login_attempts la
JOIN accounts a ON a.id = la.account_id
WHERE la.status = 'failed'
GROUP BY a.name
ORDER BY failed_logins DESC;`,
  },
  {
    id: "api-500-spike-by-endpoint",
    title: "API 500 spike by endpoint",
    description: "Identify endpoints with elevated 500 volume over the last seven days.",
    sql: `SELECT endpoint,
  COUNT(*) AS error_count,
  ROUND(AVG(latency_ms), 1) AS avg_latency_ms
FROM api_requests
WHERE status_code >= 500
  AND happened_at >= '2026-06-12T00:00:00Z'
GROUP BY endpoint
ORDER BY error_count DESC, avg_latency_ms DESC;`,
  },
  {
    id: "browser-specific-blank-dashboard",
    title: "Users affected by browser-specific blank dashboard",
    description: "Correlate UI rendering failures with browser versions and the impacted users.",
    sql: `SELECT a.name AS account,
  u.name AS user_name,
  u.browser AS reported_browser,
  ae.created_at AS event_time
FROM app_events ae
JOIN users u ON u.id = ae.user_id
JOIN accounts a ON a.id = ae.account_id
WHERE ae.event_name = 'blank_dashboard_render'
ORDER BY ae.created_at DESC;`,
  },
  {
    id: "sla-breach-candidates",
    title: "SLA breach candidates",
    description: "Surface open tickets whose response or resolution targets have already elapsed.",
    sql: `SELECT t.id AS ticket_id,
  t.title,
  t.severity,
  t.status,
  a.name AS account,
  CASE
    WHEN t.resolution_due_at < '2026-06-19T22:00:00Z' THEN 'resolution'
    WHEN t.first_response_due_at < '2026-06-19T22:00:00Z' THEN 'first_response'
    ELSE 'on_track'
  END AS breach_type
FROM tickets t
JOIN accounts a ON a.id = t.account_id
WHERE t.status <> 'closed'
  AND (t.first_response_due_at < '2026-06-19T22:00:00Z' OR t.resolution_due_at < '2026-06-19T22:00:00Z')
ORDER BY t.resolution_due_at ASC;`,
  },
  {
    id: "duplicate-reports",
    title: "Duplicate reports from same account",
    description: "Group likely duplicate tickets to help merge cases and reduce noisy escalation volume.",
    sql: `SELECT a.name AS account,
  t.issue_key,
  COUNT(*) AS ticket_count,
  GROUP_CONCAT(t.id) AS ticket_ids
FROM tickets t
JOIN accounts a ON a.id = t.account_id
GROUP BY a.name, t.issue_key
HAVING COUNT(*) > 1
ORDER BY ticket_count DESC;`,
  },
  {
    id: "subscription-payment-mismatch",
    title: "Subscription and payment mismatch",
    description: "Find accounts whose subscription state disagrees with billing or invoice status.",
    sql: `SELECT a.name AS account,
  s.status AS subscription_status,
  s.billing_status,
  s.last_invoice_status,
  s.seats_in_use,
  s.seats_purchased
FROM subscriptions s
JOIN accounts a ON a.id = s.account_id
WHERE s.status = 'active'
  AND (s.last_invoice_status <> 'paid' OR s.seats_in_use > s.seats_purchased OR s.billing_status <> 'current')
ORDER BY a.name;`,
  },
  {
    id: "permission-denied-after-role-change",
    title: "Permission denied after role change",
    description: "Trace authorization failures that happen immediately after a membership or role mutation.",
    sql: `SELECT a.name AS account,
  u.name AS user_name,
  rc.created_at AS role_changed_at,
  pe.created_at AS denied_at,
  json_extract(pe.metadata_json, '$.permission') AS permission
FROM app_events rc
JOIN app_events pe ON pe.account_id = rc.account_id AND pe.user_id = rc.user_id
JOIN accounts a ON a.id = rc.account_id
JOIN users u ON u.id = rc.user_id
WHERE rc.event_name = 'user_role_updated'
  AND pe.event_name = 'permission_denied'
  AND pe.created_at > rc.created_at
ORDER BY pe.created_at DESC;`,
  },
  {
    id: "webhook-delivery-delays",
    title: "Webhook delivery delays",
    description: "Highlight accounts where the webhook backlog suggests downstream delivery lag.",
    sql: `SELECT a.name AS account,
  ae.created_at AS observed_at,
  json_extract(ae.metadata_json, '$.event') AS webhook_event,
  CAST(json_extract(ae.metadata_json, '$.queue_delay_seconds') AS INTEGER) / 60 AS queue_delay_minutes
FROM app_events ae
JOIN accounts a ON a.id = ae.account_id
WHERE ae.event_name = 'webhook_backlog_detected'
ORDER BY queue_delay_minutes DESC;`,
  },
];

export function getInvestigationsByIds(ids: string[]) {
  return savedInvestigations.filter((investigation) => ids.includes(investigation.id));
}
