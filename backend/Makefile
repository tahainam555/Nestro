.PHONY: install install-dev run test lint format docker-up docker-down

install:
	pip install .

install-dev:
	pip install -e ".[dev]"

run:
	uvicorn main:app --host 0.0.0.0 --port 8000 --reload

test:
	pytest -q

lint:
	ruff check .

format:
	ruff format .

docker-up:
	docker compose up --build

docker-down:
	docker compose down
