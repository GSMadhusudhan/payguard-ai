# PayGuard AI — Product Design System & UI Specification

## 1. Document Purpose

This document defines the complete product design system and user experience for **PayGuard AI**.

It covers:

* Visual direction
* Product layout
* Navigation
* Typography
* Color system
* Spacing
* Cards
* Tables
* Charts
* Status indicators
* Dashboard
* Transaction Explorer
* Transaction Detail
* Incident Management
* Incident Detail
* AI Investigation
* Risk Analytics
* Alerts
* AI Risk Copilot
* Approvals
* Simulator
* Authentication
* Responsive behavior
* Loading states
* Error states
* Accessibility
* Motion
* Design consistency rules

The goal is to create a product that feels like a real enterprise payment-risk platform.

---

# 2. Product Design Goal

PayGuard AI should visually communicate:

```text
TRUST
+
INTELLIGENCE
+
CONTROL
+
SPEED
+
FINANCIAL SERIOUSNESS
```

The UI should feel:

* Premium
* Technical
* Calm
* Precise
* Data-driven
* Modern
* Operational
* Enterprise-ready

It should NOT feel like:

* A college dashboard
* A generic admin template
* A colorful crypto product
* A gaming dashboard
* A basic Bootstrap project
* A chatbot with a few cards around it

---

# 3. Visual Direction

Primary direction:

```text
Dark Fintech Operations Interface
```

The product should primarily use:

```text
Near-black surfaces
Dark neutral panels
Subtle borders
High-contrast typography
Controlled semantic colors
Minimal gradients
Soft depth
Data-focused layouts
```

The design should allow risk information to stand out without making the entire interface red.

---

# 4. Design Philosophy

PayGuard follows five core principles.

## 4.1 Information Before Decoration

Risk operations contain large amounts of information.

The user should immediately understand:

```text
What is happening?
How serious is it?
What is affected?
Why did it happen?
What should I do?
```

Decorative effects must never reduce clarity.

---

## 4.2 Semantic Color

Color should communicate meaning.

Example:

```text
Green
Healthy / successful

Amber
Warning / medium risk

Orange
High risk

Red
Critical risk

Blue / Purple
AI intelligence / informational
```

Do not use random bright colors merely for visual variety.

---

## 4.3 Progressive Detail

Dashboard:

```text
Overview
```

Incident list:

```text
Important incidents
```

Incident detail:

```text
Full investigation
```

Transaction detail:

```text
Evidence
```

The user should not receive every detail at once.

---

## 4.4 AI Must Be Visually Distinguishable

AI-generated interpretation must look different from deterministic system facts.

Example:

```text
Risk Score
87
```

is a deterministic fact.

While:

```text
AI Investigation
Likely bank degradation
91% confidence
```

is AI-generated interpretation.

Users should never confuse the two.

---

## 4.5 Risk Without Panic

Critical incidents require attention but the interface should remain calm.

Avoid filling large screens with:

```text
BRIGHT RED
```

Instead:

```text
Dark neutral background
+
controlled red highlights
```

---

# 5. Primary Application Layout

Desktop layout:

```text
┌────────────────────────────────────────────────────────────────────┐
│ Sidebar │                     Main Content                          │
│         │                                                           │
│ Logo    │ Header                                                    │
│         │                                                           │
│ Nav     │ Page Content                                              │
│         │                                                           │
│         │                                                           │
│         │                                                           │
│         │                                                           │
│ User    │                                                           │
└────────────────────────────────────────────────────────────────────┘
```

---

# 6. Sidebar

Approximate width:

```text
240–260px expanded
72–80px collapsed
```

Sidebar should remain fixed on desktop.

Navigation:

```text
Overview

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

Suggested icon mapping:

```text
Overview
LayoutDashboard

Transactions
CreditCard

Incidents
Siren

Risk Intelligence
ShieldCheck

Analytics
ChartNoAxesCombined

Alerts
Bell

AI Copilot
Sparkles / Bot

Approvals
BadgeCheck

Simulator
PlayCircle

Settings
Settings
```

Use Lucide icons.

---

# 7. Sidebar Structure

```text
PAYGUARD AI

──────────────

Overview

MONITOR
Transactions
Incidents
Alerts

INTELLIGENCE
Risk Intelligence
Analytics
AI Copilot

CONTROL
Approvals
Simulator

──────────────

Settings

User Profile
```

Section labels should be subtle and small.

---

# 8. Product Logo

Temporary text logo:

```text
PAYGUARD
AI
```

Possible lockup:

```text
◈ PAYGUARD
```

with a small:

```text
AI
```

badge.

Logo should remain minimal.

Avoid unnecessarily complex logo artwork during MVP development.

---

# 9. Top Header

Desktop header may contain:

Left:

```text
Page title
Breadcrumb
```

Right:

```text
Environment badge

System health

Search

Notifications

User avatar
```

Example:

```text
Risk Overview

                     TEST MODE   ● Healthy   🔔   BM
```

---

# 10. Global Search

Search should eventually support:

```text
Transaction ID

Incident ID

Merchant

Customer reference

