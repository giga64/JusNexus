from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ENUM
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(ENUM('user', 'admin', name='user_role_enum'), default='user')
    is_active = Column(Boolean, default=False)
    is_pending = Column(Boolean, default=True)