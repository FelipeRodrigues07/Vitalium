# Vitalium AI

Microserviço de análise de sintomas relatados pelo paciente.

## O que faz

Recebe a lista de sintomas de um paciente em um mês e devolve um relatório em texto para o médico.

- `GET /health`
- `POST /reports/symptoms-monthly`

## Não faz

Não responde chat automaticamente e não integra com WhatsApp.

## Rodar

```bash
cp .env.example .env
# Gemini (grátis): AI_PROVIDER=gemini + GEMINI_API_KEY=...
# OpenAI: AI_PROVIDER=openai + OPENAI_API_KEY=...
python main.py
```

Sem chave de LLM, o serviço gera um resumo local (fallback).

### Gemini (recomendado sem cartão)

1. Crie a chave em https://aistudio.google.com/apikey
2. No `.env`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=sua-chave
GEMINI_MODEL=gemini-flash-lite-latest
```

## Docker Compose

O serviço sobe com `.\dev.bat up` na porta `3003`.