Bank/provider
```

Keyboard shortcut:

```text
⌘ K
```

may open global search / command palette later.

---

# 11. Environment Indicator

Because the system may operate using simulated/test payments:

```text
TEST MODE
```

must be clearly visible.

This avoids presenting demo data as production traffic.

Possible badges:

```text
DEMO
TEST MODE
LIVE
```

---

# 12. Main Content Width

Main content should use the available desktop width while preserving readable spacing.

Suggested maximum:

```text
1600px
```

Large financial dashboards should not be constrained to narrow blog-style widths.

---

# 13. Base Spacing System

Use a consistent 4px-based spacing system.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Common usage:

```text
Card padding
20–24px

Section gap
24–32px

Page horizontal padding
24–32px

Small control gap
8px

Large content group gap
32px
```

---

# 14. Border Radius

Keep corners refined rather than extremely rounded.

Recommended:

```text
Small controls
6px

Inputs / buttons
8px

Cards
10–12px

Large panels
12–16px
```

Avoid:

```text
30px+
```

rounded dashboard cards.

This is a financial operations system, not a consumer social product.

---

# 15. Borders

Use subtle low-contrast borders.

Example design token concept:

```text
border-default
border-subtle
border-hover
border-critical
```

Most cards should have:

```text
1px subtle border
```

instead of heavy shadows.

---

# 16. Shadows

Use shadows sparingly.

Preferred:

```text
Very subtle shadow
```

for:

* Modals
* Dropdowns
* Floating Copilot panels

Dashboard cards should mostly rely on:

```text
Surface contrast + border
```

---

# 17. Color Architecture

Actual Tailwind values will be finalized during frontend implementation.

Semantic token structure:

```text
--background
--surface-1
--surface-2
--surface-3

--border-default
--border-subtle

--text-primary
--text-secondary
--text-muted

--accent-primary

--success
--warning
--high-risk
--critical
--info

--ai
```

---

# 18. Background Hierarchy

Suggested hierarchy:

```text
Application background
Almost black

Sidebar
Slightly different black

Primary card
Dark neutral

Secondary card
Slightly elevated neutral

Hover state
Subtle lighter neutral
```

The interface should show hierarchy without becoming gray everywhere.

---

# 19. Semantic Risk Colors

## LOW

Use:

```text
Green
```

Meaning:

```text
Normal / healthy
```

---

## MEDIUM

Use:

```text
Amber
```

---

## HIGH

Use:

```text
Orange
```

---

## CRITICAL

Use:

```text
Red
```

---

# 20. AI Color

AI-specific information should use a separate accent.

Possible direction:

```text
Indigo / violet
```

Use this for:

```text
AI Investigation
AI Copilot
AI-generated recommendation
AI confidence
```

Do not use AI color for deterministic risk scores.

---

# 21. Typography

Use a clean modern sans-serif.

Potential fonts:

```text
Inter
Geist
Manrope
```

Final implementation can choose based on availability.

Preferred initial direction:

```text
Inter / Geist
```

---

# 22. Typography Scale

## Display Metric

```text
32–40px
600–700 weight
```

Used for:

```text
87
₹4.28L
3
```

---

## Page Title

```text
24–28px
600
```

---

## Section Heading

```text
16–18px
600
```

---

## Card Heading

```text
14–16px
500–600
```

---

## Body

```text
14px
400
```

---

## Small

```text
12–13px
```

---

## Metadata

```text
11–12px
```

Muted.

---

# 23. Number Typography

Financial and operational numbers should align cleanly.

Where supported use:

```text
font-variant-numeric: tabular-nums
```

for:

```text
₹4,28,430

91%

342

14:32
```

This makes dashboards more professional.

---

# 24. Button System

Primary:

```text
Primary accent background
High contrast text
```

Examples:

```text
Run Investigation

Run Scenario

Approve
```

Secondary:

```text
Dark surface
Border
```

Examples:

```text
View Details

Export

Refresh
```

Danger:

```text
Controlled red
```

Examples:

```text
Reject
Stop Simulation
```

Ghost:

```text
Transparent
```

for toolbar actions.

---

# 25. Button Rules

Every button needs:

```text
Default
Hover
Focus
Disabled
Loading
```

state.

Loading example:

```text
Investigating...
```

with a spinner.

Never allow repeated clicks during an in-progress destructive action.

---

# 26. Input System

Inputs include:

```text
Text input

Search

Select

Multi-select

Date range

Amount filter

Risk filter

Status filter
```

Inputs should use dark surfaces with visible focus states.

Placeholders should not be too bright.

---

# 27. Badge System

Badges are heavily used.

Risk:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Incident:

```text
INVESTIGATING
MONITORING
RESOLVED
ESCALATED
```

Payment:

```text
CAPTURED
FAILED
AUTHORIZED
REFUNDED
```

Environment:

```text
TEST MODE
```

AI:

```text
AI GENERATED
```

---

# 28. Badge Design

Use:

```text
Subtle tinted background
+
semantic text
+
optional small dot
```

Avoid solid saturated pills everywhere.

---

# 29. Metric Card Component

Dashboard metric card:

```text
┌────────────────────────────┐
│ Revenue at Risk        ↗   │
│                            │
│ ₹4.28L                     │
│                            │
│ ↑ 18.4% from 15 min ago   │
└────────────────────────────┘
```

Structure:

```text
Label
Value
Trend
Optional sparkline
```

---

# 30. Critical Metric Card

Example:

```text
Revenue at Risk

₹4.28L

