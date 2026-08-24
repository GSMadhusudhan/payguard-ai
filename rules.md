# PayGuard AI — Development Rules

## 1. Document Purpose

This document defines the mandatory engineering rules for **PayGuard AI**.

These rules apply to:

* Frontend development
* Backend development
* Database design
* Risk Engine
* AI system
* Razorpay integration
* Transaction simulator
* Security
* Testing
* Git
* Documentation
* Deployment
* Demo preparation

The objective is to keep PayGuard AI:

* Maintainable
* Secure
* Predictable
* Explainable
* Testable
* Demo-safe
* Production-minded

These rules should be followed throughout development unless an architectural decision is explicitly updated and documented.

---

# 2. Core Development Principle

Every important feature should follow:

```text
Requirement
    ↓
Architecture
    ↓
Data Model
    ↓
API Contract
    ↓
Backend Logic
    ↓
Frontend Integration
    ↓
Testing
    ↓
Documentation
```

Do not build disconnected UI or backend logic without understanding where it fits in this flow.

---

# 3. No Random Coding Rule

Do not:

```text
Open random file
↓
Write random feature
↓
Try to connect it later
```

Instead:

```text
Understand feature
↓
Locate correct module
↓
Define interfaces
↓
Implement
↓
Test
```

Every feature must have a clear architectural location.

---

# 4. Documentation Is Part of the Product

Documentation is not optional.

When architecture or behavior changes, update the relevant documentation.

Examples:

If database schema changes:

```text
docs/database-schema.md
```

must be updated.

If API changes:

```text
docs/api-contract.md
```

must be updated.

If risk logic changes:

```text
docs/risk-engine.md
```

must be updated.

If AI behavior changes:

```text
docs/ai-system.md
```

must be updated.

If UI architecture changes:

```text
design.md
```

must be updated.

---

# 5. Source of Truth Hierarchy

Use this order when resolving implementation decisions:

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

Code should match documentation.

If code must intentionally differ, update the documentation.

---

# 6. Project Structure Rule

Files must be placed in the module that owns the responsibility.

Do not place unrelated files in:

```text
utils/
```

just because there is no obvious location.

Create meaningful modules.

---

# 7. Backend Technology Rules

Backend:

```text
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL
```

Do not introduce another backend framework unless required by a documented architecture change.

---

# 8. Frontend Technology Rules

Frontend:

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

Do not introduce multiple competing libraries for the same purpose without a clear reason.

Example:

Avoid having:

```text
Axios
+
Fetch wrappers
+
another HTTP library
```

simultaneously.

Choose one API-client strategy and use it consistently.

---

# 9. Backend Layering Rule

Backend request flow should generally follow:

```text
Router
   ↓
Service
   ↓
Repository
   ↓
Database
```

For risk logic:

```text
Service
   ↓
Risk Engine
```

For AI:

```text
Service
   ↓
AI Context Builder
   ↓
AI Provider
```

---

# 10. Router Rule

FastAPI routers are responsible for:

* HTTP request handling
* Request validation
* Authentication dependencies
* Authorization checks
* Service calls
* Response formatting
* Status codes

Routers must not contain large amounts of business logic.

Avoid:

```python
@router.post("/transactions")
async def create_transaction(...):
    # 300 lines of processing
```

Instead:

```python
@router.post("/transactions")
async def create_transaction(...):
    return await transaction_service.create(...)
```

---

# 11. Service Rule

Services contain:

* Business orchestration
* Transaction workflows
* Cross-module coordination
* Validation beyond schema validation
* Risk pipeline triggering
* Incident creation logic
* Recommendation coordination

Services should not contain raw SQL.

---

# 12. Repository Rule

Repositories handle database access.

Examples:

```text
create
get
list
update
exists
aggregate
```

Repository functions should not contain HTTP concerns.

Avoid returning FastAPI responses from repository functions.

---

# 13. Schema Rule

Use Pydantic models for:

```text
API requests
API responses
Internal structured AI outputs
Risk Engine data structures
Configuration validation
```

Do not pass unvalidated arbitrary dictionaries throughout the application when a clear schema exists.

---

# 14. Database Model Rule

SQLAlchemy models represent persistence.

Do not use SQLAlchemy models directly as API request bodies.

Maintain separation between:

```text
Database Model
```

and:

```text
API Schema
```

---

# 15. Naming Conventions — Python

Python:

```text
snake_case
```

for:

* Functions
* Variables
* Modules

Example:

```python
calculate_risk_score()
```

Classes:

```text
PascalCase
```

Example:

```python
RiskEvaluationService
```

Constants:

```text
UPPER_SNAKE_CASE
```

Example:

```python
MAX_RISK_SCORE = 100
```

