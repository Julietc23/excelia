import os
from typing import Dict, Any
import pandas as pd
import openai
from openai import OpenAI

class AIService:
    """Servicio para interactuar con OpenAI API"""

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
                stats = summary["numeric_stats"]
                context_lines.append(
                    f"- {col}: promedio={stats['mean'][col]:.2f} (min={stats['min'][col]}, max={stats['max'][col]})"
                )

        # Valores categóricos
        if summary.get("categorical_columns"):
            context_lines.append("\nValores únicos en columnas categóricas:")
            for col in summary["categorical_columns"][:3]:  # Limitar a 3 columnas
                unique_vals = df[col].dropna().unique()[:5]
                context_lines.append(f"- {col}: {', '.join(map(str, unique_vals))}")

        # Ejemplos de datos
        if not df.empty:
            context_lines.append("\nPrimeras filas de ejemplo:")
            for _, row in df.head(2).iterrows():
                example = ", ".join(f"{k}={v}" for k, v in row.items()[:3])
                context_lines.append(f"- {example}")

        return "\n".join(context_lines)

    def get_answer(self, df: pd.DataFrame, summary: Dict[str, Any], question: str) -> str:
        """Obtiene respuesta de OpenAI usando el contexto de los datos"""
        context = self.generate_dataframe_context(df, summary)

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",  # o "gpt-4-turbo"
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
                temperature=0.3,  # Para respuestas más deterministas
                max_tokens=500
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            return f"Error al consultar OpenAI: {str(e)}"
