"""
Create the PayGuard hackathon demo merchant and administrator.

Safe to run repeatedly. Credentials are supplied only through
environment variables and are never stored in source control.
"""

import os

from sqlalchemy import select

from app.core.security import hash_password
from app.db.models import Merchant, User
from app.db.session import SessionLocal


MERCHANT_SLUG = os.getenv(
    "DEMO_MERCHANT_SLUG",
    "demo-merchant",
)

MERCHANT_NAME = os.getenv(
    "DEMO_MERCHANT_NAME",
    "PayGuard Demo Merchant",
)

ADMIN_EMAIL = os.getenv(
    "DEMO_ADMIN_EMAIL",
    "admin@payguard.example.com",
).lower().strip()

ADMIN_PASSWORD = os.getenv(
    "DEMO_ADMIN_PASSWORD",
)


def bootstrap() -> None:
    if not ADMIN_PASSWORD:
        raise RuntimeError(
            "DEMO_ADMIN_PASSWORD must be configured "
            "in the deployment environment."
        )

    db = SessionLocal()

    try:
        merchant = db.scalar(
            select(Merchant).where(
                Merchant.slug == MERCHANT_SLUG
            )
        )

        if merchant is None:
            merchant = Merchant(
                name=MERCHANT_NAME,
                slug=MERCHANT_SLUG,
                is_active=True,
            )

            db.add(merchant)
            db.flush()

            print(
                f"Created demo merchant: {MERCHANT_SLUG}"
            )
        else:
            merchant.is_active = True

            print(
                f"Demo merchant ready: {MERCHANT_SLUG}"
            )

        user = db.scalar(
            select(User).where(
                User.merchant_id == merchant.id,
                User.email == ADMIN_EMAIL,
            )
        )

        if user is None:
            user = User(
                merchant_id=merchant.id,
                email=ADMIN_EMAIL,
                full_name="PayGuard Demo Admin",
                password_hash=hash_password(
                    ADMIN_PASSWORD
                ),
                role="ADMIN",
                is_active=True,
            )

            db.add(user)

            print(
                f"Created demo administrator: "
                f"{ADMIN_EMAIL}"
            )
        else:
            # Keep the deployed credential synchronized with
            # the private Render environment variable.
            user.password_hash = hash_password(
                ADMIN_PASSWORD
            )
            user.role = "ADMIN"
            user.is_active = True

            print(
                f"Demo administrator ready: "
                f"{ADMIN_EMAIL}"
            )

        db.commit()

        print("PAYGUARD DEMO BOOTSTRAP COMPLETE")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    bootstrap()
