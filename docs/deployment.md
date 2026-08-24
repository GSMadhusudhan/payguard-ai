# PayGuard AI — Deployment & Environment Strategy

## 1. Document Purpose

This document defines how **PayGuard AI** is configured, run, built, deployed, monitored, and recovered across:

* Local development
* Automated testing
* Demo/staging
* Production-style deployment

It covers:

* macOS local development
* Python environment setup
* React development environment
* PostgreSQL configuration
* Environment variables
* Database migrations
* Frontend builds
* Backend startup
* Health checks
* AI provider configuration
* Razorpay webhook configuration
* Secret handling
* Demo deployment
* Rollback strategy
* Deployment validation

The deployment strategy should remain simple enough for a hackathon while preserving good engineering practices.

---

# 2. Deployment Philosophy

PayGuard AI should optimize for:

```text
RELIABLE
+
REPEATABLE
+
SECURE
+
SIMPLE
+
RECOVERABLE
```

The application should not depend on the developer's laptop configuration to function correctly.

A clean environment should be able to:

```text
Clone
↓
Configure
↓
Install
↓
Migrate
↓
Run
```

using documented steps.

---

# 3. Environment Types

PayGuard uses three primary environments.

```text
development
test
production
```

For the hackathon we may also treat the deployed demo as:

```text
demo
```

through configuration while still following production-style deployment behavior.

---

# 4. Environment Responsibilities

## Development

Used for local coding.

Characteristics:

```text
Debugging enabled where useful
Local PostgreSQL
Transaction simulator
Razorpay test mode
Local frontend
Local backend
```

---

## Test

Used for automated tests.

Characteristics:

```text
Separate test database
Mock AI provider by default
Synthetic transactions only
No production credentials
Deterministic test configuration
```

---

## Demo

Used for Razorpay Buildathon presentation.

Characteristics:

```text
Hosted frontend
Hosted backend
Hosted PostgreSQL
Razorpay test mode
AI provider configured
Simulator enabled
High-impact mitigation simulated
TEST / DEMO MODE visible
```

---

## Production

Future production-style environment.

Characteristics:

```text
Debug disabled
HTTPS enforced
Restricted CORS
Secure secret management
Dedicated database
Monitoring
Backups
Rate limiting
Production provider configuration
```

Production architecture is documented for completeness but is not required to be fully implemented during the hackathon.

---

# 5. Local macOS Architecture

Development machine:

```text
macOS
+
zsh
+
VS Code
```

Local architecture:

```text
Browser
   ↓
React + Vite
localhost:5173
   ↓
FastAPI
localhost:8000
   ↓
PostgreSQL
localhost:5432
```

Optional external integrations:

```text
FastAPI
   ↓
AI Provider
```

and:

```text
Razorpay Test Mode
   ↓
Webhook Tunnel
   ↓
FastAPI
```

---

# 6. Local Project Structure

Expected root:

```text
payguard-ai/
│
├── backend/
├── frontend/
├── ai/
├── database/
├── docs/
├── scripts/
│
├── README.md
├── PRD.md
├── architecture.md
├── design.md
├── rules.md
├── phases.md
└── memory.md
```

---

# 7. Terminal Environment

Preferred shell:

```text
zsh
```

Confirm project location:

```bash
pwd
```

Expected final directory name:

```text
payguard-ai
```

List files:

```bash
ls
```

---

# 8. Conda Handling

If the terminal shows:

```text
(base)
```

Conda base is active.

Before creating the backend environment:

```bash
conda deactivate
```

PayGuard will use a project-specific Python virtual environment instead of depending on Conda base.

---

# 9. Python Version

The exact supported Python version will be fixed during backend initialization.

Recommended direction:

```text
Python 3.11+
```

Before setup:

```bash
python3 --version
```

The selected version must be documented in the final README.

---

# 10. Backend Virtual Environment

From the project root:

```bash
cd backend
```

Create:

```bash
python3 -m venv venv
```

Activate:

```bash
source venv/bin/activate
```

