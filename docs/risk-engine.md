# PayGuard AI — Risk Engine Specification

## 1. Document Purpose

This document defines the architecture, rules, scoring logic, anomaly detection methods, thresholds, and explainability requirements for the **PayGuard AI Risk Engine**.

The Risk Engine is responsible for transforming raw payment activity into:

* Risk features
* Rule matches
* Anomaly signals
* Risk factors
* Transaction risk scores
* Risk classifications
* Incident triggers
* Explainable evidence

The Risk Engine must operate independently of the LLM layer.

The AI Investigation Engine may explain and investigate risk results, but it must not invent or directly replace deterministic risk calculations.

---

# 2. Risk Engine Goal

The goal of the PayGuard Risk Engine is to answer:

```text
How risky is this transaction or payment pattern?
```

and:

```text
Why is it risky?
```

Every risk decision should therefore produce both:

```text
RISK SCORE
+
EXPLANATION
```

Example:

```text
Risk Score: 87 / 100
Risk Level: CRITICAL
```

Reasons:

```text
+25 High transaction velocity
+20 Abnormally high transaction amount
+18 New device
+14 Repeated payment failures
+10 Location anomaly
```

---

# 3. Risk Engine Philosophy

PayGuard AI uses a hybrid risk architecture.

```text
Deterministic Rules
        +
Statistical Anomaly Detection
        +
Historical Behavior
        +
Contextual Signals
        ↓
Final Risk Score
```

The first version will prioritize:

* Explainability
* Deterministic behavior
* Testability
* Fast execution
* Clear evidence
* Stable demonstrations

Complex machine-learning models are not required for the initial MVP.

---

# 4. Risk Processing Pipeline

```text
Incoming Transaction
        ↓
Validate Input
        ↓
Load Historical Context
        ↓
Extract Features
        ↓
Run Deterministic Rules
        ↓
Run Anomaly Detectors
        ↓
Calculate Component Scores
        ↓
Apply Score Caps
        ↓
Calculate Final Risk Score
        ↓
Classify Risk
        ↓
Generate Risk Factors
        ↓
Evaluate Incident Triggers
        ↓
Store Results
```

---

# 5. Risk Components

The final risk score will consist of three main components.

```text
Rule Score
+
Anomaly Score
+
Contextual Score
```

Recommended maximum contribution:

```text
Rule Score:       70 points
Anomaly Score:    20 points
Contextual Score: 10 points
```

Maximum:

```text
100
```

This prevents any single risk category from dominating the system uncontrollably.

---

# 6. Final Risk Formula

Initial MVP formula:

```text
final_score =
min(
    100,
    rule_score
    + anomaly_score
    + contextual_score
)
```

Example:

```text
Rule Score       = 58
Anomaly Score    = 17
Contextual Score = 8
```

Final:

```text
83
```

Classification:

```text
CRITICAL
```

---

# 7. Risk Levels

Risk classification:

```text
0 – 29
LOW
```

```text
30 – 59
MEDIUM
```

```text
60 – 79
HIGH
```

```text
80 – 100
CRITICAL
```

Risk levels must be implemented using shared enums rather than duplicated strings throughout the codebase.

---

# 8. Risk Feature Object

Before evaluating rules, the Feature Extraction Engine should build a structured object.

Example:

```json
{
  "transaction_amount": 5000000,
  "customer_average_amount": 420000,
  "amount_ratio": 11.9,
  "transactions_last_60_seconds": 7,
  "transactions_last_10_minutes": 12,
  "failed_attempts_last_10_minutes": 5,
  "is_new_device": true,
  "is_new_location": true,
  "country_changed": false,
  "merchant_failure_rate": 0.042,
  "payment_method_failure_rate": 0.151,
  "bank_failure_rate": 0.284,
  "historical_bank_failure_rate": 0.051,
  "customer_historical_risk_score": 28
}
```

This feature object becomes the input to both the rule and anomaly engines.

---

# 9. Feature Categories

Features will be grouped into:

```text
Transaction Features
Customer Features
Device Features
Velocity Features
Location Features
Merchant Features
Payment Method Features
Bank / Provider Features
Failure Features
Historical Features
```

---

# 10. Transaction Amount Features

Important values:

```text
transaction_amount
customer_average_amount
merchant_average_amount
amount_ratio_customer
amount_ratio_merchant
```

Example:

```text
Transaction:
₹50,000

Customer Average:
₹4,200

Ratio:
11.9x
```

