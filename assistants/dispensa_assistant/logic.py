# assistants/dispensa_assistant/logic.py
# Contém a lógica de negócio principal para o assistente de dispensa.

import fitz  # PyMuPDF
import httpx
import json
from langchain_community.vectorstores import FAISS

# Importa as peças específicas deste assistente
from .schema import get_schema
from .prompt import get_prompt # Atualizado para a nova função de prompt

def run_analysis(form_type: str, file_content: bytes, vector_store: FAISS, gemini_url: str):
    """
    Executa o fluxo completo de análise para o assistente de dispensa,
    usando lógica e prompts especializados para cada tipo de formulário.
    Retorna um dicionário com os dados extraídos e o contexto RAG.
    """
    # 1. Extrair texto do PDF (sem alterações)
    with fitz.open(stream=file_content, filetype="pdf") as doc:
        decision_text = "".join(page.get_text() for page in doc)
    if not decision_text.strip():
        raise ValueError("O arquivo PDF está vazio ou não contém texto extraível.")

    # 2. Lógica de RAG Condicional e Especializada
    rag_context = ""
    if form_type == 'autodispensa':
        print("Executando busca RAG especializada para 'autodispensa'...")
        query_text = decision_text[:2000]
        
        # Filtra a busca para usar apenas os documentos com a metadata correta
        # NOTA: O filtro deve corresponder à metadata definida em create_vector_store.py
        relevant_docs = vector_store.similarity_search(
            query=query_text, 
            k=5, # Aumenta um pouco para garantir que captura o contexto certo
            filter={"source": "autodispensa"}
        )
        
        if relevant_docs:
            rag_context = "\n\n---\n\n".join([doc.page_content for doc in relevant_docs])
            print("Contexto RAG recuperado com sucesso.")
        else:
            print("AVISO: Nenhum contexto RAG encontrado para 'autodispensa'.")
    else:
        # Para 'dispensa' e 'autorizacao', o RAG é ignorado, como solicitado.
        print(f"RAG não aplicável para o formulário tipo '{form_type}'.")


    # 3. Construir o prompt especializado e obter o schema
    prompt_text = get_prompt(form_type, decision_text, rag_context)
    json_schema = get_schema(form_type)

    if not prompt_text or not json_schema:
        raise ValueError(f"Não foi possível encontrar prompt ou schema para o formulário '{form_type}'.")

    # 4. Chamar a API do modelo de linguagem (LLM) - sem alterações
    payload = {
        "contents": [{"parts": [{"text": prompt_text}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {"type": "OBJECT", "properties": json_schema}
        }
    }
    
    response = httpx.post(gemini_url, json=payload, timeout=120.0)
    response.raise_for_status()
    
    result = response.json()
    if 'candidates' in result and result['candidates']:
        extracted_data = json.loads(result['candidates'][0]['content']['parts'][0]['text'])
        return {
            "extracted_data": extracted_data,
            "rag_context": rag_context
        }
    else:
        raise ValueError(f"Resposta inesperada da API Gemini: {result}")