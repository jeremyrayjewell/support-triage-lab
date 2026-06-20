type AccountSeed = {
  id: number;
  name: string;
  plan: string;
  industry: string;
  region: string;
  owner_name: string;
  mrr: number;
  health_score: number;
};

type UserSeed = {
  id: number;
  account_id: number;
  name: string;
  email: string;
  role: string;
  browser: string;
  timezone: string;
};

type TicketSeed = {
  id: number;
  account_id: number;
  user_id: number;
  title: string;
  status: string;
  severity: string;
  category: string;
  channel: string;
  source: string;
  created_at: string;
  updated_at: string;
  first_response_due_at: string;
  resolution_due_at: string;
  issue_key: string;
  summary: string;
};

type LoginAttemptSeed = {
  id: number;
  user_id: number;
  account_id: number;
  attempted_at: string;
  ip_address: string;
  status: string;
  failure_reason: string | null;
  mfa_required: number;
};

type AppEventSeed = {
  id: number;
  account_id: number;
  user_id: number | null;
  ticket_id: number | null;
  event_type: string;
  event_name: string;
  created_at: string;
  page: string | null;
  browser: string | null;
  metadata_json: string;
};

type ApiRequestSeed = {
  id: number;
  account_id: number;
  user_id: number | null;
  ticket_id: number | null;
  happened_at: string;
  endpoint: string;
  method: string;
  status_code: number;
  latency_ms: number;
  request_id: string;
  error_code: string | null;
};

type SubscriptionSeed = {
  id: number;
  account_id: number;
  plan_name: string;
  status: string;
  seats_purchased: number;
  seats_in_use: number;
  renewal_date: string;
  billing_status: string;
  last_invoice_status: string;
  payment_processor: string;
};

export const seededAt = "2026-06-19T22:00:00Z";

export const accounts: AccountSeed[] = [
  { id: 1, name: "Northstar Health", plan: "Enterprise", industry: "Healthcare", region: "US-East", owner_name: "Rina Patel", mrr: 42000, health_score: 68 },
  { id: 2, name: "Beacon Retail Group", plan: "Business", industry: "Retail", region: "US-Central", owner_name: "Miles Carter", mrr: 18500, health_score: 72 },
  { id: 3, name: "Pioneer Logistics", plan: "Enterprise", industry: "Logistics", region: "EU-West", owner_name: "Ivy Schneider", mrr: 39000, health_score: 61 },
  { id: 4, name: "LumenPay", plan: "Startup", industry: "Fintech", region: "US-West", owner_name: "Derek Gomez", mrr: 9200, health_score: 55 },
  { id: 5, name: "Atlas Learning", plan: "Business", industry: "EdTech", region: "APAC", owner_name: "Samira Hale", mrr: 14800, health_score: 77 },
  { id: 6, name: "Kepler Cloudworks", plan: "Enterprise", industry: "IT Services", region: "US-East", owner_name: "Nadia Price", mrr: 51000, health_score: 64 },
];

export const users: UserSeed[] = [
  { id: 1, account_id: 1, name: "Mina Ross", email: "mina.ross@northstar.example", role: "Admin", browser: "Chrome 126", timezone: "America/New_York" },
  { id: 2, account_id: 1, name: "Daniel Wu", email: "daniel.wu@northstar.example", role: "Analyst", browser: "Edge 126", timezone: "America/New_York" },
  { id: 3, account_id: 2, name: "Cleo Nash", email: "cleo.nash@beacon.example", role: "Admin", browser: "Chrome 126", timezone: "America/Chicago" },
  { id: 4, account_id: 2, name: "Leo Park", email: "leo.park@beacon.example", role: "Manager", browser: "Safari 17", timezone: "America/Chicago" },
  { id: 5, account_id: 3, name: "Eva Lang", email: "eva.lang@pioneer.example", role: "Admin", browser: "Firefox 127", timezone: "Europe/Berlin" },
  { id: 6, account_id: 3, name: "Jonas Frei", email: "jonas.frei@pioneer.example", role: "Dispatcher", browser: "Chrome 126", timezone: "Europe/Berlin" },
  { id: 7, account_id: 4, name: "Tara Wells", email: "tara.wells@lumenpay.example", role: "Admin", browser: "Chrome 126", timezone: "America/Los_Angeles" },
  { id: 8, account_id: 4, name: "Ian Cole", email: "ian.cole@lumenpay.example", role: "Engineer", browser: "Chrome 126", timezone: "America/Los_Angeles" },
  { id: 9, account_id: 5, name: "Priya Raman", email: "priya.raman@atlas.example", role: "Admin", browser: "Safari 17", timezone: "Asia/Singapore" },
  { id: 10, account_id: 5, name: "Owen Hart", email: "owen.hart@atlas.example", role: "Support Lead", browser: "Chrome 125", timezone: "Asia/Singapore" },
  { id: 11, account_id: 6, name: "Sofia Reed", email: "sofia.reed@kepler.example", role: "Admin", browser: "Edge 126", timezone: "America/New_York" },
  { id: 12, account_id: 6, name: "Marco Silva", email: "marco.silva@kepler.example", role: "Operator", browser: "Chrome 126", timezone: "America/New_York" },
];

