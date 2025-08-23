# Estágio 1: Builder - Instala dependências
FROM python:3.10-slim as builder

WORKDIR /app

# Instala o poetry para um gerenciamento de dependências mais robusto
RUN pip install poetry

# Copia apenas os arquivos de dependência e instala
COPY poetry.lock pyproject.toml ./
RUN poetry install --no-dev --no-root

# Estágio 2: Produção - Imagem final e leve
FROM python:3.10-slim

WORKDIR /app

# Copia as dependências instaladas do estágio builder
COPY --from=builder /app/.venv ./.venv

# Ativa o ambiente virtual
ENV PATH="/app/.venv/bin:$PATH"

# Copia o código da aplicação
COPY ./app ./app
COPY ./config ./config

# Expõe a porta e inicia a aplicação com Uvicorn
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]