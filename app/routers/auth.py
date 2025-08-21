from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.crud import user as user_crud
from app.services.auth import verify_password

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
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
    
    return user_crud.create_user(db=db, user=user)

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso pendente de aprovação. Verifique seu e-mail."
        )

    # TO-DO: Gerar token JWT
from app.services.auth import verify_password, create_access_token

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
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

    if db_user.is_pending:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso pendente de aprovação. Verifique seu e-mail."
        )

    # Gerar o token JWT e a resposta
    access_token = create_access_token(data={"sub": str(db_user.id), "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "full_name": db_user.full_name, "email": db_user.email}}