3 critical incidents
```

Critical color should only highlight:

```text
value
indicator
small border/accent
```

not the entire card background.

---

# 31. Chart Design

Charts should be:

* Minimal
* Dark-theme compatible
* Easy to read
* Tooltips enabled
* Properly labelled
* Semantically colored

Avoid:

```text
3D charts
Pie charts with 15 categories
Huge legends
Random gradients
```

---

# 32. Preferred Charts

Use:

```text
Line chart
Risk trend

Area chart
Transaction/failure trend

Bar chart
Provider comparison

Horizontal bar
Top risk factors

Donut chart
Small risk distribution only

Sparkline
Metric cards
```

---

# 33. Dashboard Page

Route:

```text
/dashboard
```

Main purpose:

```text
Answer what is happening right now.
```

---

# 34. Dashboard Header

Example:

```text
Risk Overview

Monitor payment health, active incidents and financial exposure.

Last updated 12 sec ago                    Refresh
```

---

# 35. Dashboard Top Metrics

First row:

```text
Payment Health

Revenue at Risk

Open Incidents

Critical Transactions

Transactions Monitored
```

Possible responsive layout:

```text
Desktop
5 cards

Medium
3 + 2

Mobile
1 per row / horizontal scroll
```

---

# 36. Payment Health Score

Example:

```text
Payment Health

87 / 100

Stable
```

This score represents overall payment-system health.

Do not confuse it with:

```text
Transaction Risk Score
```

Clearly label them differently.

---

# 37. Dashboard Main Chart

Primary graph:

```text
Payment Health / Failure Rate Over Time
```

Possible controls:

```text
15m
1h
6h
24h
7d
```

Overlay:

```text
Normal traffic
Failure spike
Incident start
Recovery
```

Incident markers on charts can make the demo especially strong.

---

# 38. Active Incident Panel

Example:

```text
ACTIVE INCIDENT

CRITICAL

UPI failure spike associated with ABC Bank

Started 8 min ago

342 affected transactions
₹4.28L revenue at risk

[ View Incident ]
```

The most severe active incident may receive prominent dashboard placement.

---

# 39. Risk Distribution Card

Example:

```text
Risk Distribution

Low       93.2%
Medium     5.7%
High       0.9%
Critical   0.2%
```

Visualization may use:

```text
Horizontal stacked bar
```

rather than a large donut.

---

# 40. Payment Method Health

Example:

```text
Payment Method Health

UPI       84.2% success     HIGH
Cards     96.1% success     LOW
Netbank   93.8% success     LOW
Wallet    95.4% success     LOW
```

---

# 41. Provider Health

Example:

```text
Provider / Bank Health

ABC Bank
UPI failure 28.4%
↑ 5.5x baseline

XYZ Bank
UPI failure 4.8%
Normal
```

---

# 42. Recent Alerts

Dashboard should show a short list.

Example:

```text
14:42  CRITICAL  UPI failure spike
14:38  HIGH      Transaction velocity anomaly
14:31  MEDIUM    Refund rate elevated
```

Link:

```text
View all alerts
```

---

# 43. Transactions Page

Route:

```text
/transactions
```

Purpose:

```text
Investigate individual payment activity.
```

---

# 44. Transactions Header

```text
Transactions

126,482 monitored transactions
```

Actions:

```text
Search
Filters
Export
Refresh
```

---

# 45. Transaction Filters

Top filter bar:

```text
Risk

Status

Payment Method

Bank

Amount

Date Range

Incident
```

Advanced filters may appear in a drawer.

---

# 46. Transaction Table

Recommended columns:

```text
Transaction

Time

Customer

Amount

Method

Bank

Status

Risk

Risk Score

Incident
```

Example:

```text
pay_demo_001

16:42:18

CUS-182

₹50,000

UPI

ABC Bank

FAILED

CRITICAL

89

PG-00042
```

---

# 47. Table Row Behavior

On hover:

```text
Subtle row highlight
```

Click:

```text
Open transaction detail
```

Critical rows may show:

```text
small red indicator
```

not full bright-red background.

---

# 48. Transaction Detail Page

Route:

```text
/transactions/:transactionId
```

Layout:

```text
Header

Transaction Summary

Risk Score

Risk Factors

Payment Details

Customer Context

Device Context

Related Incident

Timeline
```

---

# 49. Transaction Header

Example:

```text
← Transactions

pay_demo_001

FAILED     CRITICAL

₹50,000

24 Aug 2026 • 16:42:18
```

---

# 50. Risk Score Card

Example:

```text
RISK SCORE

89
/100

CRITICAL
```

Breakdown:

```text
Rules        70
Anomaly      14
Context       5
```

---

# 51. Risk Factor List

Example:

```text
Risk Factors

+25
Extreme transaction amount

Transaction amount is 12x above the customer's historical average.


+20
High transaction velocity

7 transactions were attempted within 60 seconds.


+10
New device

This device has not previously been observed for this customer.
```

Each factor should show:

```text
Contribution
Name
Explanation
Evidence
```

---

# 52. Evidence Drawer

Clicking a risk factor may reveal:

```text
Observed
7 transactions

Threshold
5 transactions

Window
60 seconds
```

This reinforces explainability.

---

# 53. Incident List Page

Route:

```text
/incidents
```

Purpose:

```text
View and prioritize active risk events.
```

---

# 54. Incident Table

Columns:

```text
Incident

Severity

