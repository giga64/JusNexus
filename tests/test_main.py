import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.models.user import User
from fastapi.testclient import TestClient

# Configuração do banco de dados de teste em memória
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Sobrescreve a dependência de banco de dados para usar o banco de teste
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Cria o cliente de teste para fazer requisições
client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """Cria o banco de dados antes de cada teste e o limpa depois."""
    Base.metadata.create_all(bind=engine)
    yield
    # Limpa todas as tabelas após cada teste
    Base.metadata.drop_all(bind=engine)

def create_test_user(db, email="test@example.com"):
    """Função auxiliar para criar um usuário de teste."""
    from app.services.auth import get_password_hash
    hashed_password = get_password_hash("testpassword123")
    user = User(full_name="Test User", email=email, hashed_password=hashed_password, is_active=True, is_pending=False, role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_test_admin_user(db, email="admin@example.com"):
    """Função auxiliar para criar um usuário administrador de teste."""
    from app.services.auth import get_password_hash
    hashed_password = get_password_hash("adminpassword123")
    user = User(full_name="Admin User", email=email, hashed_password=hashed_password, is_active=True, is_pending=False, role="admin")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_test_token(db, user):
    """Função auxiliar para obter um token JWT de teste."""
    from app.services.auth import create_access_token
    return create_access_token(data={"sub": str(user.id), "role": user.role})

# Exemplo de Teste - Login e acesso a endpoint protegido
def test_user_login_and_access_protected_route(setup_database):
    db = next(override_get_db())
    test_user = create_test_user(db)
    
    # Testa o login do usuário
    login_data = {"email": "test@example.com", "password": "testpassword123"}
    login_response = client.post("/auth/login", json=login_data)
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Testa o acesso à rota protegida com o token
    headers = {"Authorization": f"Bearer {token}"}
    profile_response = client.get("/api/v1/profile", headers=headers)
    assert profile_response.status_code == 200
    assert profile_response.json()["email"] == "test@example.com"

def test_unauthorized_access_to_admin_route(setup_database):
    db = next(override_get_db())
    test_user = create_test_user(db, email="user2@example.com")

    # Tenta acessar uma rota de admin com um token de usuário comum
    token = get_test_token(db, test_user)
    headers = {"Authorization": f"Bearer {token}"}
    admin_response = client.get("/admin/users", headers=headers)
    
    assert admin_response.status_code == 403
    assert "permissão" in admin_response.json()["detail"]

# TODO: Adicionar mais testes para os endpoints de registro, verificação de e-mail e processamento
