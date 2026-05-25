# 🤖 Plano de Implementação: IA como Assistente Virtual Vitalium

**Data**: 25 de maio de 2026  
**Objetivo**: Transformar a IA em assistente virtual que executa ações na plataforma para pacientes e médicos  
**Complexidade**: Alta  
**Tempo Estimado**: 2-3 semanas

---

## 📋 Visão Geral

### O Que Será Implementado

**Paciente pode**:

- ✅ "Quais são minhas próximas consultas?"
- ✅ "Me mostre minhas prescrições ativas"
- ✅ "Qual foi meu último resultado de exame?"
- ✅ "Agendar consulta com Dr. João para próxima segunda"
- ✅ "Quais são os horários disponíveis do meu médico?"

**Médico pode**:

- ✅ "Mostre pacientes com consulta hoje"
- ✅ "Prescrições pendentes de aprovação"
- ✅ "Histórico clínico do paciente Maria Silva"
- ✅ "Criar prescrição de Paracetamol 500mg para João"
- ✅ "Listar exames pendentes"

### Arquitetura

```
Usuário (Paciente/Médico)
         ↓
    Backend API
         ↓
   chat.to_ai (RabbitMQ)
         ↓
    🤖 AI Service
         ↓
  Function Calling (GPT-4)
         ↓
   🔧 AI Tools API
         ↓
    Backend Endpoints
         ↓
   💾 PostgreSQL
```

---

## 🏗️ Arquitetura Detalhada

### Camadas

1. **Frontend**: Interface de chat já existente
2. **Backend Core**: Endpoints REST já existentes + novos endpoints para IA
3. **AI Service**: Consumer com function calling habilitado
4. **AI Tools API**: Novo microsserviço que traduz functions → API calls
5. **Message Broker**: RabbitMQ (já existe)

---

## 📦 Componentes a Implementar

### 1. Backend: Endpoints para IA

**Novo módulo**: `vitalium-backend/src/modules/ai-assistant.module.ts`

#### Endpoints Necessários

**Para Pacientes**:

```typescript
GET / api / ai - assistant / patient / appointments; // Lista consultas
GET / api / ai - assistant / patient / prescriptions; // Prescrições ativas
GET / api / ai - assistant / patient / exams; // Resultados de exame
GET / api / ai - assistant / patient / medical - history; // Histórico clínico resumido
POST / api / ai - assistant / patient / schedule; // Agendar consulta
GET / api / ai - assistant / patient / available - slots; // Horários disponíveis médico
```

**Para Médicos**:

```typescript
GET /api/ai-assistant/doctor/today-appointments    // Consultas do dia
GET /api/ai-assistant/doctor/patients/:id/history  // Histórico paciente
GET /api/ai-assistant/doctor/pending-prescriptions // Prescrições pendentes
POST /api/ai-assistant/doctor/prescriptions        // Criar prescrição
GET /api/ai-assistant/doctor/exams/pending        // Exames pendentes
GET /api/ai-assistant/doctor/patients/search      // Buscar paciente
```

**Características**:

- ✅ Todos protegidos com `AuthGuard` + `RolesGuard`
- ✅ IA usa JWT do usuário (context-aware)
- ✅ Retornam JSON otimizado para LLM (sem dados desnecessários)
- ✅ Limites de taxa (rate limiting) para evitar abuso

---

### 2. AI Service: Function Calling

**Arquivo**: `vitalium-ai/services/function_caller.py`

#### Tools Disponíveis

