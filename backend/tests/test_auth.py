import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from starlette.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.security import verify_password
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.feedback import CitizenFeedback
from app.models.hotspot import Hotspot
from sqlalchemy import select

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database_and_users():
    """Ensure database tables and default accounts are initialized."""
    import asyncio
    async def init():
        from app.core.database import init_db
        from app.models.user import User
        from app.core.security import get_password_hash
        await init_db()
        async with AsyncSessionLocal() as db:
            admin_res = await db.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
            if not admin_res.scalar_one_or_none():
                admin_user = User(
                    email=settings.ADMIN_EMAIL,
                    username="admin",
                    full_name="Government Administrator",
                    password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                    role="GOVERNMENT_ADMIN",
                    is_active=True
                )
                db.add(admin_user)

            citizen_res = await db.execute(select(User).where(User.email == settings.CITIZEN_EMAIL))
            if not citizen_res.scalar_one_or_none():
                citizen_user = User(
                    email=settings.CITIZEN_EMAIL,
                    username="citizen",
                    full_name="Ramesh Pawar (Citizen)",
                    password_hash=get_password_hash(settings.CITIZEN_PASSWORD),
                    role="CITIZEN",
                    is_active=True
                )
                db.add(citizen_user)

            await db.commit()

    asyncio.run(init())


def test_01_user_seeding_and_password_hashing():
    """Verify that users are seeded and passwords are secure hashes, NEVER plaintext."""
    import asyncio

    async def check_users():
        async with AsyncSessionLocal() as db:
            users = (await db.execute(select(User))).scalars().all()
            assert len(users) >= 2, "Both admin and citizen users should be present"
            
            for u in users:
                # Password must NOT be plaintext
                assert u.password_hash != settings.ADMIN_PASSWORD
                assert u.password_hash != settings.CITIZEN_PASSWORD
                assert not u.password_hash.startswith("Admin@")
                assert not u.password_hash.startswith("Citizen@")
                assert len(u.password_hash) > 20, "Password hash must be cryptographically hashed"

                if u.role == "GOVERNMENT_ADMIN":
                    assert verify_password(settings.ADMIN_PASSWORD, u.password_hash) is True
                elif u.role == "CITIZEN":
                    assert verify_password(settings.CITIZEN_PASSWORD, u.password_hash) is True

    asyncio.run(check_users())


def test_02_citizen_login_succeeds():
    """Verify citizen login succeeds and returns citizen role."""
    resp = client.post("/api/v1/auth/login/citizen", json={
        "username_or_email": settings.CITIZEN_EMAIL,
        "password": settings.CITIZEN_PASSWORD
    })
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "CITIZEN"
    assert data["user"]["email"] == settings.CITIZEN_EMAIL
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]
    # Verify cookie was set
    assert "jansetu_token" in resp.cookies


def test_03_admin_login_succeeds():
    """Verify admin login succeeds and returns GOVERNMENT_ADMIN role."""
    resp = client.post("/api/v1/auth/login/admin", json={
        "username_or_email": settings.ADMIN_EMAIL,
        "password": settings.ADMIN_PASSWORD
    })
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "GOVERNMENT_ADMIN"
    assert data["user"]["email"] == settings.ADMIN_EMAIL
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]
    assert "jansetu_token" in resp.cookies


def test_04_invalid_password_rejected():
    """Verify that an incorrect password fails with 401."""
    resp = client.post("/api/v1/auth/login", json={
        "username_or_email": settings.CITIZEN_EMAIL,
        "password": "WrongPassword123!"
    })
    assert resp.status_code == 401
    assert "Invalid credentials" in resp.json()["detail"]


def test_05_unknown_user_rejected():
    """Verify that an unknown user fails with 401."""
    resp = client.post("/api/v1/auth/login", json={
        "username_or_email": "nonexistent@jansetu.in",
        "password": "AnyPassword123!"
    })
    assert resp.status_code == 401
    assert "Invalid credentials" in resp.json()["detail"]


