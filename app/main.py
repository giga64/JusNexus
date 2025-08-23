from fastapi import FastAPI
from app.routers import auth, admin, user, process
from app.database import Base, engine
from app.models import user as user_model

# Crie todas as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JusNexus API",
    description="API para a plataforma jurídica inteligente JusNexus.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(admin.router, prefix="/admin", tags=["Administração"])
app.include_router(user.router, prefix="/api/v1", tags=["Usuário"])
app.include_router(process.router, prefix="/process", tags=["Processamento"])

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao JusNexus!"}