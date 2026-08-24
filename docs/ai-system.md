# PayGuard AI — AI System Specification

## 1. Document Purpose

This document defines the AI architecture used by **PayGuard AI**.

The AI layer is responsible for:

* Incident investigation
* Root-cause analysis
* Risk explanation
* Evidence summarization
* Recommendation generation
* Incident summaries
* Natural-language risk queries
* AI Risk Copilot responses

The AI system must operate on top of deterministic PayGuard data.

It must never replace the Risk Engine as the source of truth.

---

# 2. AI System Goal

The PayGuard AI layer should behave like an intelligent payment-risk analyst.

The system should answer questions such as:

```text
What happened?
```

```text
Why did it happen?
```

```text
What evidence supports this conclusion?
```

```text
How confident are we?
```

```text
How much money is affected?
```

```text
What should the merchant or risk analyst do next?
```

---

# 3. Core AI Principle

The AI architecture follows:

```text
DATA
  ↓
DETERMINISTIC ANALYSIS
  ↓
STRUCTURED EVIDENCE
  ↓
AI REASONING
  ↓
VALIDATED OUTPUT
  ↓
USER
```

Never:

```text
RAW TRANSACTIONS
      ↓
LLM
      ↓
RANDOM RISK SCORE
```

---

# 4. AI Responsibilities

AI is allowed to:

* Summarize incidents
* Explain risk factors
* Compare current behavior with baselines
* Identify likely root causes
* Rank possible explanations
* Generate mitigation recommendations
* Highlight uncertainties
* Answer natural-language questions
* Produce analyst-friendly reports

AI is not allowed to:

* Modify transaction facts
* Change risk scores
* Change payment status
* Declare fraud without evidence
* Fabricate transaction data
* Execute sensitive actions directly
* Bypass approval requirements
* Access unrestricted database tables

---

# 5. AI Architecture

```text
PayGuard Data
     ↓
Context Builder
     ↓
Evidence Selection
     ↓
Prompt Builder
     ↓
AI Provider Adapter
     ↓
LLM
     ↓
Structured Output Parser
     ↓
Pydantic Validation
     ↓
Safety Validation
     ↓
Persist Investigation
     ↓
Display in Dashboard
```

---

# 6. AI Modules

Recommended backend structure:

```text
backend/app/modules/ai/
│
├── provider/
│   ├── base.py
│   ├── factory.py
│   └── client.py
│
├── context/
│   ├── builder.py
│   ├── schemas.py
│   └── selectors.py
│
├── investigation/
│   ├── service.py
│   ├── prompts.py
│   ├── schemas.py
│   └── validators.py
│
├── explanation/
│   ├── service.py
│   └── prompts.py
│
├── recommendations/
│   ├── service.py
│   ├── prompts.py
│   └── validators.py
│
├── copilot/
│   ├── service.py
│   ├── intents.py
│   ├── context.py
│   └── prompts.py
│
└── common/
    ├── schemas.py
    ├── errors.py
    └── constants.py
```

---

# 7. AI Provider Abstraction

PayGuard should not depend directly on one model provider.

Configuration:

```text
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
AI_TEMPERATURE=
AI_TIMEOUT_SECONDS=
```

Application code should call:

```text
AIProvider
```

rather than vendor-specific APIs directly.

Conceptual interface:

```python
class AIProvider:
    async def generate_structured(
        self,
        messages,
        response_schema
    ):
        ...
```

This allows the provider to be changed later without rewriting the risk system.

---

# 8. AI Provider Factory

Example architecture:

```text
AI_PROVIDER
    ↓
Provider Factory
    ↓
Configured Client
```

Example:

```python
provider = get_ai_provider(settings.AI_PROVIDER)
```

The rest of the application should not need to know which external AI provider is active.

---

# 9. AI Context Builder

The Context Builder is one of the most important AI components.

It determines what evidence the model is allowed to see.

Location:

```text
backend/app/modules/ai/context/
```

The Context Builder collects:

* Incident data
* Related transactions
* Risk scores
* Risk factors
* Anomaly signals
* Merchant metrics
* Payment-method metrics
* Bank/provider metrics
* Historical baselines
* Recent alerts
* Incident timeline

