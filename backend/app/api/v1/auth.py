import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, decode_access_token, get_password_hash
from app.models.user import User
from app.schemas.auth import LoginRequest, UserResponse, TokenResponse, UserCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

COOKIE_NAME = "jansetu_token"


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Extracts and validates user from Authorization header OR HttpOnly cookie.
    Returns None if unauthenticated.
    """
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1].strip()
    elif COOKIE_NAME in request.cookies:
        token = request.cookies[COOKIE_NAME]

    if not token:
        return None

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None

    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        return None

    return user


async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    """
    Enforces authentication. Raises 401 Unauthorized if invalid or missing token.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def require_government_admin(
    user: User = Depends(get_current_user)
) -> User:
    """
    Enforces server-side authorization for government administrative APIs.
    Raises 403 Forbidden if the user is authenticated but lacks admin privileges.
    """
    role = (user.role or "").upper()
    if role not in ["GOVERNMENT_ADMIN", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Government administrator authorization required."
        )
    return user


async def require_citizen(
    user: User = Depends(get_current_user)
) -> User:
    """
    Enforces citizen authentication.
    """
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Unified login endpoint verifying email/username and password.
    Sets HttpOnly session cookie and returns access token.
    """
    identifier = credentials.username_or_email.strip().lower()
    result = await db.execute(
        select(User).where(
            or_(
                User.email.ilike(identifier),
                User.username.ilike(identifier)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify username/email and password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact administration."
        )

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role
    })

    # Set secure HttpOnly session cookie
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=86400,  # 24 hours
        samesite="lax",
        secure=False,  # allow localhost development
        path="/"
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login/citizen", response_model=TokenResponse)
async def login_citizen(
    credentials: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Citizen login endpoint. Validates credentials and ensures user is authenticated.
    """
    identifier = credentials.username_or_email.strip().lower()
    result = await db.execute(
        select(User).where(
            or_(
                User.email.ilike(identifier),
                User.username.ilike(identifier)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your citizen username/email and password."
        )

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role
    })

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        secure=False,
        path="/"
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login/admin", response_model=TokenResponse)
async def login_admin(
    credentials: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Government / Admin login endpoint.
    Strictly verifies credentials and enforces government administrator authorization.
    """
    identifier = credentials.username_or_email.strip().lower()
    result = await db.execute(
        select(User).where(
            or_(
                User.email.ilike(identifier),
                User.username.ilike(identifier)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrative credentials. Please verify email and password."
        )

    role = (user.role or "").upper()
    if role not in ["GOVERNMENT_ADMIN", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This account does not possess government administrative privileges."
        )

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role
    })

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        secure=False,
        path="/"
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/logout")
async def logout(response: Response):
    """
    Logs out the current session and clears the HttpOnly cookie.
    """
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"status": "success", "message": "Successfully logged out. Session invalidated."}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's safe profile. Password hash is never returned.
    """
    return UserResponse.model_validate(user)