---

# 11. Velocity Features

Velocity measures how quickly transactions occur.

Features:

```text
transactions_last_30_seconds
transactions_last_60_seconds
transactions_last_5_minutes
transactions_last_10_minutes
transactions_last_1_hour
```

Also:

```text
failed_transactions_last_60_seconds
failed_transactions_last_10_minutes
unique_cards_last_10_minutes
unique_customers_from_device
unique_devices_for_customer
```

---

# 12. Failure Features

Features:

```text
customer_failure_rate
merchant_failure_rate
bank_failure_rate
payment_method_failure_rate
recent_failed_attempts
consecutive_failures
failure_code_frequency
```

---

# 13. Device Features

Features:

```text
is_new_device
device_age
customers_using_device
transactions_from_device
failed_transactions_from_device
high_risk_transactions_from_device
```

A device becomes more suspicious when it is associated with unusually large numbers of unrelated customers or repeated failed payments.

---

# 14. Geographic Features

Features:

```text
is_new_country
is_new_city
distance_from_previous_transaction
impossible_travel
country_risk_signal
location_change_frequency
```

The MVP should avoid overclaiming geographic certainty.

Location information should be treated as supporting evidence rather than proof of fraud.

---

# 15. Payment Infrastructure Features

Infrastructure signals are important because not all payment failures are fraud.

Features:

```text
bank_failure_rate
payment_method_failure_rate
provider_failure_rate
merchant_failure_rate
historical_bank_baseline
historical_method_baseline
```

Example:

```text
ABC Bank UPI current failure rate:
28.4%

Historical baseline:
5.1%
```

This is more likely to indicate provider degradation than customer fraud.

---

# 16. Rule Engine Output

Every matched rule produces a structured result.

Example:

```json
{
  "rule_code": "HIGH_VELOCITY",
  "matched": true,
  "score": 25,
  "severity": "HIGH",
  "reason": "Customer attempted 7 transactions within 60 seconds.",
  "evidence": {
    "transactions_last_60_seconds": 7,
    "threshold": 5
  }
}
```

This result becomes a `risk_factor`.

---

# 17. Core MVP Rules

Initial PayGuard AI should implement the following deterministic rules.

```text
R001 HIGH_AMOUNT
R002 EXTREME_AMOUNT
R003 HIGH_VELOCITY
R004 EXTREME_VELOCITY
R005 REPEATED_FAILURES
R006 NEW_DEVICE
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

---

# 18. R001 — High Transaction Amount

Rule:

```text
HIGH_AMOUNT
```

Condition:

```text
transaction_amount >= customer_average_amount × 5
```

Minimum historical transaction requirement:

```text
customer_history_count >= 5
```

Score:

```text
+15
```

Severity:

```text
MEDIUM
```

Example:

```text
Historical Average:
₹4,000

Current Transaction:
₹24,000
```

Ratio:

```text
6x
```

Result:

```text
+15
```

---

# 19. R002 — Extreme Transaction Amount

Condition:

```text
transaction_amount >= customer_average_amount × 10
```

Score:

```text
+25
```

Severity:

```text
HIGH
```

Important:

`HIGH_AMOUNT` and `EXTREME_AMOUNT` must not stack fully.

If `EXTREME_AMOUNT` matches, the engine should use the stronger amount rule.

Correct:

```text
+25
```

Not:

```text
+15 +25
```

---

# 20. R003 — High Transaction Velocity

Condition:

```text
transactions_last_60_seconds >= 5
```

Score:

```text
+20
```

Severity:

```text
HIGH
```

Evidence:

```text
Transaction count
Time window
Threshold
```

---

# 21. R004 — Extreme Transaction Velocity

Condition:

```text
transactions_last_60_seconds >= 10
```

Score:

```text
+30
```

Severity:

```text
CRITICAL
```

`HIGH_VELOCITY` and `EXTREME_VELOCITY` belong to the same score group.

Only the strongest matched rule contributes to the final score.

---

# 22. R005 — Repeated Payment Failures

Condition:

```text
failed_attempts_last_10_minutes >= 4
```

Score:

```text
+15
```

For:

```text
failed_attempts_last_10_minutes >= 8
```

Score:

```text
+25
```

Repeated failures may indicate:

* Credential testing
* User retries
* Provider problems
* Automated abuse

Therefore this factor must be interpreted alongside infrastructure signals.

---

# 23. R006 — New Device

Condition:

```text
device_fingerprint is not present
in customer's historical devices
```

Score:

```text
+10
```

New devices alone should never create CRITICAL risk.

They are contextual indicators.

---

# 24. R007 — Device Shared Across Many Customers

Condition:

```text
unique_customers_from_device >= 5
within 24 hours
```

Score:

```text
+20
```

For:

```text
unique_customers_from_device >= 10
```

Score:

```text
+30
```

This may indicate:

* Automated activity
* Shared infrastructure
* Fraud ring behavior
* Legitimate shared environments

Therefore the reason should describe it as suspicious behavior, not confirmed fraud.

---

# 25. R008 — New Location

Condition:

```text
location not previously observed
for customer
```

Score:

```text
+5
```

This is deliberately low because legitimate users travel.

---

# 26. R009 — Rapid Location Change

Example condition:

```text
Previous transaction:
Bengaluru

