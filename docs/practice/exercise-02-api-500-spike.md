# Exercise 02: API 500 Spike

## Scenario Summary

Pioneer Logistics reports repeated failures on route sync. Support needs to confirm whether the errors are concentrated on one endpoint, whether latency is rising, and whether the issue lines up with a backend deploy.

## Pages To Open

- `/`
- `/tickets`
- `/tickets/102`
- `/investigations`
- `/case-studies`

## Evidence To Inspect

- Ticket summary and status on `#102`
- Related API requests for `/v1/routes/sync`
- Related app events tied to deploy and retry exhaustion
- Top error codes and API spike panels on the dashboard

## SQL Investigation To Review

- `API 500 spike by endpoint`
- `SLA breach candidates`

## Questions To Answer

1. What evidence shows this is more than one failed request?
2. What points toward backend worker failure instead of bad customer input?
3. How does the deploy timing affect your escalation note?
4. What should support avoid promising to the customer at this stage?
5. If engineering replies slowly, what should support do next?

## Customer Update Prompt

Write a customer-safe update that confirms the repeated API failures, explains that support is checking the worker path, and gives a realistic next checkpoint.

## Engineering Escalation Prompt

Write an escalation asking engineering to review the route-sync worker, deploy timing, and whether rollback or mitigation is safer.

## 60-Second Interview Explanation Prompt

Explain how you would use ticket context, API evidence, and SQL to move from “customer sees 500s” to a focused escalation.