export const tickets: TicketSeed[] = [
  {
    id: 101,
    account_id: 1,
    user_id: 1,
    title: "Admins locked out after MFA reset",
    status: "open",
    severity: "sev-1",
    category: "Authentication",
    channel: "Email",
    source: "Zendesk",
    created_at: "2026-06-19T17:12:00Z",
    updated_at: "2026-06-19T21:28:00Z",
    first_response_due_at: "2026-06-19T17:42:00Z",
    resolution_due_at: "2026-06-19T19:12:00Z",
    issue_key: "auth-mfa-reset",
    summary: "Northstar reports repeated failed logins for privileged users after a forced MFA reset during onboarding cleanup.",
  },
  {
    id: 102,
    account_id: 3,
    user_id: 5,
    title: "Dispatch API returning 500 on route sync",
    status: "investigating",
    severity: "sev-2",
    category: "API",
    channel: "Slack",
    source: "Shared Channel",
    created_at: "2026-06-19T14:03:00Z",
    updated_at: "2026-06-19T20:55:00Z",
    first_response_due_at: "2026-06-19T14:33:00Z",
    resolution_due_at: "2026-06-19T22:03:00Z",
    issue_key: "api-500-route-sync",
    summary: "Pioneer Logistics sees retries and failures on POST /v1/routes/sync after the latest backend rollout.",
  },
  {
    id: 103,
    account_id: 2,
    user_id: 3,
    title: "Chrome users see blank dashboard after login",
    status: "open",
    severity: "sev-2",
    category: "Frontend",
    channel: "Email",
    source: "HubSpot",
    created_at: "2026-06-19T13:24:00Z",
    updated_at: "2026-06-19T18:42:00Z",
    first_response_due_at: "2026-06-19T13:54:00Z",
    resolution_due_at: "2026-06-20T01:24:00Z",
    issue_key: "frontend-blank-dashboard",
    summary: "Multiple Beacon users report a white screen after login that reproduces only on Chrome 126.",
  },
  {
    id: 104,
    account_id: 4,
    user_id: 7,
    title: "Permission denied after manager role change",
    status: "waiting-on-eng",
    severity: "sev-2",
    category: "Authorization",
    channel: "Email",
    source: "Zendesk",
    created_at: "2026-06-19T11:10:00Z",
    updated_at: "2026-06-19T20:03:00Z",
    first_response_due_at: "2026-06-19T11:40:00Z",
    resolution_due_at: "2026-06-19T23:10:00Z",
    issue_key: "authz-role-change",
    summary: "LumenPay changed multiple user roles and immediately hit 403s on project settings and export endpoints.",
  },
  {
    id: 105,
    account_id: 6,
    user_id: 11,
    title: "Webhook deliveries delayed by 20+ minutes",
    status: "open",
    severity: "sev-3",
    category: "Integrations",
    channel: "Slack",
    source: "Shared Channel",
    created_at: "2026-06-18T16:45:00Z",
    updated_at: "2026-06-19T19:22:00Z",
    first_response_due_at: "2026-06-18T17:15:00Z",
    resolution_due_at: "2026-06-19T04:45:00Z",
    issue_key: "webhook-delays",
    summary: "Kepler reports delayed invoice.created webhooks and stale downstream automations since yesterday afternoon.",
  },
  {
    id: 106,
    account_id: 5,
    user_id: 9,
    title: "Subscription shows active but payment marked failed",
    status: "open",
    severity: "sev-3",
    category: "Billing",
    channel: "Email",
    source: "Billing Queue",
    created_at: "2026-06-19T07:55:00Z",
    updated_at: "2026-06-19T15:10:00Z",
    first_response_due_at: "2026-06-19T08:25:00Z",
    resolution_due_at: "2026-06-20T07:55:00Z",
    issue_key: "billing-subscription-mismatch",
    summary: "Atlas Learning sees seat access as active while the last invoice is marked failed in billing.",
  },
  {
    id: 107,
    account_id: 2,
    user_id: 4,
    title: "Second report: blank dashboard still affecting regional managers",
    status: "open",
    severity: "sev-3",
    category: "Frontend",
    channel: "Chat",
    source: "In-app",
    created_at: "2026-06-19T18:02:00Z",
    updated_at: "2026-06-19T20:18:00Z",
    first_response_due_at: "2026-06-19T18:32:00Z",
    resolution_due_at: "2026-06-20T06:02:00Z",
    issue_key: "frontend-blank-dashboard",
    summary: "A second Beacon contact confirmed the blank dashboard issue for a different user cohort.",
  },
];

