from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    merchant_slug: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class AuthUser(BaseModel):
    id: str
    merchant_id: str
    email: EmailStr
    full_name: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: AuthUser
