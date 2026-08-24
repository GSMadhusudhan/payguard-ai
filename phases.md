# PayGuard AI — Implementation Roadmap

## 1. Document Purpose

This document defines the complete implementation roadmap for **PayGuard AI**.

It converts the product architecture into a controlled sequence of development phases.

The roadmap is designed to ensure that:

* Backend foundations are stable before feature development
* Database schema matches the documented architecture
* Risk logic works before AI explanations are added
* AI remains outside the critical payment-processing path
* Simulator traffic goes through the real transaction pipeline
* Frontend consumes real APIs rather than permanent mock data
* Testing happens continuously
* Documentation remains aligned with implementation
* The final Razorpay Buildathon demonstration is reproducible

The project will follow:

```text
SPECIFY
   ↓
BUILD FOUNDATION
   ↓
INGEST PAYMENTS
   ↓
DETECT RISK
   ↓
CREATE INCIDENTS
   ↓
INVESTIGATE WITH AI
   ↓
RECOMMEND ACTION
   ↓
VISUALIZE
   ↓
INTEGRATE RAZORPAY
   ↓
TEST
   ↓
POLISH
   ↓
DEMO
```

---

# 2. Development Philosophy

The most important rule for implementation is:

```text
Working end-to-end flow
>
Large number of unfinished features
```

The core PayGuard flow must work before optional features receive significant effort.

Core loop:

```text
Transaction
    ↓
Feature Extraction
    ↓
Risk Engine
    ↓
Anomaly Detection
    ↓
Incident Correlation
    ↓
Revenue at Risk
    ↓
AI Investigation
    ↓
Recommendation
    ↓
Dashboard
```

---

# 3. Phase Status Convention

Each phase uses one of:

```text
NOT_STARTED
IN_PROGRESS
BLOCKED
COMPLETED
```

A phase should only be marked:

```text
COMPLETED
```

when its completion criteria are satisfied.

---

# 4. Phase Overview

```text
PHASE 0
Product Specification

PHASE 1
Repository & Development Foundation

PHASE 2
FastAPI Backend Foundation

PHASE 3
PostgreSQL & Database Foundation

PHASE 4
Authentication & Security Foundation

PHASE 5
Merchant, Customer & Transaction Core

PHASE 6
Risk Feature Extraction

PHASE 7
Deterministic Risk Rule Engine

PHASE 8
Anomaly Detection & Risk Scoring

PHASE 9
Incident Correlation & Incident Management

PHASE 10
Revenue-at-Risk & Analytics Foundation

PHASE 11
Alerts & Audit Trail

PHASE 12
AI Provider & Investigation Engine

PHASE 13
Recommendation & Approval System

PHASE 14
Transaction Simulator

PHASE 15
React Frontend Foundation

PHASE 16
Dashboard UI

PHASE 17
Transaction Explorer

PHASE 18
Incident Command Center

PHASE 19
Risk Intelligence & Analytics

PHASE 20
AI Risk Copilot

PHASE 21
Approvals & Simulator UI

PHASE 22
Razorpay Test Integration

PHASE 23
Security Hardening

PHASE 24
Automated Testing & Reliability

PHASE 25
UI Polish & Responsive Refinement

PHASE 26
Deployment

PHASE 27
Hackathon Demo Preparation

PHASE 28
Final Documentation & Submission
```

---

# 5. Phase 0 — Product Specification

## Status

```text
IN_PROGRESS
```

## Objective

Lock the product before implementation.

## Documents

```text
PRD.md
architecture.md
design.md
rules.md
phases.md

docs/
├── database-schema.md
├── risk-engine.md
├── ai-system.md
├── api-contract.md
├── security.md
├── testing.md
├── deployment.md
└── demo-flow.md
```

## Already Defined

```text
PRD.md
architecture.md
docs/database-schema.md
docs/risk-engine.md
docs/ai-system.md
docs/api-contract.md
design.md
rules.md
```

## Remaining

```text
phases.md
docs/security.md
docs/testing.md
docs/deployment.md
docs/demo-flow.md
README.md
memory.md
```

## Completion Criteria

Phase 0 is complete when:

* Product scope is clear
* Architecture is defined
* Database entities are defined
* Risk rules are defined
* AI responsibilities are defined
* API contract is defined
* UI direction is defined
* Development rules are defined
* Implementation phases are defined
* Security strategy is documented
* Testing strategy is documented
* Deployment strategy is documented
* Demo flow is documented

---

# 6. Phase 1 — Repository & Development Foundation

