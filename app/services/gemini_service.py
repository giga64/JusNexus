import google.generativeai as genai
from config.settings import GEMINI_API_KEY
import logging
import json

# Configuração do logger para depuração
logging.basicConfig(level=logging.INFO)

# Configura a chave da API do Gemini a partir das configurações
try:
    genai.configure(api_key=GEMINI_API_KEY)
    logging.info("API Key do Gemini configurada com sucesso.")
except Exception as e:
    logging.error(f"Erro ao configurar a API Key do Gemini: {e}")

def get_gemini_model():
    """Inicializa e retorna o modelo generativo."""
    return genai.GenerativeModel('gemini-1.5-pro-latest')

def extract_data_from_text(text: str) -> dict:
    model = get_gemini_model()
    
    prompt = f"""
    Extraia as seguintes informações do texto de um documento processual fornecido abaixo e retorne os dados em um formato JSON puro, sem markdown (```json```) ou qualquer outro texto explicativo.

    Informações a serem extraídas:
    - "number": O número do processo.
    - "parties": Um objeto com "plaintiff" (autor/requerente) e "defendant" (réu/requerido).
    - "court": A vara ou tribunal onde o processo tramita.
    - "value": O valor da causa.
    - "subject": O assunto principal ou tipo de ação.
    - "date": A data principal do documento, se houver.
    - "status": O status atual, se mencionado.

    Texto do Documento:
    ---
    {text[:4000]} # Limita o texto para evitar exceder limites de token em casos simples
    ---

    JSON de Saída:
    """
    
    logging.info("Enviando prompt para extração de dados ao Gemini...")
    try:
        response = model.generate_content(prompt)
        logging.info("Resposta recebida da API do Gemini para extração.")
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_response)
    except Exception as e:
        logging.error(f"Erro na API do Gemini durante extração: {e}")
        raise ValueError("Não foi possível processar a resposta da IA.")

def generate_document(template_id: str, process_data: dict, additional_data: dict) -> str:
    model = get_gemini_model()
    
    template_names = {
        'manifestacao-endereco': "MANIFESTAÇÃO SOBRE NOVO ENDEREÇO",
        'dilacao-prazo': "PEDIDO DE DILAÇÃO DE PRAZO",
        'pesquisa-endereco': "REQUERIMENTO DE PESQUISA DE ENDEREÇO"
    }
    piece_name = template_names.get(template_id, "PEÇA PROCESSUAL")

    prompt = f"""
    Aja como um assistente jurídico especialista. Sua tarefa é redigir uma peça processual do tipo "{piece_name}" de forma clara, objetiva e profissional, utilizando os dados fornecidos.

    **Dados do Processo (Formato JSON):**
    {process_data}

    **Dados Adicionais Fornecidos pelo Usuário (Formato JSON):**
    {additional_data}

    **Instruções:**
    1. Utilize todos os dados fornecidos para compor o documento.
    2. Mantenha a formatação jurídica padrão.
    3. Seja formal e utilize a linguagem jurídica apropriada.
    4. Ao final, inclua um local, data e espaço para assinatura do advogado.
    5. Retorne APENAS o texto completo da peça processual, sem comentários adicionais.

    **Documento a ser Gerado:**
    """
    
    logging.info("Enviando prompt para geração de documento ao Gemini...")
    try:
        response = model.generate_content(prompt)
        logging.info("Resposta recebida da API do Gemini para geração de documento.")
        return response.text
    except Exception as e:
        logging.error(f"Erro na API do Gemini durante geração: {e}")
        raise

def get_chat_response(history: list, new_message: str, process_data: dict) -> str:
    model = get_gemini_model()
    formatted_history = "\n".join([f"{msg['type']}: {msg['content']}" for msg in history])

    prompt = f"""
    Aja como um assistente jurídico conversacional. Responda à "Nova Mensagem do Usuário" de forma útil e concisa, utilizando o "Contexto do Processo" e o "Histórico da Conversa".

    **Contexto do Processo (Formato JSON):**
    {process_data}

    **Histórico da Conversa:**
    {formatted_history}

    **Nova Mensagem do Usuário:**
    {new_message}

    **Instruções:**
    1. Responda APENAS à "Nova Mensagem do Usuário".
    2. Use os dados do processo para formular sua resposta.
    3. Mantenha as respostas curtas e diretas.

    **Sua Resposta:**
    """

    logging.info("Enviando prompt de chat ao Gemini...")
    try:
        response = model.generate_content(prompt)
        logging.info("Resposta de chat recebida da API do Gemini.")
        return response.text
    except Exception as e:
        logging.error(f"Erro na API do Gemini durante o chat: {e}")
        raise