Current transaction:
London

Time difference:
20 minutes
```

If the geographical distance is impossible to reasonably travel within that time:

```text
+15
```

This signal is supporting evidence only.

---

# 27. R010 — Customer Risk History

Condition:

```text
customer_historical_risk_score >= 70
```

Score:

```text
+10
```

For:

```text
customer_historical_risk_score >= 85
```

Score:

```text
+15
```

Historical risk must not permanently punish a customer.

The value should decay or be recalculated over time in future versions.

---

# 28. R011 — Bank Failure Spike

This is an operational risk rule.

Condition:

```text
current_bank_failure_rate
>
historical_bank_failure_rate × 2
```

AND:

```text
minimum transaction sample >= 20
```

Score:

```text
+15 anomaly/operational risk
```

For:

```text
current rate >= baseline × 4
```

Score:

```text
+25
```

This signal should primarily contribute toward:

```text
BANK_DEGRADATION
```

incidents.

---

# 29. R012 — Payment Method Failure Spike

Example:

```text
Current UPI Failure Rate:
17%

Historical:
4%
```

Condition:

```text
current_method_failure_rate
>=
baseline_failure_rate × 3
```

Minimum sample:

```text
30 transactions
```

Score:

```text
+20
```

---

# 30. R013 — Merchant Failure Spike

Condition:

```text
merchant current failure rate
>=
historical merchant failure rate × 3
```

Minimum sample:

```text
30 transactions
```

Score:

```text
+20
```

Potential causes:

* Merchant integration issue
* Payment configuration problem
* Provider degradation
* Platform incident

The AI Investigation Engine determines the likely explanation using additional evidence.

---

# 31. R014 — Refund Pattern

Condition example:

```text
refund_rate_1_hour
>=
historical_refund_rate × 3
```

Minimum sample required.

Score:

```text
+15
```

Possible incident:

```text
REFUND_SPIKE
```

---

# 32. R015 — Duplicate Payment Pattern

Condition:

Multiple transactions with:

```text
same merchant
same customer
same amount
small time window
```

Example:

```text
3 matching payments within 30 seconds
```

Score:

```text
+15
```

The engine must differentiate between:

```text
Duplicate user attempts
```

and:

```text
Successfully captured duplicate payments
```

Captured duplicates should receive higher operational priority.

---

# 33. Rule Groups

Rules that describe the same underlying behavior should not blindly stack.

Groups:

```text
AMOUNT
VELOCITY
FAILURE
DEVICE
LOCATION
INFRASTRUCTURE
REFUND
DUPLICATE
HISTORICAL
```

Example:

```text
HIGH_AMOUNT = +15
EXTREME_AMOUNT = +25
```

If both match:

```text
AMOUNT contribution = 25
```

not:

```text
40
```

---

# 34. Rule Score Calculation

For each group:

```text
group_score =
max(score of matched rules in group)
```

Final:

```text
rule_score =
sum(group_scores)
```

Then apply:

```text
rule_score = min(rule_score, 70)
```

---

# 35. Anomaly Detection Engine

The anomaly engine measures deviations from historical behavior.

Initial MVP anomaly methods:

```text
Rolling average
Rolling standard deviation
Z-score
Ratio-to-baseline
Percentage deviation
Velocity deviation
```

---

# 36. Z-Score Detection

Formula:

```text
z =
(current_value - historical_mean)
/
historical_standard_deviation
```

Interpretation:

```text
|z| < 2
Normal

2 <= |z| < 3
Moderate anomaly

