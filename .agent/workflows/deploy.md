---
description: Guía de despliegue a producción con Docker
---

# Despliegue a Producción

Esta guía explica cómo desplegar `Meditrib` usando Docker Compose, ideal para servidores Linux (VPS, EC2, Droplets) o para producción en local.

## Prerequisitos
-   Docker Engine
-   Docker Compose (incluido en versiones modernas de Docker)

## Pasos para Despliegue

### 1. Preparar Variables de Entorno
Crea un archivo `.env` en la raíz (si no existe) basado en el ejemplo o asegúrate de que el `docker-compose.yml` tenga las variables correctas.
**IMPORTANTE**: Cambia `SECRET_KEY` y las contraseñas de base de datos en `docker-compose.yml` para un entorno real expuesto a internet.

### 2. Construir y Levantar Contenedores
Este comando construye las imágenes (Frontend y Backend) y levanta la base de datos PostgreSQL.

```bash
# --build fuerza la re-construcción de imágenes
# -d corre en segundo plano (detached)
docker compose up --build -d
```

### 3. Verificar Estado
Verifica que los contenedores estén corriendo (`Up`):
```bash
docker compose ps
```
Deberías ver `meditrib-backend`, `meditrib-frontend` y `meditrib-db`.

### 4. Inicializar Base de Datos (Primera vez)
Al usar PostgreSQL por primera vez, las tablas estarán vacías. El backend creará las tablas al iniciar (`Base.metadata.create_all`), pero para el usuario inicial admin:

```bash
# Entrar al contenedor de backend
docker compose exec backend python backend/init_db.py
```
*Nota: Revisa si `init_db.py` está configurado para Postgres antes de correr esto.*

### 5. Acceso
-   **App**: `http://localhost` (o IP del servidor).
-   **API Docs**: `http://localhost/api/v1/docs` (vía proxy nginx).

## Actualización (Re-deployment)
Si haces cambios en el código:

1.  Traer cambios: `git pull`
2.  Reconstruir: `docker compose up --build -d`
    *   Docker solo reconstruirá las capas que cambiaron.
    *   La base de datos **NO** se perderá (está en un volumen persistente `postgres_data`).