---

# 16. Naming Conventions — TypeScript

React components:

```text
PascalCase
```

Example:

```text
IncidentCard.tsx
```

Functions:

```text
camelCase
```

Example:

```text
formatRiskScore()
```

Hooks:

```text
useSomething
```

Example:

```text
useIncidents()
```

Types/interfaces:

```text
PascalCase
```

Example:

```typescript
interface Incident {}
```

---

# 17. Naming Conventions — Database

Tables:

```text
snake_case
plural
```

Examples:

```text
transactions
risk_scores
incident_events
```

Columns:

```text
snake_case
```

Foreign keys:

```text
<entity>_id
```

Example:

```text
transaction_id
```

---

# 18. API Naming Rule

REST endpoints must use:

```text
lowercase
kebab-case only where needed
```

Prefer resource nouns.

Correct:

```text
/transactions
/incidents
/risk/rules
```

Avoid:

```text
/getTransactions
/createIncidentNow
```

---

# 19. API Version Rule

All application endpoints must remain under:

```text
/api/v1
```

Do not create random unversioned endpoints.

Exceptions:

```text
/health
/ready
```

may be exposed separately if architecture requires it.

---

# 20. API Response Rule

Responses must use consistent structure.

Success:

```json
{
  "data": {},
  "meta": {}
}
```

Collections:

```json
{
  "data": [],
  "pagination": {},
  "meta": {}
}
```

Errors:

```json
{
  "error": {
    "code": "...",
    "message": "...",
    "request_id": "..."
  }
}
```

---

# 21. Never Trust the Frontend

The backend must never trust frontend-generated:

```text
Risk score
Risk level
Incident severity
Revenue at risk
Approval status
Role
AI confidence
```

These values must be calculated or validated server-side.

---

# 22. Money Rule

Never use binary floating-point types for official financial values.

Use:

```text
BIGINT
```

representing the smallest currency unit.

Example:

```text
₹50,000
=
5,000,000 paise
```

Frontend may format the amount for display.

---

# 23. Timestamp Rule

Store:

```text
UTC
```

in the backend/database.

Use:

```text
TIMESTAMPTZ
```

where appropriate.

Frontend converts to local timezone.

---

# 24. UUID Rule

Internal database entities should use UUIDs unless there is a documented reason not to.

External IDs must remain separate.

Example:

```text
id
```

is internal.

```text
external_payment_id
```

is provider-specific.

---

# 25. Database Migration Rule

All schema changes must use:

```text
Alembic
```

Never manually modify the production database structure without a migration.

---

# 26. Migration Naming Rule

Migration names should describe the change.

Good:

```text
create_transaction_tables
add_incident_timeline
add_risk_model_version
```

Avoid:

```text
fix
update1
newmigration
```

---

# 27. Database Transaction Rule

Operations that must succeed together should use database transactions.

Example:

```text
Create Risk Score
+
Create Risk Factors
+
Create Rule Executions
```

If one fails:

```text
ROLLBACK
```

---

# 28. Historical Data Rule

Do not silently overwrite important historical decisions.

Examples:

```text
Risk scores
Investigations
Recommendations
Approvals
Mitigation actions
Audit logs
```

If a new evaluation occurs, create a new version/record where appropriate.

---

# 29. Audit Rule

Important system actions require audit logging.

Examples:

```text
LOGIN
TRANSACTION_INGESTED
RISK_SCORE_CREATED
INCIDENT_CREATED
AI_INVESTIGATION_COMPLETED
RECOMMENDATION_GENERATED
APPROVAL_GRANTED
MITIGATION_EXECUTED
```

---

# 30. Audit Integrity Rule

Audit logs should be append-oriented.

Normal application workflows should not silently edit or delete historical audit records.

---

# 31. Risk Engine Rule

The Risk Engine must be deterministic for identical:

```text
Input
Historical Context
Configuration
Version
```

Expected:

```text
same score
same risk factors
```

---

# 32. AI Must Never Generate Official Risk Scores

Forbidden:

```text
Transaction
↓
LLM
↓
Risk score = 87
```

Correct:

```text
Transaction
↓
Risk Engine
↓
Risk score = 87
↓
AI explains why
```

---

# 33. Risk Score Boundary Rule

All risk scores:

```text
0 <= score <= 100
```

Component caps:

```text
Rule Score        <= 70
Anomaly Score     <= 20
Context Score     <= 10
```

---

# 34. Risk Classification Rule

Shared classification:

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

Do not duplicate slightly different classifications in different files.

---

# 35. Risk Rule Grouping

Rules representing the same behavioral category must not blindly stack.

Example:

```text
HIGH_AMOUNT
EXTREME_AMOUNT
```

Use strongest matching contribution.

