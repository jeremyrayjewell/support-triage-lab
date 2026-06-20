# Sample Support Investigation Report

Case used: `Ticket #102 - Dispatch API returning 500 on route sync`

## Issue Summary

Pioneer Logistics reported repeated failures on `POST /v1/routes/sync` after a recent backend rollout. The ticket is still open and tied to the API category. The customer impact is active because retries are failing on a workflow they depend on.

## Severity / SLA Risk

`SEV-2` with active SLA risk. The resolution target is close enough that support should keep this in active follow-up and avoid leaving the customer without a checkpoint while engineering reviews the worker path.

## Affected Account / User

- Account: Pioneer Logistics
- Plan: Enterprise
- Region: EU-West
- Reporter: Eva Lang (`eva.lang@pioneer.example`)
- Role: Admin
- Browser: Firefox 127
- Related user activity also seen from Jonas Frei on the same account

## Evidence Reviewed

- Ticket timeline from `2026-06-19T14:03:00Z` through the latest update
- Related API requests for the account, including repeated `500` responses on `POST /v1/routes/sync`
- App events tied to the account, including:
  - `background_job_deployed`
  - `route_sync_retry_exhausted`
- Account context and subscription state to confirm this is a real customer-impacting case and not just test traffic

## SQL Used

### API 500 spike by endpoint

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

Why it was used:
Checked whether the 500s were clustered on one endpoint and whether latency was rising with the failures.

### SLA breach candidates

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

Why it was used:
Checked urgency and whether the case needed immediate ownership or escalation.

## Findings

- Multiple `500` responses are concentrated on `POST /v1/routes/sync`.
- Related request latency is elevated at the same time as the failures.
- A `background_job_deployed` event for `route-sync-worker` appears before the customer-facing failures.
- A `route_sync_retry_exhausted` event appears after the deploy, which supports the theory that the worker path is failing rather than the customer sending malformed requests.
- Evidence suggests release correlation, but support cannot confirm causation without engineering review of worker logs and queue state.

## Likely Cause

Evidence suggests the route sync worker may be timing out after the latest background job deploy. That is the current leading theory, but support cannot confirm whether this is a deploy regression, queue saturation, or another worker-side failure until engineering checks the worker logs and runtime metrics.

## Customer-Safe Update

Hi Eva,

We confirmed the failures on the Pioneer Logistics workspace and are reviewing the related API and job activity now. We are seeing repeated errors on the route sync requests, but the exact cause is not yet confirmed. The next step on our side is engineering review of the worker path that handles those sync jobs.

I'll send the next update within 30 minutes, even if the investigation is still in progress.

Best,  
SupportOps

## Engineering Escalation Note

Account: Pioneer Logistics  
Ticket: `#102 Dispatch API returning 500 on route sync`  
Severity: `SEV-2`  
Urgency: Customer workflow impact; retries are failing.

Support checked:
- ticket timeline
- repeated `500` responses on `POST /v1/routes/sync`
- increased latency on affected requests
- `route-sync-worker` deploy marker before failures
- `route_sync_retry_exhausted` event after deploy

Engineering ask:
- review `route-sync-worker` logs for timeout or queue issues
- confirm whether the latest deploy introduced the regression
- advise whether rollback or mitigation is safer for the current support window

Unknowns / blockers:
- support cannot confirm whether the failures are isolated to this account
- support cannot confirm whether the worker is timing out because of code, queue depth, or upstream dependency failure

## Recommended Next Action

Keep the customer updated on the active investigation, have engineering verify the worker failure path, and decide whether to roll back the current worker release or apply a targeted mitigation once the failure mode is confirmed.

## Documentation Follow-Up

Add a route-sync incident note to the support runbook covering:
- the first SQL checks to run
- the worker events that matter most
- when support should escalate immediately
- what evidence to gather before asking for a rollback decision
