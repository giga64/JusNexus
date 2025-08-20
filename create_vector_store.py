import os
import pickle
import fitz  # PyMuPDF
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# --- Configurações ---
# Agora processa uma lista de dicionários, cada um com o caminho e o "tipo"
SPECIALIZED_DOCS = [
    {"path": "GUIA AUTODISPENSA.pdf", "metadata": {"source": "autodispensa"}}
]
VECTOR_STORE_PATH = "vector_store.pkl"
EMBEDDING_MODEL = "rufimelo/Legal-BERTimbau-sts-large"

def create_and_save_vector_store():
    """
    Lê os PDFs especializados, adiciona metadata, cria os embeddings 
    e salva a base de vetores em um ficheiro .pkl.
    """
    all_chunks = []

    for doc_info in SPECIALIZED_DOCS:
        doc_path = doc_info["path"]
        doc_metadata = doc_info["metadata"]

        print(f"A ler o documento especializado: {doc_path}")
        if not os.path.exists(doc_path):
            print(f"AVISO: Ficheiro '{doc_path}' não encontrado. A ignorar.")
            continue

        # Extrai o texto do PDF
        with fitz.open(doc_path) as doc:
            text = "".join(page.get_text() for page in doc)
        
        # Cria um único documento LangChain para ser dividido
        doc_container = Document(page_content=text, metadata=doc_metadata)

        # Divide o texto em pedaços (chunks)
        print("A dividir o texto em chunks...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents([doc_container])
        print(f"Texto de '{doc_path}' dividido em {len(chunks)} chunks.")
        
        # Adiciona os chunks processados à lista geral
        all_chunks.extend(chunks)

    if not all_chunks:
        print("ERRO: Nenhum documento foi processado. A base de vetores não será criada.")
        return

    # Carrega o modelo de embeddings (pode demorar um pouco na primeira vez)
    print(f"A carregar o modelo de embeddings: {EMBEDDING_MODEL}...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    print("Modelo carregado.")

    # Cria a base de vetores FAISS a partir de todos os chunks
    print("A criar a base de dados vetorial (FAISS) com metadata...")
    vector_store = FAISS.from_documents(all_chunks, embedding=embeddings)
    print("Base de dados criada com sucesso.")

    # Salva a base de vetores no ficheiro
    with open(VECTOR_STORE_PATH, "wb") as f:
        pickle.dump(vector_store, f)
    
    print(f"✅ Base de dados vetorial salva com sucesso em: {VECTOR_STORE_PATH}")

if __name__ == "__main__":
    create_and_save_vector_store()