Type

Status

Risk Score

Affected Transactions

Revenue at Risk

Started

Updated
```

Example:

```text
PG-2026-000042

CRITICAL

Bank degradation

INVESTIGATING

91

342

₹4.28L

8 min ago

12 sec ago
```

---

# 55. Incident Prioritization

Default sort:

```text
Severity
then
Revenue at Risk
then
Most recent
```

Critical incidents should naturally rise to the top.

---

# 56. Incident Detail Page

Route:

```text
/incidents/:incidentId
```

This is one of the most important pages in the product.

The page should tell a complete story.

---

# 57. Incident Detail Layout

```text
Incident Header

Impact Metrics

Incident Trend

AI Investigation

Evidence

Affected Transactions

Recommended Actions

Incident Timeline
```

---

# 58. Incident Header

Example:

```text
PG-2026-000042

UPI Failure Spike Associated with ABC Bank

CRITICAL        INVESTIGATING

Started 8 minutes ago

Last updated 12 seconds ago
```

Actions:

```text
Run Investigation

Escalate

Mark Monitoring

Resolve
```

---

# 59. Incident Metrics

Cards:

```text
Risk Score
91

Affected Transactions
342

Affected Payment Value
₹5.10L

Revenue at Risk
₹4.28L

UPI Failure Rate
28.4%

Baseline
5.1%
```

---

# 60. Incident Trend Chart

Show:

```text
Failure rate
vs
Historical baseline
```

Add vertical marker:

```text
Incident Detected
```

Example:

```text
5% ───────── baseline ─────────

                             ╭──── 28%
                         ╭───╯
                    ╭────╯
───────────────●────╯
               Incident
```

---

# 61. AI Investigation Panel

This is the hero intelligence component.

Suggested design:

```text
┌─────────────────────────────────────────────────────────────┐
│ ✦ AI INVESTIGATION                           AI GENERATED   │
│                                                             │
│ Likely Root Cause                                           │
│                                                             │
│ ABC Bank-associated UPI degradation                        │
│                                                             │
│ Confidence                                                  │
│ 91%  VERY HIGH                                              │
│                                                             │
│ Summary                                                     │
│ UPI failure rates increased significantly and are heavily   │
│ concentrated in ABC Bank transactions.                     │
│                                                             │
│ Evidence                                                    │
│ • UPI failure rate: 28.4%                                  │
│ • Historical baseline: 5.1%                               │
│ • ABC Bank share of failures: 81%                         │
│ • Card traffic remains healthy                             │
│                                                             │
│ Uncertainty                                                 │
│ No direct provider outage confirmation is available.       │
└─────────────────────────────────────────────────────────────┘
```

---

# 62. AI Investigation Visual Rule

The panel must clearly display:

```text
AI GENERATED
```

and separate:

```text
Facts
```

from:

```text
AI interpretation
```

---

# 63. Investigation Confidence

Possible presentation:

```text
91%

VERY HIGH CONFIDENCE
```

with a small progress indicator.

Do not overemphasize confidence as scientific certainty.

Tooltip:

```text
Confidence reflects the strength of evidence available to the AI investigation.
```

---

# 64. Recommended Action Panel

Example:

```text
RECOMMENDED ACTION

Promote alternate payment methods

UPI failures are concentrated within ABC Bank while card payments remain healthy.

Expected Impact

Reduce checkout failures while provider health recovers.

No approval required

[ Apply Simulation ]
```

---

# 65. Sensitive Recommendation

Example:

```text
Rate-limit suspicious transaction pattern

Approval required

[ Review Approval ]
```

Clearly differentiate:

```text
Recommendation
```

from:

```text
Executed action
```

---

# 66. Incident Timeline

Example:

```text
16:32

Anomaly detected

UPI failure rate exceeded 3x baseline.


16:33

Incident PG-00042 created


16:34

Risk severity changed to CRITICAL


16:35

AI investigation started


16:36

Investigation completed


16:37

Mitigation recommendation generated
```

Use a clean vertical timeline.

---

# 67. Risk Intelligence Page

Route:

```text
/risk
```

Purpose:

```text
Understand why PayGuard is assigning risk.
```

Sections:

```text
Overall risk state

Top risk factors

Risk rules

Anomaly signals

Risk distribution

High-risk entities
```

---

# 68. Risk Rule Panel

Example:

```text
HIGH VELOCITY

Enabled

Threshold
5 transactions / 60 sec

Risk Contribution
+20

Severity
HIGH
```

Admin users may eventually configure rules.

For MVP, read-only is sufficient initially.

---

# 69. Active Anomaly Signals

Example:

```text
BANK_FAILURE_SPIKE

ABC Bank

Observed
28.4%

Baseline
5.1%

Deviation
5.56x

Severity
CRITICAL
```

---

# 70. Analytics Page

Route:

```text
/analytics
```

Tabs:

```text
Overview

Risk

Failures

Payment Methods

Providers

Revenue
```

---

# 71. Analytics Overview

Suggested charts:

```text
Transaction volume

Failure rate

Average risk score

Revenue at risk

Risk distribution

Incident frequency
```

---

# 72. Provider Analytics

Table:

```text
Provider

Method

Transactions

Success Rate

Failure Rate

Baseline

Deviation

