from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignUpSchema(BaseModel):
    user_name: str
    user_email: EmailStr
    password: str

    class Config:
        str_strip_whitespace = True

class UserSignInSchema(BaseModel):
    user_email: EmailStr
    password: str

    class Config:
        str_strip_whitespace = True

class NoteCreateSchema(BaseModel):
    note_title: str
    note_content: Optional[str] = ""

    class Config:
        str_strip_whitespace = True

class NoteUpdateSchema(BaseModel):
    note_title: Optional[str] = None
    note_content: Optional[str] = None

    class Config:
        str_strip_whitespace = True