Do not add:

```text
15 + 25
```

when both represent the same amount-risk group.

---

# 36. Missing Data Rule

Missing data is not automatically suspicious.

Example:

```text
device_fingerprint = null
```

must not imply:

```text
NEW_DEVICE = true
```

Instead:

```text
Device signal unavailable
```

---

# 37. Cold Start Rule

If insufficient customer history exists:

Do not invent historical averages.

Use:

```text
Merchant baseline
Provider baseline
Global demo baseline
```

where defined.

---

# 38. Risk Language Rule

Use:

```text
Suspicious
Unusual
Potential
Likely
Possible
Risk signal
```

Do not state:

```text
Fraudster
Fraud confirmed
```

without authoritative confirmation.

---

# 39. Infrastructure Risk Rule

Payment failures must not automatically be interpreted as customer fraud.

Always consider:

```text
Bank degradation
Payment-method degradation
Provider outage
Merchant integration issue
```

---

# 40. AI System Rule

AI operates only on structured context selected by the backend.

Never provide unrestricted direct database access to the LLM.

---

# 41. AI Source-of-Truth Rule

Evidence authority:

```text
Transaction facts
↓
Risk Engine
↓
Anomaly metrics
↓
Historical baselines
↓
AI interpretation
```

AI is never above factual system data.

---

# 42. AI Hallucination Rule

If evidence is insufficient, AI must say:

```text
Insufficient evidence
```

or:

```text
Unknown
```

instead of inventing an explanation.

---

# 43. AI Structured Output Rule

Important AI workflows must use structured schemas.

Example:

```text
summary
likely_root_cause
confidence
evidence
alternative_explanations
uncertainties
recommended_next_checks
```

Validate output with Pydantic before persistence.

---

# 44. AI Confidence Rule

AI confidence must remain:

```text
0.0 – 1.0
```

It represents evidence strength.

It must not be described as a mathematically guaranteed probability.

---

# 45. AI Failure Isolation Rule

If AI fails:

```text
Transaction ingestion must continue
Risk Engine must continue
Incidents must continue
Alerts must continue
```

Only AI-specific functionality may become unavailable.

---

# 46. AI Retry Rule

MVP default:

```text
Initial AI request
↓
Failure
↓
Retry once
↓
Failure
↓
Mark FAILED
```

No infinite retries.

---

# 47. AI Prompt Version Rule

All important prompts must have versions.

Example:

```text
investigation-v1
recommendation-v1
copilot-v1
```

Prompt changes require version updates where behavior meaningfully changes.

---

# 48. AI Provider Rule

Do not scatter provider-specific SDK calls throughout the application.

Use:

```text
AIProvider abstraction
```

Application modules call the abstraction.

---

# 49. AI Secret Rule

Never expose:

```text
AI_API_KEY
```

to frontend code.

AI calls must originate from backend.

---

# 50. Copilot Data Rule

Operational Copilot answers must use PayGuard data.

Correct:

```text
Question
↓
Retrieve data
↓
Build context
↓
AI
```

Forbidden:

```text
Question
↓
LLM guesses from general knowledge
```

---

# 51. Copilot Authorization Rule

Copilot must respect the same merchant/user authorization boundaries as normal APIs.

AI is not allowed to bypass permissions.

---

# 52. Copilot No-Data Rule

When no relevant data exists, return a safe no-data response.

Example:

```text
There is not enough PayGuard data to determine the cause yet.
```

---

# 53. Recommendation Rule

AI recommendations must use predefined action types where possible.

Do not let arbitrary AI text directly become executable code.

---

# 54. Human-in-the-Loop Rule

Sensitive actions require approval.

Examples:

```text
Block user
Freeze merchant
Modify limits
Disable payment method
Change routing
Rate-limit payment access
```

---

# 55. Safe Automatic Actions

The system may automatically:

```text
Create incident
Generate alert
Run investigation
Generate recommendation
Increase monitoring
Create report
```

---

# 56. Mitigation Demo Rule

During the hackathon, high-impact mitigation should normally operate in:

```text
SIMULATED
```

mode.

Do not perform dangerous real financial actions for demonstration purposes.

---

# 57. Razorpay Secret Rule

Never expose:

