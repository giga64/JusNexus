from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.crud import user as user_crud
from app.services.auth import (
    verify_password, 
    create_access_token, 
    create_email_verification_token,
    send_verification_email,
    verify_email_token
)

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user: UserCreate,
    db: Annotated[Session, Depends(get_db)]
):
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="As senhas não coincidem."
        )
    
    db_user = user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado."
        )
    
    new_user = user_crud.create_user(db=db, user=user)
    
    # Gerar e enviar o token de verificação
    token = create_email_verification_token(new_user.email)
    send_verification_email(email=new_user.email, token=token)

    return new_user

@router.get("/verify-email")
def verify_email(token: str, db: Annotated[Session, Depends(get_db)]):
    user = verify_email_token(token, db)
    # Idealmente, aqui você redirecionaria para uma página de sucesso no frontend
    return {"message": f"E-mail de {user.email} verificado com sucesso! Aguarde a aprovação do administrador."}

@router.post("/login")
def login(
    user_data: UserLogin,
    db: Annotated[Session, Depends(get_db)]
):
    db_user = user_crud.get_user_by_email(db, email=user_data.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )
    
    if not verify_password(user_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas."
        )
    
    if not db_user.is_active:
        if db_user.is_pending:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso pendente de aprovação. Verifique seu e-mail para confirmar a conta."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sua conta foi desativada ou rejeitada."
            )

    # Gerar o token JWT e a resposta
    access_token = create_access_token(data={"sub": str(db_user.id), "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "full_name": db_user.full_name, "email": db_user.email, "role": db_user.role}}