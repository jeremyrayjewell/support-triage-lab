# Exercise 05: Webhook Delay

## Scenario Summary

Kepler Cloudworks reports delayed webhooks and stale downstream automations. Support needs to determine whether this looks like customer endpoint failure, internal queue backlog, or mixed causes.

## Pages To Open

- `/`
- `/tickets`
- `/tickets/105`
- `/investigations`
- `/case-studies`

## Evidence To Inspect

- Ticket `#105` summary and severity
- Related webhook API requests
- App events showing `webhook_backlog_detected`
- Any SLA breach context from the dashboard

## SQL Investigation To Review

- `Webhook delivery delays`
- `SLA breach candidates`

## Questions To Answer

1. What points toward internal backlog instead of a customer endpoint rejecting events?
2. What customer impact should support call out clearly?
3. What still needs engineering to confirm?
4. What is the right severity and why?
5. What should the next support update include if there is still no fix ETA?

## Customer Update Prompt

Write a customer-safe update explaining that support sees delayed webhook processing and is waiting on engineering review of queue health.

## Engineering Escalation Prompt

Write an escalation asking engineering to confirm queue health, delivery state, and replay options.

## 60-Second Interview Explanation Prompt

Explain how you would investigate delayed webhook deliveries using the queue, ticket evidence, and SQL checks.