```text
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

in frontend code.

---

# 58. Webhook Verification Rule

All Razorpay webhooks must verify:

```text
X-Razorpay-Signature
```

against the configured webhook secret.

---

# 59. Raw Webhook Body Rule

Webhook signature verification must use:

```text
original raw request body
```

Do not parse and reconstruct JSON before verification.

---

# 60. Webhook Idempotency Rule

Receiving the same webhook twice must not create duplicate transaction state.

Use:

```text
provider event ID
payload hash
external payment ID
```

where appropriate.

---

# 61. Webhook Response Rule

Do not wait for slow AI processing before acknowledging a valid provider webhook.

Preferred:

```text
Verify
Persist
Queue/trigger processing
Respond
```

---

# 62. External Provider Rule

Provider-specific payloads must be normalized before entering core PayGuard logic.

Risk Engine must depend on:

```text
PayGuard normalized transaction
```

not raw Razorpay-specific schemas.

---

# 63. Simulator Rule

The simulator must use the same transaction-processing pipeline as real/test provider transactions.

Correct:

```text
Simulator
↓
Transaction ingestion
↓
Risk Engine
↓
Incidents
```

Forbidden:

```text
Simulator
↓
Fake dashboard numbers
```

---

# 64. Demo Data Rule

Synthetic demo data must be clearly identifiable.

Use:

```text
SIMULATOR
TEST MODE
DEMO
```

where appropriate.

Never imply synthetic transactions are real customer payments.

---

# 65. No Fake Frontend Data After Integration

Temporary mock data may be used during UI development.

Once the corresponding backend endpoint exists:

```text
replace mock data
```

Do not leave hidden hardcoded fake statistics in production demo screens.

---

# 66. Frontend Architecture Rule

Frontend pages should be composed from smaller reusable components.

Avoid giant:

```text
Dashboard.tsx
```

with thousands of lines.

---

# 67. Feature Ownership Rule

Feature-specific UI belongs in:

```text
src/features/<feature>/
```

Shared components belong in:

```text
src/components/
```

---

# 68. Shared Component Rule

Do not duplicate:

```text
Buttons
Badges
Cards
Tables
Modals
Inputs
Risk score components
Money formatting
Time formatting
```

across multiple features.

Create reusable shared components.

---

# 69. Design Token Rule

Do not hardcode random colors repeatedly.

Use:

```text
Tailwind theme
CSS variables
semantic tokens
```

---

# 70. UI Risk Color Rule

Risk colors must remain consistent.

```text
LOW → green

MEDIUM → amber

HIGH → orange

CRITICAL → red
```

AI information uses a separate AI accent.

---

# 71. AI Visual Separation Rule

AI-generated content must be visually labelled.

Example:

```text
AI GENERATED
```

Users must be able to distinguish AI interpretation from deterministic facts.

---

# 72. Frontend Calculation Rule

Frontend must not calculate authoritative:

```text
Risk score
Revenue at risk
Incident severity
AI confidence
Payment health
```

It may format values received from backend.

---

# 73. TypeScript Strictness Rule

Avoid:

```typescript
any
```

where a real type can be defined.

API responses should have proper TypeScript interfaces/types.

---

# 74. API Client Rule

All frontend API calls must go through a central API layer.

Example:

```text
services/apiClient.ts
```

Do not scatter arbitrary API calls across components.

---

# 75. TanStack Query Rule

Server state should generally be handled using TanStack Query.

Use it for:

```text
Fetching
Caching
Background refetching
Loading states
Error states
Mutation states
```

---

# 76. React State Rule

Do not put server state unnecessarily into global state management.

Use:

```text
TanStack Query
```

for server data.

Use local/component state for local UI behavior.

---

# 77. Component Size Rule

If a component becomes difficult to understand, split it.

Signs:

```text
Too many responsibilities
Large JSX blocks
Multiple unrelated API calls
Complex state combinations
Repeated UI patterns
```

---

# 78. Loading State Rule

Every data-heavy page must handle:

```text
Initial loading
Background loading
Empty state
Error state
Success state
```

---

# 79. Error State Rule

Do not silently swallow frontend errors.

Display user-safe messages.

Example:

```text
Unable to load incidents.
```

Never expose raw stack traces.

---

# 80. Accessibility Rule

At minimum:

```text
Keyboard accessible
Visible focus
Semantic labels
Readable contrast
Status not represented by color alone
Accessible buttons
```

---

# 81. Icon Rule

Use:

```text
Lucide React
```

consistently.

Do not mix many icon libraries.

---

# 82. Emoji Rule

Avoid emoji as primary production UI icons.

Use proper icon components.

Emoji may exist in documentation or informal developer messages, but not as the central product iconography.

---

# 83. Responsive Rule

Primary target:

```text
Desktop
```

but no page should completely break on mobile/tablet.

Test major screens at multiple widths.

---

# 84. Table Rule

Large transaction lists must use backend pagination.

Do not load massive datasets into the browser for client-side filtering.

---

# 85. Chart Rule

Charts should use aggregated backend data.

Avoid processing hundreds of thousands of transaction records in React merely to create a chart.

---

# 86. Secrets Rule

Never commit:

```text
.env
API keys
Database passwords
JWT secrets
Razorpay secrets
AI secrets
```

---

# 87. Environment File Rule

Commit:

```text
.env.example
```

Do not commit:

```text
.env
```

---

# 88. .gitignore Rule

At minimum ignore:

```text
.env
.env.*
!.env.example

