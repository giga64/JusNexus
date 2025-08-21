from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_active: bool
    is_pending: bool
    role: str

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_pending: Optional[bool] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str