from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class FilePreview(BaseModel):
    """Esquema para la vista previa de un archivo Excel"""
    filename: str
    rows: int
    columns: int
    column_names: List[str]
    preview_data: List[Dict[str, Any]]

class ChatRequest(BaseModel):
    """Esquema para solicitudes de chat"""
    filename: str
    question: str = Field(..., min_length=1, max_length=500)

class ChatResponse(BaseModel):
    """Esquema para respuestas de chat"""
    answer: str
    context: Optional[Dict[str, Any]] = None