---

# 10. Context Builder Principle

The AI must not receive unrestricted database access.

Instead:

```text
Database
   ↓
Backend Queries
   ↓
Approved Structured Data
   ↓
Context Builder
   ↓
AI
```

This protects:

* Security
* Privacy
* Performance
* Explainability
* Prompt reliability

---

# 11. Investigation Context Schema

Conceptual investigation input:

```json
{
  "incident": {
    "incident_number": "PG-2026-000042",
    "incident_type": "BANK_DEGRADATION",
    "severity": "CRITICAL",
    "status": "INVESTIGATING",
    "risk_score": 91,
    "affected_transaction_count": 342,
    "affected_payment_value": 51000000,
    "revenue_at_risk": 42800000
  },

  "current_metrics": {
    "upi_failure_rate": 0.284,
    "card_failure_rate": 0.041,
    "merchant_failure_rate": 0.121
  },

  "historical_baselines": {
    "upi_failure_rate": 0.051,
    "card_failure_rate": 0.039
  },

  "provider_distribution": {
    "ABC Bank": {
      "failure_count": 58,
      "failure_share": 0.81
    }
  },

  "risk_factors": [],

  "anomaly_signals": [],

  "recent_incident_events": []
}
```

---

# 12. Context Limits

The system should not send every transaction associated with a large incident.

Instead, provide:

```text
Aggregated metrics
+
Representative samples
+
Highest-risk transactions
+
Recent transactions
```

Example:

Incident contains:

```text
10,000 transactions
```

AI context might include:

```text
Aggregate statistics
Top 20 high-risk transactions
20 recent failures
20 representative successful transactions
```

This reduces cost and prevents context overload.

---

# 13. Context Selection Strategy

Transactions may be selected using:

```text
Highest risk score
Most recent
Most financially significant
Representative failure codes
Representative banks
Representative payment methods
```

The system should preserve aggregate statistics even when individual transactions are sampled.

---

# 14. AI Investigation Engine

Location:

```text
backend/app/modules/ai/investigation/
```

The Investigation Engine receives structured incident evidence and produces a structured investigation.

---

# 15. Investigation Output Schema

The AI must return something equivalent to:

```json
{
  "summary": "",
  "likely_root_cause": "",
  "confidence": 0.0,
  "evidence": [],
  "alternative_explanations": [],
  "uncertainties": [],
  "recommended_next_checks": []
}
```

---

# 16. Investigation Fields

## summary

Short description of what happened.

Example:

```text
UPI failure rates increased significantly over the last five minutes and are heavily concentrated among ABC Bank transactions.
```

---

## likely_root_cause

The most likely explanation supported by current evidence.

Example:

```text
Possible UPI degradation associated with ABC Bank.
```

---

## confidence

Range:

```text
0.00 – 1.00
```

Example:

```text
0.91
```

Confidence must represent evidence strength, not fabricated mathematical certainty.

---

## evidence

Example:

```json
[
  "ABC Bank represents 81% of failed UPI transactions.",
  "UPI failure rate increased from 5.1% to 28.4%.",
  "Card payment performance remains near historical baseline.",
  "Merchant API health remains normal."
]
```

---

## alternative_explanations

Possible competing hypotheses.

Example:

```json
[
  "A merchant-specific UPI configuration issue.",
  "A temporary upstream payment network degradation."
]
```

---

## uncertainties

Example:

```json
[
  "No direct provider outage confirmation is available.",
  "The incident has been active for only six minutes."
]
```

---

# 17. Investigation Prompt Rules

The system prompt should instruct the AI to:

1. Use only supplied evidence.
2. Never invent values.
3. Separate facts from hypotheses.
4. State uncertainty explicitly.
5. Avoid declaring fraud without confirmation.
6. Prefer concise operational explanations.
7. Return structured output.
8. Never execute actions.
9. Never modify risk scores.
10. Never treat missing data as suspicious evidence.

---

# 18. Investigation Prompt Concept

Conceptual system instruction:

