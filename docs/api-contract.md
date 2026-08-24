# PayGuard AI — API Contract

## 1. Document Purpose

This document defines the REST API contract for **PayGuard AI**.

The API provides communication between:

* React + TypeScript frontend
* FastAPI backend
* PostgreSQL database
* Risk Engine
* Incident Engine
* AI Investigation Engine
* AI Risk Copilot
* Razorpay webhooks
* Transaction Simulator

The primary goals of the API design are:

* Consistency
* Predictability
* Security
* Versioning
* Traceability
* Explainability
* Idempotency
* Frontend/backend contract stability

---

# 2. API Base URL

All application APIs must use versioning.

```text
/api/v1
```

Local development:

```text
http://localhost:8000/api/v1
```

Example:

```text
GET http://localhost:8000/api/v1/transactions
```

---

# 3. API Versioning

Current version:

```text
v1
```

All application endpoints begin with:

```text
/api/v1
```

Example:

```text
/api/v1/incidents
```

Future incompatible changes may use:

```text
/api/v2
```

Existing clients should not unexpectedly break when future versions are introduced.

---

# 4. Content Type

Standard request body:

```text
Content-Type: application/json
```

Standard response:

```text
application/json
```

Webhook endpoints may still receive JSON provider payloads.

---

# 5. Authentication

Protected endpoints use:

```text
Authorization: Bearer <access_token>
```

Example:

```http
Authorization: Bearer eyJhbGciOi...
```

The backend is responsible for validating:

* Token signature
* Token expiry
* User status
* User permissions
* Merchant access

---

# 6. Authentication Exceptions

The following endpoints do not require normal user authentication:

```text
GET /health
GET /ready

POST /auth/login

POST /webhooks/razorpay
```

Razorpay webhooks must instead use:

```text
Webhook signature verification
```

---

# 7. Standard Response Format

Successful single-resource response:

```json
{
  "data": {},
  "meta": {
    "request_id": "req_01J6A...",
    "timestamp": "2026-08-24T11:30:00Z"
  }
}
```

Successful collection response:

```json
{
  "data": [],
  "pagination": {},
  "meta": {
    "request_id": "req_01J6A...",
    "timestamp": "2026-08-24T11:30:00Z"
  }
}
```

---

# 8. Standard Error Format

All API errors should follow:

```json
{
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "The requested transaction was not found.",
    "details": null,
    "request_id": "req_01J6A..."
  }
}
```

Validation example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than zero."
      }
    ],
    "request_id": "req_01J6A..."
  }
}
```

---

# 9. Standard HTTP Status Codes

```text
200 OK
Successful request
```

```text
201 Created
Resource created
```

```text
202 Accepted
Asynchronous processing accepted
```

```text
204 No Content
Successful operation without body
```

```text
400 Bad Request
Invalid request
```

```text
401 Unauthorized
Authentication required or invalid
```

```text
403 Forbidden
Authenticated but not allowed
```

```text
404 Not Found
Resource not found
```

```text
409 Conflict
Duplicate or state conflict
```

```text
422 Unprocessable Entity
Schema/input validation error
```

```text
429 Too Many Requests
Rate limit exceeded
```

```text
500 Internal Server Error
Unexpected internal failure
```

```text
502 Bad Gateway
External provider failure
```

```text
503 Service Unavailable
Dependency unavailable
```

---

# 10. Request ID

Every incoming request should receive a unique:

```text
request_id
```

Request header may optionally contain:

```text
X-Request-ID
```

If no ID exists, the backend generates one.

Response:

```http
X-Request-ID: req_01J6A...
```

This ID should also appear in logs and error responses.

---

# 11. Idempotency

Critical POST requests may support:

```text
Idempotency-Key
```

Example:

```http
Idempotency-Key: demo-payment-001
```

Required or strongly recommended for:

```text
POST /transactions
POST /simulator/scenarios/{scenario}/run
POST /approvals/{id}/approve
POST /mitigations/{id}/execute
```

Razorpay webhooks use provider event IDs and payload hashes for duplicate protection.

---

# 12. Pagination

Collection endpoints use cursor or page-based pagination.

For MVP we will use page-based pagination.

Request:

```text
?page=1&page_size=25
```

Maximum:

```text
page_size = 100
```

Response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 25,
    "total_items": 327,
    "total_pages": 14,
    "has_next": true,
    "has_previous": false
  }
}
```

---

# 13. Sorting

Collection endpoints may support:

```text
sort_by
sort_order
```

Example:

```text
?sort_by=occurred_at&sort_order=desc
```

Allowed:

```text
asc
desc
```

The backend must allow-list sortable fields.

---

# 14. Date and Time

API timestamps use ISO-8601 UTC.

Example:

```text
2026-08-24T11:30:00Z
```

Frontend is responsible for local display conversion.

---

# 15. Money Representation

Monetary values are represented using the smallest currency unit.

Example:

```json
{
  "amount": 5000000,
  "currency": "INR"
}
```

Means:

```text
₹50,000.00
```

Do not send financial amounts as floating-point values.

---

# 16. Risk Level Enum

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 17. Incident Status Enum

```text
DETECTED
INVESTIGATING
ACTION_RECOMMENDED
MONITORING
RESOLVED
ESCALATED
```

---

# 18. Alert Severity Enum

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 19. Authentication API

## POST /auth/login

Authenticate a PayGuard user.

### Request