Risk
```

Sorting should allow the analyst to quickly identify degraded providers.

---

# 73. Alerts Page

Route:

```text
/alerts
```

Sections:

```text
All
Critical
Unacknowledged
Resolved
```

Alert card/list:

```text
CRITICAL

UPI failure spike

Failure rate is 5.5x above baseline.

PG-2026-000042

2 min ago

[ Acknowledge ]
```

---

# 74. Alerts UX

Acknowledging an alert:

```text
OPEN
→
ACKNOWLEDGED
```

should not automatically resolve the associated incident.

---

# 75. AI Copilot Page

Route:

```text
/copilot
```

The Copilot should feel like:

```text
Risk analyst workspace
```

rather than a generic chatbot.

---

# 76. Copilot Layout

Desktop:

```text
┌─────────────────────────────────────────────────────────────┐
│ AI Risk Copilot                                             │
│                                                             │
│ Conversation                           Context               │
│                                                             │
│ User question                          Active Incident       │
│                                                             │
│ AI answer                              Risk Summary          │
│                                                             │
│ Evidence                               Referenced Entities   │
│                                                             │
│ Input                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

# 77. Copilot Empty State

Example:

```text
Ask PayGuard about your payment risk.

Try:

Why are UPI payments failing?

Which provider has the highest failure rate?

Show critical incidents from the last hour.

Why is transaction pay_demo_001 critical?
```

Use clickable suggested questions.

---

# 78. Copilot Response

Example:

```text
UPI failures are currently 5.5x above their historical baseline.

The increase is primarily associated with ABC Bank, which accounts for 81% of failed UPI transactions.

Current evidence suggests a bank-specific degradation rather than a merchant-wide integration issue.
```

Then:

```text
Evidence

UPI failure rate
28.4%

Baseline
5.1%

ABC Bank failure share
81%

Card failure rate
4.1%
```

Referenced:

```text
PG-2026-000042
```

---

# 79. Copilot Input

Bottom composer:

```text
Ask about transactions, incidents, risk or payment health...
```

Actions:

```text
Send
```

Potential later shortcut:

```text
⌘ Enter
```

---

# 80. Copilot Loading State

Avoid generic:

```text
Thinking...
```

Possible product-specific sequence:

```text
Retrieving PayGuard data...

Analyzing evidence...

Preparing response...
```

Do not fake long multi-step reasoning unnecessarily.

---

# 81. Approvals Page

Route:

```text
/approvals
```

Purpose:

```text
Review sensitive AI-recommended actions.
```

---

# 82. Approval Card

Example:

```text
PENDING APPROVAL

Rate-limit suspicious transaction pattern

Incident
PG-2026-000047

Requested by
PayGuard AI

Reason
High transaction velocity across multiple customer identities.

Potential Impact
May temporarily restrict suspicious payment attempts.

[ Reject ]             [ Approve ]
```

---

# 83. Approval Confirmation

Before sensitive action:

```text
Approve mitigation?

This action will be executed in SIMULATED mode for the current demo environment.

[ Cancel ]

[ Approve Action ]
```

Production actions would require stronger controls.

---

# 84. Simulator Page

Route:

```text
/simulator
```

This page is especially important for the hackathon demo.

Purpose:

```text
Generate deterministic payment-risk scenarios.
```

---

# 85. Simulator Scenario Cards

Cards:

```text
Normal Traffic

UPI Bank Degradation

Velocity Attack

Shared Device Abuse

Refund Spike

Duplicate Payments
```

Each should show:

```text
Scenario name

Description

Expected system behavior

Estimated duration

Run button
```

---

# 86. Bank Degradation Scenario

Example card:

```text
UPI BANK DEGRADATION

Simulates a sharp failure spike concentrated within one UPI bank while other payment methods remain healthy.

Expected Detection

BANK_FAILURE_SPIKE

PAYMENT_METHOD_FAILURE_SPIKE

Expected Incident

BANK_DEGRADATION

[ Run Scenario ]
```

---

# 87. Simulation Running State

Example:

```text
Simulation Running

UPI Bank Degradation

127 / 250 transactions generated

████████████░░░░░░

Detected signals
2

Active incidents
1

[ View Incident ]

[ Stop ]
```

This can create a powerful live demonstration.

---

# 88. Demo Mode Banner

When simulator is active:

```text
DEMO MODE

Synthetic payment traffic is currently running.
```

This banner should appear clearly but not obstruct the UI.

---

# 89. Settings Page

Route:

```text
/settings
```

Possible sections:

```text
General

Risk Configuration

AI Configuration

Notifications

Integrations

Security
```

For the MVP, most settings can be display-only or minimal.

---

# 90. Authentication Page

Route:

```text
/login
```

Login should remain simple and polished.

Layout:

```text
PayGuard branding

Secure payment risk intelligence

Email

Password

Sign In
```

Possible right-side desktop visualization:

```text
Live risk summary
```

but do not overcomplicate authentication.

---

# 91. Login Demo Credentials

If hackathon demo credentials are shown in development:

```text
Demo Risk Analyst
```

provide them only in a safe demo environment.

Never embed real production credentials.

---

# 92. Empty States

Every major page requires an intentional empty state.

Example incidents:

```text
No active incidents

Payment activity is operating within configured risk thresholds.
```

Transactions:

```text
No transactions match these filters.
```

Alerts:

```text
No open alerts.
```

Copilot:

```text
Ask PayGuard about your payment risk.
```

---

# 93. Loading States

Use:

```text
Skeleton cards

Skeleton table rows

Chart skeletons
```

for initial loading.

Avoid full-screen spinners for normal dashboard navigation.

---

# 94. Background Refresh

For dashboard/incident updates:

```text
Background refresh
```

should not repeatedly replace the whole screen with loading placeholders.

Show subtle:

```text
Updating...
```

status if needed.

---

# 95. Error States

Example:

```text
Unable to load incidents

PayGuard couldn't retrieve incident data.

[ Try Again ]
```

AI-specific:

```text
AI investigation temporarily unavailable

Deterministic risk information remains available.

[ Retry Investigation ]
```

---

# 96. Offline / Backend Unavailable

Potential state:

```text
PayGuard API unavailable

We couldn't connect to the monitoring service.

Last successful update:
16:42:18
```

Do not display stale information as if it is live.

---

# 97. Toast Notifications

Use toasts for short-lived confirmations.

Examples:

```text
Alert acknowledged

Incident moved to monitoring

Investigation started

Approval submitted

Simulation started
```

Do not use toasts for critical information that must remain visible.

---

# 98. Modal Usage

Use modals only for focused actions:

```text
Approve mitigation

Reject action

Resolve incident

Stop simulation

Confirm dangerous action
```

Avoid using modals for normal navigation or long data views.

---

# 99. Tooltips

Use tooltips for:

```text
Confidence meaning

Risk score breakdown

Metric definition

Technical abbreviations

Icon-only buttons
```

Do not hide essential information exclusively inside tooltips.

---

# 100. Responsive Design

Primary target:

```text
Desktop / laptop
```

because risk operations typically happen on larger screens.

However, interface must remain usable on:

```text
Tablet
Mobile
```

---

# 101. Desktop Breakpoint

Approximate:

```text
>= 1280px
```

Use:

```text
Expanded sidebar
Multi-column dashboard
Full tables
Side-by-side incident analysis
```

---

# 102. Tablet

Approximate:

```text
768–1279px
```

Use:

```text
Collapsible sidebar
2-column metric grids
Scrollable tables
Stacked AI investigation sections
```

---

# 103. Mobile

Under:

```text
768px
```

Use:

```text
Drawer navigation

Single-column cards

Horizontal table scrolling

Stacked filters

Compact charts

Sticky important actions where appropriate
```

Do not attempt to squeeze the desktop table into tiny columns.

---

# 104. Responsive Table Strategy

Mobile may transform complex tables into:

```text
Cards
```

or retain:

```text
Horizontal scrolling
```

depending on page.

Transaction mobile card:

```text
pay_demo_001

₹50,000

UPI • ABC Bank

FAILED       CRITICAL 89

16:42
```

---

# 105. Accessibility

Minimum requirements:

* Keyboard navigation
* Visible focus states
* Semantic HTML
* Proper labels
* ARIA where necessary
* Color is not the only status signal
* Sufficient contrast
* Buttons have descriptive names
* Charts provide textual context

---

# 106. Risk Accessibility

Do not communicate risk using color alone.

Correct:

```text
● CRITICAL
```

Incorrect:

```text
●
```

with only red color and no label.

---

# 107. Motion Design

Use subtle transitions.

Examples:

```text
150–250ms
```

for:

```text
Hover
Panel opening
Dropdown
Sidebar collapse
Tab switch
```

Avoid dramatic page animations.

---

# 108. Live Data Animation

When a metric changes:

Possible:

```text
Very subtle highlight/fade
```

Do not constantly animate every number.

Financial monitoring should remain calm.

---

# 109. Incident Detection Animation

When a new critical incident appears during a demo:

Possible:

```text
Small pulse on notification
Brief card highlight
```

Avoid:

```text
Flashing red screen
```

---

# 110. Chart Animation

Initial chart load may animate lightly.

Live updates should transition smoothly.

Animations must not interfere with rapid data interpretation.

---

# 111. Icon Rules

Use:

```text
Lucide React
```

consistently.

Avoid mixing:

```text
Lucide
Font Awesome
Emoji
Material icons
```

inside the product UI.

Emoji should generally not be used for production interface status indicators.

---

# 112. Card Component Variants

Shared variants:

```text
default

interactive

metric

critical

ai

success

warning
```

These should be design-system variants rather than individually styled components.

---

# 113. Data Table Component

Shared table should support:

```text
Sorting

Pagination

Loading

Empty state

Row click

Column alignment

Status cells

Custom filters
```

Later:

```text
Column visibility
```

may be added.

---

# 114. Page Header Component

Reusable:

```text
PageHeader
```

Props conceptually:

```text
title
description
breadcrumbs
actions
status
```

---

# 115. Status Badge Component

Reusable:

```text
StatusBadge
```

Supports:

```text
risk
incident
transaction
alert
approval
system
```

---

# 116. Risk Score Component

Reusable:

```text
RiskScore
```

Variants:

```text
compact

standard

large
```

Example:

```text
89
CRITICAL
```

---

# 117. Money Component

Reusable formatting:

```text
MoneyValue
```

Inputs:

```text
amount in smallest currency unit
currency
```

Output:

```text
₹4.28L
```

or:

```text
₹4,28,000
```

depending on context.

Formatting must remain consistent.

---

# 118. Time Component