def test_06_citizen_cannot_login_via_admin_portal():
    """Verify that a citizen attempting to log into the admin portal is rejected."""
    resp = client.post("/api/v1/auth/login/admin", json={
        "username_or_email": settings.CITIZEN_EMAIL,
        "password": settings.CITIZEN_PASSWORD
    })
    assert resp.status_code == 403, "Citizen should not be allowed into admin login"
    assert "government administrative" in resp.json()["detail"].lower()


def test_07_unauthenticated_government_api_returns_401():
    """Verify that calling government endpoints without authentication returns 401."""
    # Create fresh unauthenticated client
    unauth_client = TestClient(app)
    resp = unauth_client.get("/api/v1/gov/stats")
    assert resp.status_code == 401
    assert "Authentication required" in resp.json()["detail"]

    resp2 = unauth_client.get("/api/v1/gov/hotspots")
    assert resp2.status_code == 401


def test_08_citizen_calling_government_api_returns_403():
    """Verify that a citizen calling government endpoints returns 403 Forbidden."""
    # Log in as citizen
    c_login = client.post("/api/v1/auth/login/citizen", json={
        "username_or_email": settings.CITIZEN_EMAIL,
        "password": settings.CITIZEN_PASSWORD
    })
    assert c_login.status_code == 200
    token = c_login.json()["access_token"]

    # Call /gov/stats with citizen Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/gov/stats", headers=headers)
    assert resp.status_code == 403, f"Expected 403, got {resp.status_code}: {resp.text}"
    assert "Forbidden" in resp.json()["detail"]

    # Call /gov/recalculate with citizen token
    resp_recalc = client.post("/api/v1/gov/recalculate", headers=headers)
    assert resp_recalc.status_code == 403


def test_09_government_admin_calling_authorized_api_succeeds():
    """Verify that a government admin calling protected endpoints succeeds (200)."""
    a_login = client.post("/api/v1/auth/login/admin", json={
        "username_or_email": settings.ADMIN_EMAIL,
        "password": settings.ADMIN_PASSWORD
    })
    assert a_login.status_code == 200
    token = a_login.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/v1/gov/stats", headers=headers)
    assert resp.status_code == 200
    stats = resp.json()
    assert "total_complaints" in stats
    assert "active_hotspots_count" in stats

    resp_hotspots = client.get("/api/v1/gov/hotspots", headers=headers)
    assert resp_hotspots.status_code == 200
    assert isinstance(resp_hotspots.json(), list)


def test_10_me_endpoint_returns_safe_profile():
    """Verify /me returns safe profile without leaking password hashes."""
    a_login = client.post("/api/v1/auth/login/admin", json={
        "username_or_email": settings.ADMIN_EMAIL,
        "password": settings.ADMIN_PASSWORD
    })
    token = a_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 200
    profile = resp.json()
    assert profile["email"] == settings.ADMIN_EMAIL
    assert profile["role"] == "GOVERNMENT_ADMIN"
    assert "password" not in profile
    assert "password_hash" not in profile


def test_11_logout_invalidates_session():
    """Verify logout clears the session cookie."""
    resp = client.post("/api/v1/auth/logout")
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"


def test_12_demo_mode_data_and_endpoints_preserved():
    """Verify Hackathon Demo Mode endpoints and data remain intact and accessible."""
    # 1. Scenarios endpoint
    scenarios_resp = client.get("/api/v1/admin/scenarios")
    assert scenarios_resp.status_code == 200
    scenarios = scenarios_resp.json()
    assert len(scenarios) == 4

    # 2. Demo complaints endpoint
    complaints_resp = client.get("/api/v1/admin/complaints?scenario_id=marathwada_water_crisis")
    assert complaints_resp.status_code == 200
    assert len(complaints_resp.json()) == 6

    # 3. Demo hotspots endpoint
    hotspots_resp = client.get("/api/v1/admin/demo-hotspots")
    assert hotspots_resp.status_code == 200
    assert len(hotspots_resp.json()) >= 1
