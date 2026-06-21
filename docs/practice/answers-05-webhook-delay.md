# Answer Key 05: Webhook Delay

## Expected Issue Summary

Kepler Cloudworks is seeing delayed webhook deliveries and stale downstream automations. The issue likely involves queue backlog or delivery-worker health, with customer impact still active.

## Affected Account / User

- Account: Kepler Cloudworks
- Primary user: Sofia Reed
- Related traffic also appears from Marco Silva on the same account

## Evidence Chain

- Ticket summary says webhook deliveries are delayed
- API evidence shows related webhook delivery traffic, including a `500`
- App events show `webhook_backlog_detected`
- The backlog signal points toward internal queue health instead of a clean customer endpoint rejection
- SQL highlights queue delay in minutes for the affected account

## Plain-English SQL Explanation

The webhook-delivery-delays query reads the queue-delay value from the event metadata and converts it into minutes. It helps support see how large the backlog is and which account it affects.

## Likely Cause With Uncertainty

Evidence suggests internal delivery backlog or worker stall, but support cannot rule out mixed causes until engineering confirms whether events are delayed, partially processing, or failing on specific retries.

## Sample Customer-Safe Update

Hi Sofia,

We confirmed delayed webhook processing on the Kepler workspace and are reviewing the delivery queue now. The issue appears to be on the delivery side rather than a confirmed problem with your endpoint, but the exact cause is still under engineering review. We will send the next update within 30 minutes.

Best,  
SupportOps

## Sample Engineering Escalation

Account: Kepler Cloudworks  
Ticket: `#105 Webhook deliveries delayed by 20+ minutes`  
Urgency: Downstream automations are delayed

Support checked:
- delayed webhook report
- related webhook API activity
- backlog detection event
- delivery traffic with related `500` response

Engineering ask:
- confirm queue health and worker state
- confirm whether deliveries are delayed, stalled, or partially processing
- advise on replay steps or mitigation ETA

Unknowns:
- how many events are delayed
- whether any events were dropped versus only queued

## Common Mistakes To Avoid

- assuming the customer endpoint is failing without checking internal backlog clues
- ignoring automation impact when setting urgency
- promising a replay or ETA before engineering confirms it
- escalating without queue-delay evidence

## 60-Second Interview Answer

I would check whether the webhook problem looks external or internal. In this case, the backlog event and related delivery errors point more toward queue or worker health than customer endpoint rejection. I would explain that support can identify the likely direction of failure, but engineering still needs to confirm whether events are only delayed or actually failing in a way that needs replay.
