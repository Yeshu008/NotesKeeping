from pydantic import BaseModel, constr
from typing import Optional

class NoteCreateSchema(BaseModel):
    note_title: constr(strip_whitespace=True, min_length=1)
    note_content: Optional[str] = ""

    class Config:
        str_strip_whitespace = True

class NoteUpdateSchema(BaseModel):
    note_title: Optional[constr(strip_whitespace=True, min_length=1)] = None
    note_content: Optional[str] = None

    class Config:
        str_strip_whitespace = True