Reusable time display:

```text
14:32:18

8 min ago

24 Aug 2026, 16:42
```

with tooltip containing exact timestamp where useful.

---

# 119. AI Panel Component

Reusable:

```text
AIInsightPanel
```

Sections:

```text
Title

AI badge

Confidence

Summary

Evidence

Uncertainty

Actions
```

Used across:

```text
Incident Investigation

Transaction Explanation

Recommendations
```

---

# 120. Frontend Component Architecture

Recommended structure:

```text
frontend/src/components/
│
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Tooltip.tsx
│   ├── Tabs.tsx
│   ├── Skeleton.tsx
│   └── DataTable.tsx
│
├── layout/
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── PageHeader.tsx
│   └── MobileNav.tsx
│
├── risk/
│   ├── RiskBadge.tsx
│   ├── RiskScore.tsx
│   ├── RiskFactor.tsx
│   └── RiskDistribution.tsx
│
├── incidents/
│   ├── IncidentCard.tsx
│   ├── IncidentTimeline.tsx
│   └── IncidentMetrics.tsx
│
├── ai/
│   ├── AIInsightPanel.tsx
│   ├── ConfidenceIndicator.tsx
│   ├── EvidenceList.tsx
│   └── RecommendationCard.tsx
│
└── charts/
    ├── FailureTrendChart.tsx
    ├── RiskTrendChart.tsx
    ├── ProviderHealthChart.tsx
    └── TransactionVolumeChart.tsx
```

---

# 121. Frontend Feature Structure

```text
frontend/src/features/
│
├── dashboard/
├── transactions/
├── incidents/
├── risk/
├── analytics/
├── alerts/
├── copilot/
├── approvals/
├── simulator/
└── settings/
```

Each feature should own feature-specific components.

Shared UI belongs in:

```text
components/
```

---

# 122. Design Token Strategy

Do not hardcode random color values in every component.

Use centralized tokens through:

```text
Tailwind theme
CSS variables
```

Example:

```text
bg-background

bg-surface

text-primary

text-muted

border-subtle

text-risk-critical
```

---

# 123. Dark Theme First

Initial implementation:

```text
Dark theme
```

Light theme is not required for MVP.

Architecture should still avoid making a future light theme impossible.

---

# 124. No Excessive Gradients

Gradients may be used very subtly for:

```text
AI highlight

Login branding

Hero metric glow
```

Avoid:

```text
Rainbow gradient cards

Gradient borders everywhere
```

---

# 125. No Glassmorphism Overuse

Avoid making every panel translucent.

Financial data should remain readable and stable.

Glass effects may be used sparingly in:

```text
Floating overlay
```

but are not the primary design language.

---

# 126. Demo-Specific UX

The hackathon demo should be understandable without lengthy explanation.

A judge should be able to see:

```text
Normal payment health
```

then:

```text
Simulation starts
```

then:

```text
Failure rate spikes
```

then:

```text
Incident appears
```

then:

```text
AI investigates
```

then:

```text
Revenue at risk
```

then:

```text
Recommendation
```

then:

```text
Copilot explanation
```

---

# 127. Demo Navigation Sequence

Recommended demo path:

```text
1. Dashboard

2. Simulator

3. Run Bank Degradation

4. Dashboard updates

5. Open generated incident

6. Show deterministic evidence

7. Show AI Investigation

8. Show revenue at risk

9. Show recommendation

10. Ask Copilot:
   "Why are UPI payments failing?"
```

This UX sequence should influence implementation priorities.

---

# 128. Demo Dashboard Before Incident

Initial:

```text
PAYMENT HEALTH

96 / 100

Healthy
```

```text
UPI FAILURE RATE

4.1%

Normal
```

```text
ACTIVE INCIDENTS

0
```

---

# 129. Demo Dashboard During Incident

After scenario:

```text
PAYMENT HEALTH

72 / 100

Degraded
```

```text
UPI FAILURE RATE

28.4%

5.5x baseline
```

```text
REVENUE AT RISK

₹4.28L
```

```text
CRITICAL INCIDENTS

1
```

This provides strong before/after visual contrast.

---

# 130. Demo Incident Hero

The critical moment should look approximately like:

```text
CRITICAL INCIDENT

PG-2026-000042

UPI Failure Spike Associated with ABC Bank

Risk Score
91

Affected Transactions
342

Revenue at Risk
₹4.28L

Started
8 min ago
```

Below:

```text
AI INVESTIGATION

Likely Root Cause
ABC Bank-associated UPI degradation

Confidence
91%

Evidence
...
```

---

# 131. Copywriting Tone

Product copy should be:

```text
Concise
Specific
Professional
Operational
Evidence-based
```

Good:

```text
UPI failure rate is 5.5x above its historical baseline.
```

Avoid:

```text
Whoa! Something crazy is happening with UPI!
```

---

# 132. Risk Language

Use:

```text
Potential fraud pattern

Suspicious activity

Unusual behavior

Likely degradation

Current evidence suggests
```

Avoid unsupported certainty:

```text
Fraudster detected

Bank is definitely down

Customer committed fraud
```

---

# 133. AI Language

Always communicate AI uncertainty appropriately.

Preferred:

```text
Likely Root Cause

Current evidence suggests...

Confidence

Uncertainty
```

Avoid:

```text
AI knows the cause
```

---