```text
You are PayGuard AI, a payment-risk investigation assistant.

Analyze only the structured evidence provided.

Do not invent transaction facts, provider outages, customer behavior, or financial values.

Clearly distinguish:
- observed facts
- likely explanations
- uncertainties

If evidence is insufficient, say so.

Never declare fraud confirmed unless the supplied data explicitly marks it as confirmed.

Return output matching the required structured schema.
```

---

# 19. Root-Cause Reasoning

Possible root-cause categories:

```text
BANK_DEGRADATION
PAYMENT_METHOD_DEGRADATION
MERCHANT_INTEGRATION
CUSTOMER_BEHAVIOR
DEVICE_ABUSE
VELOCITY_ATTACK
DUPLICATE_PAYMENT_PATTERN
REFUND_ANOMALY
UNKNOWN
```

AI may choose:

```text
UNKNOWN
```

when evidence is insufficient.

This is preferable to hallucinating a cause.

---

# 20. Evidence Hierarchy

AI should prioritize evidence in this order:

```text
1. Transaction facts
2. Deterministic risk factors
3. Statistical anomaly results
4. Historical baselines
5. Incident metrics
6. Related incident history
7. AI interpretation
```

AI interpretation is always the lowest-authority layer.

---

# 21. Confidence Handling

Confidence should depend on factors such as:

```text
Strength of anomaly
Sample size
Concentration of failures
Agreement between multiple signals
Quality of historical baseline
Presence of conflicting evidence
```

Examples:

```text
0.30
Weak evidence

0.55
Moderate evidence

0.75
Strong evidence

0.90+
Very strong evidence
```

These are presentation guidelines, not scientifically calibrated probabilities.

---

# 22. Hallucination Prevention

PayGuard AI must use multiple safeguards.

## Guard 1 — Structured Context

The model receives controlled structured evidence.

## Guard 2 — Structured Output

AI must return a predefined schema.

## Guard 3 — Schema Validation

Pydantic validates:

```text
confidence
required fields
field types
allowed values
```

## Guard 4 — Evidence Validation

AI-generated evidence should reference facts present in supplied context.

## Guard 5 — Safe Fallback

If the response cannot be validated:

```text
Investigation unavailable.
Deterministic risk information remains available.
```

---

# 23. AI Output Validation

Conceptual schema:

```python
class InvestigationResult(BaseModel):
    summary: str
    likely_root_cause: str
    confidence: float
    evidence: list[str]
    alternative_explanations: list[str]
    uncertainties: list[str]
    recommended_next_checks: list[str]
```

Constraint:

```text
0 <= confidence <= 1
```

---

# 24. Invalid AI Response

If the AI returns malformed output:

```text
Parse
   ↓
Validation fails
   ↓
Retry once with repair instruction
```

If it still fails:

```text
Mark investigation as FAILED
```

Do not store invalid AI output as a successful investigation.

---

# 25. AI Retry Strategy

Recommended MVP behavior:

```text
Initial request
   ↓
Failure?
   ↓
Retry once
   ↓
Failure?
   ↓
Persist failure status
```

Avoid infinite retries.

---

# 26. AI Timeout

The risk pipeline must continue even if the model is slow.

Example:

```text
Transaction persisted ✅
Risk score generated ✅
Incident created ✅
AI investigation timeout ❌
```

The application should still show:

```text
AI investigation pending/unavailable
```

---

# 27. AI Failure Isolation

AI is outside the critical transaction path.

This means:

```text
AI_PROVIDER_DOWN
```

must not stop:

* Transaction ingestion
* Risk scoring
* Incident detection
* Alerts
* Dashboard metrics

---

# 28. AI Investigation Status

Possible statuses:

```text
PENDING
RUNNING
COMPLETED
FAILED
```

Future:

```text
STALE
RETRYING
```

---

# 29. Risk Explanation Engine

Apart from full incident investigations, AI may generate natural-language explanations for transaction risk.

Example deterministic factors:

```text
EXTREME_AMOUNT +25
HIGH_VELOCITY +20
NEW_DEVICE +10
```

AI explanation:

```text
This transaction is considered high risk because its amount is significantly above the customer's normal spending pattern, multiple payment attempts occurred within a short period, and the transaction originated from a previously unseen device.
```

