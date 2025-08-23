from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.crud import user as user_crud
from app.services.auth import get_current_user
from app.models.user import User
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

def get_current_admin(user = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para realizar esta ação."
        )
    return user

@router.get("/users")
def get_all_users(
    db = Depends(get_db),
    current_user = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100
):
    logger.info("Obtendo usuários com skip=%d e limit=%d", skip, limit)
    # Retorno fixo para isolar o problema
    return [
        {
            "id": 1,
            "full_name": "Usuário Teste",
            "email": "teste@example.com",
            "is_active": True,
            "is_pending": False,
            "role": "admin"
        }
    ]

@router.put("/users/{user_id}/status")
def update_user_approval(
    user_id: int,
    user_update: UserUpdate,
    db = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    update_data = user_update.model_dump(exclude_unset=True)
    db_user = user_crud.update_user_status(db, user_id=user_id, user_update_data=update_data)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return db_user