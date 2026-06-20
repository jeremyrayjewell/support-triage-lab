# Support Runbook

Use this workflow when triaging tickets in SupportOps Triage Lab.

## 1. Classify Severity

- `SEV-1`: login loss, outage, or workflow failure affecting critical users or whole accounts
- `SEV-2`: major feature or integration failure with clear customer impact
- `SEV-3`: partial failure, degraded workflow, billing mismatch, or delayed processing
- `SEV-4`: low-impact question, cosmetic issue, or request that is not blocking work

Escalate faster when:
- the case is already at SLA risk
- the customer cannot complete a core workflow
- multiple users or duplicate tickets point to account-wide impact
- support has evidence of repeated `401`, `403`, or `500` responses

## 2. Check Account And User Context

- confirm the affected account, plan, region, and owner
- confirm the reporting user, role, browser, and timezone
- note whether the account has other open tickets on the same issue key

## 3. Inspect Login, API, And App Events

- review login attempts for failed auth patterns
- review API requests for repeated `401`, `403`, or `500` responses
- review app events for deploy markers, role changes, UI errors, billing events, or webhook backlog signals
- build a rough timeline before posting an internal or customer update

## 4. Run Saved SQL Investigations

Use the saved SQL panel to confirm the leading theory.

Recommended starting points:
- failed logins by account
- API 500 spike by endpoint
- SLA breach candidates
- duplicate reports from same account
- permission denied after role change
- webhook delivery delays

## 5. Draft Customer Update

Customer updates should:
- confirm that support reproduced or validated the issue if true
- say what support is checking now
- avoid claiming the cause is confirmed if engineering has not verified it
- give the next checkpoint time when possible

Good phrasing:
- "We confirmed the issue and are reviewing the related API and app activity now."
- "The likely cause is not yet confirmed."
- "I'll send the next update within 30 minutes."

Avoid:
- blaming engineering before verification
- promising a fix time without confirmation
- exposing internal uncertainty in a way that sounds careless

## 6. Escalate To Engineering

Include:
- exact ticket and account
- severity and urgency
- customer impact
- what support already checked
- exact engineering ask
- unknowns or blockers

Escalate immediately when:
- support sees strong evidence of backend failure
- the issue follows a deploy, role change, or billing sync event
- the customer is blocked on a core workflow
- support cannot safely mitigate from the queue

## 7. Document Follow-Up

- note the likely cause with uncertainty if still unconfirmed
- record what evidence was reviewed
- capture the customer-safe wording used
- add a runbook or troubleshooting note if the case exposed a repeatable pattern
