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
# opcional: OPENAI_API_KEY=...
python main.py
```

Sem chave de LLM, o serviço gera um resumo local (fallback).

## Docker Compose

O serviço sobe com `.\dev.bat up` na porta `3003`.
