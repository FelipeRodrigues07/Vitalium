# 🤖 Vitalium AI Service

Microserviço de Inteligência Artificial para processamento de mensagens de chat do sistema Vitalium.

## 📋 Descrição

Este serviço consome mensagens da fila `chat.to_ai`, processa usando LLMs (OpenAI GPT-4 ou Anthropic Claude) e publica respostas na fila `chat.from_ai`.

### Funcionalidades

- ✅ Consumer RabbitMQ com retry automático
- ✅ Integração com OpenAI GPT-4o
- ✅ Suporte para Anthropic Claude 3.5 Sonnet
- ✅ Logging colorido e estruturado
- ✅ Graceful shutdown
- ✅ Health checks
- ✅ Docker + Docker Compose ready

## 🚀 Quick Start

### 1. Configuração

```bash
# Copie o .env.example
cp .env.example .env

# Edite o .env e adicione sua API key
# OPENAI_API_KEY=sk-...
```

### 2. Instalação Local

```bash
# Crie virtual environment
python -m venv venv

# Ative o venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale dependências
pip install -r requirements.txt

# Execute
python main.py
```

### 3. Docker (Recomendado)

```bash
# Build
docker build -t vitalium-ai .

# Run
docker run --env-file .env vitalium-ai
```

### 4. Docker Compose (Integrado)

```bash
# No diretório raiz do projeto
docker-compose up vitalium-ai
```

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável                 | Descrição                          | Padrão                               |
| ------------------------ | ---------------------------------- | ------------------------------------ |
| `RABBITMQ_URL`           | URL de conexão RabbitMQ            | `amqp://guest:guest@localhost:5672/` |
| `RABBITMQ_QUEUE_TO_AI`   | Fila de entrada                    | `chat.to_ai`                         |
| `RABBITMQ_QUEUE_FROM_AI` | Fila de saída                      | `chat.from_ai`                       |
| `AI_PROVIDER`            | Provider (`openai` ou `anthropic`) | `openai`                             |
| `OPENAI_API_KEY`         | Chave API OpenAI                   | **obrigatório**                      |
| `OPENAI_MODEL`           | Modelo OpenAI                      | `gpt-4o`                             |
| `OPENAI_MAX_TOKENS`      | Tokens máximos da resposta         | `500`                                |
| `OPENAI_TEMPERATURE`     | Criatividade (0-2)                 | `0.7`                                |
| `SYSTEM_PROMPT`          | Prompt do sistema                  | (ver `.env.example`)                 |
| `LOG_LEVEL`              | Nível de log                       | `INFO`                               |

### Trocar para Claude (Anthropic)

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## 📦 Estrutura do Projeto

```
vitalium-ai/
├── main.py                  # Entry point
├── config.py                # Configurações centralizadas
├── requirements.txt         # Dependências Python
├── Dockerfile               # Build produção
├── Dockerfile.dev           # Build desenvolvimento
├── .env.example             # Template de variáveis
├── consumers/
│   ├── __init__.py
│   └── ai_consumer.py       # Consumer chat.to_ai
└── services/
    ├── __init__.py
    ├── llm_service.py       # Integração OpenAI/Claude
    └── rabbitmq_service.py  # Cliente RabbitMQ
```

## 🔄 Fluxo de Mensagens

```
Paciente envia mensagem
         ↓
Backend recebe e persiste
         ↓
Backend publica em chat.to_ai
         ↓
🤖 AI Service consome
         ↓
Processa com GPT-4/Claude
         ↓
AI Service publica em chat.from_ai
         ↓
Backend consome resposta
         ↓
Backend persiste resposta
         ↓
Backend envia ao paciente (WhatsApp/WebSocket)
```

## 🧪 Testes

### Teste Manual

1. Certifique-se que RabbitMQ está rodando
2. Publique uma mensagem em `chat.to_ai`:

```python
import pika
import json

connection = pika.BlockingConnection(pika.URLParameters('amqp://guest:guest@localhost:5672/'))
channel = connection.channel()

payload = {
    "channel": "WEB",
    "patientId": "patient-123",
    "conversationId": "conv-456",
    "message": "Olá, como posso agendar uma consulta?",
    "timestamp": "2026-05-25T10:00:00Z",
    "origin": "PATIENT",
    "metadata": {}
}

channel.basic_publish(
    exchange='',
    routing_key='chat.to_ai',
    body=json.dumps(payload)
)

print("Mensagem enviada!")
connection.close()
```

3. Verifique os logs do AI Service
4. Veja a resposta em `chat.from_ai`

## 📊 Monitoramento

### Logs

O serviço emite logs coloridos estruturados:

```
2026-05-25 10:00:00 | INFO     | AIConsumer | 📨 Mensagem recebida | Conversa: conv-456
2026-05-25 10:00:02 | INFO     | LLMService | 🤖 Resposta IA gerada: 234 caracteres
2026-05-25 10:00:03 | INFO     | AIConsumer | ✅ Resposta publicada em chat.from_ai
```

### Health Check

```bash
# Container health
docker ps

# Manual check
python -c "from services.llm_service import LLMService; llm = LLMService(); print('OK' if llm.health_check() else 'FAIL')"
```

## 🐛 Troubleshooting

### Erro: "OPENAI_API_KEY é obrigatório"

- Certifique-se que o `.env` existe e contém a chave válida
- Verifique se o arquivo `.env` está no diretório correto

### Erro de Conexão RabbitMQ

```bash
# Verifique se RabbitMQ está rodando
docker-compose ps rabbitmq

# Logs do RabbitMQ
docker-compose logs rabbitmq
```

### Mensagens não são processadas

- Verifique logs do serviço: `docker-compose logs vitalium-ai`
- Verifique filas no RabbitMQ Management: `http://localhost:15672`
- Confirme que backend está publicando em `chat.to_ai`

## 🔐 Segurança

- ✅ Não commite `.env` com API keys
- ✅ Use secrets no ambiente de produção
- ✅ Rotacione API keys regularmente
- ✅ Container roda como usuário não-root

## 📈 Performance

- **Throughput**: ~50-100 mensagens/minuto (depende do modelo)
- **Latência**: 1-3 segundos por resposta
- **Escalabilidade**: Horizontal via múltiplas instâncias (RabbitMQ distribui)

## 🚀 Roadmap

- [ ] Implementar busca de histórico de conversa
- [ ] Cache de respostas comuns (Redis)
- [ ] Métricas Prometheus
- [ ] Suporte para Google Gemini
- [ ] Análise de sentimento
- [ ] Detecção de emergências médicas

## 📝 Licença

Propriedade do Projeto Vitalium.

## 👥 Suporte

Para dúvidas ou problemas, contate a equipe de desenvolvimento.
