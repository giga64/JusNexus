# Use uma imagem oficial do Python como base
FROM python:3.10-slim

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie o arquivo de requisitos e instale as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie o resto do código da aplicação
COPY . .

# Comando para iniciar o servidor Uvicorn quando o contêiner for iniciado
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]