venv/
.venv/

__pycache__/
*.pyc

node_modules/

dist/
build/

.DS_Store

coverage/

.pytest_cache/

.vscode/
```

Keep `.vscode/` only if we intentionally decide to commit safe shared settings.

---

# 89. macOS Rule

Because development is being performed on macOS:

Do not commit:

```text
.DS_Store
```

Use:

```text
zsh
```

compatible commands in development instructions.

---

# 90. Python Environment Rule

Use a project-specific virtual environment.

Recommended:

```bash
python3 -m venv venv
source venv/bin/activate
```

Do not rely on globally installed Python packages.

---

# 91. Conda Rule

If Conda base is automatically active:

```bash
conda deactivate
```

before creating/activating the PayGuard virtual environment.

Avoid mixing Conda base packages with the project `venv`.

---

# 92. Dependency Rule

Add dependencies only when needed.

Do not install large libraries simply because they may be useful later.

Every dependency should have a clear purpose.

---

# 93. Python Dependency Rule

Backend dependencies must be recorded in:

```text
backend/requirements.txt
```

or another documented dependency-management file if we later change strategy.

---

# 94. Node Dependency Rule

Frontend dependencies are managed through:

```text
package.json
```

Do not manually copy library source code into the project.

---

# 95. Version Rule

Where stability matters, dependency versions should be controlled rather than always relying on unrestricted latest versions.

---

# 96. Security Rule

Security is server-side.

Frontend hiding UI controls does not count as authorization.

---

# 97. Password Rule

Passwords must be securely hashed.

Never store plaintext passwords.

---

# 98. JWT Rule

JWT secrets stay server-side.

Tokens must have expiry.

Protected endpoints must validate authentication.

---

# 99. Authorization Rule

Roles must be enforced server-side.

Potential roles:

```text
ADMIN

RISK_ANALYST

OPERATIONS_ANALYST

VIEWER
```

---

# 100. Least Privilege Rule

Users should receive only the minimum permissions needed.

---

# 101. Input Validation Rule

All external inputs must be validated:

```text
Frontend input
API input
Webhook input
AI output
Simulator configuration
```

---

# 102. SQL Injection Rule

Use SQLAlchemy parameterized queries.

Never construct unsafe raw SQL using untrusted strings.

---

# 103. Logging Security Rule

Never log:

```text
Passwords
Authorization tokens
API secrets
Webhook secrets
Full card details
Sensitive raw customer PII
```

---

# 104. PII Minimization Rule

Store only the customer information necessary for risk analysis.

Prefer:

```text
Hashing
Masking
Internal IDs
```

where possible.

---

# 105. Payment Data Rule

Never attempt to store complete card numbers, CVV, or other prohibited sensitive authentication data.

PayGuard should operate on safe payment metadata.

---

# 106. Request ID Rule

Every backend request should have a:

```text
request_id
```

for traceability.

Use it in:

```text
Logs
Errors
Audit context
```

---

# 107. Exception Rule

Do not expose internal exception traces through APIs.

Backend logs may retain diagnostic details.

Frontend gets safe errors.

---

# 108. Custom Exception Rule

Use meaningful domain exceptions.

Examples:

```text
TransactionNotFoundError

DuplicateTransactionError

InvalidIncidentStateError

ApprovalAlreadyReviewedError
```

Map them centrally to API errors.

---

# 109. No Bare Exception Rule

Avoid:

```python
except:
    pass
```

This hides failures.

Use specific exceptions.

---

# 110. Test Requirement Rule

Critical backend logic must have automated tests.

Highest-priority tests:

```text
Risk Engine
Risk classification
Webhook idempotency
Transaction ingestion
Incident correlation
Approval state changes
AI structured validation
Authorization
```

---

# 111. Risk Rule Test Rule

Each rule needs:

```text
Below threshold
At threshold
Above threshold
Missing input
Cold start
Strongest-rule behavior
```

---

# 112. Boundary Test Rule

Risk classification must test:

```text
0
29
30
59
60
79
80
100
```

---

# 113. API Test Rule

Core endpoints need tests for:

```text
Success
Validation failure
Authentication failure
Authorization failure
Not found
Conflict
```

---

# 114. AI Test Rule

AI workflows require tests for:

```text
Valid structured response
Malformed response
Timeout
Provider unavailable
Unsupported evidence claims
Missing data
Conflicting evidence
```

---

# 115. Simulator Test Rule

Simulator scenarios should be deterministic enough that expected behavior can be verified.

Example:

```text
bank_degradation
```

should consistently produce conditions capable of triggering the intended anomaly and incident.

---

# 116. No Test-Only Production Logic

Do not make production logic depend on hidden values solely to pass tests.

Tests should verify real behavior.

---

# 117. Git Repository Rule

PayGuard should use Git from the beginning.

Important source changes should be committed in logical units.

---

# 118. Branch Strategy

For an individual hackathon project, keep branching simple.

Recommended:

```text
main
```

plus short-lived feature branches when useful.

Example:

```text
feature/risk-engine

