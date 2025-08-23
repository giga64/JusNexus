from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Header
from sqlalchemy.orm import Session
from config.settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.crud import user as user_crud
from app.database import get_db
# Configuração do contexto de hash para a senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_email_verification_token(email: str):
    expire = datetime.utcnow() + timedelta(hours=24) # Token válido por 24 horas
    to_encode = {"exp": expire, "sub": email, "scope": "email_verification"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_email_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("scope") != "email_verification":
            raise HTTPException(status_code=401, detail="Token inválido para verificação de e-mail")
        
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
            
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    user = user_crud.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Ativa o usuário e remove o status de pendente
    user_update_data = {"is_active": True, "is_pending": False}
    updated_user = user_crud.update_user_status(db, user_id=user.id, user_update_data=user_update_data)
    
    return updated_user

def get_user_from_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        token_data = {"id": user_id}
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    user = user_crud.get_user_by_id(db, user_id=token_data["id"])
    if user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

# SERVIÇO SIMULADO DE E-MAIL
def send_verification_email(email: str, token: str):
    # Em um ambiente real, você usaria uma biblioteca como 'fastapi-mail' ou 'smtplib'
    # para enviar um e-mail de verdade.
    verification_link = f"http://localhost:8080/verify-email?token={token}"
    print("---- SIMULAÇÃO DE ENVIO DE E-MAIL ----")
    print(f"Para: {email}")
    print("Assunto: Verifique seu e-mail no JusNexus")
    print("Corpo: Por favor, clique no link abaixo para verificar seu e-mail e ativar sua conta.")
    print(f"Link: {verification_link}")
    print("--------------------------------------")

# Função de dependência adequada para o FastAPI
def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    """
    Dependência FastAPI para obter o usuário atual a partir do token de autorização.
    """
    # Extrai o token do header Authorization (formato: "Bearer <token>")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Esquema de autorização inválido")
    except ValueError:
        raise HTTPException(status_code=401, detail="Header de autorização inválido")
    
    # Usa a função existente para validar o token e obter o usuário
    return get_user_from_token(token, db)