import json
import logging
import logging.handlers
from datetime import datetime
from pathlib import Path
from typing import Any


class StructuredFormatter(logging.Formatter):
    """Formateador estructurado para logs JSON"""

    def format(self, record: logging.LogRecord) -> str:
        # Extraer información del registro
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Agregar campos extra si existen
        if hasattr(record, "user_id"):
            log_entry["user_id"] = record.user_id
        if hasattr(record, "user_email"):
            log_entry["user_email"] = record.user_email
        if hasattr(record, "ip_address"):
            log_entry["ip_address"] = record.ip_address
        if hasattr(record, "user_agent"):
            log_entry["user_agent"] = record.user_agent
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        if hasattr(record, "action"):
            log_entry["action"] = record.action
        if hasattr(record, "resource"):
            log_entry["resource"] = record.resource
        if hasattr(record, "resource_id"):
            log_entry["resource_id"] = record.resource_id
        if hasattr(record, "old_values"):
            log_entry["old_values"] = record.old_values
        if hasattr(record, "new_values"):
            log_entry["new_values"] = record.new_values
        if hasattr(record, "duration_ms"):
            log_entry["duration_ms"] = record.duration_ms
        if hasattr(record, "status_code"):
            log_entry["status_code"] = record.status_code
        if hasattr(record, "error_type"):
            log_entry["error_type"] = record.error_type
        if hasattr(record, "stack_trace"):
            log_entry["stack_trace"] = record.stack_trace

        # Agregar excepción si existe
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, ensure_ascii=False)


def setup_logging(log_level: str = "INFO", log_dir: str = "logs") -> None:
    """Configura el sistema de logging completo"""

    # Crear directorio de logs
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)

    # Configurar niveles
    level_map = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL,
    }
    level = level_map.get(log_level.upper(), logging.INFO)

    # Logger raíz
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Limpiar handlers existentes
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Formatter estructurado
    structured_formatter = StructuredFormatter()

    # Formatter simple para consola
    console_formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    # Handler para consola
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    # Handler para archivo general (rotativo diario)
    general_handler = logging.handlers.TimedRotatingFileHandler(
        filename=log_path / "meditrib.log",
        when="midnight",
        interval=1,
        backupCount=30,  # Mantener 30 días
    )
    general_handler.setLevel(logging.INFO)
    general_handler.setFormatter(structured_formatter)
    root_logger.addHandler(general_handler)

    # Handler para errores (rotativo semanal)
    error_handler = logging.handlers.TimedRotatingFileHandler(
        filename=log_path / "meditrib_error.log",
        when="W0",  # Rotar los domingos
        interval=1,
        backupCount=12,  # Mantener 12 semanas
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(structured_formatter)
    root_logger.addHandler(error_handler)

    # Handler para actividades de usuario (rotativo diario)
    user_activity_handler = logging.handlers.TimedRotatingFileHandler(
        filename=log_path / "user_activity.log",
        when="midnight",
        interval=1,
        backupCount=90,  # Mantener 90 días
    )
    user_activity_handler.setLevel(logging.INFO)
    user_activity_handler.setFormatter(structured_formatter)

    # Logger específico para actividades de usuario
    user_logger = logging.getLogger("user_activity")
    user_logger.setLevel(logging.INFO)
    user_logger.addHandler(user_activity_handler)
    user_logger.propagate = False  # No propagar al logger raíz

    # Logger para auditoría (no rotativo, mantener todo)
    audit_handler = logging.FileHandler(filename=log_path / "audit.log", encoding="utf-8")
    audit_handler.setLevel(logging.INFO)
    audit_handler.setFormatter(structured_formatter)

    audit_logger = logging.getLogger("audit")
    audit_logger.setLevel(logging.INFO)
    audit_logger.addHandler(audit_handler)
    audit_logger.propagate = False

    # Logger para monitoreo de sistema
    system_handler = logging.handlers.TimedRotatingFileHandler(
        filename=log_path / "system_monitor.log", when="midnight", interval=1, backupCount=30
    )
    system_handler.setLevel(logging.INFO)
    system_handler.setFormatter(structured_formatter)

    system_logger = logging.getLogger("system")
    system_logger.setLevel(logging.INFO)
    system_logger.addHandler(system_handler)
    system_logger.propagate = False


# Funciones helper para logging contextual
def log_user_action(
    user_id: int,
    user_email: str,
    action: str,
    resource: str,
    resource_id: Any = None,
    old_values: dict = None,
    new_values: dict = None,
    ip_address: str = None,
    user_agent: str = None,
    request_id: str = None,
) -> None:
    """Registra una acción del usuario"""
    logger = logging.getLogger("user_activity")
    extra = {
        "user_id": user_id,
        "user_email": user_email,
        "action": action,
        "resource": resource,
    }

    if resource_id is not None:
        extra["resource_id"] = str(resource_id)
    if old_values:
        extra["old_values"] = old_values
    if new_values:
        extra["new_values"] = new_values
    if ip_address:
        extra["ip_address"] = ip_address
    if user_agent:
        extra["user_agent"] = user_agent
    if request_id:
        extra["request_id"] = request_id

    logger.info(f"User action: {action} on {resource}", extra=extra)


def log_audit_event(
    event_type: str, user_id: int = None, details: dict = None, ip_address: str = None, severity: str = "INFO"
) -> None:
    """Registra un evento de auditoría"""
    logger = logging.getLogger("audit")
    extra = {"event_type": event_type, "severity": severity}

    if user_id:
        extra["user_id"] = user_id
    if details:
        extra.update(details)
    if ip_address:
        extra["ip_address"] = ip_address

    if severity == "ERROR":
        logger.error(f"Audit event: {event_type}", extra=extra)
    elif severity == "WARNING":
        logger.warning(f"Audit event: {event_type}", extra=extra)
    else:
        logger.info(f"Audit event: {event_type}", extra=extra)


def log_system_health(component: str, metric: str, value: Any, status: str = "OK", details: dict = None) -> None:
    """Registra métricas de salud del sistema"""
    logger = logging.getLogger("system")
    extra = {"component": component, "metric": metric, "value": value, "status": status}

    if details:
        extra.update(details)

    if status in ["ERROR", "CRITICAL"]:
        logger.error(f"System health: {component}.{metric} = {value}", extra=extra)
    elif status == "WARNING":
        logger.warning(f"System health: {component}.{metric} = {value}", extra=extra)
    else:
        logger.info(f"System health: {component}.{metric} = {value}", extra=extra)


def log_api_request(
    method: str,
    path: str,
    status_code: int,
    duration_ms: float,
    user_id: int = None,
    ip_address: str = None,
    user_agent: str = None,
    request_id: str = None,
) -> None:
    """Registra una petición API"""
    logger = logging.getLogger("api")
    extra = {"method": method, "path": path, "status_code": status_code, "duration_ms": duration_ms}

    if user_id:
        extra["user_id"] = user_id
    if ip_address:
        extra["ip_address"] = ip_address
    if user_agent:
        extra["user_agent"] = user_agent
    if request_id:
        extra["request_id"] = request_id

    if status_code >= 500:
        logger.error(f"API request: {method} {path} -> {status_code}", extra=extra)
    elif status_code >= 400:
        logger.warning(f"API request: {method} {path} -> {status_code}", extra=extra)
    else:
        logger.info(f"API request: {method} {path} -> {status_code}", extra=extra)