feature/incident-system

feature/dashboard
```

Do not create unnecessary enterprise-level branching complexity.

---

# 119. Commit Message Rule

Use descriptive commit messages.

Good:

```text
feat: add transaction ingestion endpoint

feat: implement velocity risk rules

fix: prevent duplicate webhook processing

docs: add AI system specification
```

Avoid:

```text
update

done

changes

final final
```

---

# 120. Commit Scope Rule

One commit should represent a logical change.

Avoid a single massive commit containing:

```text
frontend
backend
database
docs
random debugging
```

all at once when avoidable.

---

# 121. Secret Check Before Commit

Before every important commit, verify:

```text
No .env

No API keys

No database passwords

No tokens

No private credentials
```

---

# 122. Main Branch Rule

Do not knowingly commit broken code to `main`.

Minimum before merging:

```text
App starts
Relevant tests pass
No obvious runtime error
```

---

# 123. Formatting Rule — Python

Use consistent Python formatting.

We may use:

```text
Black
```

and:

```text
Ruff
```

during implementation.

---

# 124. Formatting Rule — Frontend

Use consistent TypeScript formatting.

We may use:

```text
Prettier
ESLint
```

during frontend setup.

---

# 125. Lint Rule

Do not ignore large amounts of lint warnings permanently.

Fix underlying problems where reasonable.

---

# 126. No Dead Code Rule

Remove obsolete code once a replacement is verified.

Avoid accumulating:

```text
old_service.py
new_service.py
new_service_final.py
final2.py
```

---

# 127. Comment Rule

Comments should explain:

```text
WHY
```

when logic is non-obvious.

Avoid comments that simply repeat code.

Bad:

```python
# increase count
count += 1
```

Better:

```python
# Use merchant baseline because customer history is insufficient.
```

---

# 128. TODO Rule

TODOs should be actionable.

Good:

```text
TODO: Replace simulator baseline with merchant-specific rolling baseline.
```

Avoid:

```text
TODO: fix later
```

---

# 129. Performance Rule

Do not prematurely optimize everything.

However, avoid obvious performance problems such as:

```text
N+1 database queries

Fetching entire transaction history unnecessarily

Running AI for every normal transaction