Terminal should then show something similar to:

```text
(venv)
```

---

# 11. Upgrade pip

After activating the virtual environment:

```bash
python3 -m pip install --upgrade pip
```

---

# 12. Backend Dependency Installation

Dependencies will be recorded in:

```text
backend/requirements.txt
```

Install:

```bash
python3 -m pip install -r requirements.txt
```

All Python package installation commands should be run while:

```text
backend/venv
```

is active.

---

# 13. Backend Environment File

Development secrets:

```text
backend/.env
```

Example:

```text
APP_NAME=PayGuard AI
APP_ENV=development
APP_DEBUG=true

DATABASE_URL=

JWT_SECRET=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

FRONTEND_URL=http://localhost:5173

AI_PROVIDER=
AI_API_KEY=
AI_MODEL=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

---

# 14. Environment Example File

Commit:

```text
backend/.env.example
```

Do not commit:

```text
backend/.env
```

The example file contains variable names only.

---

# 15. Configuration Loading

Backend configuration should be centralized using:

```text
Pydantic Settings
```

Conceptual:

```text
backend/app/config.py
```

The application should not call environment variables directly throughout unrelated modules.

---

# 16. Required Configuration

Core backend startup requires:

```text
APP_ENV
DATABASE_URL
JWT_SECRET
```

AI features additionally require:

```text
AI_PROVIDER
AI_API_KEY
AI_MODEL
```

Razorpay integration requires:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

---

# 17. Optional Dependency Behavior

If the AI configuration is unavailable:

```text
Core application may still start
```

with:

```text
AI provider = degraded
```

Core transaction and Risk Engine functions must remain operational.

---

# 18. Frontend Environment

Frontend configuration:

```text
frontend/.env
```

Only public values may be placed here.

Example:

```text
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_ENV=development
```

Never place backend secrets in frontend environment variables.

---

# 19. Frontend Secret Rule

Anything beginning with:

```text
VITE_
```

may become visible in the browser bundle.

Therefore never store:

```text
JWT_SECRET
AI_API_KEY
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
DATABASE_URL
```

in frontend environment configuration.

---

# 20. Node.js Environment

The exact Node.js version will be fixed when the frontend is initialized.

Recommended direction:

```text
Node.js LTS
```

Verify:

```bash
node --version
```

and:

```bash
npm --version
```

---

# 21. Frontend Dependency Installation

From root:

```bash
cd frontend
```

Install:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Expected:

```text
http://localhost:5173
```

---

# 22. PostgreSQL Local Development

PostgreSQL should run locally on:

```text
localhost:5432
```

Development database:

```text
payguard
```

Test database:

```text
payguard_test
```

These must remain separate.

---

# 23. PostgreSQL Installation on macOS

The exact installation route may depend on the machine.

Supported approaches may include:

```text
Homebrew PostgreSQL
```

or:

```text
Postgres.app
```

We will select one implementation path when Phase 3 begins.

Do not install multiple PostgreSQL distributions unnecessarily.

---

# 24. Homebrew Check

If we choose Homebrew:

```bash
brew --version
```

If PostgreSQL is installed with Homebrew, service management may use:

```bash
brew services list
```

Exact commands will be documented once the chosen version is installed.

---

# 25. Database Connection String

Conceptual development format:

```text
postgresql+psycopg://USER:PASSWORD@localhost:5432/payguard
```

The exact driver format will depend on the SQLAlchemy/PostgreSQL driver selected.

This value belongs only in backend environment configuration.

---

# 26. Database Migrations

Schema changes are managed with:

```text
Alembic
```

Initial setup will create:

```text
backend/alembic.ini
backend/alembic/
```

---

# 27. Apply Migrations

Typical command:

```bash
alembic upgrade head
```

This must be run from the configured backend environment.

---

# 28. Migration History

Inspect current revision:

```bash
alembic current
```

Inspect history:

```bash
alembic history
```

---

# 29. Create Migration

Conceptually:

```bash
alembic revision --autogenerate -m "create transaction tables"
```

Autogenerated migrations must be reviewed before applying.

Do not blindly trust autogenerated destructive changes.

---

# 30. Migration Rollback

Development rollback:

```bash
alembic downgrade -1
```

Rollback behavior must be tested before deployment where meaningful.

Production rollback requires additional care when migrations are destructive.

---

# 31. Migration Safety

Before deployment:

```text
Review migration
↓
Back up important data
↓
Apply migration
↓
Verify
```

Avoid destructive schema changes immediately before a hackathon demo.

---

# 32. Backend Development Server

From:

```text
backend/
```

with virtual environment active:

```bash
uvicorn app.main:app --reload
```

Expected:

```text
http://127.0.0.1:8000
```

---

# 33. Backend Development URLs

Health:

```text
http://127.0.0.1:8000/health
```

Readiness:

```text
http://127.0.0.1:8000/ready
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

