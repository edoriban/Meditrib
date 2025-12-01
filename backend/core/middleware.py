import time
import logging
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import uuid


logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para logging de todas las peticiones HTTP"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generar ID único para la petición
        request_id = str(uuid.uuid4())[:8]

        # Registrar inicio de petición
        start_time = time.time()

        # Extraer información de la petición
        method = request.method
        path = request.url.path
        query_params = str(request.url.query)
        full_path = f"{path}?{query_params}" if query_params else path

        # Intentar obtener información del usuario (si está autenticado)
        user_id = None
        user_email = None
        try:
            # Esto asume que tienes un sistema de autenticación que guarda el usuario en request.state
            if hasattr(request.state, 'user'):
                user_id = request.state.user.get('id')
                user_email = request.state.user.get('email')
        except:
            pass

        # Obtener IP del cliente
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        try:
            # Procesar la petición
            response = await call_next(request)

            # Calcular duración
            duration_ms = (time.time() - start_time) * 1000

            # Registrar petición exitosa
            from backend.core.logging_config import log_api_request
            log_api_request(
                method=method,
                path=full_path,
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2),
                user_id=user_id,
                ip_address=client_ip,
                user_agent=user_agent,
                request_id=request_id
            )

            # Agregar headers de respuesta
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"

            return response

        except Exception as e:
            # Calcular duración incluso en error
            duration_ms = (time.time() - start_time) * 1000

            # Registrar error
            logger.error(
                f"Request failed: {method} {full_path}",
                extra={
                    "request_id": request_id,
                    "user_id": user_id,
                    "ip_address": client_ip,
                    "user_agent": user_agent,
                    "duration_ms": round(duration_ms, 2),
                    "error_type": type(e).__name__,
                    "error_message": str(e)
                }
            )

            # Retornar respuesta de error
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error", "request_id": request_id}
            )


class SystemHealthMiddleware(BaseHTTPMiddleware):
    """Middleware para monitoreo de salud del sistema"""

    def __init__(self, app, check_interval: int = 60):
        super().__init__(app)
        self.check_interval = check_interval
        self.last_check = 0
        self.system_status = "OK"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Monitoreo básico de salud cada check_interval segundos
        current_time = time.time()
        if current_time - self.last_check > self.check_interval:
            self._perform_health_check()
            self.last_check = current_time

        response = await call_next(request)
        return response

    def _perform_health_check(self):
        """Realizar chequeo básico de salud del sistema"""
        from backend.core.logging_config import log_system_health
        from sqlalchemy import text

        try:
            # Verificar conectividad a base de datos
            from backend.core.database import engine
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            db_status = "OK"
        except Exception as e:
            db_status = "ERROR"
            logger.error(f"Database health check failed: {e}")

        # Registrar estado de la base de datos
        log_system_health(
            component="database",
            metric="connectivity",
            value=1 if db_status == "OK" else 0,
            status=db_status
        )

        # Verificar uso de memoria (básico)
        import psutil
        try:
            memory = psutil.virtual_memory()
            memory_usage_percent = memory.percent

            status = "OK" if memory_usage_percent < 90 else "WARNING" if memory_usage_percent < 95 else "CRITICAL"

            log_system_health(
                component="system",
                metric="memory_usage_percent",
                value=round(memory_usage_percent, 2),
                status=status,
                details={
                    "total_mb": round(memory.total / 1024 / 1024, 2),
                    "available_mb": round(memory.available / 1024 / 1024, 2),
                    "used_mb": round(memory.used / 1024 / 1024, 2)
                }
            )
        except ImportError:
            # psutil no disponible
            pass
        except Exception as e:
            logger.error(f"Memory health check failed: {e}")

        # Verificar uso de disco
        try:
            disk = psutil.disk_usage('/')
            disk_usage_percent = disk.percent

            status = "OK" if disk_usage_percent < 90 else "WARNING" if disk_usage_percent < 95 else "CRITICAL"

            log_system_health(
                component="system",
                metric="disk_usage_percent",
                value=round(disk_usage_percent, 2),
                status=status,
                details={
                    "total_gb": round(disk.total / 1024 / 1024 / 1024, 2),
                    "free_gb": round(disk.free / 1024 / 1024 / 1024, 2),
                    "used_gb": round(disk.used / 1024 / 1024 / 1024, 2)
                }
            )
        except ImportError:
            pass
        except Exception as e:
            logger.error(f"Disk health check failed: {e}")


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware para auditoría de acciones críticas"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Registrar acciones críticas
        if request.method in ["POST", "PUT", "DELETE"]:
            # Obtener información del usuario
            user_id = None
            user_email = None
            try:
                if hasattr(request.state, 'user'):
                    user_id = request.state.user.get('id')
                    user_email = request.state.user.get('email')
            except:
                pass

            # Registrar acción crítica
            from backend.core.logging_config import log_audit_event

            # Determinar tipo de acción basado en la ruta
            path = request.url.path
            if "/medicines" in path:
                resource = "medicine"
            elif "/sales" in path:
                resource = "sale"
            elif "/expenses" in path:
                resource = "expense"
            elif "/invoices" in path:
                resource = "invoice"
            elif "/users" in path:
                resource = "user"
            else:
                resource = "unknown"

            action_map = {
                "POST": "create",
                "PUT": "update",
                "DELETE": "delete"
            }

            action = action_map.get(request.method, "unknown")

            log_audit_event(
                event_type=f"{action}_{resource}",
                user_id=user_id,
                details={
                    "method": request.method,
                    "path": path,
                    "ip_address": request.client.host if request.client else "unknown"
                }
            )

        response = await call_next(request)
        return response