---
description: Gestión de Base de Datos
---

# Gestión de Base de Datos

Guía para mantenimiento, actualizaciones y backups de la base de datos.

## Esquema Actual
El esquema se define en `backend/core/models.py` usando SQLAlchemy.
Actualmente el sistema usa `Base.metadata.create_all(bind=engine)` en el arranque (`main.py`) para crear tablas que no existen.

**Nota**: Este método NO migra columnas modificadas, solo crea tablas nuevas. Para cambios de estructura en tablas existentes, se requerirá una herramienta de migración como `Alembic` (pendiente de implementar para Fases futuras).

## Backups (Copias de Seguridad)

### SQLite (Desarrollo)
Simplemente copia el archivo `meditrib.db`.
```bash
cp meditrib.db meditrib_backup_$(date +%F).db
```

### PostgreSQL (Producción / Docker)
Para respaldar la base de datos corriendo en Docker:

```bash
# Crear dump
docker compose exec -t db pg_dump -U meditrib meditrib_db > backup_meditrib_$(date +%F).sql
```

Para restaurar:
```bash
# Copiar archivo al contenedor (o usar pipe)
cat backup.sql | docker compose exec -T db psql -U meditrib meditrib_db
```

## Reset Completo (Cuidado: Borra todo)
Si necesitas reiniciar de cero en Docker:

```bash
docker compose down -v
# -v borra los volúmenes (datos persistentes)
docker compose up -d
```
