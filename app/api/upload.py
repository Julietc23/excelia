from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import os
import uuid
from typing import List

from app.services.excel_service import ExcelService
from app.models.schemas import FilePreview

router = APIRouter(tags=["Upload"])

@router.post("/upload/", response_model=FilePreview)
async def upload_excel(
    file: UploadFile = File(...),
):
    """
    Carga un archivo Excel y devuelve una vista previa
    
    Args:
        file: Archivo Excel a cargar
        
    Returns:
        FilePreview: Vista previa del archivo
    """
    # Verificar que el archivo sea Excel o CSV
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="El archivo debe ser Excel (.xlsx o .xls) o CSV (.csv)")
    
    try:
        # Leer el contenido del archivo
        file_content = await file.read()
        
        # Generar un nombre único para el archivo
        unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
        
        # Guardar el archivo
        file_path = ExcelService.save_file(file_content, unique_filename)
        
        # Obtener vista previa
        preview = ExcelService.get_preview(file_path)
        
        return preview
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo: {str(e)}")

@router.get("/files/", response_model=List[str])
async def list_files():
    """
    Lista todos los archivos Excel disponibles
    
    Returns:
        List[str]: Lista de nombres de archivos
    """
    try:
        files = [f for f in os.listdir(ExcelService.TEMP_DIR) 
                if f.endswith(('.xlsx', '.xls', '.csv'))]
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar archivos: {str(e)}")

@router.get("/files/{filename}/preview", response_model=FilePreview)
async def get_file_preview(filename: str):
    """
    Obtiene una vista previa de un archivo Excel existente
    
    Args:
        filename: Nombre del archivo
        
    Returns:
        FilePreview: Vista previa del archivo
    """
    file_path = ExcelService.get_file_path(filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    try:
        preview = ExcelService.get_preview(file_path)
        return preview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener vista previa: {str(e)}")

@router.delete("/files/{filename}")
async def delete_file(filename: str):
    """
    Elimina un archivo Excel
    
    Args:
        filename: Nombre del archivo a eliminar
    """
    file_path = ExcelService.get_file_path(filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    try:
        os.remove(file_path)
        return {"message": f"Archivo {filename} eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar archivo: {str(e)}")