export const loginAttempts: LoginAttemptSeed[] = [
  { id: 1, user_id: 1, account_id: 1, attempted_at: "2026-06-19T20:11:00Z", ip_address: "54.84.22.14", status: "failed", failure_reason: "mfa_token_rejected", mfa_required: 1 },
  { id: 2, user_id: 1, account_id: 1, attempted_at: "2026-06-19T20:14:00Z", ip_address: "54.84.22.14", status: "failed", failure_reason: "mfa_token_rejected", mfa_required: 1 },
  { id: 3, user_id: 2, account_id: 1, attempted_at: "2026-06-19T20:18:00Z", ip_address: "54.84.22.29", status: "failed", failure_reason: "account_policy_mismatch", mfa_required: 1 },
  { id: 4, user_id: 3, account_id: 2, attempted_at: "2026-06-19T17:55:00Z", ip_address: "18.93.0.21", status: "success", failure_reason: null, mfa_required: 0 },
  { id: 5, user_id: 4, account_id: 2, attempted_at: "2026-06-19T18:00:00Z", ip_address: "18.93.0.44", status: "success", failure_reason: null, mfa_required: 0 },
  { id: 6, user_id: 7, account_id: 4, attempted_at: "2026-06-19T12:01:00Z", ip_address: "44.201.54.16", status: "success", failure_reason: null, mfa_required: 1 },
  { id: 7, user_id: 11, account_id: 6, attempted_at: "2026-06-19T08:40:00Z", ip_address: "23.20.80.66", status: "success", failure_reason: null, mfa_required: 0 },
  { id: 8, user_id: 12, account_id: 6, attempted_at: "2026-06-19T18:12:00Z", ip_address: "23.20.80.81", status: "failed", failure_reason: "password_expired", mfa_required: 0 },
  { id: 9, user_id: 8, account_id: 4, attempted_at: "2026-06-19T18:47:00Z", ip_address: "44.201.54.88", status: "failed", failure_reason: "role_cache_stale", mfa_required: 0 },
  { id: 10, user_id: 5, account_id: 3, attempted_at: "2026-06-19T13:48:00Z", ip_address: "3.123.190.21", status: "success", failure_reason: null, mfa_required: 0 },
];

