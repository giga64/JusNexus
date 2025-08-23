from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from app.services import gemini_service
from app.services.auth import get_current_user
from app.models.user import User
import PyPDF2
import io

router = APIRouter()


@router.post("/extract-data", dependencies=[Depends(get_current_user)])
async def extract_process_data(file: UploadFile = File(...)):
    if not file.content_type == 'application/pdf':
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são aceitos.")

    try:
        pdf_content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        
        text = "".join(page.extract_text() or "" for page in pdf_reader.pages)
        
        if not text:
            raise HTTPException(status_code=400, detail="Não foi possível extrair texto do PDF.")
        
        # Substitui o mock pela chamada real ao serviço Gemini
        extracted_data = gemini_service.extract_data_from_text(text)

        return extracted_data
    except ValueError as e: # Captura o erro específico da IA
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo: {str(e)}")


class DocumentGenerationRequest(BaseModel):
    templateId: str
    processData: Dict[str, Any]
    additionalData: Dict[str, Any]

@router.post("/generate-document", dependencies=[Depends(get_current_user)])
async def generate_document_endpoint(request: DocumentGenerationRequest):
    try:
        generated_text = gemini_service.generate_document(
            template_id=request.templateId,
            process_data=request.processData,
            additional_data=request.additionalData
        )
        return {"document": generated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar o documento: {str(e)}")


class ChatRequest(BaseModel):
    history: list
    message: str
    processData: Dict[str, Any]

@router.post("/chat", dependencies=[Depends(get_current_user)])
async def chat_with_assistant(request: ChatRequest):
    try:
        response_text = gemini_service.get_chat_response(
            history=request.history,
            new_message=request.message,
            process_data=request.processData
        )
        return {"reply": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na comunicação com o assistente: {str(e)}")