# 34. Backend Production Startup

Production-style startup must not use:

```text
--reload
```

A production ASGI process should run the FastAPI application.

The exact command will depend on the selected hosting platform.

---

# 35. Health Check

`GET /health`

should verify:

```text
Application process is alive
```

Example:

```json
{
  "status": "healthy"
}
```

---

# 36. Readiness Check

`GET /ready`

should verify important dependencies.

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

---

# 37. Degraded Readiness

AI provider unavailable:

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

This should not automatically make transaction risk processing unavailable.

---

# 38. Frontend Development Server

From:

```text
frontend/
```

run:

```bash
npm run dev
```

Local browser:

```text
http://localhost:5173
```

Frontend should call:

```text
http://localhost:8000/api/v1
```

through its centralized API client.

---

# 39. CORS Development Configuration

Backend should allow:

```text
http://localhost:5173
```

for local development.

Do not permanently use unrestricted origins for deployed environments.

---

# 40. Local Startup Order

Recommended:

```text
1. PostgreSQL

2. Backend virtual environment

3. Database migrations

4. FastAPI backend

5. React frontend
```

Optional after that:

```text
6. Razorpay webhook tunnel

7. Simulator
```

---

# 41. Local Development Terminal Layout

Recommended VS Code terminals:

```text
Terminal 1
Backend

Terminal 2
Frontend

Terminal 3
Database / migrations / utility commands
```

This avoids repeatedly stopping important processes.

---

# 42. Local Backend Startup

Example:

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

---

# 43. Local Frontend Startup

Separate terminal:

```bash
cd frontend
npm run dev
```

---

# 44. Environment Verification

Before debugging code, verify:

```text
Correct directory

Correct Python venv

Correct backend URL

Correct database

Correct environment file

Correct frontend API base URL
```

Many development problems come from environment mismatch rather than application logic.

---

# 45. AI Provider Deployment

AI calls originate only from backend.

Deployment secret:

```text
AI_API_KEY
```

must be configured through the hosting platform's secret/environment system.

Never bundle it with frontend assets.

---

# 46. AI Model Configuration

Configuration:

```text
AI_PROVIDER
AI_MODEL
```

allows model changes without rewriting application architecture.

Deployments may use different models across:

```text
development
demo
production
```

---

# 47. AI Timeout Configuration

Deployment should define:

```text
AI_TIMEOUT_SECONDS
```

with a bounded timeout.

A hanging AI provider must not indefinitely consume backend workers.

---

# 48. Razorpay Environment

Hackathon integration should use:

```text
Razorpay Test Mode
```

unless explicitly required otherwise.

Test credentials must remain separate from any live credentials.

---

# 49. Razorpay Backend Configuration

Backend secrets:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

The key secret and webhook secret remain server-side.

---

# 50. Razorpay Webhook URL

Deployed endpoint:

```text
https://<backend-domain>/api/v1/webhooks/razorpay
```

This URL is configured in the Razorpay test environment.

---

# 51. Local Razorpay Webhooks

Razorpay cannot normally reach:

```text
localhost
```

directly.

During local development we may use a secure webhook tunnel.