The explanation must not change the numeric score.

---

# 30. Recommendation Engine

AI may generate recommendations based on:

```text
Incident type
Risk level
Root cause
Financial exposure
Operational evidence
```

---

# 31. Recommendation Output Schema

```json
{
  "recommendation_type": "PROMOTE_ALTERNATE_PAYMENT_METHOD",
  "title": "Promote alternate payment methods",
  "description": "",
  "reasoning": "",
  "expected_impact": "",
  "risk_if_ignored": "",
  "requires_approval": false,
  "priority": "HIGH"
}
```

---

# 32. Recommendation Safety

The AI can recommend:

```text
Increase monitoring
Create alert
Promote alternate payment method
Escalate incident
Request verification
Review transactions
```

AI cannot directly:

```text
Block customer
Freeze merchant
Disable payment method
Change routing
Modify limits
```

Those actions must go through the approval system.

---

# 33. Recommendation Type Registry

Recommendation types should be predefined where possible.

Examples:

```text
INCREASE_MONITORING

PROMOTE_ALTERNATE_PAYMENT_METHOD

ESCALATE_INCIDENT

REQUEST_ADDITIONAL_VERIFICATION

REVIEW_HIGH_RISK_TRANSACTIONS

MONITOR_PROVIDER

RATE_LIMIT_PATTERN

RESTRICT_ACCOUNT
```

This is better than allowing the model to invent arbitrary executable actions.

---

# 34. AI-to-Action Boundary

Correct architecture:

```text
AI Recommendation
       ↓
Recommendation Validator
       ↓
Action Registry
       ↓
Approval Requirement Check
       ↓
Human Approval if Needed
       ↓
Action Executor
```

Incorrect architecture:

```text
LLM
 ↓
Directly performs financial action
```

---

# 35. AI Risk Copilot

The Copilot allows users to ask questions about PayGuard data.

Examples:

```text
Why did payment risk increase today?
```

```text
Which bank is causing the most failures?
```

```text
Show me the highest-risk transactions.
```

```text
Why was transaction TXN-1042 classified as critical?
```

```text
How much revenue is at risk?
```

---

# 36. Copilot Architecture

```text
User Question
     ↓
Authentication
     ↓
Intent Classification
     ↓
Entity Extraction
     ↓
Authorization Check
     ↓
Data Retrieval
     ↓
Context Builder
     ↓
AI
     ↓
Structured / Natural Response
     ↓
Frontend
```

---

# 37. Copilot Intent Types

Initial supported intents:

```text
DASHBOARD_SUMMARY

INCIDENT_SUMMARY

INCIDENT_EXPLANATION

TRANSACTION_EXPLANATION

RISK_TREND

PAYMENT_METHOD_ANALYSIS

BANK_ANALYSIS

MERCHANT_ANALYSIS

REVENUE_AT_RISK

ALERT_SUMMARY

GENERAL_RISK_QUESTION
```

---

# 38. Intent Example

User:

```text
Why are UPI payments failing?
```

Detected intent:

```text
PAYMENT_METHOD_ANALYSIS
```

Entity:

```text
payment_method = UPI
```

Backend retrieves:

```text
Current UPI metrics
Historical UPI baseline
Provider distribution
Active UPI incidents
Relevant alerts
```

Then builds AI context.

---

# 39. Copilot Must Query Real Data

The Copilot must never answer operational questions entirely from model knowledge.

Correct:

```text
Question
 ↓
Query PayGuard Database
 ↓
Build context
 ↓
AI response
```

Incorrect:

```text
Question
 ↓
LLM general knowledge
 ↓
Guess
```

---

# 40. Copilot No-Data Response

If no relevant data exists:

```text
I don't have enough PayGuard data to determine the cause yet.
```

Do not invent a likely incident.

---

# 41. Copilot Entity References

Responses may reference:

```text
Incident IDs
Transaction IDs
Merchant IDs
Payment methods
Banks/providers
Risk factors
```

Example:

```text
Incident PG-2026-000042 is currently the largest contributor to UPI risk.
```

