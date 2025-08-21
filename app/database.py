from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from config.settings import DATABASE_URL

# Crie o engine do banco de dados
engine = create_engine(DATABASE_URL)

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