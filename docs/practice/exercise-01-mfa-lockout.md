# Exercise 01: MFA Lockout

## Scenario Summary

Northstar Health reports that admins are locked out after an MFA reset. Support needs to decide severity, confirm scope, and determine whether the issue looks like bad credentials, policy mismatch, or stale auth state.

## Pages To Open

- `/`
- `/tickets`
- `/tickets/101`
- `/investigations`

## Evidence To Inspect

- Ticket summary and severity on ticket `#101`
- Related login attempts
- Related API requests
- Related app events
- Any SLA risk shown on the dashboard

## SQL Investigation To Review

- `Failed logins by account`
- `SLA breach candidates`

## Questions To Answer

1. What makes this more severe than a normal single-user login problem?
2. What evidence suggests this is related to MFA or policy state instead of a simple wrong password?
3. Is the issue limited to one user, or does the evidence suggest broader account impact?
4. What can support say with confidence, and what still needs engineering confirmation?
5. What exact engineering ask would move this case forward fastest?

## Customer Update Prompt

Write a short update to the Northstar contact that confirms the issue is under review, explains what support checked, and avoids claiming the cause is confirmed.

## Engineering Escalation Prompt

Write an internal escalation note that includes urgency, what support checked, what auth events were seen, and what engineering needs to verify.

## 60-Second Interview Explanation Prompt

Explain how you would triage an admin lockout after an MFA reset using ticket evidence, login data, API requests, and SQL checks.
