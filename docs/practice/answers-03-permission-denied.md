# Answer Key 03: Permission Denied

## Expected Issue Summary

LumenPay changed a user role and immediately saw `403` responses on settings and export endpoints. This points to a likely permission propagation or cache issue after the role update.

## Affected Account / User

- Account: LumenPay
- Primary user: Tara Wells
- Related activity also appears on the same account after the role change

## Evidence Chain

- Ticket summary ties the issue to a role change
- API requests show repeated `403` responses
- App events show `user_role_updated` before `permission_denied`
- The timing supports stale authz state rather than a random access check
- SQL confirms the role-change-to-denied sequence

## Plain-English SQL Explanation

The permission-denied-after-role-change query links role-change events with later permission-denied events for the same account and user. It helps support test whether the two actions are connected in time.

## Likely Cause With Uncertainty

Evidence suggests the role update is not propagating cleanly to authorization checks, possibly because of stale cache or delayed permission recompute. Support cannot confirm which internal path failed without engineering review.

## Sample Customer-Safe Update

Hi Tara,

We confirmed the permission errors and traced them to the same timeframe as the role change. We are reviewing whether the updated access state propagated correctly across the account, but the exact cause is not yet confirmed. We have engineering reviewing the permission path now and will send the next update within 30 minutes.

Best,  
SupportOps

## Sample Engineering Escalation

Account: LumenPay  
Ticket: `#104 Permission denied after manager role change`  
Urgency: Access regression after role change

Support checked:
- role-change event
- repeated `403` responses
- permission-denied event right after role update

Engineering ask:
- confirm whether stale cache entries remain after role changes
- verify whether permission recompute failed after write

Unknowns:
- whether the issue is limited to the reported users or any recent role change

## Common Mistakes To Avoid

- assuming the user simply lost access by design
- missing the timing between role update and 403s
- escalating without naming affected endpoints
- telling the customer the cache is definitely stale before engineering confirms it

## 60-Second Interview Answer

I would look for timing. In this case, the important clue is that the `403` responses happen right after the role-change event. That makes it look less like expected access removal and more like a propagation or cache issue. I would explain that support can identify the likely failure path from event timing, but engineering still needs to confirm whether the problem is stale cache or failed permission recompute.