Example categories:

```text
ngrok
Cloudflare Tunnel
```

The exact tool will be selected during Razorpay integration.

---

# 52. Tunnel Security

A tunnel exposes the local backend to the internet.

Only expose the necessary port.

Webhook signature verification remains mandatory.

Never assume the tunnel itself authenticates the provider.

---

# 53. Webhook Deployment Verification

After configuring webhook URL:

Test:

```text
Valid Razorpay test event
↓
Webhook received
↓
Signature verified
↓
Event persisted
↓
Transaction normalized
↓
Risk pipeline triggered
```

---

# 54. Frontend Production Build

Before deployment:

```bash
npm run build
```

Expected:

```text
frontend/dist/
```

The build must complete without TypeScript errors.

---

# 55. Frontend Preview

Local production-build preview may use:

```bash
npm run preview
```

This helps detect issues that appear only in the optimized build.

---

# 56. Frontend Deployment Configuration

Production/demo frontend:

```text
VITE_API_BASE_URL=https://<backend-domain>/api/v1
```

This is a public API URL, so it is safe to expose.

---

# 57. Backend Deployment Configuration

Backend receives:

```text
APP_ENV=demo
APP_DEBUG=false

DATABASE_URL=<hosted database>

JWT_SECRET=<secret>

FRONTEND_URL=<deployed frontend>

AI_PROVIDER=<provider>
AI_API_KEY=<secret>
AI_MODEL=<model>

RAZORPAY_KEY_ID=<test key>
RAZORPAY_KEY_SECRET=<secret>
RAZORPAY_WEBHOOK_SECRET=<secret>
```

---

# 58. Hosted Architecture

Recommended simple deployment:

```text
Browser
   ↓
Hosted React Frontend
   ↓ HTTPS
Hosted FastAPI Backend
   ↓
Hosted PostgreSQL
```

External:

```text
FastAPI
   ↓
AI Provider
```

and:

```text
Razorpay Test Mode
   ↓
FastAPI Webhook
```

---

# 59. Deployment Platform Selection Principles

Choose platforms based on:

```text
Reliability

Fast deployment

HTTPS

Environment variables

PostgreSQL support

Python support

Node/static frontend support

Logs

Reasonable free/demo limits
```

Do not select infrastructure purely because it sounds more sophisticated.

---

# 60. Platform Independence

Architecture should not tightly couple PayGuard to one hosting provider.

Frontend should need:

```text
Static/Vite deployment
```

Backend should need:

```text
Python ASGI support
```

Database:

```text
PostgreSQL
```

---

# 61. Containerization

Docker is optional for the MVP.

It can improve reproducibility but should not delay the critical path.

If Docker is introduced later:

```text
backend container
frontend build/container if required
PostgreSQL external service
```

must still follow the same environment/security rules.

---

# 62. No Premature Kubernetes

Do not deploy:

```text
Kubernetes
```

for the hackathon unless explicitly required.

It introduces unnecessary complexity for the current architecture.

---

# 63. Deployment Pipeline

Conceptual deployment:

```text
Code Commit
    ↓
Tests
    ↓
Frontend Build
    ↓
Backend Validation
    ↓
Database Migration
    ↓
Backend Deploy
    ↓
Frontend Deploy
    ↓
Health Check
    ↓
Smoke Test
```

---

# 64. Pre-Deployment Backend Checks

Run:

```bash
pytest
```

Verify:

```text
All critical tests pass
```

Then:

```text
Database migration valid
```

Then ensure application starts without development-only configuration.

---

# 65. Pre-Deployment Frontend Checks

Run:

```bash
npm run build
```

Also:

```text
No TypeScript errors

No missing environment variable

No backend secrets

No obvious console errors
```

---

# 66. Pre-Deployment Git Check

Run:

```bash
git status
```

Confirm:

```text
No accidental .env

No private keys

No temporary data dumps

No sensitive screenshots
```

---

# 67. Database Deployment Strategy

Recommended order:

```text
Backup if necessary
↓
Apply migration
↓
Verify schema
↓
Deploy backend
```

When backward compatibility matters:

Prefer migrations that support both old and new backend briefly.

---

# 68. Hackathon Migration Strategy

During the hackathon:

Avoid complex destructive migrations near presentation time.

Prefer:

```text
Additive changes
```

such as:

```text
New table
New nullable column
New index
```

over risky destructive modifications.

---

# 69. Seed Data

The demo environment may require:

```text
Demo user

Demo merchant

Optional baseline configuration

Risk rules
```

Seed scripts should be placed in:

```text
scripts/
```

or an appropriate backend module.

---

# 70. Seed Script Requirements

Seed scripts must be:

```text
Idempotent
```

Running the seed process twice must not create unlimited duplicate demo accounts or rules.

---

# 71. Demo User Seeding

A development/demo user may be created through a seed command.

Password should be configured safely.

Do not commit a real personal password.

---

# 72. Risk Rule Seeding

Initial risk rules may be inserted through:

```text
migration
```

or:

```text
seed process
```

depending on implementation.

Rules must include versions.

---

# 73. Simulator Deployment

Simulator should be:

```text
Enabled
```

for:

```text
development
demo
```

Possible production policy:

```text
Disabled
```

or admin-only.

---

# 74. Simulator Safety

Deployment configuration should limit:

```text
Maximum transactions per simulation

Concurrent simulations

Simulation duration
```

This protects the demo backend from accidental overload.

---

# 75. Demo Reset

A reset utility may clear:

```text
SIMULATOR transactions

SIMULATOR incidents

SIMULATOR alerts

SIMULATOR analytics state
```

only.

It must not accidentally delete unrelated data.

---

# 76. Demo Reset Script

Potential location:

```text
scripts/reset_demo.py
```

The reset command should be intentionally named and require explicit execution.

---

# 77. Demo Initialization Script

Potential:

```text
scripts/seed_demo.py
```

May create:

```text
Demo merchant
Demo user
Baseline risk rules
Required simulator state
```

---

# 78. Deployment Logging

Hosting platform must provide access to backend logs.

Useful fields:

```text
timestamp
level
request_id
module
transaction_id
incident_id
event
```

Never log secret values.

---

# 79. Deployment Monitoring

At minimum monitor:

```text
Backend reachable

Database reachable

Error rate

Webhook failures

AI provider failures

Incident generation errors
```

Hackathon monitoring may remain lightweight.

---

# 80. Health Monitoring

Use:

```text
/health
```

for process health.

Use:

```text
/ready
```

for dependency state.

A hosting platform may call the health endpoint automatically.

---

# 81. Application Startup Validation

At startup:

Validate:

```text
Environment

Database configuration

JWT configuration

Critical application constants
```

Optional integrations:

```text
AI

Razorpay
```

may report degraded state when intentionally unconfigured in development.

---

# 82. Database Backup

For deployed demo data, backup requirements are modest.

For any production-style system:

Use automated PostgreSQL backups.

Before destructive migrations:

```text
Create backup
```

---

# 83. Rollback Philosophy

Every deployment must answer:

```text
What happens if the new version fails?
```

Rollback may involve:

```text
Previous application version

Database migration rollback where safe

Restore backup if necessary
```

---

# 84. Application Rollback

If backend release fails:

```text
Redeploy previous known-good commit
```

Do not debug major unknown deployment issues live during judging if a known-good version is available.

---

# 85. Frontend Rollback

If a new frontend build breaks:

Deploy previous known-good static build/commit.

Backend compatibility should remain stable enough for this when possible.

---

# 86. Database Rollback

Database rollback requires more caution.

Safe:

```text
Drop newly added unused table
```

Potentially unsafe:

```text
Delete transformed data
```

Never automatically run destructive rollback without reviewing impact.

---

# 87. Feature Fallbacks

If AI fails:

```text
Show deterministic evidence
```

If Razorpay webhook integration fails during demo:

```text
Use simulator
```

If external payment traffic is unavailable:

```text
Use synthetic scenarios
```

The demo must have a reliable fallback for external integrations.

---

# 88. Hackathon Deployment Resilience

Primary presentation must not depend entirely on:

```text
Razorpay network availability

AI provider availability

External webhook tunnel

Developer laptop
```

The system should be deployable and have simulator-backed fallbacks.

---

# 89. AI Demo Fallback

If AI provider fails during judging:

Incident page should still show:

```text
Risk Score

Risk Factors

Anomaly Signals

Historical Baseline

Affected Transactions

Revenue at Risk
```

AI panel:

```text
AI Investigation temporarily unavailable
```

This still demonstrates strong core architecture.

---

# 90. Razorpay Demo Fallback

If provider events fail:

Use:

```text
Transaction Simulator
```

The simulator uses the same internal ingestion/risk pipeline and therefore remains a legitimate product demonstration.

---

# 91. Deployment Smoke Test

Immediately after deployment:

Test:

```text
GET /health
```

Then:

```text
GET /ready
```

Then:

```text
Login
```

Then:

```text
Dashboard
```

Then:

```text
One test transaction
```

Then:

```text
Risk evaluation
```

---

# 92. Extended Smoke Test

Before presentation:

```text
1. Login

2. Dashboard

3. Start normal traffic

4. Run bank degradation

5. Confirm incident

6. Open incident

7. Run AI investigation

8. Confirm recommendation

9. Ask Copilot

10. Verify no errors
```

---

# 93. Frontend Routing Deployment

Since React Router is used, hosting must support SPA fallback.

Unknown frontend routes such as:

```text
/incidents/123
```

should serve:

```text
index.html
```

and allow React Router to resolve the route.

---

# 94. API URL Configuration

Never hardcode:

```text
localhost:8000
```

inside components.

Use:

```text
VITE_API_BASE_URL
```

through centralized configuration.

---

# 95. Backend URL Configuration

Backend should not hardcode the frontend URL.

Use:

```text
FRONTEND_URL
```

for CORS configuration.

---

# 96. Test Mode UI

Deployment environment should expose safe environment state to frontend.

Possible public variable:

```text
VITE_APP_ENV=demo
```

UI can display:

```text
DEMO MODE
```

This does not expose a secret.

---

# 97. Deployment Security Checklist

Before any public deployment:

```text
[ ] APP_DEBUG=false

[ ] .env not committed

[ ] HTTPS enabled

[ ] JWT secret configured

[ ] Database credentials secure

[ ] AI API key backend-only

[ ] Razorpay secret backend-only

[ ] Razorpay webhook secret backend-only

[ ] CORS restricted

[ ] Production frontend points to production backend

[ ] Database migrations applied

[ ] Demo/test data labelled

[ ] Simulator limits configured

[ ] High-impact actions simulated

[ ] Logs checked for secret exposure
```

---

# 98. Backend Deployment Checklist

```text
[ ] requirements.txt up to date

[ ] Python version supported

[ ] app starts

[ ] /health works

[ ] /ready works

[ ] database connects

[ ] migrations current

[ ] environment variables present

[ ] tests pass
```

---

# 99. Frontend Deployment Checklist

```text
[ ] npm install succeeds

[ ] npm run build succeeds

[ ] API URL correct

[ ] no backend secrets

[ ] routes work after refresh

[ ] login works

[ ] dashboard loads

[ ] mobile layout does not completely break
```

---

# 100. Database Deployment Checklist

```text
[ ] Database exists

[ ] DATABASE_URL correct

[ ] Alembic revision current

[ ] Constraints created

[ ] Indexes created

[ ] Seed data applied once

[ ] Test and demo databases separated
```

---

# 101. AI Deployment Checklist

```text
[ ] AI provider configured

[ ] API key server-side

[ ] model configured

[ ] timeout configured

[ ] investigation schema validation works

[ ] failure fallback verified
```

---

# 102. Razorpay Deployment Checklist