|z| >= 3
Strong anomaly
```

Risk contribution example:

```text
2.0 – 2.49 → +5
2.5 – 2.99 → +10
3.0+       → +15
```

---

# 37. Failure Rate Anomaly

Example:

Historical bank failure rate:

```text
5%
```

Current rolling rate:

```text
21%
```

Increase:

```text
4.2x baseline
```

This should generate an anomaly signal such as:

```json
{
  "signal_type": "BANK_FAILURE_SPIKE",
  "observed_value": 0.21,
  "baseline_value": 0.05,
  "deviation": 4.2,
  "anomaly_score": 18
}
```

---

# 38. Amount Anomaly

Customer-based amount anomaly:

```text
historical mean
historical standard deviation
current transaction
```

Example:

```text
Average:
₹4,300

Standard deviation:
₹2,000

Current:
₹25,000
```

This produces a strong statistical outlier.

However:

The deterministic amount rule remains the primary explainable signal.

Anomaly detection supplements it.

---

# 39. Anomaly Score Cap

Total anomaly contribution:

```text
maximum = 20
```

This prevents statistical noise from dominating deterministic evidence.

---

# 40. Contextual Score

Contextual signals include:

```text
Historical customer risk
Merchant risk
Previous related incidents
Recent alerts
Known suspicious device history
```

Maximum contextual contribution:

```text
10
```

---

# 41. Contextual Example

Customer:

```text
Historical Risk:
78
```

Device:

```text
Previously involved in:
2 HIGH-risk transactions
```

Merchant:

```text
Current state:
Normal
```

Contextual contribution:

```text
+8
```

---

# 42. Score Calculation Example

Transaction:

```text
₹50,000 UPI payment
```

Signals:

```text
Extreme amount               +25
High velocity                +20
New device                   +10
Repeated failures            +15
```

Rule subtotal:

```text
70
```

Anomaly engine:

```text
Amount anomaly               +10
Velocity anomaly              +5
```

Anomaly subtotal:

```text
15
```

Context:

```text
Previous customer risk        +5
```

Final:

```text
70 + 15 + 5
=
90
```

Result:

```text
90 / 100
CRITICAL
```

---

# 43. Positive / Risk-Reducing Signals

Future versions may include negative score adjustments.

Examples:

```text
Trusted long-term device
Known customer behavior
Strong verification
Stable merchant
Normal location
```

However, negative scoring should be used cautiously.

For MVP:

```text
No negative risk scores.
```

Instead, absence of suspicious signals naturally results in a lower risk score.

---

# 44. Minimum Data Requirements

Historical rules require enough evidence.

Example:

A customer with only:

```text
1 previous transaction
```

does not have a reliable historical average.

Therefore:

```text
HIGH_AMOUNT historical comparison
```

should only activate when:

```text
historical transaction count >= 5
```

Otherwise the engine may use merchant or population baselines.

---

# 45. Cold Start Handling

For new customers:

Use:

```text
Merchant average
Payment method average
Global simulator baseline
```

instead of unavailable customer history.

Cold start must never produce invented customer history.

---

# 46. Missing Data Handling

Example:

```text
device_fingerprint = null
```

The engine should not assume:

```text
NEW_DEVICE
```

Instead:

```text
Device risk signal unavailable
```

Missing information is not automatically suspicious.

---

# 47. Risk Factor Explainability

Every contributing factor must expose:

```text
factor_code
factor_name
factor_type
score_contribution
reason
evidence
```

Example:

```json
{
  "factor_code": "HIGH_VELOCITY",
  "factor_name": "High transaction velocity",
  "factor_type": "RULE",
  "score_contribution": 20,
  "reason": "7 transactions were attempted within 60 seconds.",
  "evidence": {
    "observed": 7,
    "threshold": 5,
    "window_seconds": 60
  }
}
```

---

# 48. Explainability Language Rules

Use:

```text
Suspicious pattern detected
Unusual behavior observed
Risk signal
Potential account abuse
Possible provider degradation
```

Avoid unsupported statements such as:

```text
This customer is a fraudster.
```

or:

```text
Fraud confirmed.
```

unless a separate authoritative system provides such a confirmed status.

---

# 49. Incident Trigger Logic

Not every risky transaction should create an incident.

Incident triggers should depend on:

```text
Risk severity
Transaction count
Pattern concentration
Financial exposure
Time window
Infrastructure anomaly
```

---

# 50. Transaction-Level Incident Trigger

Possible condition:

```text
risk_level = CRITICAL
```

AND:

```text
risk_score >= 90
```

May generate:

```text
HIGH_RISK_TRANSACTION
```

incident if additional critical signals exist.

---

# 51. Pattern-Level Incident Trigger

Example:

```text
UPI failures >= 30
within 5 minutes
```

AND:

```text
failure rate >= 3× historical baseline
```

Generate:

```text
PAYMENT_FAILURE_SPIKE
```

incident.

---

# 52. Bank Degradation Incident Trigger

Possible condition:

```text
bank transaction sample >= 20
```

AND:

```text
bank failure rate >= baseline × 3
```

AND:

```text
majority of failures concentrated in same bank
```

Generate:

```text
BANK_DEGRADATION
```

---

# 53. Fraud Pattern Incident Trigger

Possible condition:

```text
shared device
+
multiple customers
+
high velocity
+
high-risk transactions
```

Generate:

```text
FRAUD_PATTERN
```

or:

```text
VELOCITY_ATTACK
```

depending on evidence.

---

# 54. Incident Correlation Key

An incident correlation key may be generated from:

```text
incident_type
merchant
payment_method
bank
failure_code
time bucket
```

Example:

```text
BANK_DEGRADATION:
ABC_BANK:
UPI
```

Transactions matching the correlation pattern within the configured window may join the same incident.

---

# 55. Incident Severity Calculation

Example initial logic:

```text
LOW

