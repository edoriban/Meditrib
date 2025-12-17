---
description: Gestión de Base de Datos
---

# Gestión de Base de Datos

Guía para mantenimiento, actualizaciones y backups de la base de datos.

## Inicialización de Base de Datos Nueva

Cuando se crea una base de datos Postgres nueva (después de `docker compose down -v`):

```bash
# 1. Iniciar Postgres
docker compose up db -d

# 2. Esperar que esté lista
sleep 3

# 3. Crear tablas
python -c "from backend.core.database import engine, Base; from backend.core import models; Base.metadata.create_all(bind=engine); print('Tablas creadas')"

# 4. Poblar con datos iniciales (IMPORTANTE)
python -m backend.seed_data
```

## Seed Data (Datos Semilla)

### Archivo: `backend/seed_data.py`
Crea datos esenciales para que el sistema funcione:

| Tipo | Datos creados |
|------|---------------|
| 👤 **Usuario Admin** | `admin@meditrib.com` / `admin123` |
| 🏷️ **Roles** | Administrador |
| 🏷️ **Tags** | Analgésico, Antibiótico, Antiinflamatorio, Material de curación |
| 💊 **Medicamentos** | 5 medicamentos de ejemplo con inventario |
| 📦 **Proveedor** | SEVI |
| 🧑‍⚕️ **Cliente** | Doctor 1 |

**Ejecutar:** `python -m backend.seed_data`

### Archivo: `backend/init_db.py`
Script mínimo que solo crea roles (Usuario y Admin).
**Ejecutar:** `python backend/init_db.py`

## Esquema Actual
El esquema se define en `backend/core/models.py` usando SQLAlchemy.
El sistema usa `Base.metadata.create_all(bind=engine)` en el arranque para crear tablas nuevas.

**Nota**: Este método NO migra columnas modificadas. Para cambios de estructura usar `Alembic`:
```bash
alembic revision --autogenerate -m "descripcion_del_cambio"
alembic upgrade head
```

## Backups (Copias de Seguridad)

### PostgreSQL (Producción / Docker)
```bash
# Crear backup
docker compose exec -t db pg_dump -U meditrib meditrib_db > backup_meditrib_$(date +%F).sql

# Restaurar
cat backup.sql | docker compose exec -T db psql -U meditrib meditrib_db
```

### SQLite (Solo desarrollo legacy)
```bash
cp meditrib.db meditrib_backup_$(date +%F).db
```

## Reset Completo (⚠️ Borra todo)
```bash
docker compose down -v   # Borra contenedor Y volúmenes
docker compose up db -d
# Luego ejecutar pasos de inicialización arriba
```
