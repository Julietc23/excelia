from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from app.models.schemas import ChatRequest, ChatResponse
from app.services.excel_service import ExcelService
from app.services.ai_service import AIService

router = APIRouter(tags=["Chat"])

@router.post("/chat/", response_model=ChatResponse)
async def chat_with_excel(request: ChatRequest):
    """
    Procesa una pregunta sobre un archivo Excel y devuelve una respuesta generada por IA
    
    Args:
        request: Solicitud de chat con nombre de archivo y pregunta
        
    Returns:
        ChatResponse: Respuesta generada por el modelo de IA
    """
    try:
        # Obtener la ruta del archivo
        file_path = ExcelService.get_file_path(request.filename)
        
        # Leer el archivo (Excel o CSV)
        df, summary = ExcelService.read_file(file_path)
        
        # Obtener respuesta del modelo de IA
        answer = await AIService.get_answer(df, summary, request.question)
        
        # Preparar contexto simplificado para la respuesta
        simplified_context = {
            "rows": summary["rows"],
            "columns": summary["columns"],
            "column_names": summary["column_names"]
        }
        
        return ChatResponse(
            answer=answer,
            context=simplified_context
        )
    
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Archivo {request.filename} no encontrado")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la consulta: {str(e)}")