import os
import shutil
import sqlite3
import gzip
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class BackupManager:
    """Gestor de backups automáticos para la aplicación Meditrib"""

    def __init__(self, db_path: str = "meditrib.db", backup_dir: str = "backups"):
        self.db_path = Path(db_path)
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(exist_ok=True)

        # Configuración de retención
        self.retention_days = {
            "daily": 30,      # Mantener 30 días de backups diarios
            "weekly": 12,     # Mantener 12 semanas de backups semanales
            "monthly": 24     # Mantener 24 meses de backups mensuales
        }

    def create_backup(self, backup_type: str = "manual") -> str:
        """
        Crea un backup completo de la base de datos

        Args:
            backup_type: Tipo de backup ("manual", "daily", "weekly", "monthly")

        Returns:
            Ruta del archivo de backup creado
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"meditrib_backup_{backup_type}_{timestamp}.db.gz"
        backup_path = self.backup_dir / backup_filename

        try:
            # Verificar que la base de datos existe
            if not self.db_path.exists():
                raise FileNotFoundError(f"Database file not found: {self.db_path}")

            # Crear backup comprimido
            with open(self.db_path, 'rb') as db_file:
                with gzip.open(backup_path, 'wb', compresslevel=9) as backup_file:
                    shutil.copyfileobj(db_file, backup_file)

            # Verificar que el backup se creó correctamente
            if not backup_path.exists() or backup_path.stat().st_size == 0:
                raise Exception("Backup file was not created or is empty")

            # Registrar el backup
            self._log_backup(backup_path, backup_type)

            logger.info(f"Backup created successfully: {backup_path}")
            return str(backup_path)

        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
            # Limpiar archivo parcial si existe
            if backup_path.exists():
                backup_path.unlink()
            raise

    def restore_backup(self, backup_path: str, target_db: Optional[str] = None) -> bool:
        """
        Restaura un backup

        Args:
            backup_path: Ruta del archivo de backup
            target_db: Ruta donde restaurar (por defecto, la DB original)

        Returns:
            True si la restauración fue exitosa
        """
        backup_file = Path(backup_path)
        target_path = Path(target_db) if target_db else self.db_path

        if not backup_file.exists():
            raise FileNotFoundError(f"Backup file not found: {backup_path}")

        # Crear backup de seguridad antes de restaurar
        safety_backup = target_path.with_suffix('.safety_backup')
        if target_path.exists():
            shutil.copy2(target_path, safety_backup)

        try:
            # Descomprimir y restaurar
            with gzip.open(backup_file, 'rb') as backup_file_obj:
                with open(target_path, 'wb') as db_file:
                    shutil.copyfileobj(backup_file_obj, db_file)

            # Verificar que la restauración fue exitosa
            if not target_path.exists() or target_path.stat().st_size == 0:
                raise Exception("Restored database is empty or was not created")

            # Verificar integridad de la base de datos
            self._verify_database_integrity(target_path)

            # Registrar restauración
            self._log_restore(backup_path, str(target_path))

            logger.info(f"Backup restored successfully: {backup_path} -> {target_path}")

            # Eliminar backup de seguridad si todo salió bien
            if safety_backup.exists():
                safety_backup.unlink()

            return True

        except Exception as e:
            logger.error(f"Failed to restore backup: {e}")

            # Restaurar el backup de seguridad si existe
            if safety_backup.exists():
                shutil.copy2(safety_backup, target_path)
                safety_backup.unlink()
                logger.info("Safety backup restored due to restore failure")

            raise

    def cleanup_old_backups(self) -> Dict[str, int]:
        """
        Limpia backups antiguos según la política de retención

        Returns:
            Diccionario con cantidad de archivos eliminados por tipo
        """
        cleaned = {"daily": 0, "weekly": 0, "monthly": 0, "manual": 0}

        # Obtener todos los archivos de backup
        backup_files = list(self.backup_dir.glob("meditrib_backup_*.db.gz"))

        # Ordenar por fecha (más recientes primero)
        backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)

        # Procesar cada tipo de backup
        for backup_type in ["daily", "weekly", "monthly"]:
            type_files = [f for f in backup_files if f"_{backup_type}_" in f.name]

            # Mantener solo los más recientes según retención
            retention_count = self.retention_days[backup_type]
            files_to_delete = type_files[retention_count:]

            for file_path in files_to_delete:
                try:
                    file_path.unlink()
                    cleaned[backup_type] += 1
                    logger.info(f"Deleted old backup: {file_path}")
                except Exception as e:
                    logger.error(f"Failed to delete backup {file_path}: {e}")

        # Para backups manuales, mantener todos (no limpiar automáticamente)
        # Los administradores deben decidir cuándo eliminarlos

        return cleaned

    def get_backup_info(self) -> Dict:
        """
        Obtiene información sobre los backups disponibles
        """
        backup_files = list(self.backup_dir.glob("meditrib_backup_*.db.gz"))

        info = {
            "total_backups": len(backup_files),
            "total_size_mb": 0,
            "by_type": {"daily": 0, "weekly": 0, "monthly": 0, "manual": 0},
            "oldest_backup": None,
            "newest_backup": None
        }

        if backup_files:
            # Calcular tamaño total
            total_size = sum(f.stat().st_size for f in backup_files)
            info["total_size_mb"] = round(total_size / (1024 * 1024), 2)

            # Contar por tipo
            for file_path in backup_files:
                if "_daily_" in file_path.name:
                    info["by_type"]["daily"] += 1
                elif "_weekly_" in file_path.name:
                    info["by_type"]["weekly"] += 1
                elif "_monthly_" in file_path.name:
                    info["by_type"]["monthly"] += 1
                else:
                    info["by_type"]["manual"] += 1

            # Fechas
            mtimes = [f.stat().st_mtime for f in backup_files]
            info["oldest_backup"] = datetime.fromtimestamp(min(mtimes)).isoformat()
            info["newest_backup"] = datetime.fromtimestamp(max(mtimes)).isoformat()

        return info

    def schedule_automatic_backups(self):
        """
        Configura backups automáticos (debe ser llamado periódicamente)
        """
        now = datetime.now()

        # Backup diario a las 2 AM
        if now.hour == 2 and now.minute < 5:  # Ventana de 5 minutos
            try:
                self.create_backup("daily")
                self.cleanup_old_backups()
            except Exception as e:
                logger.error(f"Automatic daily backup failed: {e}")

        # Backup semanal los domingos a las 3 AM
        elif now.weekday() == 6 and now.hour == 3 and now.minute < 5:
            try:
                self.create_backup("weekly")
            except Exception as e:
                logger.error(f"Automatic weekly backup failed: {e}")

        # Backup mensual el día 1 a las 4 AM
        elif now.day == 1 and now.hour == 4 and now.minute < 5:
            try:
                self.create_backup("monthly")
            except Exception as e:
                logger.error(f"Automatic monthly backup failed: {e}")

    def _verify_database_integrity(self, db_path: Path) -> bool:
        """
        Verifica la integridad de la base de datos SQLite
        """
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()

            # Ejecutar PRAGMA integrity_check
            cursor.execute("PRAGMA integrity_check")
            result = cursor.fetchone()

            conn.close()

            if result and result[0] == "ok":
                return True
            else:
                raise Exception(f"Database integrity check failed: {result}")

        except Exception as e:
            logger.error(f"Database integrity check failed: {e}")
            raise

    def _log_backup(self, backup_path: Path, backup_type: str):
        """Registra la creación de un backup"""
        from backend.core.logging_config import log_system_health

        log_system_health(
            component="backup",
            metric="created",
            value=str(backup_path),
            status="OK",
            details={
                "backup_type": backup_type,
                "size_bytes": backup_path.stat().st_size,
                "size_mb": round(backup_path.stat().st_size / (1024 * 1024), 2)
            }
        )

    def _log_restore(self, backup_path: str, target_path: str):
        """Registra la restauración de un backup"""
        from backend.core.logging_config import log_audit_event

        log_audit_event(
            event_type="backup_restore",
            details={
                "backup_file": backup_path,
                "target_database": target_path
            },
            severity="INFO"
        )


# Funciones de conveniencia
def create_backup(backup_type: str = "manual") -> str:
    """Función de conveniencia para crear backup"""
    manager = BackupManager()
    return manager.create_backup(backup_type)


def restore_backup(backup_path: str, target_db: Optional[str] = None) -> bool:
    """Función de conveniencia para restaurar backup"""
    manager = BackupManager()
    return manager.restore_backup(backup_path, target_db)


def get_backup_info() -> Dict:
    """Función de conveniencia para obtener info de backups"""
    manager = BackupManager()
    return manager.get_backup_info()


def cleanup_backups() -> Dict[str, int]:
    """Función de conveniencia para limpiar backups antiguos"""
    manager = BackupManager()
    return manager.cleanup_old_backups()