```json
{
  "email": "analyst@payguard.demo",
  "password": "password"
}
```

### Success

```text
200 OK
```

```json
{
  "data": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "analyst@payguard.demo",
      "full_name": "Risk Analyst",
      "role": "RISK_ANALYST"
    }
  },
  "meta": {
    "request_id": "req_...",
    "timestamp": "2026-08-24T11:30:00Z"
  }
}
```

### Errors

```text
401 INVALID_CREDENTIALS
403 USER_INACTIVE
```

---

# 20. GET /auth/me

Returns the currently authenticated user.

### Response

```json
{
  "data": {
    "id": "uuid",
    "email": "analyst@payguard.demo",
    "full_name": "Risk Analyst",
    "role": "RISK_ANALYST",
    "merchant_ids": [
      "uuid"
    ]
  }
}
```

---

# 21. Health API

## GET /health

Basic process health.

### Response

```json
{
  "status": "healthy",
  "service": "payguard-api",
  "version": "1.0.0"
}
```

---

# 22. GET /ready

Dependency readiness check.

Example:

```json
{
  "status": "ready",
  "dependencies": {
    "database": "healthy",
    "risk_engine": "healthy",
    "ai_provider": "healthy"
  }
}
```

AI provider failure should not necessarily make the entire API unavailable.

Possible:

```json
{
  "status": "degraded",
  "dependencies": {
    "database": "healthy",
    "risk_engine": "healthy",
    "ai_provider": "unavailable"
  }
}
```

---

# 23. Dashboard API

## GET /dashboard

Returns the primary dashboard summary.

Optional query:

```text
?merchant_id=<uuid>
```

### Response

```json
{
  "data": {
    "payment_health_score": 87,
    "transactions_today": 126482,
    "successful_transactions_today": 118241,
    "failed_transactions_today": 8241,
    "success_rate": 0.9348,
    "failure_rate": 0.0652,
    "high_risk_transactions": 42,
    "critical_risk_transactions": 11,
    "open_incidents": 7,
    "critical_incidents": 3,
    "revenue_at_risk": 42800000,
    "currency": "INR",
    "active_alerts": 14
  }
}
```

---

# 24. GET /dashboard/risk-distribution

### Response

```json
{
  "data": [
    {
      "risk_level": "LOW",
      "count": 118432
    },
    {
      "risk_level": "MEDIUM",
      "count": 7350
    },
    {
      "risk_level": "HIGH",
      "count": 658
    },
    {
      "risk_level": "CRITICAL",
      "count": 42
    }
  ]
}
```

---

# 25. GET /dashboard/payment-methods

Returns payment method performance.

### Response

```json
{
  "data": [
    {
      "payment_method": "upi",
      "transaction_count": 62400,
      "success_rate": 0.842,
      "failure_rate": 0.158,
      "risk_score": 78
    },
    {
      "payment_method": "card",
      "transaction_count": 41320,
      "success_rate": 0.961,
      "failure_rate": 0.039,
      "risk_score": 21
    }
  ]
}
```

---

# 26. Transaction API

## POST /transactions

Manually ingest a transaction.

Used for:

* Development
* Testing
* Simulator
* Controlled demo cases

### Request

```json
{
  "merchant_id": "uuid",
  "customer_id": "uuid",
  "external_payment_id": "pay_demo_001",
  "external_order_id": "order_demo_001",
  "amount": 5000000,
  "currency": "INR",
  "payment_method": "upi",
  "payment_provider": "Razorpay",
  "bank": "ABC Bank",
  "status": "FAILED",
  "failure_code": "PAYMENT_FAILED",
  "failure_reason": "Bank rejected payment",
  "device_fingerprint": "device_demo_101",
  "country_code": "IN",
  "city": "Bengaluru",
  "occurred_at": "2026-08-24T11:20:00Z",
  "metadata": {}
}
```

### Response

Recommended:

```text
202 Accepted
```

```json
{
  "data": {
    "transaction_id": "uuid",
    "status": "RECEIVED",
    "risk_processing_status": "PENDING"
  }
}
```

The backend persists the transaction before triggering non-critical processing.

---

# 27. Transaction Ingestion Validation

Required:

```text
merchant_id
amount
currency
payment_method
status
occurred_at
```

Rules:

```text
amount > 0
```

```text
currency must be supported ISO currency code
```

```text
occurred_at must be valid timestamp
```

Do not trust frontend-provided risk scores.

The following must NOT be accepted from the client as authoritative:

```text
risk_score
risk_level
risk_factors
incident_id
```

---

# 28. Duplicate Transaction Response

If the same external payment has already been processed:

```text
409 Conflict
```

```json
{
  "error": {
    "code": "DUPLICATE_TRANSACTION",
    "message": "A transaction with this payment identifier already exists."
  }
}
```

With an idempotency key, the original successful result may instead be replayed.

---

# 29. GET /transactions

Returns transactions.

Supported filters:

```text
merchant_id
customer_id
risk_level
status
payment_method
bank
incident_id
min_amount
max_amount
from
to
search
page
page_size
sort_by
sort_order
```

Example:

```text
GET /transactions?risk_level=CRITICAL&payment_method=upi&page=1&page_size=25
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "external_payment_id": "pay_demo_001",
      "amount": 5000000,
      "currency": "INR",
      "payment_method": "upi",
      "bank": "ABC Bank",
      "status": "FAILED",
      "risk_score": 89,
      "risk_level": "CRITICAL",
      "occurred_at": "2026-08-24T11:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 25,
    "total_items": 42,
    "total_pages": 2
  }
}
```

