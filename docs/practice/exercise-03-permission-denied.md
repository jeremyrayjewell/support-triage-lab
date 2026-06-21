# Exercise 03: Permission Denied After Role Change

## Scenario Summary

LumenPay changed a user role and immediately hit permission-denied errors. Support needs to decide whether this looks like expected access removal, stale authorization cache, or a broken permission recompute after the role change.

## Pages To Open

- `/`
- `/tickets`
- `/tickets/104`
- `/investigations`

## Evidence To Inspect

- Ticket `#104` summary and severity
- Related API requests returning `403`
- App events for `user_role_updated` and `permission_denied`
- Any other open tickets for the same account

## SQL Investigation To Review

- `Permission denied errors after role change`
- `SLA breach candidates`

## Questions To Answer

1. What evidence ties the permission issue to the role change?
2. Why does this look different from a customer simply lacking the right role?
3. What does support know versus what still needs engineering verification?
4. Would you treat this as a product bug, config issue, or unknown at this stage?
5. What would you ask engineering to confirm first?

## Customer Update Prompt

Write a short update that confirms support found the role-change timing and is checking permission propagation.

## Engineering Escalation Prompt

Write an escalation note asking engineering to verify cache state and permission recomputation after the role write.

## 60-Second Interview Explanation Prompt

Explain how you would distinguish between expected access restrictions and a broken authorization flow after a role change.