Frontend may later make these references clickable.

---

# 42. Copilot Authorization

Copilot queries must respect user permissions.

A user should only retrieve data they are authorized to see.

AI must not bypass backend authorization.

---

# 43. Conversation Storage

Conversation storage:

```text
copilot_conversations
copilot_messages
```

Store:

* User question
* AI response
* Timestamp
* Referenced entities
* Context metadata

Avoid storing unnecessary sensitive raw data.

---

# 44. Copilot Context Snapshot

For traceability, the system may store a safe snapshot describing which data supported a response.

Example:

```json
{
  "incident_ids": [
    "PG-2026-000042"
  ],
  "transaction_count": 342,
  "metric_window": "15_MIN",
  "generated_at": "2026-08-24T10:40:00Z"
}
```

---

# 45. AI Prompt Versioning

Prompts must be versioned.

Examples:

```text
investigation-v1
recommendation-v1
copilot-v1
transaction-explanation-v1
```

If a prompt changes:

```text
investigation-v2
```

Historical investigations retain their original prompt version.

---

# 46. AI Model Metadata

Each investigation should store:

```text
model_provider
model_name
prompt_version
generated_at
```

This improves traceability.

---

# 47. Temperature

Risk investigation should use relatively deterministic generation.

Recommended:

```text
Low temperature
```

Creative writing behavior is not desirable in a payment-risk system.

Exact provider configuration will be chosen during implementation.

---

# 48. AI Cost Control

To prevent unnecessary calls:

Do not run full AI investigation for:

```text
Every LOW-risk transaction
Every normal transaction
Every dashboard refresh
```

Prefer AI calls when:

```text
Incident created
Incident significantly changes
Analyst requests explanation
Copilot query submitted
Recommendation required
```

---

# 49. Investigation Deduplication

If an incident has not meaningfully changed:

```text
Do not regenerate investigation repeatedly.
```

Possible trigger for reinvestigation:

```text
Severity changes
Affected transaction count increases significantly
Root evidence changes
User explicitly requests refresh
```

---

# 50. Investigation Versioning

An incident may have multiple investigation versions.

Example:

```text
Investigation 1
14:35

Investigation 2
14:45
```

This allows the dashboard to show how understanding evolved over time.

---

# 51. AI Evidence Citation Inside Product

AI explanations should visibly connect to evidence.

Example UI:

```text
Likely Root Cause

ABC Bank UPI degradation

Confidence
91%

Evidence

• UPI failure rate: 28.4%
• Historical baseline: 5.1%
• ABC Bank share of failures: 81%
• Card payments remain normal
```

This is stronger than presenting a paragraph with no evidence.

---

# 52. Revenue-at-Risk Boundary

The LLM must not calculate the official revenue-at-risk number.

Instead:

```text
Revenue-at-Risk Engine
       ↓
₹4.28L
       ↓
AI explains the impact
```

AI may say:

```text
Approximately ₹4.28L is currently estimated to be at risk based on affected transaction value and the configured revenue-risk model.
```

It must not invent a different amount.

---

# 53. AI Security

Never send the following to an AI provider unless explicitly required and properly protected:

```text
Passwords
API secrets
JWT secrets
Razorpay secrets
Raw authentication tokens
Full payment credentials
Unnecessary customer PII
```

---

# 54. PII Minimization

Where possible send:

```text
customer_104
device_882
merchant_42
```

rather than unnecessary real personal identifiers.

AI analysis should operate primarily on behavioral and payment signals.

---

# 55. Prompt Injection Protection

External transaction metadata may contain arbitrary text.

Therefore user-controlled values must be treated as:

```text
DATA
```

not trusted instructions.

The prompt should clearly separate:

```text
SYSTEM INSTRUCTIONS
```

from:

```text
TRANSACTION DATA
```

Never concatenate untrusted text into system instructions.

---

# 56. Tool / Function Boundary

If future AI models support tool calling, tools must be strictly allow-listed.

Possible read-only tools:

```text
get_incident
get_transaction
get_risk_factors
get_payment_metrics
get_recent_alerts
```

Sensitive tools must require server-side authorization and approval.