```python
PATIENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_appointments",
            "description": "Lista próximas consultas do paciente",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Número máximo de consultas a retornar",
                        "default": 5
                    },
                    "status": {
                        "type": "string",
                        "enum": ["SCHEDULED", "COMPLETED", "CANCELLED"],
                        "description": "Filtrar por status da consulta"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_prescriptions",
            "description": "Lista prescrições ativas do paciente",
            "parameters": {
                "type": "object",
                "properties": {
                    "active_only": {
                        "type": "boolean",
                        "description": "Retornar apenas prescrições ativas",
                        "default": True
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_appointment",
            "description": "Agendar nova consulta com médico",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {
                        "type": "string",
                        "description": "ID do médico"
                    },
                    "date": {
                        "type": "string",
                        "description": "Data da consulta (YYYY-MM-DD)"
                    },
                    "time": {
                        "type": "string",
                        "description": "Hora da consulta (HH:MM)"
                    }
                },
                "required": ["doctor_id", "date", "time"]
            }
        }
    },
    # ... mais tools
]

DOCTOR_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_today_appointments",
            "description": "Lista consultas do médico para hoje",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_patient_history",
            "description": "Busca histórico clínico completo de um paciente",
            "parameters": {
                "type": "object",
                "properties": {
                    "patient_id": {
                        "type": "string",
                        "description": "ID do paciente"
                    }
                },
                "required": ["patient_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_prescription",
            "description": "Criar nova prescrição para paciente",
            "parameters": {
                "type": "object",
                "properties": {
                    "patient_id": {"type": "string"},
                    "medication": {"type": "string"},
                    "dosage": {"type": "string"},
                    "frequency": {"type": "string"},
                    "duration_days": {"type": "integer"}
                },
                "required": ["patient_id", "medication", "dosage", "frequency"]
            }
        }
    },
    # ... mais tools
]
```

---

### 3. AI Service: Executor de Funções

**Arquivo**: `vitalium-ai/services/backend_api_service.py`

```python
"""
Serviço que executa chamadas ao backend
Usa JWT do usuário para fazer requisições autenticadas
"""
import requests
from typing import Dict, Any
from config import Config

class BackendAPIService:
    def __init__(self, user_jwt: str, user_role: str):
        self.base_url = Config.BACKEND_API_URL
        self.headers = {
            "Authorization": f"Bearer {user_jwt}",
            "Content-Type": "application/json"
        }
        self.user_role = user_role  # PATIENT | DOCTOR

    def execute_function(self, function_name: str, arguments: Dict[str, Any]) -> Dict:
        """
        Executa função chamando endpoint correspondente do backend
        """
        endpoint = self._get_endpoint(function_name)
        method = self._get_method(function_name)

        if method == "GET":
            response = requests.get(
                f"{self.base_url}{endpoint}",
                headers=self.headers,
                params=arguments,
                timeout=10
            )
        elif method == "POST":
            response = requests.post(
                f"{self.base_url}{endpoint}",
                headers=self.headers,
                json=arguments,
                timeout=10
            )

        response.raise_for_status()
        return response.json()

    def _get_endpoint(self, function_name: str) -> str:
        """Mapeia nome da função para endpoint"""
        role_prefix = "patient" if self.user_role == "PATIENT" else "doctor"

        ENDPOINTS = {
            # Patient
            "get_appointments": f"/api/ai-assistant/{role_prefix}/appointments",
            "get_prescriptions": f"/api/ai-assistant/{role_prefix}/prescriptions",
            "schedule_appointment": f"/api/ai-assistant/{role_prefix}/schedule",

            # Doctor
            "get_today_appointments": f"/api/ai-assistant/doctor/today-appointments",
            "get_patient_history": f"/api/ai-assistant/doctor/patients/{{patient_id}}/history",
            "create_prescription": f"/api/ai-assistant/doctor/prescriptions",
        }

        return ENDPOINTS.get(function_name, "")
```

---

### 4. AI Consumer: Integração Function Calling

**Arquivo**: `vitalium-ai/consumers/ai_consumer.py` (MODIFICAR)

```python
class AIConsumer:
    def _on_message(self, ch, method, properties, body):
        payload = json.loads(body)
        user_message = payload.get("message", "")
        conversation_id = payload.get("conversationId")
        user_context = payload.get("metadata", {})

        # Extrai role e JWT do metadata (backend deve enviar)
        user_role = user_context.get("userRole", "PATIENT")
        user_jwt = user_context.get("jwt", "")

        # Escolhe tools baseado no role
        tools = PATIENT_TOOLS if user_role == "PATIENT" else DOCTOR_TOOLS

        # Chama LLM com function calling
        response = self.llm_service.generate_with_tools(
            message=user_message,
            tools=tools,
            user_jwt=user_jwt,
            user_role=user_role
        )

        # Publica resposta
        self.rabbitmq.publish(Config.QUEUE_FROM_AI, {
            "conversationId": conversation_id,
            "message": response,
            "origin": "AI",
            # ...
        })
```

