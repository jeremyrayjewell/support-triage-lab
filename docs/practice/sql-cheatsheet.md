# SQL Cheat Sheet

This cheat sheet explains the SQL patterns used in SupportOps Triage Lab in plain English.

## SELECT

`SELECT` chooses which columns to return.

Project example:

```sql
SELECT endpoint,
  COUNT(*) AS error_count,
  ROUND(AVG(latency_ms), 1) AS avg_latency_ms
FROM api_requests
WHERE status_code >= 500
  AND happened_at >= '2026-06-12T00:00:00Z'
GROUP BY endpoint
ORDER BY error_count DESC, avg_latency_ms DESC;
```

Plain English:
Return the endpoint name, how many 500-level errors happened, and the average latency.

## WHERE

`WHERE` filters rows before the results are grouped or displayed.

Project example:

```sql
WHERE la.status = 'failed'
```

Plain English:
Only include failed login attempts, not successful ones.

## JOIN

`JOIN` combines related tables.

Project example:

```sql
FROM login_attempts la
JOIN accounts a ON a.id = la.account_id
```

Plain English:
Match each login attempt to its account so support can see which customer is affected.

## GROUP BY

`GROUP BY` collects rows into buckets so you can summarize them.

Project example:

```sql
GROUP BY a.name
```

Plain English:
Group login failures by account name instead of listing every failed attempt one by one.

## COUNT

`COUNT(*)` tells you how many rows are in each group.

Project example:

```sql
COUNT(*) AS failed_logins
```

Plain English:
Count how many failed logins happened for each account.

## ORDER BY

`ORDER BY` sorts the output.

Project example:

```sql
ORDER BY failed_logins DESC;
```

Plain English:
Show the accounts with the most failed logins first.

## Time-Window Filtering

Time-window filtering limits the query to a useful period, such as the last week.

Project example:

```sql
WHERE status_code >= 500
  AND happened_at >= '2026-06-12T00:00:00Z'
```

Plain English:
Only look at recent 500 errors instead of the entire request history.

## Project Query Walkthroughs

### Failed Logins By Account

```sql
SELECT a.name AS account,
  COUNT(*) AS failed_logins,
  GROUP_CONCAT(DISTINCT la.failure_reason) AS failure_reasons
FROM login_attempts la
JOIN accounts a ON a.id = la.account_id
WHERE la.status = 'failed'
GROUP BY a.name
ORDER BY failed_logins DESC;
```

Plain English:
Show which accounts have the most failed logins and list the failure reasons seen for each one.

### API 500 Spike By Endpoint

```sql
SELECT endpoint,
  COUNT(*) AS error_count,
  ROUND(AVG(latency_ms), 1) AS avg_latency_ms
FROM api_requests
WHERE status_code >= 500
  AND happened_at >= '2026-06-12T00:00:00Z'
GROUP BY endpoint
ORDER BY error_count DESC, avg_latency_ms DESC;
```

Plain English:
Show which API endpoint is producing the most 500 errors and whether those failures are also slow.

### Users Affected By Browser-Specific Blank Dashboard

```sql
SELECT a.name AS account,
  u.name AS user_name,
  u.browser AS reported_browser,
  ae.created_at AS event_time
FROM app_events ae
JOIN users u ON u.id = ae.user_id
JOIN accounts a ON a.id = ae.account_id
WHERE ae.event_name = 'blank_dashboard_render'
ORDER BY ae.created_at DESC;
```

Plain English:
Show which users hit the blank dashboard event, what browser they used, and when it happened.

### SLA Breach Candidates

```sql
SELECT t.id AS ticket_id,
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
ORDER BY t.resolution_due_at ASC;
```

Plain English:
Show open tickets whose first response or resolution target has already passed, and label what kind of breach risk it is.

### Duplicate Reports From Same Account

```sql
SELECT a.name AS account,
  t.issue_key,
  COUNT(*) AS ticket_count,
  GROUP_CONCAT(t.id) AS ticket_ids
FROM tickets t
JOIN accounts a ON a.id = t.account_id
GROUP BY a.name, t.issue_key
HAVING COUNT(*) > 1
ORDER BY ticket_count DESC;
```

Plain English:
Show cases where the same account opened more than one ticket for the same underlying issue pattern.

### Subscription And Payment Mismatch

```sql
SELECT a.name AS account,
  s.status AS subscription_status,
  s.billing_status,
  s.last_invoice_status,
  s.seats_in_use,
  s.seats_purchased
FROM subscriptions s
JOIN accounts a ON a.id = s.account_id
WHERE s.status = 'active'
  AND (s.last_invoice_status <> 'paid' OR s.seats_in_use > s.seats_purchased OR s.billing_status <> 'current')
ORDER BY a.name;
```

Plain English:
Show active subscriptions where billing or entitlement data does not line up with what the customer is seeing.

### Permission Denied After Role Change

```sql
SELECT a.name AS account,
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
ORDER BY pe.created_at DESC;
```

Plain English:
Show users who had a role update and then hit a permission-denied event afterward, which helps support test whether the two are connected.

### Webhook Delivery Delays

```sql
SELECT a.name AS account,
  ae.created_at AS observed_at,
  json_extract(ae.metadata_json, '$.event') AS webhook_event,
  CAST(json_extract(ae.metadata_json, '$.queue_delay_seconds') AS INTEGER) / 60 AS queue_delay_minutes
FROM app_events ae
JOIN accounts a ON a.id = ae.account_id
WHERE ae.event_name = 'webhook_backlog_detected'
ORDER BY queue_delay_minutes DESC;
```

Plain English:
Show which account saw a webhook backlog event, which webhook type was affected, and how large the queue delay was in minutes.
