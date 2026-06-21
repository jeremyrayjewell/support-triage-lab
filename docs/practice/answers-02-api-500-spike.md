# Answer Key 02: API 500 Spike

## Expected Issue Summary

Pioneer Logistics is seeing repeated `500` responses on route sync after a recent backend rollout. This is likely a worker-side problem with active customer workflow impact.

## Affected Account / User

- Account: Pioneer Logistics
- Primary reporter: Eva Lang
- Related activity also appears from Jonas Frei on the same account

## Evidence Chain

- Ticket summary says route sync is failing after rollout
- Related API requests show repeated `500` responses on `/v1/routes/sync`
- Latency is elevated on the same endpoint
- App events show a route-sync worker deploy before the failures
- App events also show retry exhaustion after the deploy
- SQL confirms the `500` spike is concentrated on the route-sync endpoint

## Plain-English SQL Explanation

The API 500 spike query groups server errors by endpoint and counts how often they happen. It helps support see whether the problem is spread across the app or concentrated on one route.

## Likely Cause With Uncertainty

Evidence suggests the route-sync worker may be timing out after the latest deploy. Support still needs engineering to confirm whether this is a code regression, queue pressure, or another worker-side dependency problem.

## Sample Customer-Safe Update

Hi Eva,

We confirmed repeated failures on the route sync requests and are reviewing the worker path that handles those jobs. We are seeing a consistent server-side error pattern, but the exact cause is not yet confirmed. Engineering is reviewing the related backend activity now, and we will send the next update within 30 minutes.

Best,  
SupportOps

## Sample Engineering Escalation

Account: Pioneer Logistics  
Ticket: `#102 Dispatch API returning 500 on route sync`  
Urgency: Customer workflow impact; retries are failing

Support checked:
- repeated `500` responses on `/v1/routes/sync`
- elevated request latency
- `route-sync-worker` deploy marker before failures
- retry exhaustion event after deploy

Engineering ask:
- review worker logs
- confirm whether the latest deploy introduced timeouts
- advise on rollback versus mitigation

Unknowns:
- whether impact is limited to this account
- whether the worker failure is code, queue, or dependency related

## Common Mistakes To Avoid

- calling it customer input error without checking the endpoint pattern
- missing the deploy timing
- telling the customer a rollback is happening before engineering confirms it
- escalating without request IDs or endpoint details

## 60-Second Interview Answer

I would use the ticket, API requests, and app events together. The API evidence shows repeated `500` responses on one endpoint, the latency is elevated, and the route-sync worker deploy appears before the failures. That gives support a focused escalation instead of a vague “customer sees errors” handoff. I would tell the customer we confirmed the failure pattern, but I would keep the cause as likely rather than confirmed until engineering checks the worker logs.