```text
[ ] Test credentials configured

[ ] Webhook URL public

[ ] HTTPS active

[ ] Webhook secret configured

[ ] Signature verification tested

[ ] Duplicate event test passes

[ ] payment.failed tested

[ ] payment.captured tested where applicable
```

---

# 103. Demo Deployment Checklist

```text
[ ] TEST / DEMO MODE visible

[ ] Demo user exists

[ ] Demo merchant exists

[ ] Risk rules seeded

[ ] Normal traffic scenario works

[ ] Bank degradation works

[ ] Incident appears

[ ] Revenue at risk appears

[ ] AI investigation works

[ ] Simulator fallback works

[ ] Reset procedure works

[ ] Demo succeeds three times
```

---

# 104. Production Build Principle

Do not deploy:

```text
Uncommitted experimental code
```

when a stable commit exists.

Before final presentation, tag or identify:

```text
known-good commit
```

for emergency recovery.

---

# 105. Git Release Marker

Before demo freeze, create a known-good commit such as:

```text
chore: prepare PayGuard Buildathon demo
```

Optionally create a Git tag later:

```text
demo-v1
```

This gives us a reliable rollback target.

---

# 106. Demo Freeze Policy

Near the final presentation:

Do not introduce major architecture changes.

Allowed:

```text
Bug fixes
Copy fixes
Minor styling
Performance fixes
Deployment corrections
```

Avoid:

```text
New database architecture
New auth system
New AI provider architecture
Large dependency changes
```

---

# 107. Development Startup Script — Future

We may later add helper scripts such as:

```text
scripts/start_backend.sh
scripts/start_frontend.sh
```

or:

```text
Makefile
```

if useful.

These should simplify commands without hiding important behavior.

---

# 108. Development Reset Script — Future

Potential:

```text
scripts/reset_local_db.sh
```

should only target the documented local development database.

Never write ambiguous destructive scripts.

---

# 109. Deployment Documentation Rule

Whenever:

```text
Port changes

Hosting provider changes

Environment variable changes

Startup command changes

Database host changes
```

this document and README must be updated.

---

# 110. Local Development Success Criteria

Local development environment is ready when:

```text
PostgreSQL running

Backend virtual environment active

Migrations applied

FastAPI running on 8000

React running on 5173

Frontend can call backend

Database state persists

Health endpoints work
```

---

# 111. Demo Environment Success Criteria

Demo environment is ready when:

1. Frontend loads over HTTPS.
2. Backend loads over HTTPS.
3. PostgreSQL is connected.
4. Authentication works.
5. Dashboard loads.
6. Simulator generates transactions.
7. Risk Engine evaluates them.
8. Incidents are created.
9. Revenue-at-risk is calculated.
10. AI investigation works or degrades safely.
11. Copilot works.
12. Razorpay test webhooks work if enabled.
13. Demo data is clearly labelled.
14. No secrets are exposed.
15. Demo scenario can be repeated reliably.

---

# 112. Final Deployment Architecture

```text
                    USER
                      │
                   HTTPS
                      │
                      ↓
             ┌─────────────────┐
             │ React Frontend  │
             └────────┬────────┘
                      │
                   HTTPS
                      │
                      ↓
             ┌─────────────────┐
             │ FastAPI Backend │
             └──────┬────┬─────┘
                    │    │
          ┌─────────┘    └──────────────┐
          ↓                             ↓
   ┌──────────────┐              ┌─────────────┐
   │ PostgreSQL   │              │ AI Provider │
   └──────────────┘              └─────────────┘

             Razorpay Test Mode
                     │
                     │ Signed Webhook
                     ↓
             FastAPI Webhook API
                     │
                     ↓
             Transaction Pipeline
```

---

# 113. Final Deployment Principle

PayGuard AI deployment must always preserve:

```text
REPEATABILITY

SECURITY

TRACEABILITY

FAILURE ISOLATION

DEMO RELIABILITY
```

The deployment architecture does not need to be unnecessarily complex.

It must allow PayGuard AI to be started, tested, demonstrated, and recovered predictably.