**Modificação no LLMService**:

```python
class LLMService:
    def generate_with_tools(self, message: str, tools: List[Dict],
                           user_jwt: str, user_role: str) -> str:
        """
        Gera resposta com function calling habilitado
        """
        api_service = BackendAPIService(user_jwt, user_role)

        messages = [
            {"role": "system", "content": self._get_system_prompt(user_role)},
            {"role": "user", "content": message}
        ]

        # Primeira chamada: LLM decide se precisa chamar função
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        # Se LLM chamou função
        if response.choices[0].message.tool_calls:
            for tool_call in response.choices[0].message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                logger.info(f"IA chamando função: {function_name}")

                # Executa função no backend
                try:
                    function_result = api_service.execute_function(
                        function_name,
                        function_args
                    )

                    # Adiciona resultado ao contexto
                    messages.append({
                        "role": "function",
                        "name": function_name,
                        "content": json.dumps(function_result)
                    })

                except Exception as e:
                    logger.error(f"Erro ao executar função: {e}")
                    messages.append({
                        "role": "function",
                        "name": function_name,
                        "content": json.dumps({"error": str(e)})
                    })

            # Segunda chamada: LLM processa resultados e gera resposta final
            final_response = self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )

            return final_response.choices[0].message.content

        # Se não chamou função, retorna resposta normal
        return response.choices[0].message.content

    def _get_system_prompt(self, user_role: str) -> str:
        """System prompt baseado no role"""
        if user_role == "PATIENT":
            return """
Você é o VitaliumAI, assistente virtual do sistema de saúde Vitalium.
Ajude o paciente com informações sobre consultas, prescrições e exames.
Use as funções disponíveis para buscar dados reais do sistema.
Seja empático, claro e objetivo.
NUNCA faça diagnósticos médicos.
"""
        else:  # DOCTOR
            return """
Você é o VitaliumAI, assistente virtual para médicos no sistema Vitalium.
Auxilie o médico com informações de pacientes, agenda, prescrições e exames.
Use as funções disponíveis para buscar e criar dados no sistema.
Seja preciso, profissional e objetivo.
"""
```

---

### 5. Backend: Modificar Consumer para enviar contexto

**Arquivo**: `vitalium-backend/src/shared/messaging/consumers/whatsapp-incoming.consumer.ts`

```typescript
// Adicionar metadata com JWT e role
await this.chatProducer.publishToAI({
  ...payload,
  patientId: resolvedPatientId,
  conversationId,
  metadata: {
    userRole: "PATIENT",
    jwt: this.generateServiceJWT(resolvedPatientId, "PATIENT"), // Novo método
    userId: resolvedPatientId,
  },
});
```

**Novo serviço**: `JWTService` para gerar tokens de serviço com escopo limitado

```typescript
@Injectable()
export class ServiceJWTService {
  generateServiceToken(userId: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, role, type: "AI_SERVICE" },
      { expiresIn: "5m" }, // Token de curta duração
    );
  }
}
```

---

## 🔐 Segurança

### Camadas de Proteção

1. **JWT com escopo limitado**:
   - Token expira em 5 minutos
   - Flag `type: 'AI_SERVICE'` identifica origem
   - Não pode ser usado para login web

2. **Rate Limiting**:
   - Máximo 10 function calls por conversa
   - Máximo 5 requisições/segundo por usuário

3. **Validação de Permissões**:
   - Paciente só acessa seus próprios dados
   - Médico só acessa pacientes vinculados
   - Logs de auditoria para todas as ações da IA

4. **Sanitização de Dados**:
   - LLM nunca recebe dados sensíveis (CPF, senha)
   - Respostas são filtradas antes de enviar ao usuário

---

## 📊 Fluxo Completo

### Exemplo: Paciente pergunta "Quais minhas próximas consultas?"