---

# 30. GET /transactions/{transaction_id}

Returns complete transaction detail.

### Response

```json
{
  "data": {
    "id": "uuid",
    "merchant_id": "uuid",
    "customer_id": "uuid",
    "external_payment_id": "pay_demo_001",
    "amount": 5000000,
    "currency": "INR",
    "payment_method": "upi",
    "bank": "ABC Bank",
    "status": "FAILED",
    "failure_code": "PAYMENT_FAILED",
    "occurred_at": "2026-08-24T11:20:00Z",

    "risk": {
      "score": 89,
      "level": "CRITICAL",
      "rule_score": 70,
      "anomaly_score": 14,
      "contextual_score": 5,
      "model_version": "risk-v1"
    },

    "risk_factors": [
      {
        "factor_code": "EXTREME_AMOUNT",
        "factor_name": "Extreme transaction amount",
        "score_contribution": 25,
        "reason": "Transaction is 12x above the customer's historical average."
      }
    ],

    "related_incidents": [
      {
        "id": "uuid",
        "incident_number": "PG-2026-000042",
        "title": "Potential device abuse pattern"
      }
    ]
  }
}
```

---

# 31. GET /transactions/{transaction_id}/risk

Returns current/latest risk evaluation.

```json
{
  "data": {
    "transaction_id": "uuid",
    "risk_score": 89,
    "risk_level": "CRITICAL",
    "rule_score": 70,
    "anomaly_score": 14,
    "contextual_score": 5,
    "model_version": "risk-v1",
    "evaluated_at": "2026-08-24T11:20:01Z"
  }
}
```

---

# 32. GET /transactions/{transaction_id}/risk-factors

### Response

```json
{
  "data": [
    {
      "factor_code": "EXTREME_AMOUNT",
      "factor_type": "RULE",
      "score_contribution": 25,
      "reason": "Transaction amount exceeds the configured historical threshold.",
      "evidence": {
        "amount_ratio": 12,
        "threshold": 10
      }
    }
  ]
}
```

---

# 33. POST /transactions/{transaction_id}/risk/recalculate

Development/admin endpoint.

Re-run risk evaluation using the current configured risk model.

Must not silently overwrite previous historical scores.

### Response

```text
202 Accepted
```

```json
{
  "data": {
    "transaction_id": "uuid",
    "evaluation_status": "PENDING"
  }
}
```

Recommended permission:

```text
ADMIN
RISK_ANALYST
```

---

# 34. Risk API

## GET /risk/summary

Returns aggregate risk information.

### Response

```json
{
  "data": {
    "average_risk_score": 26.8,
    "high_risk_transactions": 658,
    "critical_transactions": 42,
    "active_risk_signals": 17,
    "top_risk_factor": "HIGH_VELOCITY"
  }
}
```

---

# 35. GET /risk/rules

Returns configured risk rules.

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "code": "HIGH_VELOCITY",
      "name": "High transaction velocity",
      "score": 20,
      "severity": "HIGH",
      "enabled": true,
      "version": 1
    }
  ]
}
```

---

# 36. GET /risk/rules/{rule_id}

Returns complete rule configuration.

Sensitive implementation details should still remain controlled.

---

# 37. PATCH /risk/rules/{rule_id}

Optional administrative MVP endpoint.

Allowed users:

```text
ADMIN
```

Example request:

```json
{
  "is_enabled": false
}
```

Changing rule configuration must create an audit log.

For the hackathon, major score/threshold editing may be deferred if unnecessary.

---

# 38. Incident API

## GET /incidents

Supported filters:

```text
status
severity
incident_type
merchant_id
payment_method
bank
from
to
page
page_size
sort_by
sort_order
```

Example:

```text
GET /incidents?severity=CRITICAL&status=INVESTIGATING
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "incident_number": "PG-2026-000042",
      "title": "UPI failure spike associated with ABC Bank",
      "incident_type": "BANK_DEGRADATION",
      "severity": "CRITICAL",
      "status": "INVESTIGATING",
      "risk_score": 91,
      "affected_transaction_count": 342,
      "revenue_at_risk": 42800000,
      "currency": "INR",
      "started_at": "2026-08-24T11:32:00Z",
      "detected_at": "2026-08-24T11:33:00Z"
    }
  ]
}
```

---

# 39. GET /incidents/{incident_id}

Returns complete incident details.

### Response

```json
{
  "data": {
    "id": "uuid",
    "incident_number": "PG-2026-000042",
    "title": "UPI failure spike associated with ABC Bank",
    "description": "A significant increase in failed UPI transactions was detected.",
    "incident_type": "BANK_DEGRADATION",
    "severity": "CRITICAL",
    "status": "INVESTIGATING",
    "risk_score": 91,
    "confidence_score": 0.91,
    "affected_transaction_count": 342,
    "affected_payment_value": 51000000,
    "revenue_at_risk": 42800000,
    "currency": "INR",
    "primary_payment_method": "upi",
    "primary_bank": "ABC Bank",
    "started_at": "2026-08-24T11:32:00Z",
    "detected_at": "2026-08-24T11:33:00Z",
    "resolved_at": null
  }
}
```

---

# 40. GET /incidents/{incident_id}/transactions

Returns transactions correlated with an incident.

Supports:

```text
relationship_type
risk_level
status
page
page_size
```

---

# 41. GET /incidents/{incident_id}/timeline

Returns incident timeline.

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "event_type": "ANOMALY_DETECTED",
      "title": "UPI failure anomaly detected",
      "description": "Failure rate exceeded historical baseline.",
      "actor_type": "SYSTEM",
      "occurred_at": "2026-08-24T11:32:00Z"
    },
    {
      "id": "uuid",
      "event_type": "AI_INVESTIGATION_COMPLETED",
      "title": "AI investigation completed",
      "actor_type": "AI",
      "occurred_at": "2026-08-24T11:36:00Z"
    }
  ]
}
```

