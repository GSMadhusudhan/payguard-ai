from uuid import uuid4

import pytest
from sqlalchemy import delete, func, select

from app.core.security import hash_password
from app.db.models import (
    Incident,
    Investigation,
    Merchant,
    Recommendation,
    Transaction,
    User,
)
from app.db.session import SessionLocal
from app.main import app
from app.modules.copilot.schemas import CopilotQueryRequest
from app.modules.copilot.service import answer_copilot_query
from app.modules.read_api.service import (
    get_incident,
    get_investigation,
    get_recommendation,
    list_incidents,
    list_transactions,
)
from app.modules.recommendations.service import (
    RecommendationStateError,
    approve_recommendation,
    execute_recommendation,
)
from app.modules.simulator.service import run_scenario


@pytest.fixture
def merchant_context():
    db = SessionLocal()
    suffix = uuid4().hex[:10]
    merchant_id = None

    try:
        merchant = Merchant(
            name=f"Pytest Merchant {suffix}",
            slug=f"pytest-{suffix}",
            is_active=True,
        )
        db.add(merchant)
        db.flush()

        merchant_id = merchant.id

        admin = User(
            merchant_id=merchant_id,
            email=f"admin-{suffix}@payguard.example.com",
            full_name="Pytest Admin",
            password_hash=hash_password("TemporaryPass123!"),
            role="ADMIN",
            is_active=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        yield db, merchant, admin

    finally:
        db.rollback()

        if merchant_id is not None:
            db.execute(
                delete(Recommendation).where(
                    Recommendation.merchant_id == merchant_id
                )
            )
            db.execute(
                delete(Investigation).where(
                    Investigation.merchant_id == merchant_id
                )
            )
            db.execute(
                delete(Incident).where(
                    Incident.merchant_id == merchant_id
                )
            )
            db.execute(
                delete(Transaction).where(
                    Transaction.merchant_id == merchant_id
                )
            )
            db.execute(
                delete(User).where(
                    User.merchant_id == merchant_id
                )
            )
            db.execute(
                delete(Merchant).where(
                    Merchant.id == merchant_id
                )
            )
            db.commit()

        db.close()


def run_demo(db, admin):
    return run_scenario(
        db,
        current_user=admin,
        scenario_id="bank_degradation",
        transaction_count=100,
        duration_seconds=60,
    )


def test_bank_degradation_end_to_end(merchant_context):
    db, merchant, admin = merchant_context

    simulation = run_demo(db, admin)

    assert simulation.status == "COMPLETED"
    assert simulation.transactions_generated == 100
    assert simulation.incident_id is not None
    assert simulation.investigation_id is not None
    assert simulation.recommendation_id is not None

    transaction_count = db.scalar(
        select(func.count())
        .select_from(Transaction)
        .where(
            Transaction.merchant_id == merchant.id,
            Transaction.provider == "SIMULATOR",
            Transaction.provider_payment_id.like(
                "sim_bankdeg_%"
            ),
        )
    )

    assert transaction_count == 100

    incident = db.get(
        Incident,
        simulation.incident_id,
    )

    assert incident is not None
    assert incident.incident_type == "BANK_DEGRADATION"
    assert incident.severity == "CRITICAL"
    assert incident.status == "ACTION_RECOMMENDED"
    assert incident.payment_method == "UPI"
    assert incident.bank_name == "ABC Bank"

    assert round(
        incident.baseline_failure_rate,
        4,
    ) == 0.05

    assert round(
        incident.current_failure_rate,
        4,
    ) == 0.30

    assert incident.affected_transactions == 20
    assert incident.failed_transactions == 6
    assert incident.revenue_at_risk == 42_800_000

    investigation = db.get(
        Investigation,
        simulation.investigation_id,
    )

    assert investigation is not None
    assert investigation.status == "COMPLETED"
    assert investigation.confidence_score == 0.9
    assert "ABC Bank" in investigation.root_cause

    recommendation = db.get(
        Recommendation,
        simulation.recommendation_id,
    )

    assert recommendation is not None
    assert recommendation.status == "PROPOSED"
    assert recommendation.approval_status == "PENDING"
    assert recommendation.approval_required is True
    assert recommendation.execution_mode == "SIMULATED"

    assert (
        recommendation.proposed_action["action"]
        == "REROUTE_TRAFFIC"
    )

    assert (
        recommendation.expected_impact[
            "revenue_at_risk_reference"
        ]
        == 42_800_000
    )


def test_human_approval_gate_and_simulated_execution(
    merchant_context,
):
    db, _, admin = merchant_context

    simulation = run_demo(db, admin)

    recommendation_id = simulation.recommendation_id
    admin_id = admin.id

    recommendation = db.get(
        Recommendation,
        recommendation_id,
    )

    assert recommendation is not None
    assert recommendation.approval_status == "PENDING"

    with pytest.raises(RecommendationStateError):
        execute_recommendation(
            db,
            recommendation_id,
            admin,
        )

    # Release the SELECT FOR UPDATE transaction before
    # continuing with the approval path.
    db.rollback()

    admin = db.get(User, admin_id)

    approval = approve_recommendation(
        db,
        recommendation_id,
        admin,
    )

    assert approval.status == "APPROVED"
    assert approval.approval_status == "APPROVED"
    assert approval.approved_by_user_id == admin.id

    first_execution = execute_recommendation(
        db,
        recommendation_id,
        admin,
    )

    assert first_execution.status == "EXECUTED"
    assert first_execution.approval_status == "APPROVED"
    assert first_execution.execution_mode == "SIMULATED"
    assert first_execution.execution_result["success"] is True
    assert first_execution.execution_result["simulated"] is True
    assert (
        first_execution.execution_result["action"]
        == "REROUTE_TRAFFIC"
    )

    second_execution = execute_recommendation(
        db,
        recommendation_id,
        admin,
    )

    assert (
        second_execution.execution_result
        == first_execution.execution_result
    )


def test_copilot_grounding_and_no_fabrication(
    merchant_context,
):
    db, _, admin = merchant_context

    simulation = run_demo(db, admin)

    response = answer_copilot_query(
        db,
        payload=CopilotQueryRequest(
            question="Why are my UPI payments failing?"
        ),
        current_user=admin,
    )

    assert (
        response.intent.value
        == "PAYMENT_METHOD_ANALYSIS"
    )

    assert len(response.referenced_incidents) == 1
    assert (
        response.referenced_incidents[0].id
        == simulation.incident_id
    )

    assert "ABC Bank" in response.answer
    assert "UPI" in response.answer

    evidence = {
        item.label: item.value
        for item in response.evidence
    }

    assert evidence["Current UPI failure rate"] == "30.0%"
    assert evidence["Historical UPI failure rate"] == "5.0%"
    assert evidence["Affected transaction failures"] == "6/20"
    assert evidence["Affected bank"] == "ABC Bank"
    assert evidence["Revenue at risk"] == "₹428,000.00"

    revenue_response = answer_copilot_query(
        db,
        payload=CopilotQueryRequest(
            question="How much revenue is at risk?"
        ),
        current_user=admin,
    )

    assert (
        revenue_response.intent.value
        == "REVENUE_AT_RISK"
    )

    assert "₹428,000.00" in revenue_response.answer
    assert "deterministic backend" in revenue_response.answer

    incident = db.get(
        Incident,
        simulation.incident_id,
    )

    assert incident.risk_score == 43
    assert incident.revenue_at_risk == 42_800_000


def test_read_api_tenant_isolation(
    merchant_context,
):
    db, merchant_a, admin_a = merchant_context

    simulation = run_demo(db, admin_a)

    suffix = uuid4().hex[:10]

    merchant_b = Merchant(
        name=f"Isolated Merchant {suffix}",
        slug=f"isolated-{suffix}",
        is_active=True,
    )
    db.add(merchant_b)
    db.flush()

    merchant_b_id = merchant_b.id

    user_b = User(
        merchant_id=merchant_b_id,
        email=f"admin-b-{suffix}@payguard.example.com",
        full_name="Isolated Admin",
        password_hash=hash_password("TemporaryPass123!"),
        role="ADMIN",
        is_active=True,
    )

    db.add(user_b)
    db.commit()

    try:
        a_transactions, a_pagination = list_transactions(
            db,
            merchant_id=merchant_a.id,
            page=1,
            page_size=100,
        )

        assert a_pagination.total_items == 100
        assert len(a_transactions) == 100

        b_transactions, b_pagination = list_transactions(
            db,
            merchant_id=merchant_b_id,
            page=1,
            page_size=100,
        )

        assert b_pagination.total_items == 0
        assert b_transactions == []

        b_incidents, b_incident_pagination = list_incidents(
            db,
            merchant_id=merchant_b_id,
            page=1,
            page_size=25,
        )

        assert b_incident_pagination.total_items == 0
        assert b_incidents == []

        assert (
            get_incident(
                db,
                merchant_id=merchant_b_id,
                incident_id=simulation.incident_id,
            )
            is None
        )

        assert (
            get_investigation(
                db,
                merchant_id=merchant_b_id,
                investigation_id=simulation.investigation_id,
            )
            is None
        )

        assert (
            get_recommendation(
                db,
                merchant_id=merchant_b_id,
                recommendation_id=simulation.recommendation_id,
            )
            is None
        )

    finally:
        db.rollback()

        db.execute(
            delete(Recommendation).where(
                Recommendation.merchant_id
                == merchant_b_id
            )
        )
        db.execute(
            delete(Investigation).where(
                Investigation.merchant_id
                == merchant_b_id
            )
        )
        db.execute(
            delete(Incident).where(
                Incident.merchant_id
                == merchant_b_id
            )
        )
        db.execute(
            delete(Transaction).where(
                Transaction.merchant_id
                == merchant_b_id
            )
        )
        db.execute(
            delete(User).where(
                User.merchant_id == merchant_b_id
            )
        )
        db.execute(
            delete(Merchant).where(
                Merchant.id == merchant_b_id
            )
        )
        db.commit()


def test_required_api_routes_are_registered():
    paths = app.openapi()["paths"]

    required = {
        "/api/v1/dashboard": "get",
        "/api/v1/transactions": "get",
        "/api/v1/incidents": "get",
        "/api/v1/incidents/{incident_id}": "get",
        "/api/v1/incidents/{incident_id}/investigations": "get",
        "/api/v1/incidents/{incident_id}/recommendations": "get",
        "/api/v1/copilot/query": "post",
        "/api/v1/simulator/scenarios": "get",
        "/api/v1/simulator/scenarios/{scenario_id}/run": "post",
        "/api/v1/recommendations/{recommendation_id}/approve": "post",
        "/api/v1/recommendations/{recommendation_id}/execute": "post",
    }

    for path, method in required.items():
        assert path in paths
        assert method in paths[path]