```
1. Paciente: "Quais minhas próximas consultas?"
        ↓
2. Backend persiste mensagem
        ↓
3. Backend publica em chat.to_ai com metadata:
   {
     message: "Quais minhas próximas consultas?",
     conversationId: "conv-123",
     metadata: {
       userRole: "PATIENT",
       jwt: "eyJhbGc...",
       userId: "patient-456"
     }
   }
        ↓
4. AI Service consome
        ↓
5. LLM identifica que precisa chamar função "get_appointments"
        ↓
6. AI Service executa:
   GET /api/ai-assistant/patient/appointments
   Authorization: Bearer eyJhbGc...
        ↓
7. Backend valida JWT, busca consultas do paciente
        ↓
8. Retorna JSON:
   [
     {
       "id": "app-1",
       "doctorName": "Dr. João Silva",
       "date": "2026-05-30",
       "time": "14:00",
       "specialty": "Cardiologia"
     }
   ]
        ↓
9. LLM processa resultado e gera resposta humanizada:
   "Você tem 1 consulta agendada:
    - Dr. João Silva (Cardiologia)
    - Data: 30/05/2026 às 14:00"
        ↓
10. AI Service publica em chat.from_ai
        ↓
11. Backend consome, persiste resposta (origin: AI)
        ↓
12. Backend envia ao paciente via WhatsApp/WebSocket
        ↓
13. ✅ Paciente recebe resposta
```

---

## 📂 Estrutura de Arquivos

### Backend (NestJS)

```
vitalium-backend/src/
├── modules/
│   ├── ai-assistant.module.ts           # NOVO
│   └── service-jwt.module.ts            # NOVO
│
├── application/use-cases/ai-assistant/  # NOVO
│   ├── get-patient-appointments.use-case.ts
│   ├── get-patient-prescriptions.use-case.ts
│   ├── schedule-appointment.use-case.ts
│   ├── get-doctor-appointments.use-case.ts
│   └── create-prescription.use-case.ts
│
├── presentation/controllers/
│   └── ai-assistant/
│       ├── ai-assistant-patient.controller.ts  # NOVO
│       └── ai-assistant-doctor.controller.ts   # NOVO
│
├── presentation/dto/ai-assistantDTO/    # NOVO
│   ├── appointment-summary.dto.ts
│   ├── prescription-summary.dto.ts
│   └── schedule-request.dto.ts
│
└── shared/services/
    └── service-jwt.service.ts           # NOVO
```

### AI Service (Python)

```
vitalium-ai/
├── services/
│   ├── function_caller.py               # NOVO
│   ├── backend_api_service.py           # NOVO
│   └── llm_service.py                   # MODIFICAR
│
├── tools/
│   ├── patient_tools.py                 # NOVO
│   └── doctor_tools.py                  # NOVO
│
└── consumers/
    └── ai_consumer.py                   # MODIFICAR
```

---

## 🧪 Testes

### Unit Tests

```typescript
// Backend
describe("GetPatientAppointmentsUseCase", () => {
  it("should return appointments for valid patient", () => {});
  it("should throw NotFoundException for invalid patient", () => {});
});
```

```python
# AI Service
def test_function_caller_executes_get_appointments():
    # Mock BackendAPIService
    # Verifica se chamou endpoint correto
    pass

def test_llm_service_handles_function_response():
    # Mock OpenAI response com tool_calls
    # Verifica se processa corretamente
    pass
```

### Integration Tests

```typescript
// E2E test: fluxo completo
describe("AI Assistant Integration", () => {
  it("should return appointments when patient asks", async () => {
    // 1. Publica mensagem em chat.to_ai
    // 2. Aguarda resposta em chat.from_ai
    // 3. Valida conteúdo da resposta
  });
});
```

---

## 📈 Faseamento da Implementação

### Fase 1: Foundation (Semana 1)

- [x] Criar `ai-assistant.module.ts`
- [x] Implementar `ServiceJWTService`
- [x] Criar endpoints básicos (appointments, prescriptions)
- [x] Modificar `whatsapp-incoming.consumer` para enviar metadata
- [x] Testes unitários dos use-cases

### Fase 2: AI Function Calling (Semana 2)

- [x] Implementar `FunctionCaller` no AI Service
- [x] Implementar `BackendAPIService`
- [x] Definir tools para paciente e médico
- [x] Modificar `LLMService` para suportar function calling
- [x] Testes de integração AI → Backend

### Fase 3: Features Avançadas (Semana 3)

