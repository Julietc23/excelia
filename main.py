from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.upload import router as upload_router
from app.api.chat import router as chat_router

# Crear la aplicación FastAPI
app = FastAPI(
    title="Excel AI API",
    description="API para procesar archivos Excel con IA",
    version="1.0.0"
)

# Configurar CORS - Permitir todas las solicitudes durante el desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes para desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar los routers
app.include_router(upload_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

# Endpoint raíz
@app.get("/")
async def root():
    return {"message": "Backend funcionando correctamente"}

# Crear directorio temporal para archivos si no existe
os.makedirs("temp_files", exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