---

# 57. AI Audit Events

Create audit events for:

```text
AI_INVESTIGATION_STARTED

AI_INVESTIGATION_COMPLETED

AI_INVESTIGATION_FAILED

AI_RECOMMENDATION_GENERATED

COPILOT_QUERY_SUBMITTED
```

Sensitive prompts should not automatically be copied into logs.

---

# 58. AI Error Handling

Common failures:

```text
Provider unavailable
Timeout
Rate limit
Invalid API key
Malformed response
Schema validation failure
Context building failure
```

Errors should be mapped to internal safe codes.

Example:

```text
AI_PROVIDER_TIMEOUT
```

Frontend:

```text
AI investigation is temporarily unavailable.
Risk detection remains active.
```

---

# 59. AI Service Health

Possible internal health information:

```text
Provider available
Average response latency
Recent failure rate
Last successful request
```

The dashboard may show AI system health later.

---

# 60. AI Testing

AI tests should not rely only on manually inspecting responses.

Test:

```text
Schema validity
Required fields
Confidence bounds
Allowed root-cause categories
No empty evidence
Failure handling
Timeout handling
Missing-data behavior
```

---

# 61. Hallucination Test Cases

Example context:

```text
Bank information unavailable
```

AI must not respond:

```text
ABC Bank caused the incident.
```

Correct:

```text
The current evidence does not identify a specific bank as the cause.
```

---

# 62. No-Evidence Test

Input:

```text
10 transactions
No anomaly
No unusual failures
No risk factors
```

Expected behavior:

```text
No strong risk pattern is currently supported by the available evidence.
```

---

# 63. Conflicting-Evidence Test

Example:

```text
UPI failures increased

but

all banks show similar failure rates
```

AI should not claim:

```text
ABC Bank outage
```

It should state:

```text
The available evidence suggests broader UPI degradation rather than a bank-specific issue.
```

---

# 64. Provider-Outage Demo Scenario

Structured evidence:

```text
UPI current failure rate:
28.4%

UPI baseline:
5.1%

ABC Bank failure share:
81%

Card failure rate:
4.1%

Card baseline:
3.9%

Merchant API:
Healthy
```

Expected AI conclusion:

```text
Likely ABC Bank-associated UPI degradation.
```

Expected confidence:

```text
HIGH
```

Expected uncertainty:

```text
No direct external provider outage confirmation is available.
```

---

# 65. Fraud-Pattern Demo Scenario

Evidence:

```text
One device
14 customers
39 transactions
21 failures
11 HIGH/CRITICAL transactions
```

Expected AI behavior:

```text
Potential coordinated device-based abuse pattern.
```

Avoid:

```text
These 14 customers are fraudsters.
```

---

# 66. AI Response UX

AI responses should be structured in the UI.

Preferred:

```text
AI Investigation

Summary

Likely Root Cause

Confidence

Evidence

Uncertainties

Recommended Actions
```

Avoid displaying one giant unstructured AI paragraph.

---

# 67. AI Confidence UX

Example:

```text
Confidence
91%
```

UI may additionally show:

```text
Very High
High
Moderate
Low
```

But the application should explain that confidence represents AI assessment based on available evidence.

---

# 68. Suggested Confidence Labels

```text
0–39%
LOW

40–64%
MODERATE

65–84%
HIGH

85–100%
VERY HIGH
```

These are UX labels rather than guaranteed statistical probabilities.

---

# 69. AI Investigation API

Planned endpoint:

```text
POST /api/v1/incidents/{incident_id}/investigate
```

Response:

```json
{
  "investigation_id": "...",
  "status": "COMPLETED",
  "summary": "...",
  "likely_root_cause": "...",
  "confidence": 0.91,
  "evidence": [],
  "uncertainties": []
}
```

---

# 70. Copilot API

Planned endpoint:

```text
POST /api/v1/copilot/query
```

Request:

```json
{
  "question": "Why are UPI payments failing?"
}
```

Response:

```json
{
  "answer": "...",
  "intent": "PAYMENT_METHOD_ANALYSIS",
  "referenced_incidents": [],
  "referenced_transactions": [],
  "generated_at": "..."
}
```

