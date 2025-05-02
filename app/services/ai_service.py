import os
from typing import Dict, Any, Tuple
import pandas as pd
from openai import OpenAI
from fastapi import HTTPException

class AIService:
    """Servicio para interactuar con OpenAI API"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY no está configurada")
        self.client = OpenAI(api_key=api_key)

    @staticmethod
    def generate_dataframe_context(df: pd.DataFrame, summary: Dict[str, Any]) -> str:
        """
        Genera un contexto estructurado para el prompt de OpenAI.
        Ejemplo de salida:
        '''
        El archivo tiene 100 filas y 5 columnas: [Ventas, Fecha, Producto, ...].
        - Ventas: promedio=150 (min=10, max=300)
        - Producto: valores únicos: [Laptop, Teléfono, Tablet]
        Ejemplos de datos:
        - Fila 1: Ventas=200, Fecha=2023-01-01, Producto=Laptop
        '''
        """
        context_lines = [
            f"El archivo tiene {summary['rows']} filas y {summary['columns']} columnas: {', '.join(summary['column_names'])}."
        ]

        # Estadísticas numéricas
        if summary.get("numeric_columns"):
            context_lines.append("\nEstadísticas numéricas:")
            for col in summary["numeric_columns"]:
                if col in summary.get("numeric_stats", {}).get("mean", {}):
                    stats = summary["numeric_stats"]
                    context_lines.append(
                        f"- {col}: promedio={stats['mean'][col]:.2f} (min={stats['min'][col]}, max={stats['max'][col]})"
                    )

        # Valores categóricos
        if summary.get("categorical_columns"):
            context_lines.append("\nValores únicos en columnas categóricas:")
            for col in summary["categorical_columns"][:3]:  # Limitar a 3 columnas
                unique_vals = df[col].dropna().unique()[:5]
                if len(unique_vals) > 0:
                    context_lines.append(f"- {col}: {', '.join(map(str, unique_vals))}")

        # Ejemplos de datos
        if not df.empty:
            context_lines.append("\nPrimeras filas de ejemplo:")
            for _, row in df.head(2).iterrows():
                example = ", ".join(f"{k}={v}" for k, v in row.items()[:3])
                context_lines.append(f"- {example}")

        return "\n".join(context_lines)

    @staticmethod
    def process_file_data(file_data: Dict[str, Any]) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Convierte los datos del archivo en DataFrame y summary"""
        try:
            df = pd.DataFrame(file_data.get("data", []))
            
            summary = {
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": list(df.columns),
                "numeric_columns": df.select_dtypes(include=['number']).columns.tolist(),
                "categorical_columns": df.select_dtypes(include=['object', 'category']).columns.tolist(),
                "numeric_stats": {
                    "mean": df.mean(numeric_only=True).to_dict(),
                    "min": df.min(numeric_only=True).to_dict(),
                    "max": df.max(numeric_only=True).to_dict()
                } if not df.empty else {}
            }
            return df, summary
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error procesando datos: {str(e)}")

    def get_answer(self, file_data: Dict[str, Any], question: str) -> str:
        """Versión adaptada para recibir datos del frontend"""
        if not question:
            raise ValueError("Se requiere una pregunta")
            
        try:
            df, summary = self.process_file_data(file_data)
            context = self.generate_dataframe_context(df, summary)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un asistente que analiza datos de archivos Excel. Responde preguntas basándote únicamente en el contexto proporcionado."
                    },
                    {
                        "role": "user",
                        "content": f"Contexto:\n{context}\n\nPregunta: {question}"
                    }
                ],
                temperature=0.3,
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error en OpenAI: {str(e)}")