---

# 42. PATCH /incidents/{incident_id}/status

Used for analyst-controlled lifecycle changes.

### Request

```json
{
  "status": "MONITORING",
  "reason": "Mitigation applied and metrics are improving."
}
```

Allowed transitions must be validated.

Invalid transition:

```text
409 INVALID_INCIDENT_STATE_TRANSITION
```

---

# 43. POST /incidents/{incident_id}/resolve

Explicitly resolve an incident.

### Request

```json
{
  "resolution_summary": "UPI failure rates returned to baseline.",
  "resolution_code": "PROVIDER_RECOVERED"
}
```

### Response

```text
200 OK
```

The action must generate:

```text
incident_event
audit_log
```

---

# 44. AI Investigation API

## POST /incidents/{incident_id}/investigate

Triggers AI investigation.

### Response

If processed asynchronously:

```text
202 Accepted
```

```json
{
  "data": {
    "investigation_id": "uuid",
    "incident_id": "uuid",
    "status": "PENDING"
  }
}
```

---

# 45. GET /incidents/{incident_id}/investigations

Returns investigation history.

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "status": "COMPLETED",
      "summary": "UPI failures increased sharply and are concentrated in ABC Bank.",
      "likely_root_cause": "Possible ABC Bank-associated UPI degradation.",
      "confidence_score": 0.91,
      "model_name": "configured-model",
      "prompt_version": "investigation-v1",
      "created_at": "2026-08-24T11:36:00Z"
    }
  ]
}
```

---

# 46. GET /investigations/{investigation_id}

Returns complete investigation.

### Response

```json
{
  "data": {
    "id": "uuid",
    "incident_id": "uuid",
    "status": "COMPLETED",

    "summary": "UPI payment failures increased significantly.",

    "likely_root_cause": "Possible bank-specific UPI degradation.",

    "confidence_score": 0.91,

    "evidence": [
      "UPI failure rate increased from 5.1% to 28.4%.",
      "81% of affected failures are associated with ABC Bank.",
      "Card success rates remain near baseline."
    ],

    "alternative_explanations": [
      "A wider UPI network degradation."
    ],

    "uncertainties": [
      "No direct bank outage confirmation is currently available."
    ],

    "recommended_next_checks": [
      "Continue monitoring ABC Bank UPI success rate."
    ]
  }
}
```

---

# 47. AI Failure Response

If investigation failed:

```json
{
  "data": {
    "id": "uuid",
    "status": "FAILED",
    "error_code": "AI_PROVIDER_TIMEOUT",
    "message": "AI investigation is temporarily unavailable."
  }
}
```

The deterministic incident remains available.

---

# 48. Recommendation API

## GET /incidents/{incident_id}/recommendations

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "recommendation_type": "PROMOTE_ALTERNATE_PAYMENT_METHOD",
      "title": "Promote alternate payment methods",
      "description": "Encourage cards or alternate UPI options while the affected provider is degraded.",
      "reasoning": "The failure spike is concentrated within the affected provider.",
      "expected_impact": "Reduce payment failures during the incident.",
      "requires_approval": false,
      "priority": "HIGH",
      "status": "GENERATED"
    }
  ]
}
```

---

# 49. POST /incidents/{incident_id}/recommendations/generate

Triggers recommendation generation.

### Response

```text
202 Accepted
```

---

# 50. Alerts API

## GET /alerts

Supported filters:

```text
severity
status
alert_type
incident_id
merchant_id
from
to
page
page_size
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "alert_type": "PAYMENT_FAILURE_SPIKE",
      "severity": "CRITICAL",
      "title": "UPI failure rate increased",
      "message": "UPI failure rate is 5.5x above historical baseline.",
      "status": "OPEN",
      "incident_id": "uuid",
      "created_at": "2026-08-24T11:32:00Z"
    }
  ]
}
```

---

# 51. POST /alerts/{alert_id}/acknowledge

### Response

```json
{
  "data": {
    "id": "uuid",
    "status": "ACKNOWLEDGED",
    "acknowledged_at": "2026-08-24T11:40:00Z"
  }
}
```

---

# 52. POST /alerts/{alert_id}/dismiss

Dismisses non-required alert.

Must create audit record.

---

# 53. Approval API

## GET /approvals

Returns mitigation actions awaiting review.

Filters:

```text
status
incident_id
action_type
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "incident_id": "uuid",
      "recommendation_id": "uuid",
      "action_type": "RATE_LIMIT_PATTERN",
      "status": "PENDING",
      "requested_at": "2026-08-24T11:40:00Z"
    }
  ]
}
```

---

# 54. GET /approvals/{approval_id}

Returns complete approval request.

