.PHONY: help install run seed test lint clean docker-build docker-up

help:
	@echo "Available commands:"
	@echo "  make install      - Install project dependencies"
	@echo "  make run          - Run Flask server"
	@echo "  make seed         - Seed database with sample data"
	@echo "  make test         - Run pytest test suite"
	@echo "  make docker-up    - Run application in Docker"

install:
	pip install -r ../requirements.txt

run:
	python app/main.py

seed:
	python scripts/seed_database.py

test:
	pytest tests/

docker-build:
	docker build -t traffic-ai-backend -f Dockerfile ..

docker-up:
	docker compose -f ../docker-compose.yml up --build
