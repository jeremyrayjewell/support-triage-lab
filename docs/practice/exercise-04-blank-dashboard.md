# Exercise 04: Blank Dashboard

## Scenario Summary

Beacon Retail Group reports that some users can log in but see a blank dashboard. Support needs to check whether the issue is browser-specific, tied to one feature flag, or part of a wider frontend regression.

## Pages To Open

- `/`
- `/tickets`
- `/tickets/103`
- `/tickets/107`
- `/investigations`

## Evidence To Inspect

- The primary blank-dashboard ticket and the duplicate report
- Related app events showing `blank_dashboard_render`
- Related API requests around dashboard widgets
- Any duplicate reports from the same account

## SQL Investigation To Review

- `Users affected by browser-specific blank dashboard`
- `Duplicate reports from same account`

## Questions To Answer

1. What makes this look like more than a single-user issue?
2. What evidence points to Chrome 126 specifically?
3. What evidence suggests frontend regression rather than auth failure?
4. What should support say if the likely cause is still not confirmed?
5. What is the best immediate engineering ask?

## Customer Update Prompt

Write a short update telling the customer support validated the issue pattern and is checking a browser-specific dashboard failure.

## Engineering Escalation Prompt

Write an escalation asking frontend engineering to review the current build, error path, and feature-flag exposure.

## 60-Second Interview Explanation Prompt

Explain how you would use duplicate tickets, browser clues, and event data to narrow a blank-dashboard issue.