---

# 71. Recommendation API

Possible endpoint:

```text
POST /api/v1/incidents/{incident_id}/recommendations/generate
```

Recommendations should still pass through validation before persistence.

---

# 72. Deterministic Fallback

Even without AI, PayGuard must be able to show:

```text
Risk Score

Risk Level

Risk Factors

Anomaly Signals

Incident Metrics

Revenue at Risk
```

This ensures the product remains useful if the AI provider is unavailable.

---

# 73. Future AI Improvements

Future versions may add:

```text
Multi-agent investigation

Historical incident retrieval

Graph-based fraud reasoning

Merchant-specific AI context

Analyst feedback integration

Incident similarity search

Automatic report generation

Provider status correlation

Predictive incident progression
```

These should not block the MVP.

---

# 74. Future Multi-Agent Architecture

Potential future system:

```text
Incident
   ↓
Risk Analyst Agent
   ↓
Fraud Pattern Agent
   ↓
Payment Infrastructure Agent
   ↓
Evidence Reviewer
   ↓
Final Investigation
```

For the hackathon MVP:

```text
Single orchestrated investigation pipeline
```

is preferred.

Avoid unnecessary agent complexity.

---

# 75. AI MVP Requirements

The initial AI implementation must support:

1. Provider abstraction
2. Context Builder
3. Structured investigation input
4. Structured AI output
5. Pydantic validation
6. Root-cause explanation
7. Evidence output
8. Confidence output
9. Uncertainty output
10. Recommendations
11. AI Copilot
12. Error handling
13. Retry handling
14. Prompt versioning
15. AI audit events

---

# 76. AI Implementation Order

Build AI in this order:

```text
1. AI schemas

2. Provider abstraction

3. Provider client

4. Investigation context builder

5. Investigation prompt

6. Structured output validation

7. Investigation persistence

8. Recommendation engine

9. Copilot intent layer

10. Copilot context retrieval

11. Copilot answer generation

12. AI testing

13. Retry/fallback behavior
```

---

# 77. AI Boundaries Summary

## AI CAN

```text
Investigate
Explain
Summarize
Recommend
Answer questions
Identify likely causes
Describe uncertainty
```

## AI CANNOT

```text
Change risk scores
Modify payments
Invent evidence
Confirm fraud without evidence
Reveal secrets
Bypass authorization
Execute sensitive actions directly
Overwrite transaction facts
```

---

# 78. Final AI Architecture

```text
PAYGUARD DATABASE
       ↓
DETERMINISTIC EVIDENCE
       ↓
CONTEXT BUILDER
       ↓
DATA MINIMIZATION
       ↓
PROMPT BUILDER
       ↓
AI PROVIDER
       ↓
STRUCTURED RESPONSE
       ↓
PYDANTIC VALIDATION
       ↓
SAFETY VALIDATION
       ↓
INVESTIGATION / RECOMMENDATION
       ↓
PAYGUARD DASHBOARD
```

---

# 79. AI Copilot Architecture

```text
USER QUESTION
      ↓
INTENT DETECTION
      ↓
ENTITY EXTRACTION
      ↓
AUTHORIZATION
      ↓
PAYGUARD DATA RETRIEVAL
      ↓
CONTEXT BUILDER
      ↓
AI
      ↓
VALIDATION
      ↓
ANSWER + EVIDENCE REFERENCES
```

---

# 80. AI System Success Criteria

The PayGuard AI layer is successful when:

1. It explains deterministic risk results instead of replacing them.
2. It investigates active incidents using real evidence.
3. It identifies likely root causes.
4. It communicates uncertainty.
5. It provides evidence supporting conclusions.
6. It generates useful mitigation recommendations.
7. It answers natural-language questions using PayGuard data.
8. It never requires unrestricted database access.
9. It continues failing safely when the AI provider is unavailable.
10. It never executes sensitive financial actions directly.
11. Its outputs are structured and validated.
12. Every AI-generated investigation remains traceable to the data used.

The AI layer should make PayGuard feel intelligent while keeping the financial-risk system deterministic, auditable, explainable, and safe.
