# Interview Talking Points

- I built this as a local support-engineering portfolio lab, not as a production app, so I could show how I think through ticket triage, SLA risk, SQL checks, and escalation notes.
- The strongest part of the project is the support workflow: queue first, then ticket context, then evidence review across login attempts, API requests, and app events.
- I used saved SQL investigations to show how I would validate a support hypothesis instead of guessing, especially for auth failures, API 500 spikes, duplicate reports, and webhook delays.
- I wanted the ticket detail flow to show both customer-safe communication and internal engineering escalation, because support work usually requires both at the same time.
- The generated investigation reports are meant to show what support reviewed, what the likely cause is, what is still unconfirmed, and what engineering needs to verify next.
- I kept the data model realistic enough to talk through account context, user roles, billing state, and related product telemetry without overclaiming real production experience.
- If I were extending this for a real team, I would focus on real support workflows such as log integrations, audit trails, and case ownership, but I kept this version intentionally local and scoped for portfolio use.
