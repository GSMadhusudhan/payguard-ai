# PayGuard AI — Project Memory

## 1. Project Identity

**Project:** PayGuard AI
**Tagline:** Autonomous AI Risk Manager for Digital Payments
**Buildathon:** Razorpay Buildathon
**Track:** Track 2 — AI Risk Manager

---

# 2. Product Goal

PayGuard AI continuously monitors payment activity and helps payment operations teams:

```text
Detect Risk
    ↓
Identify Anomalies
    ↓
Correlate Incidents
    ↓
Measure Financial Exposure
    ↓
Investigate Root Cause
    ↓
Recommend Actions
    ↓
Require Human Approval Where Necessary
    ↓
Monitor Recovery
```

PayGuard is not a generic fraud classifier.

It handles both:

```text
Transaction / Customer Risk
```

and:

```text
Payment Infrastructure Risk
```

such as bank or payment-method degradation.

---

# 3. Current Phase

```text
PHASE 0 — PRODUCT SPECIFICATION
```

Status:

```text
COMPLETED
```

Date completed:

```text
24 August 2026
```

Actual implementation has not started yet.

This is intentional.

---

# 4. Completed Documentation

The following documents are complete:

```text
README.md

PRD.md

architecture.md

design.md

rules.md

phases.md

memory.md
```

Inside:

```text
docs/
```

complete:

```text
api-contract.md

database-schema.md

ai-system.md

risk-engine.md

security.md

testing.md

deployment.md

demo-flow.md
```

---

# 5. Locked Technology Stack

## Frontend

```text
React
TypeScript
Vite
Tailwind CSS
React Router
TanStack Query
Recharts
Lucide React
```

## Backend

```text
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
Uvicorn
```

## Database

```text
PostgreSQL
```

## AI

Provider-independent configuration:

```text
AI_PROVIDER
AI_API_KEY
AI_MODEL
```

## Payment Integration

```text
Razorpay Test Mode
Razorpay Webhooks
```

---

# 6. Architecture Decision

Initial backend architecture:

```text
MODULAR MONOLITH
```

Do not introduce microservices unless a real requirement appears.

Primary system flow:

```text
Razorpay / Simulator
        ↓
Transaction Ingestion
        ↓
Validation & Normalization
        ↓
PostgreSQL
        ↓
Feature Extraction
        ↓
Rules + Anomaly Detection
        ↓
Risk Scoring
        ↓
Incident Correlation
        ↓
Revenue at Risk
        ↓
AI Investigation
        ↓
Recommendation
        ↓
Approval
        ↓
Dashboard / Copilot
```

---

# 7. Critical AI Boundary

The AI is not the source of truth.

Correct architecture:

```text
Transaction Facts
        ↓
Deterministic Risk Engine
        ↓
Structured Evidence
        ↓
AI Investigation
```

AI may:

```text
Investigate
Explain
Summarize
Recommend
Answer questions
```

AI may not:

```text
Generate official risk scores

Modify transaction facts

Invent evidence

Invent official revenue-at-risk values

Bypass authorization

Directly execute sensitive financial actions
```

---

# 8. Risk Engine Decision

Final transaction risk score:

```text
Rule Score        ≤ 70
Anomaly Score     ≤ 20
Contextual Score  ≤ 10
```

Formula:

```text
Final Score =
min(
    100,
    Rule Score
    + Anomaly Score
    + Contextual Score
)
```

Classification:

```text
0–29
LOW

30–59
MEDIUM

60–79
HIGH

80–100
CRITICAL
```

---

# 9. Core Risk Rules

Planned initial rules:

```text
HIGH_AMOUNT

EXTREME_AMOUNT

HIGH_VELOCITY

EXTREME_VELOCITY

REPEATED_FAILURES

NEW_DEVICE

DEVICE_MULTI_CUSTOMER

NEW_LOCATION

RAPID_LOCATION_CHANGE

CUSTOMER_RISK_HISTORY

BANK_FAILURE_SPIKE

PAYMENT_METHOD_FAILURE_SPIKE

MERCHANT_FAILURE_SPIKE

REFUND_PATTERN

DUPLICATE_PAYMENT_PATTERN
```

Rules from the same risk group must use the strongest match instead of blindly stacking.

---

# 10. Incident Architecture

Primary incident lifecycle:

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

Alternative:

```text
ESCALATED
```

Related transactions should be correlated into incidents.

Example:

```text
342 related UPI failures
```

should become approximately:

```text
1 meaningful incident
```

rather than hundreds of duplicate alerts.

---

# 11. Primary Demo Scenario

Main Buildathon scenario:

```text
UPI BANK DEGRADATION
```

Synthetic provider:

```text
ABC Bank
```

Healthy baseline:

```text
UPI failure rate:
3–5%
```

Injected degradation:

```text
ABC Bank UPI failure rate:
25–35%
```

Expected outcome:

```text
BANK_FAILURE_SPIKE
        ↓
PAYMENT_METHOD_FAILURE_SPIKE
        ↓
CRITICAL INCIDENT
        ↓
Revenue at Risk
        ↓
AI Investigation
        ↓
Recommendation
```

---

# 12. Primary Demo Story

```text
Healthy Dashboard
        ↓
Run Bank Degradation Simulator
        ↓
Failure Rate Increases
        ↓
Payment Health Drops
        ↓
Critical Incident Appears
        ↓
Open Incident
        ↓
Show Deterministic Evidence
        ↓
Show Revenue at Risk
        ↓
Show AI Investigation
        ↓
Show Recommendation
        ↓
Ask Copilot:
"Why are UPI payments failing?"
```

---

# 13. Simulator Rule

The simulator must never fake dashboard values.

Correct:

```text
Simulator
    ↓
Generate Transactions
    ↓
Normal Transaction Ingestion
    ↓
Risk Engine
    ↓
Incident Engine
```

Incorrect:

```text
Simulator
    ↓
Hardcoded dashboard numbers
```

---

# 14. Razorpay Integration Rule

Razorpay webhook processing:

```text
Receive Raw Body
        ↓
Verify X-Razorpay-Signature
        ↓
Check Idempotency
        ↓
Persist Event
        ↓
Normalize
        ↓
Transaction Pipeline
```

Webhook signature verification must use the original raw request bytes.

Duplicate webhook events must not duplicate financial state.

---

# 15. Financial Data Rule

Never use floating-point numbers for authoritative money values.

Store:

```text
BIGINT
```

in smallest currency unit.

Example:

```text
₹50,000
=
5,000,000 paise
```

---

# 16. Human Approval Boundary

Safe automatic actions may include:

```text
Create incident

Generate alert

Run investigation

Generate recommendation

Increase monitoring
```

Sensitive actions require human approval.

Examples:

```text
Block account

Freeze merchant

Change limits

Disable payment method

Change routing

Rate-limit payment access
```

During the Buildathon, high-impact actions should use:

```text
SIMULATED
```

execution mode.

---

# 17. Security Decisions

Mandatory:

```text
Password hashing

JWT authentication

Server-side authorization

Merchant isolation

Pydantic validation

Backend-only secrets

Razorpay signature verification

Webhook idempotency

PII minimization

AI structured output validation

Audit logging

Human approval for sensitive actions
```

Never commit:

```text
.env
API keys
JWT secrets
Database passwords
Razorpay secrets
AI secrets
```

---

# 18. UI Direction

Primary visual direction:

```text
Dark Fintech Operations Interface
```

Design goals:

```text
Premium
Technical
Calm
Precise
Data-driven
Enterprise-ready
```

Primary pages:

```text
Dashboard

Transactions

Incidents

Risk Intelligence

Analytics

Alerts

AI Copilot

Approvals

Simulator

Settings
```

AI-generated content must be visually labelled separately from deterministic facts.

---

# 19. Development Environment

Development machine:

```text
macOS
```

Shell:

```text
zsh
```

Editor:

```text
VS Code
```

The terminal may currently show:

```text
(base)
```

because Conda base is active.

Before Python backend setup:

```bash
conda deactivate
```

Then create project environment later with:

```bash
python3 -m venv venv
source venv/bin/activate
```

Do not install backend dependencies before Phase 2.

---

# 20. Local Development Ports

Planned:

```text
Frontend
localhost:5173

Backend
localhost:8000

PostgreSQL
localhost:5432
```

---

# 21. Immediate Next Phase

Next:

```text
PHASE 1 — REPOSITORY & DEVELOPMENT FOUNDATION
```

Objectives:

```text
Verify project directory

Initialize Git

Create .gitignore

Check documentation files

Create safe environment example structure

Make first documentation commit
```

No FastAPI package installation yet.

---

# 22. Exact Next Task

From the project root, the next work session should begin with:

```bash
pwd
```

Then verify files:

```bash
ls
```

Then initialize Git if not already initialized:

```bash
git init
```

After that, create:

```text
.gitignore
```

and prepare the initial repository structure.

---

# 23. Phase After That

After Phase 1:

```text
PHASE 2 — FASTAPI BACKEND FOUNDATION
```

That is where actual backend coding starts.

Expected initial work:

```text
Deactivate Conda base

Create backend virtual environment

Install foundation dependencies

Create FastAPI structure

Add configuration

Add request ID middleware

Add structured logging

Implement /health

Implement /ready
```

---

# 24. Important Development Discipline

Work in this order:

```text
One Small Step
      ↓
Run
      ↓
Verify
      ↓
Test
      ↓
Commit
      ↓
Continue
```

Do not make many unrelated changes simultaneously.

---

# 25. P0 Product Priority

Protect this path above optional features:

```text
Transaction Ingestion
        ↓
Risk Engine
        ↓
Anomaly Detection
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
Incident Detail
```

---

# 26. P1 Features

After the core loop:

```text
Alerts

Analytics

AI Copilot

Recommendations

Approval Simulation

Razorpay Webhooks

Transaction Explorer
```

---

# 27. Features Not to Prioritize Early

Do not spend early development time on:

```text
Microservices

Kafka

Kubernetes

Multi-agent AI

Graph database

Perfect mobile UI

Light theme

Advanced ML training pipeline

Complex user management
```

---

# 28. Demo Reliability Requirement

Before final submission:

```text
UPI Bank Degradation
```

must work:

```text
3 consecutive times
```

without manual database repair.

---

# 29. Documentation Update Rule

After every major phase, update this file with:

```text
Current Phase

Status

Completed Work

Working Features

Known Issues

Important Decisions

Next Exact Task
```

Keep this file concise.

Do not duplicate entire technical documents here.

---

# 30. Current Blockers

```text
None
```

Implementation has not started because documentation was intentionally completed first.

---

# 31. Current Project State

```text
PRODUCT SPECIFICATION     ✅

ARCHITECTURE              ✅

DATABASE DESIGN           ✅

RISK ENGINE SPEC          ✅

AI SYSTEM SPEC            ✅

API CONTRACT              ✅

UI DESIGN                 ✅

DEVELOPMENT RULES         ✅

IMPLEMENTATION ROADMAP    ✅

SECURITY PLAN             ✅

TESTING PLAN              ✅

DEPLOYMENT PLAN           ✅

DEMO FLOW                 ✅

README                     ✅

PROJECT MEMORY            ✅

IMPLEMENTATION             ⏳
```

---

# 32. Next Command

The next command to run after saving this file is:

```bash
pwd
```

We will then begin **Phase 1** carefully from the current project directory.