## Objective

Prepare the PayGuard project for controlled development.

## Tasks

Create Git repository:

```bash
git init
```

Create root `.gitignore`.

Create project folders if not already present:

```text
frontend/
backend/
ai/
database/
docs/
scripts/
```

Create:

```text
.env.example
```

where appropriate.

Initialize root documentation.

## macOS Check

Before running commands:

```bash
pwd
```

Expected project directory:

```text
payguard-ai
```

If Conda base is active:

```bash
conda deactivate
```

## Git Configuration

Initial branch:

```text
main
```

Initial documentation commit:

```bash
git add .
git commit -m "docs: initialize PayGuard AI architecture"
```

## Completion Criteria

* Git repository initialized
* `.gitignore` exists
* No secrets committed
* Project directory structure is correct
* Documentation committed
* `main` branch clean

---

# 7. Phase 2 — FastAPI Backend Foundation

## Objective

Create a stable FastAPI application before feature logic.

## Start Backend Development Here

This is the exact phase where backend coding begins.

From project root:

```bash
cd backend
```

Create virtual environment:

```bash
python3 -m venv venv
```

Activate:

```bash
source venv/bin/activate
```

Upgrade pip:

```bash
python3 -m pip install --upgrade pip
```

Install only foundation dependencies.

Expected categories:

```text
FastAPI
Uvicorn
Pydantic Settings
SQLAlchemy
Alembic
PostgreSQL driver
Password hashing
JWT
Testing tools
```

Exact versions will be chosen during implementation.

## Initial Backend Structure

```text
backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── enums.py
│   ├── exceptions.py
│   ├── middleware.py
│   ├── logging_config.py
│   ├── security.py
│   │
│   ├── core/
│   ├── utils/
│   └── modules/
│
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

## First Endpoints

Implement:

```text
GET /health
```

then:

```text
GET /ready
```

## Expected Local Server

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## Completion Criteria

* Python virtual environment works
* FastAPI starts successfully
* `/health` returns `200`
* Configuration loads correctly
* Central exception handling exists
* Request ID middleware works
* Basic structured logging works
* No business logic added prematurely

---

# 8. Phase 3 — PostgreSQL & Database Foundation

## Objective

Connect PayGuard to PostgreSQL and establish reliable schema management.

## Tasks

Install/configure PostgreSQL locally.

Default development:

```text
host: localhost
port: 5432
```

Create PayGuard database.

Example:

```text
payguard
```

Configure:

```text
DATABASE_URL
```

Initialize Alembic.

Create SQLAlchemy base.

Create database session management.

Add shared model conventions.

## Initial Migration Strategy

First migrations should cover:

```text
users
merchants
merchant_users
customers
transactions
```

Then:

```text
webhook_events
```

Then risk and incident tables.

## Test

Backend startup should verify database connectivity.

`/ready` should report:

```json
{
  "database": "healthy"
}
```

## Completion Criteria

* PostgreSQL running locally
* Backend connects successfully
* SQLAlchemy session works
* Alembic initialized
* First migration succeeds
* Migration rollback tested
* No manual schema drift

---

# 9. Phase 4 — Authentication & Security Foundation

## Objective

Protect application APIs before sensitive features grow.

## Implement

```text
users
authentication service
password hashing
JWT generation
JWT validation
current-user dependency
role authorization
```

Endpoints:

```text
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

Roles:

```text
ADMIN
RISK_ANALYST
OPERATIONS_ANALYST
VIEWER
```

## Seed Demo User

Create a safe development account.

Never hardcode plaintext passwords in source code.

## Tests

Test:

```text
Correct credentials
Incorrect password
Unknown user
Inactive user
Expired token
Missing token
Invalid token
Forbidden role
```

## Completion Criteria

* Login works
* Password hashing works
* JWT expiry works
* Protected routes reject unauthorized access
* Role dependency exists
* No credentials committed

---

# 10. Phase 5 — Merchant, Customer & Transaction Core

## Objective

Build the factual payment-data foundation.

## Implement Modules

```text
merchants/
customers/
transactions/
```

Each major module:

```text
router.py
schemas.py
models.py
service.py
repository.py
exceptions.py
```

## Transaction Ingestion

Implement:

```text
POST /api/v1/transactions
```

Transaction must be:

```text
Validated
Normalized
Persisted
```

before risk processing.

## Implement

```text
GET /api/v1/transactions
GET /api/v1/transactions/{id}
```

## Critical Rules

