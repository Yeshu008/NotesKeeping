from pydantic import BaseModel, EmailStr, root_validator,constr

class UserSignUpSchema(BaseModel):
    user_name: str
    user_email: EmailStr
    password: str
    confirm_password: str

    @root_validator
    def validate_passwords(cls, values):
        password = values.get("password")
        confirm_password = values.get("confirm_password")

        if password != confirm_password:
            raise ValueError("Passwords do not match")

        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")

        return values

    class Config:
        str_strip_whitespace = True

class UserSignInSchema(BaseModel):
    user_email: EmailStr
    password: str

    class Config:
        str_strip_whitespace = True

class UserUpdateSchema(BaseModel):
    user_name: constr(strip_whitespace=True, min_length=1, max_length=100) | None = None
    user_email: EmailStr | None = None

    class Config:
        str_strip_whitespace = True        