---

# 55. POST /approvals/{approval_id}/approve

Sensitive endpoint.

Recommended required role:

```text
ADMIN
RISK_ANALYST
```

### Request

```json
{
  "reason": "Approved based on the incident evidence."
}
```

### Response

```json
{
  "data": {
    "approval_id": "uuid",
    "status": "APPROVED",
    "reviewed_at": "2026-08-24T11:42:00Z"
  }
}
```

Must create:

```text
audit_log
incident_event
```

---

# 56. POST /approvals/{approval_id}/reject

### Request

```json
{
  "reason": "Insufficient evidence for the proposed mitigation."
}
```

### Response

```json
{
  "data": {
    "approval_id": "uuid",
    "status": "REJECTED"
  }
}
```

---

# 57. Approval Conflict

Approving an already-reviewed request:

```text
409 APPROVAL_ALREADY_REVIEWED
```

---

# 58. Mitigation API

## GET /mitigations

Returns mitigation execution history.

---

# 59. POST /mitigations/{mitigation_id}/execute

For MVP, sensitive actions should generally run in:

```text
SIMULATED
```

mode.

Backend must verify:

```text
Approval exists
Approval is APPROVED
Action matches approval
User authorized
Action not already executed
```

### Response

```text
202 Accepted
```

```json
{
  "data": {
    "mitigation_id": "uuid",
    "status": "RUNNING",
    "execution_mode": "SIMULATED"
  }
}
```

---

# 60. Analytics API

## GET /analytics/risk

Parameters:

```text
merchant_id
from
to
interval
```

Possible intervals:

```text
5m
15m
1h
1d
```

### Response

```json
{
  "data": {
    "series": [
      {
        "timestamp": "2026-08-24T11:00:00Z",
        "average_risk_score": 24.5,
        "high_risk_count": 14,
        "critical_risk_count": 3
      }
    ]
  }
}
```

---

# 61. GET /analytics/failures

### Response

```json
{
  "data": {
    "series": [
      {
        "timestamp": "2026-08-24T11:30:00Z",
        "transaction_count": 240,
        "failed_count": 68,
        "failure_rate": 0.2833
      }
    ]
  }
}
```

---

# 62. GET /analytics/payment-methods

Returns performance by payment method.

---

# 63. GET /analytics/providers

Returns bank/provider performance.

### Example

```json
{
  "data": [
    {
      "provider": "ABC Bank",
      "payment_method": "upi",
      "transaction_count": 102,
      "success_rate": 0.431,
      "failure_rate": 0.569,
      "historical_failure_rate": 0.051,
      "anomaly_score": 92
    }
  ]
}
```

---

# 64. GET /analytics/revenue-at-risk

### Response

```json
{
  "data": {
    "current_revenue_at_risk": 42800000,
    "currency": "INR",
    "open_incident_count": 7,
    "by_severity": {
      "CRITICAL": 31200000,
      "HIGH": 8400000,
      "MEDIUM": 3200000
    }
  }
}
```

---

# 65. AI Copilot API

## POST /copilot/query

### Request

```json
{
  "conversation_id": null,
  "question": "Why are UPI payments failing?"
}
```

### Response

```json
{
  "data": {
    "conversation_id": "uuid",
    "message_id": "uuid",
    "intent": "PAYMENT_METHOD_ANALYSIS",

    "answer": "UPI failures are currently significantly above historical levels and are concentrated among ABC Bank transactions.",

    "referenced_incidents": [
      {
        "id": "uuid",
        "incident_number": "PG-2026-000042"
      }
    ],

    "referenced_transactions": [],

    "evidence": [
      {
        "label": "Current UPI failure rate",
        "value": "28.4%"
      },
      {
        "label": "Historical UPI failure rate",
        "value": "5.1%"
      },
      {
        "label": "ABC Bank share of failures",
        "value": "81%"
      }
    ],

    "generated_at": "2026-08-24T11:45:00Z"
  }
}
```

---

# 66. Copilot No-Data Response

```json
{
  "data": {
    "answer": "There is not enough PayGuard data to determine the cause yet.",
    "intent": "PAYMENT_METHOD_ANALYSIS",
    "evidence": [],
    "referenced_incidents": []
  }
}
```

The model must not guess.

---

# 67. GET /copilot/conversations

Returns the user's Copilot conversations.

---

# 68. GET /copilot/conversations/{conversation_id}

Returns messages.

The backend must verify conversation ownership/authorization.

---

# 69. Merchant API

## GET /merchants

Returns merchants available to the authenticated user.

---

# 70. GET /merchants/{merchant_id}

### Response

```json
{
  "data": {
    "id": "uuid",
    "name": "Demo Store",
    "business_type": "ECOMMERCE",
    "status": "ACTIVE",
    "risk_score": 22,
    "risk_level": "LOW",
    "currency": "INR"
  }
}
```

---

# 71. GET /merchants/{merchant_id}/risk

Returns merchant-level risk summary.

---

# 72. GET /merchants/{merchant_id}/metrics

Parameters:

```text
window=15m
```

Response:

```json
{
  "data": {
    "window": "15_MIN",
    "total_transactions": 2140,
    "successful_transactions": 1831,
    "failed_transactions": 309,
    "failure_rate": 0.1444,
    "high_risk_transactions": 27,
    "critical_risk_transactions": 8,
    "open_incidents": 3,
    "revenue_at_risk": 42800000
  }
}
```