* Amount uses smallest currency unit
* Duplicate payment detection
* Server owns timestamps where appropriate
* Risk fields cannot be supplied as authoritative frontend data
* Customer history updated safely
* Transaction remains stored even if later AI processing fails

## Completion Criteria

A valid transaction can:

```text
POST
↓
Validate
↓
Persist
↓
Retrieve
```

without any Risk Engine yet.

---

# 11. Phase 6 — Risk Feature Extraction

## Objective

Convert raw transaction data into structured risk evidence.

## Create

```text
backend/app/modules/risk/features/
```

Implement:

```text
RiskFeatures schema
FeatureExtractor
Historical queries
Velocity queries
Customer baseline
Merchant baseline
Bank/provider baseline
```

Initial features:

```text
transaction_amount
customer_average_amount
amount_ratio
transactions_last_60_seconds
transactions_last_10_minutes
failed_attempts_last_10_minutes
is_new_device
merchant_failure_rate
bank_failure_rate
payment_method_failure_rate
historical baselines
```

## Cold Start

When customer history is insufficient:

```text
Customer baseline unavailable
↓
Use merchant/global baseline
```

Never invent historical data.

## Completion Criteria

Given a transaction, feature extraction returns a valid deterministic `RiskFeatures` object.

---

# 12. Phase 7 — Deterministic Risk Rule Engine

## Objective

Implement the core explainable risk intelligence.

## First Rules

Implement:

```text
R001 HIGH_AMOUNT
R002 EXTREME_AMOUNT

R003 HIGH_VELOCITY
R004 EXTREME_VELOCITY

R005 REPEATED_FAILURES

R006 NEW_DEVICE
```

Then:

```text
R007 DEVICE_MULTI_CUSTOMER
R008 NEW_LOCATION
R009 RAPID_LOCATION_CHANGE
R010 CUSTOMER_RISK_HISTORY
R011 BANK_FAILURE_SPIKE
R012 PAYMENT_METHOD_FAILURE_SPIKE
R013 MERCHANT_FAILURE_SPIKE
R014 REFUND_PATTERN
R015 DUPLICATE_PAYMENT_PATTERN
```

## Architecture

```text
RiskFeatures
    ↓
Rule Engine
    ↓
RuleResult[]
```

Each result:

```text
rule_code
matched
score
severity
group
reason
evidence
```

## Rule Grouping

Implement strongest-rule behavior.

Example:

```text
HIGH_AMOUNT = +15
EXTREME_AMOUNT = +25
```

Result:

```text
25
```

not:

```text
40
```

## Tests

Every rule:

```text
Below threshold
At threshold
Above threshold
Missing data
Cold-start
Group conflict
```

## Completion Criteria

Risk rules produce deterministic explainable results.

---

# 13. Phase 8 — Anomaly Detection & Risk Scoring

## Objective

Combine deterministic risk with statistical deviations.

## Implement

```text
Rolling baselines
Ratio-to-baseline
Failure-rate anomalies
Basic Z-score
Amount anomaly
Velocity anomaly
```

## Component Caps

```text
Rule Score       <= 70
Anomaly Score    <= 20
Contextual Score <= 10
```

## Final Calculation

```text
final_score =
min(
  100,
  rule_score
  + anomaly_score
  + contextual_score
)
```

## Classification

```text
0–29   LOW
30–59  MEDIUM
60–79  HIGH
80–100 CRITICAL
```

## Persist

```text
risk_scores
risk_factors
rule_executions
anomaly_signals
```

## Implement API

```text
GET /transactions/{id}/risk
GET /transactions/{id}/risk-factors
GET /risk/summary
```

## Major Milestone

At the end of Phase 8:

```text
Transaction
    ↓
Risk Features
    ↓
Rules
    ↓
Anomalies
    ↓
Risk Score
    ↓
Risk Factors
```

must work completely without AI.

## Completion Criteria

* Score reproducible
* Score never above 100
* Factors persisted
* APIs expose results
* Boundary tests pass

---

# 14. Phase 9 — Incident Correlation & Management

## Objective

Turn related risk signals into meaningful operational incidents.

## Implement

```text
incidents
incident_transactions
incident_events
```

## First Incident Types

```text
HIGH_RISK_TRANSACTION
PAYMENT_FAILURE_SPIKE
BANK_DEGRADATION
PAYMENT_METHOD_DEGRADATION
VELOCITY_ATTACK
FRAUD_PATTERN
```

## Correlation

Group related transactions using:

```text
incident_type
payment_method
bank
merchant
failure code
time window
```

Avoid:

```text
300 failed payments
=
300 incidents
```

Prefer:

```text
300 related failed payments
=
1 incident
```

## Lifecycle

```text
DETECTED
↓
INVESTIGATING
↓
ACTION_RECOMMENDED
↓
MONITORING
↓
RESOLVED
```

Possible:

```text
ESCALATED
```

## APIs

```text
GET /incidents
GET /incidents/{id}
GET /incidents/{id}/transactions
GET /incidents/{id}/timeline
PATCH /incidents/{id}/status
POST /incidents/{id}/resolve
```

## Completion Criteria

A transaction pattern can automatically create or update a real incident.

---

# 15. Phase 10 — Revenue-at-Risk & Analytics Foundation

## Objective

Translate technical incidents into financial impact.

## Implement

```text
RevenueRiskService
```

Initial deterministic calculation should use:

```text
Affected payment value
Failed amount
Incident status
Configured recovery assumptions
```

Avoid pretending the estimate is exact.

## Dashboard Aggregations

Implement:

```text
Transactions monitored
Success rate
Failure rate
Critical transactions
Open incidents
Critical incidents
Revenue at risk
Risk distribution
Payment method health
Provider health
```

## APIs

```text
GET /dashboard
GET /dashboard/risk-distribution
GET /dashboard/payment-methods

GET /analytics/risk
GET /analytics/failures
GET /analytics/payment-methods
GET /analytics/providers
GET /analytics/revenue-at-risk
```

## Completion Criteria

Backend can already answer:

```text
What is happening?
How risky is it?
How much money is affected?
```

without AI.

---

# 16. Phase 11 — Alerts & Audit Trail

## Objective

Make important events observable and traceable.

## Implement

```text
alerts
audit_logs
system_events
```

Create alerts for:

```text
Critical transaction
Failure spike
Bank degradation
Critical incident
Risk pipeline failure
```

## Audit

Track:

```text
LOGIN
TRANSACTION_INGESTED
RISK_SCORE_CREATED
INCIDENT_CREATED
INCIDENT_STATUS_CHANGED
```

Later:

```text
AI_INVESTIGATION_COMPLETED
APPROVAL_GRANTED
MITIGATION_EXECUTED
```

## APIs

```text
GET /alerts
POST /alerts/{id}/acknowledge
GET /audit-logs
```

## Completion Criteria

Major system actions are traceable.

---

# 17. Phase 12 — AI Provider & Investigation Engine

## Objective

Add AI intelligence only after deterministic evidence works.

## Start AI Coding Here

Do not begin AI implementation before the Risk Engine and Incident Engine are functioning.

## Implement

```text
AIProvider abstraction
Provider factory
Provider client
AI schemas
Context Builder
Prompt Builder
Investigation service
Output validator
Retry handling
Failure isolation
```

## AI Context

Use:

```text
Incident facts
Risk factors
Anomaly signals
Historical baseline
Current payment metrics
Representative transactions
Revenue at risk
```

## Output

```text
summary
likely_root_cause
confidence
evidence
alternative_explanations
uncertainties
recommended_next_checks
```

## API

```text
POST /incidents/{id}/investigate
GET  /incidents/{id}/investigations
GET  /investigations/{id}
```

## Failure Test

Disconnect AI provider.

Expected:

```text
Transactions ✅
Risk Engine ✅
Incidents ✅
Dashboard ✅
AI Investigation ❌
```

## Completion Criteria

An incident can produce a validated evidence-grounded AI investigation.

---

# 18. Phase 13 — Recommendation & Approval System

## Objective

Convert investigation into controlled action.

## Implement

```text
recommendations
approval_requests
mitigation_actions
```

## Recommendation Types

Initial:

```text
INCREASE_MONITORING
MONITOR_PROVIDER
PROMOTE_ALTERNATE_PAYMENT_METHOD
ESCALATE_INCIDENT
REVIEW_HIGH_RISK_TRANSACTIONS
REQUEST_ADDITIONAL_VERIFICATION
RATE_LIMIT_PATTERN
```

## Approval Boundary

Safe:

```text
Alert
Monitor
Recommend
Report
```

Sensitive:

```text
Rate limit
Block
Freeze
Disable
Change limits
Change routing
```

require approval.

## Demo Mode

High-impact actions:

```text
SIMULATED
```

## APIs

```text
GET  /incidents/{id}/recommendations
POST /incidents/{id}/recommendations/generate

GET  /approvals
POST /approvals/{id}/approve
POST /approvals/{id}/reject
```