Minimal impact
Low financial exposure
```

```text
MEDIUM

Growing anomaly
Limited transaction impact
```

```text
HIGH

Strong anomaly
Significant payment or financial impact
```

```text
CRITICAL

Severe anomaly
Large financial exposure
or rapidly growing incident
```

---

# 56. Revenue Impact as Severity Input

Example thresholds for simulator/demo configuration:

```text
< ₹10,000
Minimal financial impact

₹10,000 – ₹50,000
Moderate

₹50,000 – ₹2,00,000
High

> ₹2,00,000
Critical financial exposure
```

These are configurable demonstration thresholds, not universal production risk policies.

---

# 57. Risk Engine Configuration

Thresholds should not be scattered throughout Python files.

Configuration should be centralized.

Example:

```text
backend/app/modules/risk/config.py
```

or later database-driven configuration.

Example:

```python
HIGH_VELOCITY_THRESHOLD = 5
EXTREME_VELOCITY_THRESHOLD = 10
HIGH_AMOUNT_MULTIPLIER = 5
EXTREME_AMOUNT_MULTIPLIER = 10
```

Eventually these values may move to:

```text
risk_rules.configuration
```

---

# 58. Rule Versioning

Every risk rule must have a version.

Example:

```text
HIGH_VELOCITY
version 1
```

If the threshold changes:

```text
version 2
```

Historical scores remain connected to the rule version used at evaluation time.

---

# 59. Risk Model Versioning

Overall engine:

```text
risk-v1
```

Future:

```text
risk-v2
```

Each `risk_score` record stores:

```text
model_version
calculation_version
```

---

# 60. Deterministic Execution

Given:

```text
same transaction
same historical context
same configuration
same model version
```

the deterministic risk engine should return:

```text
same risk score
same risk factors
```

This is essential for testing.

---

# 61. Risk Engine Service Architecture

Recommended structure:

```text
backend/app/modules/risk/
│
├── service.py
├── schemas.py
├── constants.py
├── config.py
│
├── features/
│   ├── extractor.py
│   ├── schemas.py
│   └── queries.py
│
├── rules/
│   ├── base.py
│   ├── engine.py
│   ├── amount_rules.py
│   ├── velocity_rules.py
│   ├── failure_rules.py
│   ├── device_rules.py
│   ├── location_rules.py
│   └── infrastructure_rules.py
│
├── anomaly/
│   ├── engine.py
│   ├── statistics.py
│   ├── baselines.py
│   └── detectors.py
│
└── scoring/
    ├── engine.py
    ├── classifier.py
    └── schemas.py
