from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    username: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None
    role: str = "CITIZEN"