## Completion Criteria

AI can recommend but cannot directly execute a sensitive action.

---

# 19. Phase 14 — Transaction Simulator

## Objective

Create deterministic demo traffic using the real PayGuard pipeline.

## Critical Rule

Simulator must call:

```text
Transaction Ingestion
```

It must not write fake dashboard metrics directly.

## Scenarios

Build in this order:

```text
1. Normal Traffic

2. Bank Degradation

3. Velocity Attack

4. Shared Device Abuse

5. Duplicate Payments

6. Refund Spike
```

## Primary Scenario

```text
bank_degradation
```

Baseline:

```text
UPI failure:
3–5%
```

Attack/degradation:

```text
ABC Bank UPI failure:
25–35%
```

Others:

```text
Normal
```

Expected:

```text
BANK_FAILURE_SPIKE
↓
Incident
↓
Revenue at Risk
↓
AI Investigation
↓
Recommendation
```

## APIs

```text
GET  /simulator/scenarios
POST /simulator/scenarios/{id}/run
GET  /simulator/runs/{id}
POST /simulator/runs/{id}/stop
```

## Major Backend Milestone

After Phase 14, this should work:

```text
Run Simulation
       ↓
Transactions Generated
       ↓
Risk Engine
       ↓
Anomaly
       ↓
Incident
       ↓
Revenue at Risk
       ↓
AI Investigation
       ↓
Recommendation
```

without any frontend.

## Completion Criteria

Entire intelligence loop can be demonstrated through Swagger/API.

---

# 20. Phase 15 — React Frontend Foundation

## Objective

Start the frontend only after core backend APIs are usable.

## Start React Development Here

This is the exact phase where the React frontend begins.

From project root:

```bash
cd frontend
```

We will initialize:

```text
React
TypeScript
Vite
```

Then install required frontend libraries.

## Initial Architecture

```text
src/
├── app/
├── components/
├── features/
├── hooks/
├── pages/
├── router/
├── services/
├── store/
├── styles/
├── types/
└── utils/
```

## Implement First

```text
Design tokens
API client
Router
App shell
Sidebar
Header
Authentication state
Protected routes
Error boundary
```

## Routes

```text
/login
/dashboard
/transactions
/incidents
/risk
/analytics
/alerts
/copilot
/approvals
/simulator
/settings
```

## Completion Criteria

* React starts
* TypeScript works
* App shell renders
* Login route exists
* Backend API client connects
* Protected routes work

---

# 21. Phase 16 — Dashboard UI

## Objective

Build the central PayGuard command center using real APIs.

## Implement

```text
Payment Health
Transactions Monitored
Success Rate
Failure Rate
Revenue at Risk
Open Incidents
Critical Incidents
Critical Transactions
Risk Distribution
Failure Trend
Payment Method Health
Provider Health
Recent Alerts
```

## Data Rule

Use real:

```text
GET /dashboard
```

and analytics APIs.

Do not permanently hardcode values.

## Completion Criteria

Dashboard visibly reacts when simulator generates a bank-degradation incident.

---

# 22. Phase 17 — Transaction Explorer

## Objective

Expose transaction-level evidence.

## Build

```text
Transaction list
Search
Filters
Pagination
Sorting
Risk badges
Status badges
```

Detail:

```text
Payment data
Risk score
Rule score
Anomaly score
Context score
Risk factors
Evidence
Related incidents
```

## Routes

```text
/transactions
/transactions/:transactionId
```

## Completion Criteria

User can move:

```text
Dashboard
→ Transaction
→ Risk Evidence
```

---

# 23. Phase 18 — Incident Command Center

## Objective

Build the strongest demonstration page.

## Incident List

Show:

```text
Severity
Status
Risk score
Affected transactions
Revenue at risk
Started
```

## Incident Detail

Show:

```text
Incident header
Impact metrics
Failure trend
Historical baseline
AI Investigation
Confidence
Evidence
Uncertainty
Affected transactions
Recommendation
Timeline
```

## Critical Demo Page

This should become one of the most visually polished pages in PayGuard.

## Completion Criteria

A judge can understand the incident without needing backend knowledge.

---

# 24. Phase 19 — Risk Intelligence & Analytics

## Objective

Expose how PayGuard reasons.

## Risk Page

```text
Risk distribution
Top risk factors
Active anomaly signals
Risk rules
High-risk entities
```

## Analytics

```text
Failure trend
Risk trend
Provider performance
Payment method performance
Revenue at risk trend
Incident frequency
```

## Completion Criteria