```

---

# 62. Rule Interface

Every deterministic rule should expose a similar interface.

Conceptually:

```python
evaluate(features) -> RuleResult
```

Input:

```text
RiskFeatures
```

Output:

```text
RuleResult
```

---

# 63. RuleResult Structure

Conceptual schema:

```text
rule_code
matched
score
severity
group
reason
evidence
```

This allows the engine to evaluate rules consistently.

---

# 64. Risk Evaluation Result

Final risk engine output should resemble:

```json
{
  "transaction_id": "txn_internal_id",
  "risk_score": 87,
  "risk_level": "CRITICAL",
  "rule_score": 62,
  "anomaly_score": 17,
  "contextual_score": 8,
  "factors": [
    {
      "factor_code": "EXTREME_AMOUNT",
      "score_contribution": 25
    },
    {
      "factor_code": "HIGH_VELOCITY",
      "score_contribution": 20
    }
  ],
  "model_version": "risk-v1"
}
```

---

# 65. Processing Failure Behavior

If feature extraction fails completely:

```text
Do not fabricate a risk score.
```

Status should reflect:

```text
RISK_EVALUATION_FAILED
```

If one optional detector fails:

```text
Deterministic rules may still complete.
```

Record the unavailable signal.

---

# 66. AI Boundary

The LLM may consume:

```text
Risk Score
Risk Factors
Anomaly Signals
Incident Metrics
Historical Baselines
```

The LLM may NOT change:

```text
Transaction amount
Transaction status
Rule matches
Calculated risk score
Historical metrics
```

AI output belongs to:

```text
Investigation
Explanation
Recommendation
```

not deterministic risk state.

---

# 67. Example Scenario A — Normal Customer

Transaction:

```text
Amount:
₹1,200

Historical average:
₹1,350

Transactions last minute:
1

Known device:
Yes

Known city:
Yes

Failures:
0
```

Result:

```text
Risk Score:
3

Risk Level:
LOW
```

No incident created.

---

# 68. Example Scenario B — Suspicious Transaction

Transaction:

```text
Amount:
₹48,000

Historical average:
₹4,000

Transactions in 60 seconds:
7

Device:
New

Failed attempts:
5
```

Signals:

```text
EXTREME_AMOUNT       +25
HIGH_VELOCITY        +20
NEW_DEVICE           +10
REPEATED_FAILURES    +15
```

Rule score:

```text
70
```

Anomaly:

```text
+14
```

Context:

```text
+5
```

Final:

```text
89
```

Classification:

```text
CRITICAL
```

---

# 69. Example Scenario C — Provider Outage

Within five minutes:

```text
UPI transactions:
250

Failed:
71

Failure rate:
28.4%
```

Historical:

```text
5.1%
```

Distribution:

```text
ABC Bank:
81% of failures
```

Cards:

```text
Normal
```

Merchant API:

```text
Normal
```

Risk interpretation:

```text
Operational payment risk
```

Likely incident:

```text
BANK_DEGRADATION
```

This should NOT be presented as customer fraud.

---

# 70. Example Scenario D — Device Abuse Pattern

Within one hour:

```text
Device:
device_882

Customers:
14

Transactions:
39

Failed transactions:
21

High-risk transactions:
11
```

Possible factors:

```text
DEVICE_MULTI_CUSTOMER
HIGH_VELOCITY
REPEATED_FAILURES
```

Potential incident:

```text
FRAUD_PATTERN
```

The AI Investigation Engine may later summarize the relationship.

---

# 71. Testing Requirements

Every rule requires tests for:

```text
Below threshold
Exactly at threshold
Above threshold
Missing values
Cold-start customer
Invalid values
Strongest-rule selection
Score cap
```

Example for velocity:

```text
4 transactions → rule not matched

5 transactions → HIGH_VELOCITY

9 transactions → HIGH_VELOCITY

10 transactions → EXTREME_VELOCITY
```

---

# 72. Risk Score Tests

Required tests:

```text
Score never below 0
Score never above 100
Rule score capped at 70
Anomaly score capped at 20
Context score capped at 10
Classification boundaries correct
Same inputs produce same outputs
```

---

# 73. Classification Boundary Tests

```text
0   → LOW
29  → LOW

30  → MEDIUM
59  → MEDIUM

60  → HIGH
79  → HIGH

