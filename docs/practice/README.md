# SupportOps Mastery Pack

This practice pack is for learning how to work through SupportOps Triage Lab like a Technical Support Engineer or Application Support analyst.

Use it to practice:

- reading a ticket and deciding what matters first
- checking account and user context
- reviewing login, API, and app-event evidence
- choosing the right saved SQL investigation
- writing a customer-safe update
- writing a clear engineering escalation
- explaining your reasoning out loud in interview terms

## How To Use It

1. Open the app locally with `npm run dev`.
2. Start with one exercise file.
3. Open the pages listed in the exercise.
4. Answer the five questions in your own words before reading the answer key.
5. Draft the customer update and engineering escalation yourself.
6. Use the answer key only after you have made your own first pass.
7. Repeat the same case a second time and try to explain it in under 60 seconds.

Helpful app pages:

- `/` for queue and SLA context
- `/tickets` for browsing the backlog
- `/tickets/[id]` for ticket-level evidence and report text
- `/investigations` for saved SQL investigations
- `/case-studies` for short case summaries

## 10-Day Practice Plan

### Day 1

- Read the main README
- Open the dashboard, tickets page, and investigations page
- Skim the SQL cheat sheet

### Day 2

- Do Exercise 1: MFA lockout
- Write your own customer update before checking the answer key

### Day 3

- Do Exercise 2: API 500 spike
- Focus on how evidence leads to escalation

### Day 4

- Do Exercise 3: Permission denied after role change
- Focus on what support can say versus what engineering must confirm

### Day 5

- Do Exercise 4: Blank dashboard
- Focus on duplicate reports and browser-specific clues

### Day 6

- Do Exercise 5: Webhook delay
- Focus on integration impact and queue/backlog reasoning

### Day 7

- Revisit all five answer keys
- Compare how each case changes your severity, customer update, and escalation

### Day 8

- Practice 60-second interview explanations for all five cases
- Keep answers grounded and avoid overclaiming

### Day 9

- Pick two cases and answer them without opening the answer keys
- Time yourself

### Day 10

- Review the support runbook, sample report, and interview talking points
- Practice explaining what this project demonstrates as a support portfolio lab

## Suggested Workflow

- Start with the symptom
- Confirm who is affected
- Check the timeline
- Review evidence across systems
- Run the most relevant SQL investigation
- Decide what is likely versus what is confirmed
- Send a customer-safe update
- Escalate with a clear ask

## Files In This Pack

- [SQL Cheat Sheet](sql-cheatsheet.md)
- [Exercise 01: MFA Lockout](exercise-01-mfa-lockout.md)
- [Exercise 02: API 500 Spike](exercise-02-api-500-spike.md)
- [Exercise 03: Permission Denied](exercise-03-permission-denied.md)
- [Exercise 04: Blank Dashboard](exercise-04-blank-dashboard.md)
- [Exercise 05: Webhook Delay](exercise-05-webhook-delay.md)