Risk metrics reflect real backend aggregation.

---

# 25. Phase 20 — AI Risk Copilot

## Objective

Allow natural-language investigation over real PayGuard data.

## Implement Backend First

```text
Intent detection
Entity extraction
Authorization
Data retrieval
Context building
AI response validation
Conversation storage
```

## Frontend

Route:

```text
/copilot
```

Suggested questions:

```text
Why are UPI payments failing?

Which provider has the highest failure rate?

What is our current revenue at risk?

Why is transaction X critical?

Show active critical incidents.
```

## Evidence

Every important response should expose relevant evidence.

## Completion Criteria

The Copilot answers using actual PayGuard system state instead of generic model knowledge.

---

# 26. Phase 21 — Approvals & Simulator UI

## Objective

Expose human control and live demo capabilities.

## Approvals

Build:

```text
Pending approvals
Recommendation context
Reason
Impact
Approve
Reject
Audit state
```

## Simulator

Build:

```text
Scenario cards
Run scenario
Progress
Detected signals
Active incidents
Stop scenario
View generated incident
```

## Primary Demo Action

```text
Run UPI Bank Degradation
```

## Completion Criteria

User can launch the main demo entirely from the UI.

---

# 27. Phase 22 — Razorpay Test Integration

## Objective

Connect PayGuard to genuine Razorpay test-mode events.

## Important

Simulator remains available even after Razorpay integration.

## Implement

```text
Webhook endpoint
Raw request body
Signature verification
Idempotency
Event persistence
Normalization
Transaction ingestion
```

Endpoint:

```text
POST /api/v1/webhooks/razorpay
```

## Initial Events

Support relevant events such as:

```text
payment.authorized
payment.captured
payment.failed
refund.created
refund.processed
```

based on the Razorpay integration actually used.

## Test

```text
Valid signature
Invalid signature
Duplicate event
Unsupported event
Failed normalization
Successful transaction ingestion
```

## Completion Criteria

A Razorpay test event can enter the same Risk Engine used by simulator traffic.

---

# 28. Phase 23 — Security Hardening

## Objective

Review the entire application before deployment.

## Review

```text
Authentication
Authorization
CORS
Secrets
Environment variables
Password hashing
JWT expiry
Webhook verification
Input validation
AI data minimization
PII masking
Audit logging
Rate limiting
Error messages
Logging safety
```

## Verify

No:

```text
API secrets
JWT secret
DB password
Razorpay secret
AI secret
```

appear in:

```text
Git
Frontend bundle
Logs
Screenshots
Demo output
```

## Completion Criteria

Security checklist in:

```text
docs/security.md
```

passes.

---

# 29. Phase 24 — Automated Testing & Reliability

## Objective

Make the product dependable before final polish.

## Unit Tests

```text
Risk classifier
Risk rules
Risk grouping
Anomaly calculations
Revenue-at-risk
Incident correlation
State transitions
```

## Integration Tests

```text
Transaction → Risk
Risk → Incident
Incident → AI
Recommendation → Approval
Webhook → Transaction
Simulator → Incident
```

## API Tests

```text
Auth
Transactions
Incidents
Alerts
Copilot
Approvals
Simulator
Webhook
```

## Failure Tests

```text
Database unavailable
AI unavailable
Malformed AI output
Duplicate webhook
Duplicate transaction
Invalid JWT
Forbidden role
```

## Completion Criteria

Critical tests pass consistently.

---

# 30. Phase 25 — UI Polish & Responsive Refinement

## Objective

Make PayGuard feel premium.

Only start deep visual refinement after core flows work.

## Review

```text
Spacing
Typography
Dark surfaces
Borders
Risk colors
AI panels
Charts
Tables
Empty states
Loading states
Error states
Responsive layouts
Hover states
Focus states
Motion
```

## Important

Do not redesign backend behavior during UI polish unless a genuine issue is discovered.

## Completion Criteria

No page should appear unfinished or template-like.

---

# 31. Phase 26 — Deployment

## Objective

Deploy a stable demonstration environment.

## Components

```text
Frontend
Backend
PostgreSQL
Environment configuration
AI provider configuration
Razorpay webhook URL
```

Deployment platform will be selected based on reliability and buildathon constraints.

## Before Deployment

Run:

```text
Backend tests
Frontend build
TypeScript check
Lint
Migration
Health check
```

## Completion Criteria

Public/test environment works without depending on developer laptop state.

---

# 32. Phase 27 — Hackathon Demo Preparation

## Objective

