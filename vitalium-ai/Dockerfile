# Multi-stage build para produção otimizada
FROM python:3.11-slim as base

# Metadata
LABEL maintainer="Vitalium Team"
LABEL description="AI Microservice for chat processing"

# Diretório de trabalho
WORKDIR /app

# Variáveis de ambiente Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# ─── Stage 1: Dependencies ────────────────────────────────
FROM base as dependencies

# Instala dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ─── Stage 2: Production ──────────────────────────────────
FROM base as production

# Copia dependências instaladas
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copia código da aplicação
COPY . .

# Cria usuário não-root
RUN useradd -m -u 1000 aiservice && \
    chown -R aiservice:aiservice /app

USER aiservice

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import sys; sys.exit(0)"

# Comando padrão
CMD ["python", "main.py"]
