import pandas as pd
import os
import csv
import io
import chardet
from typing import Dict, List, Any, Tuple

class ExcelService:
    """Servicio para procesar archivos Excel y CSV"""
    
    TEMP_DIR = "temp_files"
    
    @staticmethod
    def save_file(file_content: bytes, filename: str) -> str:
        """Guarda un archivo en el directorio temporal"""
        # Asegurarse de que el directorio existe
        os.makedirs(ExcelService.TEMP_DIR, exist_ok=True)
        
        file_path = os.path.join(ExcelService.TEMP_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(file_content)
        return file_path
    
    @staticmethod
    def get_file_path(filename: str) -> str:
        """Obtiene la ruta completa de un archivo"""
        return os.path.join(ExcelService.TEMP_DIR, filename)
    
    @staticmethod
    def detect_encoding(file_path: str) -> str:
        """
        Detecta la codificación del archivo
        
        Args:
            file_path: Ruta al archivo
            
        Returns:
            str: Codificación detectada
        """
        with open(file_path, 'rb') as f:
            result = chardet.detect(f.read())
        return result['encoding'] or 'utf-8'
    
    @staticmethod
    def detect_delimiter(file_path: str, encoding: str) -> str:
        """
        Detecta el delimitador del archivo CSV
        
        Args:
            file_path: Ruta al archivo CSV
            encoding: Codificación del archivo
            
        Returns:
            str: Delimitador detectado
        """
        # Lista de delimitadores comunes
        delimiters = [',', ';', '\t', '|']
        
        try:
            # Leer las primeras líneas del archivo
            with open(file_path, 'r', encoding=encoding, errors='replace') as f:
                sample = ''.join(f.readline() for _ in range(5))
            
            # Contar ocurrencias de cada delimitador
            counts = {d: sample.count(d) for d in delimiters}
            
            # Seleccionar el delimitador más frecuente
            max_count = 0
            delimiter = ','  # Valor por defecto
            
            for d, count in counts.items():
                if count > max_count:
                    max_count = count
                    delimiter = d
            
            return delimiter
        except Exception as e:
            print(f"Error al detectar delimitador: {str(e)}")
            return ','  # Valor por defecto
    
    @staticmethod
    def read_file(file_path: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Lee un archivo Excel o CSV y devuelve el DataFrame y un resumen
        
        Returns:
            Tuple[pd.DataFrame, Dict[str, Any]]: DataFrame y resumen del archivo
        """
        try:
            # Determinar el tipo de archivo por su extensión
            if file_path.endswith('.csv'):
                # Detectar codificación
                encoding = ExcelService.detect_encoding(file_path)
                print(f"Codificación detectada: {encoding}")
                
                # Detectar delimitador
                delimiter = ExcelService.detect_delimiter(file_path, encoding)
                print(f"Delimitador detectado: '{delimiter}'")
                
                # Intentar leer el CSV con los parámetros detectados
                try:
                    df = pd.read_csv(file_path, encoding=encoding, sep=delimiter, engine='python')
                except Exception as e:
                    print(f"Error al leer CSV con parámetros detectados: {str(e)}")
                    
                    # Intentar con diferentes combinaciones
                    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
                    delimiters = [',', ';', '\t', '|']
                    
                    for enc in encodings:
                        for sep in delimiters:
                            try:
                                df = pd.read_csv(file_path, encoding=enc, sep=sep, engine='python')
                                # Si llegamos aquí, la lectura fue exitosa
                                print(f"Lectura exitosa con encoding={enc}, sep={sep}")
                                break
                            except Exception:
                                continue
                        else:
                            # Continuar con el siguiente encoding si no se encontró un delimitador que funcione
                            continue
                        # Si llegamos aquí, se encontró una combinación que funciona
                        break
                    else:
                        # Si todas las combinaciones fallan, intentar con el sniffer de CSV
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                                dialect = csv.Sniffer().sniff(f.read(4096))
                                f.seek(0)
                                reader = csv.reader(f, dialect)
                                data = list(reader)
                            
                            # Convertir a DataFrame
                            if data:
                                headers = data[0]
                                df = pd.DataFrame(data[1:], columns=headers)
                            else:
                                raise ValueError("No se pudieron leer datos del archivo CSV")
                        except Exception as csv_error:
                            print(f"Error con sniffer CSV: {str(csv_error)}")
                            # Último recurso: leer como texto y dividir manualmente
                            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                                lines = [line.strip() for line in f if line.strip()]
                            
                            if not lines:
                                raise ValueError("El archivo está vacío")
                            
                            # Intentar dividir por el delimitador más común en la primera línea
                            first_line = lines[0]
                            counts = {d: first_line.count(d) for d in delimiters}
                            best_delimiter = max(counts.items(), key=lambda x: x[1])[0]
                            
                            # Dividir todas las líneas
                            data = [line.split(best_delimiter) for line in lines]
                            headers = data[0]
                            
                            # Crear DataFrame
                            df = pd.DataFrame(data[1:], columns=headers)
            else:
                # Para archivos Excel, asegurarse de que openpyxl está instalado
                try:
                    df = pd.read_excel(file_path, engine='openpyxl')
                except ImportError:
                    raise ImportError("Missing optional dependency 'openpyxl'. Please install it using: pip install openpyxl")
            
            # Crear resumen del DataFrame
            summary = {
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": df.columns.tolist(),
                "dtypes": {col: str(df[col].dtype) for col in df.columns},
                "missing_values": df.isna().sum().to_dict(),
                "numeric_columns": df.select_dtypes(include=['number']).columns.tolist(),
                "categorical_columns": df.select_dtypes(include=['object', 'category']).columns.tolist()
            }
            
            # Agregar estadísticas básicas para columnas numéricas (CORRECCIÓN APLICADA AQUÍ)
            if summary["numeric_columns"]:
                numeric_stats = {}
                desc = df[summary["numeric_columns"]].describe()
                for stat in ['mean', 'min', 'max']:
                    if stat in desc.index:
                        numeric_stats[stat] = desc.loc[stat].to_dict()
                
                summary["numeric_stats"] = numeric_stats
            
            return df, summary
        except Exception as e:
            raise ValueError(f"Error al leer el archivo: {str(e)}")
    
    @staticmethod
    def get_preview(file_path: str, rows: int = 5) -> Dict[str, Any]:
        """
        Obtiene una vista previa de un archivo Excel o CSV
        
        Args:
            file_path: Ruta al archivo
            rows: Número de filas para la vista previa
            
        Returns:
            Dict[str, Any]: Información de vista previa del archivo
        """
        try:
            df, summary = ExcelService.read_file(file_path)
            
            # Convertir las primeras filas a diccionario para la vista previa
            preview_data = df.head(rows).to_dict(orient="records")
            
            # Asegurar que los valores son serializables a JSON
            for i, row in enumerate(preview_data):
                for key, value in row.items():
                    if pd.isna(value):
                        preview_data[i][key] = None
                    elif isinstance(value, pd.Timestamp):
                        preview_data[i][key] = value.isoformat()
                    else:
                        # Convertir todo a string para evitar problemas de serialización
                        preview_data[i][key] = str(value)
            
            return {
                "filename": os.path.basename(file_path),
                "rows": summary["rows"],
                "columns": summary["columns"],
                "column_names": summary["column_names"],
                "preview_data": preview_data
            }
        except Exception as e:
            raise ValueError(f"Error al obtener vista previa: {str(e)}")