Create a reliable judge-facing demonstration.

## Primary Demo

Start:

```text
Dashboard
```

Show:

```text
Payment Health: Healthy
Revenue at Risk: Low
No critical incident
```

Then:

```text
Simulator
```

Run:

```text
UPI Bank Degradation
```

Observe:

```text
Failure spike
```

Then dashboard changes.

Open:

```text
Critical Incident
```

Show:

```text
Risk Score
Affected Transactions
Revenue at Risk
Historical Baseline
```

Then:

```text
AI Investigation
```

Show:

```text
Likely Root Cause
Confidence
Evidence
Uncertainty
```

Then:

```text
Recommendation
```

Finally open:

```text
AI Risk Copilot
```

Ask:

```text
Why are UPI payments failing?
```

## Completion Criteria

Demo is reproducible three times consecutively without manual database repair.

---

# 33. Phase 28 — Final Documentation & Submission

## Objective

Prepare project for judges/reviewers.

## Final README

Must include:

```text
Product overview
Problem
Solution
Architecture
Key features
Tech stack
Risk Engine
AI architecture
Security boundaries
How to run
Environment configuration
Simulator
Razorpay integration
Demo flow
Project structure
Screenshots
Future work
```

## Verify Documentation

```text
PRD.md
architecture.md
design.md
rules.md
phases.md
memory.md

docs/
├── api-contract.md
├── database-schema.md
├── ai-system.md
├── risk-engine.md
├── security.md
├── testing.md
├── deployment.md
└── demo-flow.md
```

## Submission Assets

Prepare:

```text
GitHub repository
README
Demo URL
Demo video
Architecture diagram
Screenshots
Buildathon description
Feature summary
```

## Completion Criteria

A reviewer can understand and run the project without asking the developer for basic setup information.

---

# 34. Development Milestones

## Milestone 1 — Backend Alive

Target phases:

```text
1–3
```

Result:

```text
FastAPI
+
PostgreSQL
+
Health checks
```

---

# 35. Milestone 2 — Payments Work

Target:

```text
Phases 4–5
```

Result:

```text
Authentication
+
Transaction ingestion
+
Persistence
```

---

# 36. Milestone 3 — Risk Intelligence Works

Target:

```text
Phases 6–8
```

Result:

```text
Features
+
Rules
+
Anomalies
+
Risk Score
+
Explainability
```

This is one of the most important milestones.

---

# 37. Milestone 4 — Operational Intelligence Works

Target:

```text
Phases 9–11
```

Result:

```text
Incidents
+
Revenue at Risk
+
Alerts
+
Audit
```

---

# 38. Milestone 5 — AI Intelligence Works

Target:

```text
Phases 12–13
```

Result:

```text
AI Investigation
+
Evidence
+
Confidence
+
Recommendations
+
Approval Boundary
```

---

# 39. Milestone 6 — Demo Engine Works

Target:

```text
Phase 14
```

Result:

```text
Deterministic simulator
+
End-to-end backend demonstration
```

At this point the most important backend system is complete.

---

# 40. Milestone 7 — Product UI Works

Target:

```text
Phases 15–21
```

Result:

```text
Premium PayGuard interface
+
Real backend integration
+
Copilot
+
Simulator
```

---

# 41. Milestone 8 — Razorpay Connected

Target:

```text
Phase 22
```

Result:

```text
Razorpay Test Events
→
PayGuard
```

---

# 42. Milestone 9 — Buildathon Ready

Target:

```text
Phases 23–28
```

Result:

```text
Secure
Tested
Polished
Deployed
Documented
Demo-ready
```

---

# 43. What We Must Not Do Too Early

Do not prioritize these before the core loop works:

```text
Advanced ML model training

Graph databases

Kafka

Microservices

Kubernetes

Multi-agent AI

Perfect mobile UI

Light theme

Complex role management

Massive notification system

Advanced merchant configuration
```

They may be future improvements.

---

# 44. Critical Path

The shortest path to a strong PayGuard demo is:

```text
FastAPI
  ↓
PostgreSQL
  ↓
Transaction Ingestion
  ↓
Risk Features
  ↓
Risk Rules
  ↓
Risk Score
  ↓
Incident
  ↓
Revenue at Risk
  ↓
AI Investigation
  ↓
Simulator
  ↓
Dashboard
  ↓
Incident UI
  ↓
Copilot
```

If schedule pressure occurs, protect this path first.

---

# 45. Feature Priority Classification

## P0 — Mandatory