80  → CRITICAL
100 → CRITICAL
```

---

# 74. Monitoring Risk Engine Performance

Track:

```text
Risk evaluations per minute
Average evaluation latency
Rule match counts
Risk-level distribution
Evaluation failures
Incident trigger rate
Anomaly detection rate
```

Unexpected shifts can indicate a configuration or data problem.

---

# 75. False Positive Management

A risk engine that flags everything is not useful.

Future improvements may include:

```text
Analyst feedback
Rule tuning
Threshold calibration
Merchant-specific baselines
Customer-specific baselines
Risk suppression rules
Known-safe patterns
```

---

# 76. Feedback Loop

Future analyst feedback:

```text
Incident confirmed useful
False positive
Expected behavior
Needs investigation
```

may be stored and used to improve thresholds.

AI must not directly retrain or rewrite rules automatically.

---

# 77. Security Requirements

Risk-engine inputs must be validated.

The engine must not:

* Execute arbitrary rule code from untrusted configuration
* Trust frontend-calculated scores
* Accept externally supplied final risk levels
* Log sensitive raw customer information unnecessarily
* Allow unauthorized users to modify rule thresholds

---

# 78. Performance Requirements

For the hackathon MVP, individual transaction risk evaluation should target low latency.

Expected flow:

```text
Feature extraction
+
Rule execution
+
Basic anomaly checks
```

should complete quickly enough for near-real-time dashboard updates.

LLM investigation is intentionally outside this critical path.

---

# 79. MVP Implementation Order

Implement in this order:

```text
1. Risk enums and schemas
2. Feature extraction
3. Amount rules
4. Velocity rules
5. Failure rules
6. Device rules
7. Infrastructure rules
8. Rule grouping
9. Risk scoring
10. Classification
11. Risk factor persistence
12. Basic anomaly detection
13. Incident trigger hooks
14. Tests
```

---

# 80. MVP Rule Priority

Highest priority:

```text
HIGH_AMOUNT
EXTREME_AMOUNT
HIGH_VELOCITY
EXTREME_VELOCITY
REPEATED_FAILURES
NEW_DEVICE
BANK_FAILURE_SPIKE
PAYMENT_METHOD_FAILURE_SPIKE
MERCHANT_FAILURE_SPIKE
```

Secondary:

```text
NEW_LOCATION
RAPID_LOCATION_CHANGE
DEVICE_MULTI_CUSTOMER
REFUND_PATTERN
DUPLICATE_PAYMENT_PATTERN
CUSTOMER_RISK_HISTORY
```

---

# 81. Hackathon Demonstration Risk Scenario

The primary PayGuard AI demo should intentionally begin with:

```text
NORMAL TRAFFIC
```

Example:

```text
UPI failure rate:
3–5%
```

Then the simulator introduces:

```text
ABC Bank degradation
```

Traffic changes:

```text
ABC Bank UPI failure rate:
28%
```

PayGuard detects:

```text
BANK_FAILURE_SPIKE
PAYMENT_METHOD_FAILURE_SPIKE
```

Anomaly score increases.

Incident created:

```text
CRITICAL
UPI failure spike associated with ABC Bank
```

Then AI Investigation receives deterministic evidence.

AI explains:

```text
Failures are disproportionately concentrated in ABC Bank UPI payments while card traffic and merchant API health remain normal.
```

This demonstrates the difference between:

```text
Risk Detection
```

and:

```text
AI Investigation
```

---

# 82. Risk Engine Success Criteria

The Risk Engine is successful when it can:

1. Receive a normalized transaction.
2. Build risk features.
3. Evaluate deterministic rules.
4. Detect statistical anomalies.
5. Generate explainable risk factors.
6. Produce a reproducible score between 0 and 100.
7. Classify LOW, MEDIUM, HIGH, or CRITICAL.
8. Distinguish transaction risk from infrastructure risk.
9. Trigger incidents when meaningful patterns emerge.
10. Persist the evidence behind every decision.
11. Continue functioning even if the AI provider is unavailable.
12. Provide structured evidence to the AI Investigation Engine.

---

# 83. Final Risk Architecture

```text
TRANSACTION
      ↓
HISTORICAL CONTEXT
      ↓
FEATURE EXTRACTION
      ↓
 ┌───────────────┐
 │               │
 ↓               ↓
RULE ENGINE    ANOMALY ENGINE
 │               │
 └───────┬───────┘
         ↓
CONTEXTUAL SIGNALS
         ↓
RISK SCORING ENGINE
         ↓
0 – 100 SCORE
         ↓
RISK CLASSIFICATION
         ↓
EXPLAINABLE FACTORS
         ↓
INCIDENT TRIGGER
         ↓
AI INVESTIGATION
```

The deterministic Risk Engine remains the foundation of PayGuard AI's risk intelligence.

AI provides investigation and explanation on top of that foundation rather than replacing it.
