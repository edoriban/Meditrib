from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, List
from backend.core.backup import (
    create_backup, restore_backup, get_backup_info,
    cleanup_backups, BackupManager
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/create")
async def create_system_backup(backup_type: str = "manual", background_tasks: BackgroundTasks = None):
    """Crear un backup del sistema"""
    try:
        # Validar tipo de backup
        valid_types = ["manual", "daily", "weekly", "monthly"]
        if backup_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid backup type. Must be one of: {valid_types}")

        # Crear backup
        backup_path = create_backup(backup_type)

        # Limpiar backups antiguos en background si no es manual
        if backup_type != "manual" and background_tasks:
            background_tasks.add_task(cleanup_backups)

        return {
            "message": "Backup created successfully",
            "backup_path": backup_path,
            "backup_type": backup_type
        }

    except Exception as e:
        logger.error(f"Failed to create backup: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create backup: {str(e)}")


@router.post("/restore")
async def restore_system_backup(backup_path: str, target_db: str = None):
    """Restaurar un backup del sistema"""
    try:
        # Validar que el archivo existe
        import os
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail="Backup file not found")

        # Restaurar backup
        success = restore_backup(backup_path, target_db)

        if success:
            return {
                "message": "Backup restored successfully",
                "backup_path": backup_path,
                "target_database": target_db or "meditrib.db"
            }
        else:
            raise HTTPException(status_code=500, detail="Backup restoration failed")

    except Exception as e:
        logger.error(f"Failed to restore backup: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to restore backup: {str(e)}")


@router.get("/info")
async def get_backups_information():
    """Obtener información sobre los backups disponibles"""
    try:
        info = get_backup_info()
        return info
    except Exception as e:
        logger.error(f"Failed to get backup info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get backup info: {str(e)}")


@router.post("/cleanup")
async def cleanup_old_backups():
    """Limpiar backups antiguos según política de retención"""
    try:
        cleaned = cleanup_backups()
        return {
            "message": "Cleanup completed",
            "files_deleted": cleaned
        }
    except Exception as e:
        logger.error(f"Failed to cleanup backups: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cleanup backups: {str(e)}")


@router.get("/files")
async def list_backup_files():
    """Listar todos los archivos de backup disponibles"""
    try:
        manager = BackupManager()
        backup_files = list(manager.backup_dir.glob("meditrib_backup_*.db.gz"))

        files_info = []
        for file_path in backup_files:
            stat = file_path.stat()
            files_info.append({
                "filename": file_path.name,
                "path": str(file_path),
                "size_bytes": stat.st_size,
                "size_mb": round(stat.st_size / (1024 * 1024), 2),
                "created_at": stat.st_ctime,
                "modified_at": stat.st_mtime
            })

        # Ordenar por fecha de modificación (más recientes primero)
        files_info.sort(key=lambda x: x["modified_at"], reverse=True)

        return {
            "total_files": len(files_info),
            "files": files_info
        }

    except Exception as e:
        logger.error(f"Failed to list backup files: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list backup files: {str(e)}")


@router.delete("/files/{filename}")
async def delete_backup_file(filename: str):
    """Eliminar un archivo de backup específico"""
    try:
        manager = BackupManager()

        # Validar nombre del archivo para seguridad
        if not filename.startswith("meditrib_backup_") or not filename.endswith(".db.gz"):
            raise HTTPException(status_code=400, detail="Invalid backup filename")

        file_path = manager.backup_dir / filename

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Backup file not found")

        # Eliminar el archivo
        file_path.unlink()

        logger.info(f"Backup file deleted: {filename}")

        return {
            "message": "Backup file deleted successfully",
            "filename": filename
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete backup file {filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete backup file: {str(e)}")


@router.post("/schedule")
async def trigger_scheduled_backup():
    """Trigger manual execution of scheduled backup logic"""
    try:
        manager = BackupManager()
        manager.schedule_automatic_backups()

        return {
            "message": "Scheduled backup check completed"
        }

    except Exception as e:
        logger.error(f"Failed to execute scheduled backup: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to execute scheduled backup: {str(e)}")