---

# 73. Customer API

## GET /customers/{customer_id}

Returns a privacy-safe customer risk profile.

Avoid returning unnecessary raw PII.

### Response

```json
{
  "data": {
    "id": "uuid",
    "merchant_id": "uuid",
    "current_risk_score": 71,
    "current_risk_level": "HIGH",
    "lifetime_transaction_count": 48,
    "failed_transaction_count": 7,
    "historical_avg_amount": 420000,
    "first_seen_at": "...",
    "last_seen_at": "..."
  }
}
```

---

# 74. Razorpay Webhook API

## POST /webhooks/razorpay

Receives Razorpay webhook events.

Normal user JWT authentication is not used.

Security depends on:

```text
Razorpay webhook signature verification
```

Processing flow:

```text
Receive event
      ↓
Read raw request body
      ↓
Verify signature
      ↓
Validate event type
      ↓
Check idempotency
      ↓
Persist webhook event
      ↓
Normalize event
      ↓
Persist/update transaction
      ↓
Trigger risk pipeline
```

---

# 75. Razorpay Webhook Signature

Expected header:

```text
X-Razorpay-Signature
```

The signature must be verified against the configured:

```text
RAZORPAY_WEBHOOK_SECRET
```

Important:

Signature verification must use the original raw request body.

Do not reconstruct JSON before verification.

---

# 76. Invalid Webhook Signature

Return:

```text
400 Bad Request
```

or:

```text
401 Unauthorized
```

Internal error code:

```text
INVALID_WEBHOOK_SIGNATURE
```

Do not process the payload further.

---

# 77. Webhook Success

Once the webhook has been accepted and safely persisted:

```text
200 OK
```

Example:

```json
{
  "status": "accepted"
}
```

Do not perform slow AI analysis before acknowledging the provider webhook.

---

# 78. Duplicate Webhook

Duplicate events must not create duplicate transactions.

Possible internal processing state:

```text
DUPLICATE
```

The webhook endpoint may still safely return:

```text
200 OK
```

to prevent unnecessary retries.

---

# 79. Supported Razorpay Event Types

Initial events may include:

```text
payment.authorized
payment.captured
payment.failed
refund.created
refund.processed
```

Exact mappings will be implemented according to the Razorpay test-mode integration being used.

Unsupported event types should be safely recorded or ignored according to configuration.

---

# 80. Webhook Normalization

Provider payload:

```text
Razorpay-specific schema
```

must be converted into:

```text
PayGuard normalized transaction schema
```

The Risk Engine must not depend directly on the raw Razorpay event structure.

---

# 81. Simulator API

The simulator is a first-class hackathon feature.

Base:

```text
/api/v1/simulator
```

---

# 82. GET /simulator/scenarios

Returns available demo scenarios.

### Response

```json
{
  "data": [
    {
      "id": "normal_traffic",
      "name": "Normal Payment Traffic",
      "description": "Generates healthy baseline payment activity."
    },
    {
      "id": "bank_degradation",
      "name": "UPI Bank Degradation",
      "description": "Creates a sharp UPI failure spike concentrated in one bank."
    },
    {
      "id": "velocity_attack",
      "name": "Velocity Attack",
      "description": "Generates repeated payment attempts across suspicious identities."
    },
    {
      "id": "device_abuse",
      "name": "Shared Device Abuse",
      "description": "Generates multiple customers transacting through the same suspicious device."
    }
  ]
}
```

---

# 83. POST /simulator/scenarios/{scenario_id}/run

Starts a scenario.

### Request

```json
{
  "merchant_id": "uuid",
  "transaction_count": 250,
  "duration_seconds": 60
}
```

### Response

```text
202 Accepted
```

```json
{
  "data": {
    "simulation_id": "uuid",
    "scenario_id": "bank_degradation",
    "status": "RUNNING"
  }
}
```

---

# 84. GET /simulator/runs/{simulation_id}

### Response

```json
{
  "data": {
    "simulation_id": "uuid",
    "scenario_id": "bank_degradation",
    "status": "RUNNING",
    "transactions_generated": 127,
    "target_transactions": 250,
    "started_at": "...",
    "completed_at": null
  }
}
```

---

# 85. POST /simulator/runs/{simulation_id}/stop

Stops a running simulator session.

Development/admin use only.

---

# 86. Demo Scenario — Bank Degradation

Expected simulator behavior:

Normal baseline:

```text
UPI failure rate:
3–5%
```

Then inject:

```text
ABC Bank UPI failure rate:
25–35%
```

Other banks:

```text
Normal
```

Cards:

```text
Normal
```

Expected system result:

```text
Anomaly detected
→ incident created
→ revenue at risk calculated
→ AI investigation generated
→ recommendation shown
```

---

# 87. Audit API

## GET /audit-logs

Recommended roles:

```text
ADMIN
RISK_ANALYST
```

Filters:

```text
action
entity_type
entity_id
user_id
from
to
page
page_size
```

Audit logs are read-only through the normal application API.

---

# 88. Settings API

## GET /settings

Returns safe configurable application settings.

Never return:

```text
AI_API_KEY
JWT_SECRET
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
DATABASE_PASSWORD
```

---

# 89. Frontend API Service Structure

Recommended frontend structure:

```text
frontend/src/services/
│
├── apiClient.ts
├── authApi.ts
├── dashboardApi.ts
├── transactionsApi.ts
├── incidentsApi.ts
├── riskApi.ts
├── alertsApi.ts
├── analyticsApi.ts
├── copilotApi.ts
├── approvalsApi.ts
└── simulatorApi.ts
```

---

# 90. Frontend API Client

All frontend requests should go through one configured API client.

Responsibilities:

```text
Base URL
Authorization header
Request ID handling
Error normalization
Timeout handling
401 handling
```

Do not write raw `fetch()` calls throughout random React components.

---

# 91. API Type Safety

Frontend TypeScript types should mirror backend response schemas.

Example:

```text
Transaction
TransactionRisk
RiskFactor
Incident
Investigation
Recommendation
Alert
DashboardSummary
```

Avoid using:

```text
any
```

for API responses.

---

# 92. Backend Router Structure

Recommended:

```text
backend/app/api/
│
└── v1/
    ├── router.py
    └── endpoints/
```

or module-owned routers registered centrally.

Example:

```text
/app/modules/transactions/router.py
/app/modules/incidents/router.py
```

Main API router:

```python
api_router.include_router(
    transactions.router,
    prefix="/transactions",
    tags=["transactions"]
)
```

---

# 93. API Router Rule

Routers handle:

```text
HTTP request
Validation
Dependency injection
Service invocation
HTTP response
```

Routers must not contain complex risk or business logic.

Correct:

```text
Router
 ↓
Service
 ↓
Repository / Risk Engine
```

Avoid:

```text
Router
 ↓
300 lines of business logic
```

---

# 94. API Validation

Pydantic must validate:

```text
Request bodies
Query parameters
Response structures
Enums
UUIDs
Dates
Amounts
```

Never trust frontend validation alone.

---

# 95. Authorization

Authorization must happen server-side.

Examples:

```text
VIEWER
Read-only
```

```text
OPERATIONS_ANALYST
Read + operational actions
```

```text
RISK_ANALYST
Investigations + approval where permitted
```

```text
ADMIN
Administrative configuration
```

Frontend hiding a button is not security.

---

# 96. Rate Limiting

Potential rate limits:

```text
Login
Copilot
AI investigation
Simulator
Manual transaction ingestion
```

Exact limits will be defined during implementation.

AI endpoints should especially be protected from excessive calls.

---

# 97. Sensitive Data Rules

API responses must avoid exposing:

```text
password_hash
JWT secret
AI provider secret
Razorpay secret
raw access tokens
full sensitive payment credentials
```

Customer identifiers should be minimized or masked where practical.

---

# 98. Logging Rules

API logs may contain:

```text
request_id
route
method
status_code
latency
user_id
merchant_id
```

Avoid logging:

```text
passwords
authorization bearer tokens
API keys
webhook secrets
sensitive raw customer data
```

---

# 99. API Timeout Strategy

Normal REST requests:

```text
Short timeout
```

Long AI operations:

```text
Asynchronous / 202 Accepted
```

Avoid holding HTTP requests open unnecessarily while AI investigation runs.

---

# 100. Background Processing Contract

When API returns:

```text
202 Accepted
```

the frontend should later retrieve status.

Example:

```text
POST /incidents/{id}/investigate
```

returns:

```text
PENDING
```

then frontend may call:

```text
GET /investigations/{id}
```

until:

```text
COMPLETED
FAILED
```

Polling frequency must remain reasonable.

---

# 101. API Error Codes

Core standardized codes:

```text
VALIDATION_ERROR

INVALID_CREDENTIALS
USER_INACTIVE
UNAUTHORIZED
FORBIDDEN

TRANSACTION_NOT_FOUND
DUPLICATE_TRANSACTION
RISK_EVALUATION_FAILED

INCIDENT_NOT_FOUND
INVALID_INCIDENT_STATE_TRANSITION

INVESTIGATION_NOT_FOUND
AI_PROVIDER_TIMEOUT
AI_PROVIDER_UNAVAILABLE
AI_INVALID_RESPONSE

RECOMMENDATION_NOT_FOUND

ALERT_NOT_FOUND

APPROVAL_NOT_FOUND
APPROVAL_ALREADY_REVIEWED
APPROVAL_REQUIRED

MITIGATION_NOT_FOUND
MITIGATION_ALREADY_EXECUTED

INVALID_WEBHOOK_SIGNATURE
DUPLICATE_WEBHOOK_EVENT

RATE_LIMIT_EXCEEDED

INTERNAL_SERVER_ERROR
```

---

# 102. Error Message Rule

Messages should be useful but must not expose internal implementation details.

Correct:

```text
AI investigation is temporarily unavailable.
```

Avoid:

```text
OpenAIClient failed on line 84 due to socket...
```

Stack traces belong only in controlled server logs.

---

# 103. OpenAPI Documentation

FastAPI automatically provides development API documentation.

Development endpoints:

```text
/docs
```

and:

```text
/redoc
```

Production exposure may later be restricted.

---

# 104. API Documentation Rule

Every backend route should define:

```text
Summary
Description
Response model
Status codes
Authentication requirement
```

This keeps generated OpenAPI documentation useful.

---

# 105. Core MVP Endpoint List

The first complete backend should eventually support:

```text
AUTH

POST /auth/login
GET  /auth/me
```

```text
SYSTEM

GET /health
GET /ready
```

```text
DASHBOARD

GET /dashboard
GET /dashboard/risk-distribution
GET /dashboard/payment-methods
```