Loading huge datasets in frontend
```

---

# 130. Query Rule

Database queries for dashboard analytics should use aggregation.

Do not fetch every transaction into Python just to calculate a count when PostgreSQL can calculate it.

---

# 131. AI Cost Rule

Do not make AI calls for:

```text
Every dashboard refresh
Every low-risk transaction
Every normal transaction
```

Use AI when meaningful investigation or user interaction requires it.

---

# 132. Background Processing Rule

Slow operations should not block critical API responses unnecessarily.

Potential background tasks:

```text
AI investigation
Recommendation generation
Large simulation
Analytics aggregation
```

---

# 133. No Premature Microservices Rule

Do not introduce:

```text
Kafka
Kubernetes
Many microservices
Multiple queues
Distributed tracing systems
```

unless the MVP genuinely requires them.

The initial architecture is a:

```text
Modular Monolith
```

---

# 134. Infrastructure Simplicity Rule

For the hackathon:

```text
Simple
Reliable
Demoable
```

beats:

```text
Complex
Theoretically scalable
Hard to run
```

---

# 135. Feature Completion Rule

A feature is not complete just because the happy path works.

Minimum:

```text
Core behavior
Validation
Error handling
Loading state if UI
Testing
Documentation alignment
```

---

# 136. No Broken Buttons Rule

Do not leave visible buttons that do nothing.

If functionality is not implemented:

```text
Hide it
Disable it with explanation
or
Implement it
```

---

# 137. No Fake AI Rule

Do not hardcode a static "AI Investigation" and present it as live AI.

For early frontend development, mock data is acceptable if clearly temporary.

Final demo should use the actual AI pipeline where possible.

---

# 138. No Fake Risk Rule

Do not generate random risk scores solely to make the dashboard interesting.

Simulation transactions should contain behaviors that cause the real Risk Engine to produce scores.

---

# 139. Deterministic Demo Rule

The hackathon demo must not depend entirely on random chance.

Critical scenarios should be reproducible.

Example:

```text
Bank Degradation
```

should reliably create:

```text
Failure spike
Anomaly
Incident
Investigation
Recommendation
```

---

# 140. Graceful AI Failure Demo Rule

Even if the AI API is unavailable during judging, the product should still demonstrate:

```text
Transactions
Risk scores
Risk factors
Anomalies
Incident
Revenue at risk
```

---

# 141. Demo Reliability Rule

Do not make the primary demo require:

```text
Unstable external dependencies
Production Razorpay access
Unreliable network state
Manual database changes
```

A local/test simulator must be able to demonstrate the product.

---

# 142. Hackathon Scope Rule

MVP first.

Do not spend critical development time on:

```text
Complex user management
Light theme
Perfect mobile UI
Microservices
Multiple AI agents
Advanced ML training pipeline
```

before the main PayGuard intelligence loop works.

---

# 143. Core Loop Priority

The most important product flow is:

```text
Transaction
↓
Risk Detection
↓
Anomaly
↓
Incident
↓
AI Investigation
↓
Revenue at Risk
↓
Recommendation
↓
Dashboard
```

This must work before optional features receive significant effort.

---

# 144. UI Polish Timing Rule

Do not sacrifice backend correctness for visual polish too early.

Recommended:

```text
Functional backend
↓
Working end-to-end flow
↓
Frontend integration
↓
Premium UI refinement
```

---

# 145. Documentation Update Rule

Before marking a major phase complete, check whether these remain correct:

```text
README.md
PRD.md
architecture.md
design.md
rules.md
phases.md
docs/*
```

---

# 146. README Rule

The final README must enable another developer or judge to understand:

```text
What PayGuard AI is

Why it exists

Architecture

Tech stack

How to run it

How to configure it

How to run demo scenario

Key screenshots/demo

Security boundaries
```

---

# 147. Memory File Rule

`memory.md` should capture concise project state such as:

```text
Current phase

Completed work

Important decisions

Current blockers

Next task
```

It must not contain:

```text
Secrets
Passwords
API keys
```

---

# 148. Phase Rule

Do not start a later phase if a missing earlier dependency will cause major rework.

Example:

Do not build a full AI Copilot before transaction, risk, and incident APIs exist.

---

# 149. One-Step Debugging Rule

When an error occurs:

```text
Read error
↓
Identify failing layer
↓
Test smallest relevant component
↓
Fix root cause
↓
Retest
```

Avoid changing many unrelated files simultaneously.

---

# 150. Terminal Rule

Before running commands:

Check:

```text
Current directory
Virtual environment
Expected project
```

On macOS:

```bash
pwd
```

can confirm location.

---

# 151. Dependency Installation Rule

Always install dependencies inside the correct project folder/environment.

Backend:

```text
backend + Python venv
```

Frontend:

```text
frontend + npm
```

---

# 152. Environment Separation Rule

Never place frontend dependencies inside backend or vice versa.

Project layout remains:

```text
frontend/
backend/
```

---

# 153. Local Port Rule

Default development ports:

```text
Frontend
5173

Backend
8000

PostgreSQL
5432
```

If changed, update environment documentation.

---

# 154. CORS Rule

Backend CORS must explicitly allow the frontend development URL.

Do not use unrestricted production CORS unnecessarily.

---

# 155. Configuration Rule

Application configuration should be centralized.

Backend example:

```text
app/config.py
```

Do not call:

```python
os.getenv(...)
```

through dozens of unrelated files.

---

# 156. Environment Validation Rule

Required environment variables should be validated when application starts.

Misconfiguration should fail clearly rather than causing mysterious runtime errors later.

---

# 157. Feature Flag Rule

Optional or incomplete functionality may use clearly defined feature flags if needed.

Do not scatter:

```python
if demo:
```

randomly throughout the codebase.

---

# 158. Logging Rule

Use structured, useful logs.

Include where relevant:

```text
request_id
module
event
transaction_id
incident_id
```

---

# 159. Logging Level Rule

Use:

```text
DEBUG
INFO
WARNING
ERROR
CRITICAL
```

appropriately.

Do not log everything as `ERROR`.

---

# 160. No Print Debugging in Final Code

Temporary:

```python
print(...)
```

is acceptable during debugging.

Before completing a module, replace important diagnostics with proper logging or remove them.

---

# 161. Status Enum Rule

Use shared enums for:

```text
Risk level
Incident status
Transaction status
Alert status
Approval status
Investigation status
```

Avoid inconsistent magic strings.

---

# 162. Magic Number Rule

Important thresholds should be named/configured.

Avoid:

```python
if score > 79:
```

scattered everywhere.

Prefer:

```python
CRITICAL_RISK_MIN = 80
```

or centralized classifier configuration.

---

# 163. Validation Boundary Rule

Validate at boundaries.

Examples:

```text
Incoming API
Webhook
External AI response
Database input
Simulator parameters
```

Internal functions can then rely on stronger assumptions.

---

# 164. External Failure Rule

External dependency failures must be handled explicitly.

Examples:

```text
AI provider unavailable
Razorpay unavailable
Database unavailable
```

Do not allow external failures to silently corrupt data.

---

# 165. Retry Safety Rule

Retries must only be used where operations are safe or idempotent.

Never blindly retry sensitive actions that might already have succeeded.

---

# 166. State Transition Rule

Incident, approval, and mitigation states must use validated transitions.

Example:

```text
PENDING
→ APPROVED
```

Valid.

```text
REJECTED
→ APPROVED
```

should require explicit supported logic rather than accidental state mutation.

---

# 167. Transaction Status Rule

PayGuard observes payment status.

It must not fake provider transaction status changes unless operating clearly within simulator mode.

---

# 168. Revenue-at-Risk Rule

Official revenue-at-risk calculations come from backend logic.

AI can explain the number.

AI does not independently invent it.

---

# 169. Payment Health Rule

Payment Health Score must have documented backend logic before it is considered authoritative.

Do not simply display a random number.

---

# 170. Incident Correlation Rule

Do not create one incident per every failed transaction when failures clearly belong to the same pattern.

Use correlation logic.

---

# 171. Incident Evidence Rule

Every incident should be traceable to:

```text
Transactions
Anomaly signals
Risk factors
Metrics
```

---

# 172. Incident Timeline Rule

Meaningful incident state changes should create:

```text
incident_events
```

so the investigation story remains visible.

---

# 173. Recommendation Traceability Rule

Every recommendation should identify:

```text
Incident
Investigation if applicable
Reason
Expected impact
Approval requirement
```

---

# 174. Approval Traceability Rule

Every approval must record:

```text
Who reviewed
Decision
When
Reason if applicable
```

---

# 175. Demo-Safe Naming Rule

Use fictional names such as:

```text
ABC Bank
XYZ Bank
Demo Store
```

for simulated incidents unless real test-provider information is intentionally used.

Do not falsely imply an actual bank outage during demonstrations.

---

# 176. Test Mode Visibility Rule

When synthetic/test traffic is shown:

The UI should visibly display:

```text
TEST MODE
```

or:

```text
DEMO MODE
```

---

# 177. Code Review Checklist

Before considering a feature complete, ask:

```text
Does it fit architecture?

Does it use correct module?

Are inputs validated?

Are errors handled?

Are secrets protected?

Does it preserve traceability?

Does it need audit logging?

Are tests present?

Does documentation still match?

Does the UI use real backend data?
```

---

# 178. Security Review Checklist

Before deployment:

```text
No secrets committed

Passwords hashed

JWT configured

Webhook signatures verified

Authorization enforced

CORS restricted

PII minimized

Logs safe

Debug mode disabled

Production configuration validated
```

---

# 179. Demo Readiness Checklist

Before judging:

```text
Application starts cleanly

Database starts cleanly

Demo user works

Normal traffic scenario works

Bank degradation scenario works

Risk scores appear

Incident appears

AI investigation works or fallback exists

Revenue at risk appears

Recommendation appears

Copilot works

No visible console errors

No broken buttons

No placeholder text

TEST MODE visible

Demo reset procedure works
```

---

# 180. Final Mandatory Rules

The following rules are non-negotiable for PayGuard AI:

```text
1. Never commit secrets.

2. Never let frontend generate authoritative risk data.

3. Never let the LLM generate official risk scores.

4. Never let AI invent transaction evidence.

5. Never let AI directly perform sensitive financial actions.

6. Never process Razorpay webhooks without signature verification.

7. Never allow duplicate webhook processing to create duplicate financial state.

8. Never use floating point for official money values.

9. Never silently overwrite historical risk decisions.

10. Never expose raw internal stack traces to frontend users.

11. Never confuse provider outages with customer fraud without evidence.

12. Never present synthetic demo data as real production data.

13. Never leave core architecture undocumented.

14. Never mark a critical feature complete without testing it.

15. Never sacrifice the working end-to-end product loop for unnecessary complexity.
```

---

# 181. Engineering Standard

PayGuard AI should always optimize for:

```text
Correctness
+
Explainability
+
Security
+
Traceability
+
Reliability
+
Clarity
```

before unnecessary complexity.

The goal is not merely to make the project look advanced.

The goal is to build an AI Risk Manager whose behavior can be understood, demonstrated, tested, and trusted.
