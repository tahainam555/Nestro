.PHONY: dev test migrate seed

dev:
	docker compose up --build

test:
	pytest -q

migrate:
	alembic upgrade head

seed:
	python -c "import asyncio; from core.nlp.style_retriever import seed_style_knowledge_base; asyncio.run(seed_style_knowledge_base())"