```text
TRANSACTIONS

POST /transactions
GET  /transactions
GET  /transactions/{id}
GET  /transactions/{id}/risk
GET  /transactions/{id}/risk-factors
```

```text
RISK

GET /risk/summary
GET /risk/rules
```

```text
INCIDENTS

GET   /incidents
GET   /incidents/{id}
GET   /incidents/{id}/transactions
GET   /incidents/{id}/timeline
PATCH /incidents/{id}/status
POST  /incidents/{id}/resolve
```

```text
AI

POST /incidents/{id}/investigate
GET  /incidents/{id}/investigations
GET  /investigations/{id}
```

```text
RECOMMENDATIONS

GET  /incidents/{id}/recommendations
POST /incidents/{id}/recommendations/generate
```

```text
ALERTS

GET  /alerts
POST /alerts/{id}/acknowledge
```

```text
COPILOT

POST /copilot/query
GET  /copilot/conversations
GET  /copilot/conversations/{id}
```

```text
ANALYTICS

GET /analytics/risk
GET /analytics/failures
GET /analytics/payment-methods
GET /analytics/providers
GET /analytics/revenue-at-risk
```

```text
APPROVALS

GET  /approvals
POST /approvals/{id}/approve
POST /approvals/{id}/reject
```

```text
RAZORPAY

POST /webhooks/razorpay
```

```text
SIMULATOR

GET  /simulator/scenarios
POST /simulator/scenarios/{scenario}/run
GET  /simulator/runs/{id}
```

---

# 106. MVP Endpoint Priority

We should not build all endpoints simultaneously.

Implementation order:

```text
1. /health
2. /ready
3. /auth/login
4. /auth/me
5. /transactions
6. /transactions/{id}
7. Risk processing
8. /transactions/{id}/risk
9. /incidents
10. /incidents/{id}
11. /dashboard
12. /alerts
13. AI investigation APIs
14. Recommendation APIs
15. Analytics
16. Copilot
17. Approvals
18. Razorpay webhook
19. Simulator APIs
```

---

# 107. Hackathon Critical APIs

The most important end-to-end demo contract is:

```text
POST /simulator/scenarios/bank_degradation/run
```

which generates transactions.

Then:

```text
POST /transactions
```

internally triggers risk evaluation.

The frontend observes:

```text
GET /dashboard
```

then:

```text
GET /incidents
```

then:

```text
GET /incidents/{id}
```

then:

```text
POST /incidents/{id}/investigate
```

then:

```text
GET /investigations/{id}
```

then:

```text
GET /incidents/{id}/recommendations
```

Finally the analyst can ask:

```text
POST /copilot/query
```

---

# 108. End-to-End Demo API Flow

```text
SIMULATOR
      ↓
POST /transactions
      ↓
Risk Engine
      ↓
Incident Engine
      ↓
GET /dashboard
      ↓
GET /incidents
      ↓
GET /incidents/{id}
      ↓
POST /incidents/{id}/investigate
      ↓
AI Investigation
      ↓
GET /investigations/{id}
      ↓
Recommendation
      ↓
POST /copilot/query
```

---

# 109. Contract Stability Rule

Once frontend development begins, backend response contracts should not be changed casually.

If a schema changes:

```text
1. Update this document
2. Update backend Pydantic schema
3. Update frontend TypeScript type
4. Update tests
```

All four must remain aligned.

---

# 110. API Security Rule Summary

The API must never:

* Trust frontend risk calculations
* Accept privileged state changes without authorization
* Expose private secrets
* Skip webhook verification
* Process duplicate payment events blindly
* Let AI directly invoke sensitive financial actions
* Return raw internal stack traces
* Allow arbitrary sorting/database field access
* Allow cross-merchant data leakage

---

# 111. API Success Criteria

The PayGuard API is successful when:

1. All core resources use stable schemas.
2. Authentication is enforced consistently.
3. Errors use standardized codes.
4. Transaction ingestion is idempotent.
5. Razorpay webhooks are signature-verified.
6. Risk data remains server-generated.
7. Incidents expose full explainable evidence.
8. AI operations fail independently from core payment monitoring.
9. Sensitive actions require authorization and approval.
10. Frontend can consume the API without guessing response shapes.
11. All important actions generate request IDs and audit records.
12. The complete hackathon scenario works through documented API contracts.

---

# 112. Final API Architecture

```text
REACT FRONTEND
      ↓
API CLIENT
      ↓
/api/v1
      ↓
FASTAPI ROUTERS
      ↓
AUTHORIZATION
      ↓
SERVICE LAYER
      ↓
┌───────────────────────────────┐
│ Transaction Service           │
│ Risk Engine                   │
│ Incident Engine               │
│ AI Investigation              │
│ Recommendation Engine         │
│ Analytics                     │
│ Copilot                       │
│ Approval / Mitigation         │
└───────────────────────────────┘
      ↓
POSTGRESQL
```

External payment events enter separately:

```text
RAZORPAY
   ↓
SIGNED WEBHOOK
   ↓
/api/v1/webhooks/razorpay
   ↓
SIGNATURE VERIFICATION
   ↓
NORMALIZATION
   ↓
TRANSACTION PIPELINE
```

The API layer exists to expose PayGuard's capabilities safely and consistently while keeping financial logic, risk intelligence, and AI reasoning inside the backend.
