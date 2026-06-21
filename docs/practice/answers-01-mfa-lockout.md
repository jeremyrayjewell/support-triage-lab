# Answer Key 01: MFA Lockout

## Expected Issue Summary

Northstar Health is seeing admin login failures shortly after an MFA reset. This looks like an account-level auth problem, not a simple bad-password case.

## Affected Account / User

- Account: Northstar Health
- Primary user: Mina Ross
- Additional sign of impact: Daniel Wu also shows failed login evidence

## Evidence Chain

- Ticket summary says the issue started after an MFA reset
- Login attempts show repeated failed logins
- API requests show `401` responses on auth endpoints
- App events show `mfa_reset_completed` before the failures
- Failed-login SQL confirms the problem clusters at the account level

## Plain-English SQL Explanation

The failed-logins query groups login failures by account so support can see whether this is one person mistyping credentials or a wider account-level auth issue.

## Likely Cause With Uncertainty

Evidence suggests the MFA reset state and auth policy cache may be out of sync. Support cannot confirm that without engineering review of the reset job and cache behavior.

## Sample Customer-Safe Update

Hi Mina,

We confirmed the login issue on the Northstar workspace and are reviewing the related auth activity now. We are seeing repeated failures tied to the same timeframe as the MFA reset, but the exact cause is not yet confirmed. We have engineering reviewing the auth path and will send the next update within 30 minutes.

Best,  
SupportOps

## Sample Engineering Escalation

Account: Northstar Health  
Ticket: `#101 Admins locked out after MFA reset`  
Urgency: Admin login impact

Support checked:
- repeated failed logins
- related `401` auth responses
- `mfa_reset_completed` event before failures

Engineering ask:
- verify whether the MFA reset job completed cleanly
- confirm whether auth policy cache for the account is stale
- advise whether support can safely clear account-level cache

Unknowns:
- whether impact is limited to privileged users or broader

## Common Mistakes To Avoid

- calling it a password issue too early
- telling the customer the root cause is confirmed
- ignoring account-wide impact clues
- escalating without the reset timeline

## 60-Second Interview Answer

I would start by confirming whether this is a single-user auth problem or an account-level failure. In this case, the login attempts, `401` responses, and MFA reset event all line up in the same time window, so I would treat it as a likely auth-state issue rather than a bad password. I would send a customer-safe update that confirms the issue is under review, then escalate to engineering with the reset timing, failed-login evidence, and a clear ask to verify the reset job and cache behavior.
