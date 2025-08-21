from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.crud import user as user_crud
from app.services.auth import get_user_from_token
from app.models.user import User

router = APIRouter()

def get_current_admin(user: User = Depends(get_user_from_token)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para realizar esta ação."
        )
    return user

@router.get("/users", response_model=list[UserResponse])
def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users

@router.put("/users/{user_id}/status", response_model=UserResponse)
def update_user_approval(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    db_user = user_crud.update_user_status(db, user_id=user_id, user_update=user_update)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return db_user