# 134. Date / Locale

Backend timestamps remain UTC.

Frontend may display:

```text
24 Aug 2026, 16:42 IST
```

depending on user locale.

Money should support currency-aware formatting.

---

# 135. Test Data Labels

Synthetic values must be labelled appropriately where needed.

Example:

```text
SIMULATED TRANSACTION
```

or:

```text
TEST MODE
```

Avoid making generated demo data appear to be real Razorpay customer information.

---

# 136. Visual Consistency Rules

Never introduce a new:

```text
Border radius

Shadow

Font size

Status color

Button style

Card style
```

without first checking whether an existing design-system component can be reused.

---

# 137. UI Code Rules

Do not create giant page components.

Prefer:

```text
DashboardPage
    ↓
MetricGrid
FailureTrendChart
ActiveIncidentCard
PaymentMethodHealth
RecentAlerts
```

rather than putting every element in:

```text
DashboardPage.tsx
```

---

# 138. Business Logic Boundary

Frontend must not calculate authoritative:

```text
Risk scores

Incident severity

Revenue at risk

AI confidence

Payment health
```

These values must come from backend APIs.

Frontend may only:

```text
Format
Visualize
Filter
Sort client-safe data
```

---

# 139. Loading Architecture

With TanStack Query:

```text
Initial loading
→ skeleton

Background refetch
→ preserve existing data

Error
→ controlled error state
```

Avoid clearing the screen during every refresh.

---

# 140. Live Update Strategy

Initial MVP:

```text
Polling
```

for:

```text
Dashboard
Incidents
Simulation progress
Investigation status
```

Possible future:

```text
WebSockets / Server-Sent Events
```

Do not require real-time infrastructure for MVP unless necessary.

---

# 141. Performance UX

Large transaction lists must use backend pagination.

Do not fetch:

```text
100,000 transactions
```

into the browser and filter them locally.

Charts should request aggregated API data.

---

# 142. Premium Quality Checklist

Before a page is considered complete:

```text
Consistent spacing

No placeholder-looking UI

No overflowing text

No broken responsive layout

Loading state

Empty state

Error state

Hover state

Focus state

Correct semantic status colors

Correct number formatting

No console errors

No TypeScript errors

No fake frontend calculations
```

---

# 143. Dashboard Completion Criteria

Dashboard is complete when it shows:

```text
Payment Health

Transactions Monitored

Success / Failure Rate

Revenue at Risk

Critical Transactions

Active Incidents

Risk Distribution

Payment Method Health

Provider Health

Failure Trend

Recent Alerts
```

using real backend API data.

---

# 144. Incident Detail Completion Criteria

Incident page is complete when it contains:

```text
Incident metadata

Severity

Lifecycle status

Risk score

Affected payment value

Revenue at risk

Failure trend

Historical baseline

Related transactions

AI Investigation

Confidence

Evidence

Uncertainty

Recommendation

Timeline
```

---

# 145. Transaction Detail Completion Criteria

Transaction detail is complete when it contains:

```text
Payment details

Status

Amount

Method

Bank

Customer reference

Device information

Risk score

Component scores

Risk factors

Evidence

Related incidents
```

---

# 146. AI Copilot Completion Criteria

Copilot is complete when:

1. User can ask a question.
2. Backend retrieves relevant PayGuard data.
3. AI receives structured evidence.
4. Response is rendered cleanly.
5. Evidence is shown.
6. Referenced incidents/transactions are navigable.
7. Missing evidence produces a safe response.
8. Loading and failure states exist.

---

# 147. Simulator Completion Criteria

Simulator is complete when:

1. Scenario list is visible.
2. Scenario description is clear.
3. User can start a simulation.
4. Progress is displayed.
5. Generated transactions enter normal risk pipeline.
6. Dashboard updates.
7. Incidents are generated naturally.
8. User can navigate directly to generated incident.
9. User can stop an active simulation.
10. Synthetic nature of data is clear.

---

# 148. UI Implementation Priority

Build in this order:

```text
1. Design tokens

2. Base UI components

3. App shell

4. Sidebar

5. Header

6. Dashboard

7. Transactions table

8. Transaction detail

9. Incident list

10. Incident detail

11. AI Investigation panel

12. Alerts

13. Risk Intelligence

14. Analytics

15. Copilot

16. Approvals

17. Simulator

18. Settings

19. Responsive refinement

20. Motion / final polish
```

---

# 149. UI MVP

For the first working version prioritize:

```text
App Shell

Dashboard

Transactions

Incident List

Incident Detail

Risk Score

Risk Factors

AI Investigation

Simulator
```

Then extend to:

```text
Analytics

Copilot

Approvals

Settings
```

---

# 150. Final Design Goal

The final PayGuard AI experience should visually communicate this loop:

```text
MONITOR
   ↓
DETECT
   ↓
UNDERSTAND
   ↓
INVESTIGATE
   ↓
DECIDE
   ↓
ACT
   ↓
MONITOR RECOVERY
```

A user opening PayGuard should immediately understand:

```text
What is happening?

How serious is it?

How much money is affected?

What evidence supports the risk?

What does AI think is happening?

What should I do next?
```

The product should feel like an intelligent payment-risk command center rather than a generic analytics dashboard.

The interface must combine strong visual polish with trustworthy financial-risk information, explainable AI, and clear operational control.
