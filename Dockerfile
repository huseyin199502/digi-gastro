# ─────────────────────────────────────────────
# Stage 1: Build – install all dependencies
# ─────────────────────────────────────────────
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Only install what is needed to compile packages (psycopg2, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ─────────────────────────────────────────────
# Stage 2: Runtime – lean production image
# ─────────────────────────────────────────────
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Uvicorn port – can be overridden by Coolify
    PORT=8000 \
    # Upload base directory (mount as Coolify Persistent Volume)
    UPLOAD_DIR=/app/data/uploads

WORKDIR /app

# Runtime lib only (libpq for PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Copy application source (dockerignore keeps garbage out)
COPY . .

# Pre-create the persistent upload directory so it exists
# even before the volume is mounted the first time.
RUN mkdir -p /app/data/uploads/logos /app/static/images

EXPOSE 8000

# Healthcheck so Coolify knows the container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1"]