export const appEvents: AppEventSeed[] = [
  { id: 1, account_id: 2, user_id: 3, ticket_id: 103, event_type: "ui_error", event_name: "blank_dashboard_render", created_at: "2026-06-19T17:56:00Z", page: "/dashboard", browser: "Chrome 126", metadata_json: "{\"build\":\"2026.24.1\",\"feature_flag\":\"nav-redesign\"}" },
  { id: 2, account_id: 2, user_id: 4, ticket_id: 107, event_type: "ui_error", event_name: "blank_dashboard_render", created_at: "2026-06-19T18:05:00Z", page: "/dashboard", browser: "Chrome 126", metadata_json: "{\"build\":\"2026.24.1\",\"feature_flag\":\"nav-redesign\"}" },
  { id: 3, account_id: 4, user_id: 7, ticket_id: 104, event_type: "role_change", event_name: "user_role_updated", created_at: "2026-06-19T11:54:00Z", page: "/settings/members", browser: "Chrome 126", metadata_json: "{\"from_role\":\"admin\",\"to_role\":\"manager\"}" },
  { id: 4, account_id: 4, user_id: 7, ticket_id: 104, event_type: "authz_error", event_name: "permission_denied", created_at: "2026-06-19T11:58:00Z", page: "/settings/projects", browser: "Chrome 126", metadata_json: "{\"permission\":\"project.settings.write\",\"cache_version\":\"old\"}" },
  { id: 5, account_id: 6, user_id: 11, ticket_id: 105, event_type: "integration", event_name: "webhook_backlog_detected", created_at: "2026-06-19T12:22:00Z", page: null, browser: null, metadata_json: "{\"queue_delay_seconds\":1320,\"event\":\"invoice.created\"}" },
  { id: 6, account_id: 1, user_id: 1, ticket_id: 101, event_type: "auth", event_name: "mfa_reset_completed", created_at: "2026-06-19T16:54:00Z", page: "/settings/security", browser: "Chrome 126", metadata_json: "{\"reset_by\":\"support_ops\"}" },
  { id: 7, account_id: 3, user_id: 5, ticket_id: 102, event_type: "release", event_name: "background_job_deployed", created_at: "2026-06-19T13:22:00Z", page: null, browser: null, metadata_json: "{\"service\":\"route-sync-worker\",\"release\":\"2026.24.0\"}" },
  { id: 8, account_id: 5, user_id: 9, ticket_id: 106, event_type: "billing", event_name: "invoice_payment_failed", created_at: "2026-06-19T06:40:00Z", page: "/billing", browser: "Safari 17", metadata_json: "{\"invoice_id\":\"inv_2026_0619\",\"attempt\":2}" },
  { id: 9, account_id: 3, user_id: 6, ticket_id: 102, event_type: "integration", event_name: "route_sync_retry_exhausted", created_at: "2026-06-19T14:11:00Z", page: "/integrations/routes", browser: "Chrome 126", metadata_json: "{\"job_id\":\"job_8821\",\"endpoint\":\"/v1/routes/sync\"}" },
];

