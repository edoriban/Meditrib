# VanPOS Development Commands
# Usage: make backend | make frontend | make dev

.PHONY: backend frontend dev install

# Backend only (with hot reload)
backend:
	uvicorn backend.main:app --reload

# Frontend only (Vite dev server)
frontend:
	cd frontend && pnpm dev

# Both (uses run.py - legacy)
dev:
	python run.py

# Install dependencies
install:
	pip install -r requirements.txt
	cd frontend && pnpm install