```text
Transaction ingestion
Risk Engine
Risk factors
Anomaly detection
Incidents
Revenue at risk
AI investigation
Simulator
Dashboard
Incident detail
```

---

# 46. P1 — Strongly Desired

```text
Alerts
Analytics
AI Copilot
Recommendations
Approval simulation
Razorpay webhook
Transaction Explorer
```

---

# 47. P2 — Optional Enhancement

```text
Advanced settings
Full rule editor
Advanced fraud graph
Real-time WebSockets
Complex notifications
Multiple AI agents
Merchant customization
```

---

# 48. Testing Gate

Before moving between major milestones:

```text
Relevant automated tests pass
No known data corruption
No secret leakage
Documentation matches implementation
Critical APIs behave correctly
```

---

# 49. UI Gate

A page is not complete until it has:

```text
Loading state
Success state
Empty state
Error state
Responsive behavior
Correct API integration
No console errors
```

---

# 50. Backend Gate

A backend feature is not complete until:

```text
Schema exists
Service exists
Persistence works
Validation exists
Errors handled
Tests exist
API contract matches
```

where applicable.

---

# 51. Risk Engine Gate

Risk functionality is not complete until:

```text
Deterministic
Explainable
Versioned
Tested
Persisted
Bounded 0–100
```

---

# 52. AI Gate

AI functionality is not complete until:

```text
Context controlled
Output structured
Output validated
Evidence grounded
Failure isolated
Retry bounded
Prompt versioned
```

---

# 53. Razorpay Gate

Razorpay integration is not complete until:

```text
Signature verified
Duplicate-safe
Normalized
Persisted
Risk pipeline triggered
Errors handled
```

---

# 54. Demo Gate

Do not consider the project demo-ready until this flow succeeds:

```text
Reset Demo
↓
Normal Traffic
↓
Run Bank Degradation
↓
Failure Spike
↓
Risk Signal
↓
Incident
↓
Revenue at Risk
↓
AI Investigation
↓
Recommendation
↓
Copilot Query
```

three consecutive times.

---

# 55. Recommended Work Discipline

During coding, work in small verified increments.

Example:

```text
Create one module
↓
Run it
↓
Test it
↓
Commit it
↓
Continue
```

Avoid implementing five large systems before running anything.

---

# 56. Recommended Commit Progression

Examples:

```text
chore: initialize FastAPI backend

feat: add PostgreSQL database configuration

feat: add transaction ingestion

feat: implement amount risk rules

feat: implement transaction velocity rules

feat: add anomaly scoring

feat: add incident correlation

feat: calculate revenue at risk

feat: add AI investigation engine

feat: add bank degradation simulator

feat: initialize React dashboard

feat: add incident investigation UI
```

---

# 57. Documentation Update Points

After each major phase:

Update:

```text
memory.md
```

and any affected technical document.

Example:

After Phase 8:

```text
docs/risk-engine.md
```

must match actual implementation.

---

# 58. memory.md Workflow

At the end of each work session, record:

```text
Current Phase

Completed Today

Working Features

Known Issues

Important Decisions

Next Exact Task
```

Do not place secrets in `memory.md`.

---

# 59. Current Project Position

At the time this roadmap is created:

```text
Phase 0
Product Specification
```

is active.

Implementation has intentionally not started yet.

This is expected.

---

# 60. Immediate Next Steps

Finish remaining Phase 0 documents:

```text
1. phases.md

2. docs/security.md

3. docs/testing.md

4. docs/deployment.md

5. docs/demo-flow.md

6. README.md

7. memory.md
```

Then move to:

```text
PHASE 1
Repository & Development Foundation
```

After that:

```text
PHASE 2
FastAPI Backend Foundation
```

This is where actual backend coding begins.

---

# 61. Final Roadmap Principle

PayGuard AI should evolve in this order:

```text
UNDERSTAND THE PROBLEM
        ↓
DESIGN THE SYSTEM
        ↓
BUILD THE DATA FOUNDATION
        ↓
BUILD DETERMINISTIC RISK
        ↓
BUILD INCIDENT INTELLIGENCE
        ↓
ADD AI
        ↓
BUILD THE DEMO ENGINE
        ↓
BUILD THE PRODUCT UI
        ↓
CONNECT RAZORPAY
        ↓
SECURE
        ↓
TEST
        ↓
POLISH
        ↓
DEPLOY
        ↓
DEMONSTRATE
```

Following this order minimizes rework and keeps the project focused on a working, explainable, high-quality AI Risk Manager rather than a collection of disconnected features.