export const apiRequests: ApiRequestSeed[] = [
  { id: 1, account_id: 3, user_id: 5, ticket_id: 102, happened_at: "2026-06-19T13:59:00Z", endpoint: "/v1/routes/sync", method: "POST", status_code: 500, latency_ms: 4200, request_id: "req_route_001", error_code: "ROUTE_SYNC_TIMEOUT" },
  { id: 2, account_id: 3, user_id: 6, ticket_id: 102, happened_at: "2026-06-19T14:02:00Z", endpoint: "/v1/routes/sync", method: "POST", status_code: 500, latency_ms: 4388, request_id: "req_route_002", error_code: "ROUTE_SYNC_TIMEOUT" },
  { id: 3, account_id: 3, user_id: 6, ticket_id: 102, happened_at: "2026-06-19T14:06:00Z", endpoint: "/v1/routes/sync", method: "POST", status_code: 500, latency_ms: 4510, request_id: "req_route_003", error_code: "ROUTE_SYNC_TIMEOUT" },
  { id: 4, account_id: 4, user_id: 7, ticket_id: 104, happened_at: "2026-06-19T11:57:00Z", endpoint: "/v1/projects/export", method: "GET", status_code: 403, latency_ms: 182, request_id: "req_authz_001", error_code: "PERMISSION_DENIED" },
  { id: 5, account_id: 4, user_id: 7, ticket_id: 104, happened_at: "2026-06-19T12:03:00Z", endpoint: "/v1/settings/projects", method: "PATCH", status_code: 403, latency_ms: 206, request_id: "req_authz_002", error_code: "PERMISSION_DENIED" },
  { id: 6, account_id: 1, user_id: 1, ticket_id: 101, happened_at: "2026-06-19T20:16:00Z", endpoint: "/v1/auth/mfa/verify", method: "POST", status_code: 401, latency_ms: 150, request_id: "req_auth_001", error_code: "MFA_INVALID" },
  { id: 7, account_id: 1, user_id: 2, ticket_id: 101, happened_at: "2026-06-19T20:19:00Z", endpoint: "/v1/auth/login", method: "POST", status_code: 401, latency_ms: 121, request_id: "req_auth_002", error_code: "POLICY_MISMATCH" },
  { id: 8, account_id: 2, user_id: 3, ticket_id: 103, happened_at: "2026-06-19T17:58:00Z", endpoint: "/v1/dashboard/summary", method: "GET", status_code: 200, latency_ms: 90, request_id: "req_dash_001", error_code: null },
  { id: 9, account_id: 2, user_id: 4, ticket_id: 107, happened_at: "2026-06-19T18:04:00Z", endpoint: "/v1/dashboard/widgets", method: "GET", status_code: 500, latency_ms: 980, request_id: "req_dash_002", error_code: "WIDGET_STATE_NULL" },
  { id: 10, account_id: 6, user_id: 11, ticket_id: 105, happened_at: "2026-06-19T12:18:00Z", endpoint: "/v1/webhooks/deliveries", method: "POST", status_code: 202, latency_ms: 2110, request_id: "req_hook_001", error_code: null },
  { id: 11, account_id: 6, user_id: 12, ticket_id: 105, happened_at: "2026-06-19T12:19:00Z", endpoint: "/v1/webhooks/deliveries", method: "POST", status_code: 500, latency_ms: 5090, request_id: "req_hook_002", error_code: "WEBHOOK_QUEUE_STALL" },
  { id: 12, account_id: 5, user_id: 9, ticket_id: 106, happened_at: "2026-06-19T06:44:00Z", endpoint: "/v1/billing/subscription", method: "GET", status_code: 200, latency_ms: 88, request_id: "req_bill_001", error_code: null },
  { id: 13, account_id: 5, user_id: 9, ticket_id: 106, happened_at: "2026-06-19T06:49:00Z", endpoint: "/v1/billing/invoices", method: "GET", status_code: 200, latency_ms: 96, request_id: "req_bill_002", error_code: null },
  { id: 14, account_id: 3, user_id: 5, ticket_id: null, happened_at: "2026-06-17T11:11:00Z", endpoint: "/v1/routes/sync", method: "POST", status_code: 200, latency_ms: 410, request_id: "req_route_baseline", error_code: null },
  { id: 15, account_id: 4, user_id: 8, ticket_id: null, happened_at: "2026-06-19T18:49:00Z", endpoint: "/v1/settings/projects", method: "PATCH", status_code: 403, latency_ms: 188, request_id: "req_authz_003", error_code: "PERMISSION_DENIED" },
];

export const subscriptions: SubscriptionSeed[] = [
  { id: 1, account_id: 1, plan_name: "Enterprise", status: "active", seats_purchased: 200, seats_in_use: 142, renewal_date: "2026-10-01", billing_status: "current", last_invoice_status: "paid", payment_processor: "Stripe" },
  { id: 2, account_id: 2, plan_name: "Business", status: "active", seats_purchased: 60, seats_in_use: 46, renewal_date: "2026-09-15", billing_status: "current", last_invoice_status: "paid", payment_processor: "Stripe" },
  { id: 3, account_id: 3, plan_name: "Enterprise", status: "active", seats_purchased: 180, seats_in_use: 175, renewal_date: "2026-08-09", billing_status: "current", last_invoice_status: "paid", payment_processor: "NetSuite" },
  { id: 4, account_id: 4, plan_name: "Startup", status: "active", seats_purchased: 25, seats_in_use: 24, renewal_date: "2026-07-02", billing_status: "past_due", last_invoice_status: "paid", payment_processor: "Stripe" },
  { id: 5, account_id: 5, plan_name: "Business", status: "active", seats_purchased: 90, seats_in_use: 94, renewal_date: "2026-07-19", billing_status: "current", last_invoice_status: "failed", payment_processor: "Stripe" },
  { id: 6, account_id: 6, plan_name: "Enterprise", status: "active", seats_purchased: 240, seats_in_use: 219, renewal_date: "2026-11-30", billing_status: "current", last_invoice_status: "paid", payment_processor: "Adyen" },
];
