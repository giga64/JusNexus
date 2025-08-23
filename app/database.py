from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config.settings import DATABASE_URL

# Determine se é SQLite baseado na URL
is_sqlite = DATABASE_URL.startswith("sqlite")

# Configure connect_args apenas para SQLite
connect_args = {"check_same_thread": False} if is_sqlite else {}

# Crie o engine do banco de dados
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Crie uma sessão local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crie a base declarativa para os modelos
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()