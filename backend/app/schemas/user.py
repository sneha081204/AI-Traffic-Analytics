from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreateSchema(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "traffic_officer"

class UserLoginSchema(BaseModel):
    username: str
    password: str

class UserResponseSchema(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