- [x] Implementar agendamento de consultas via IA
- [x] Criar prescrições via IA (médico)
- [x] Busca de pacientes via linguagem natural
- [x] Rate limiting e segurança
- [x] Logs de auditoria
- [x] Testes E2E completos

### Fase 4: Otimizações (Opcional)

- [ ] Cache de respostas comuns (Redis)
- [ ] Histórico de conversa (contexto multi-turno)
- [ ] Analytics de uso da IA
- [ ] Feedback loop (usuário avalia resposta)

---

## 🎯 Critérios de Sucesso

### Métricas Técnicas

- ✅ Taxa de sucesso function calling > 95%
- ✅ Latência média < 3 segundos
- ✅ Zero vazamentos de dados entre usuários
- ✅ Cobertura de testes > 80%

### Métricas de Produto

- ✅ 80% das perguntas respondidas sem escalação para humano
- ✅ NPS da funcionalidade > 8
- ✅ Redução de 30% em tickets de suporte

---

## 🚨 Riscos e Mitigações

| Risco                           | Probabilidade | Impacto | Mitigação                                               |
| ------------------------------- | ------------- | ------- | ------------------------------------------------------- |
| LLM chama função errada         | Média         | Alto    | Melhorar descrições das functions, adicionar validação  |
| Token expirado durante execução | Baixa         | Médio   | Renovar token automaticamente                           |
| Dados sensíveis vazam para LLM  | Baixa         | Crítico | Sanitização rigorosa, logs de auditoria                 |
| Custo OpenAI dispara            | Média         | Alto    | Rate limiting, cache, monitoramento                     |
| IA "alucina" informações        | Alta          | Crítico | Sempre basear em function results, nunca inventar dados |

---

## 💰 Estimativa de Custos

### OpenAI API (GPT-4o)

- **Input**: $5 / 1M tokens
- **Output**: $15 / 1M tokens

**Estimativa mensal** (1000 usuários ativos):

- 10 mensagens/usuário/dia
- ~500 tokens por interação (input + output + functions)
- 1000 × 10 × 30 × 500 = 150M tokens/mês
- Custo: ~$1,500/mês

### Infraestrutura

- Container AI Service: $50/mês
- RabbitMQ (já existe): $0
- Backend (já existe): $0

**Total estimado**: $1,550/mês

---

## 📚 Referências

- OpenAI Function Calling: https://platform.openai.com/docs/guides/function-calling
- Anthropic Tool Use: https://docs.anthropic.com/claude/docs/tool-use
- NestJS Guards: https://docs.nestjs.com/guards
- RabbitMQ Patterns: https://www.rabbitmq.com/getstarted.html

---

## 🎓 Aprendizados Esperados

1. **Function Calling** é essencial para IA útil em produção
2. **Context-aware AI** requer boa arquitetura de autenticação
3. **Security by design** não é opcional em healthcare
4. **Rate limiting** é crítico para custos controláveis
5. **Auditoria** de ações da IA é requisito regulatório

---

## ✅ Checklist de Implementação

### Backend

- [ ] Criar `AIAssistantModule`
- [ ] Implementar `ServiceJWTService`
- [ ] Criar controllers (patient + doctor)
- [ ] Criar use-cases para cada função
- [ ] DTOs otimizados para LLM
- [ ] Guards de segurança
- [ ] Rate limiting
- [ ] Logs de auditoria
- [ ] Testes unitários
- [ ] Testes E2E

### AI Service

- [ ] Implementar `FunctionCaller`
- [ ] Implementar `BackendAPIService`
- [ ] Definir `PATIENT_TOOLS`
- [ ] Definir `DOCTOR_TOOLS`
- [ ] Modificar `LLMService.generate_with_tools()`
- [ ] System prompts por role
- [ ] Error handling robusto
- [ ] Retry logic
- [ ] Logging estruturado
- [ ] Testes unitários

### DevOps

- [ ] Variáveis de ambiente
- [ ] Docker Compose atualizado
- [ ] Monitoramento de custos OpenAI
- [ ] Alertas de erro
- [ ] Dashboard de métricas

### Documentação

- [ ] README atualizado
- [ ] Guia de uso para desenvolvedores
- [ ] Exemplos de uso
- [ ] Troubleshooting guide

---

**Este documento é um plano vivo e deve ser atualizado conforme a implementação progride.**
