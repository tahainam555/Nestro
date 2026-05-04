FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml /app/pyproject.toml

RUN pip install --no-cache-dir --upgrade pip && \
    python -c "import tomllib, pathlib; d=tomllib.loads(pathlib.Path('pyproject.toml').read_text()); pathlib.Path('requirements.txt').write_text('\\n'.join(d['project']['dependencies']))" && \
    pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4"]
