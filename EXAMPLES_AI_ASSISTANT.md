# 🎯 Exemplos Práticos: IA Assistant Implementation

## 📝 Exemplos de Conversas

### Paciente

**Exemplo 1: Consultar Próximas Consultas**

```
Paciente: "Quais são minhas próximas consultas?"

IA: [Chama get_appointments()]
    Resultado: [
      {
        "doctorName": "Dr. João Silva",
        "specialty": "Cardiologia",
        "date": "2026-05-30",
        "time": "14:00",
        "location": "Consultório Central"
      },
      {
        "doctorName": "Dra. Maria Santos",
        "specialty": "Dermatologia",
        "date": "2026-06-05",
        "time": "10:30",
        "location": "Clínica Norte"
      }
    ]

IA → Paciente: "Você tem 2 consultas agendadas:

📅 30/05/2026 às 14:00
   Dr. João Silva (Cardiologia)
   Local: Consultório Central

📅 05/06/2026 às 10:30
   Dra. Maria Santos (Dermatologia)
   Local: Clínica Norte

Precisa de alguma alteração?"
```

**Exemplo 2: Agendar Consulta**

```
Paciente: "Quero agendar consulta com meu cardiologista para próxima terça"

IA: [Chama get_available_slots(doctor_id="doc-123", date="2026-06-03")]
    Resultado: ["09:00", "10:00", "14:00", "15:00"]

IA → Paciente: "Encontrei os seguintes horários disponíveis com Dr. João Silva na terça (03/06):
• 09:00
• 10:00
• 14:00
• 15:00

Qual horário prefere?"

Paciente: "14:00"

IA: [Chama schedule_appointment(doctor_id="doc-123", date="2026-06-03", time="14:00")]
    Resultado: {"success": true, "appointmentId": "app-789"}

IA → Paciente: "✅ Consulta agendada com sucesso!

📅 Terça, 03/06/2026 às 14:00
👨‍⚕️ Dr. João Silva (Cardiologia)
📍 Consultório Central

Você receberá uma confirmação por email."
```

**Exemplo 3: Verificar Prescrições**

```
Paciente: "Quais remédios estou tomando?"

IA: [Chama get_prescriptions(active_only=True)]
    Resultado: [
      {
        "medication": "Losartana 50mg",
        "dosage": "1 comprimido",
        "frequency": "1x ao dia (manhã)",
        "prescribedBy": "Dr. João Silva",
        "startDate": "2026-04-01",
        "endDate": "2026-07-01"
      },
      {
        "medication": "Sinvastatina 20mg",
        "dosage": "1 comprimido",
        "frequency": "1x ao dia (noite)",
        "prescribedBy": "Dr. João Silva",
        "startDate": "2026-04-01",
        "endDate": "2026-07-01"
      }
    ]

IA → Paciente: "Suas prescrições ativas:

💊 Losartana 50mg
   Dosagem: 1 comprimido
   Frequência: 1x ao dia (manhã)
   Prescrito por: Dr. João Silva
   Válido até: 01/07/2026

💊 Sinvastatina 20mg
   Dosagem: 1 comprimido
   Frequência: 1x ao dia (noite)
   Prescrito por: Dr. João Silva
   Válido até: 01/07/2026

⚠️ Lembre-se: Não interrompa o tratamento sem orientação médica."
```

---

### Médico

**Exemplo 1: Consultas do Dia**

```
Médico: "Quais são minhas consultas de hoje?"

IA: [Chama get_today_appointments()]
    Resultado: [
      {
        "time": "09:00",
        "patientName": "João da Silva",
        "patientAge": 45,
        "reason": "Consulta de rotina",
        "status": "CONFIRMED"
      },
      {
        "time": "10:00",
        "patientName": "Maria Santos",
        "patientAge": 32,
        "reason": "Dor de cabeça recorrente",
        "status": "CONFIRMED"
      },
      {
        "time": "14:00",
        "patientName": "Pedro Oliveira",
        "patientAge": 58,
        "reason": "Retorno pós-cirúrgico",
        "status": "PENDING"
      }
    ]

IA → Médico: "Suas consultas de hoje (25/05/2026):

🕘 09:00 - João da Silva (45 anos)
   Motivo: Consulta de rotina
   Status: ✅ Confirmado

🕙 10:00 - Maria Santos (32 anos)
   Motivo: Dor de cabeça recorrente
   Status: ✅ Confirmado

🕑 14:00 - Pedro Oliveira (58 anos)
   Motivo: Retorno pós-cirúrgico
   Status: ⏳ Aguardando confirmação

Total: 3 consultas agendadas"
```

**Exemplo 2: Histórico do Paciente**

```
Médico: "Me mostre o histórico da Maria Santos"

IA: [Chama search_patient(name="Maria Santos")]
    Resultado: [{"id": "pat-456", "name": "Maria Santos", "cpf": "***.***.***-32"}]

IA: [Chama get_patient_history(patient_id="pat-456")]
    Resultado: {
      "lastVisit": "2026-03-15",
      "allergies": ["Penicilina"],
      "chronicConditions": ["Enxaqueca"],
      "recentPrescriptions": [
        {
          "date": "2026-03-15",
          "medication": "Naratriptana 2,5mg",
          "indication": "Crises de enxaqueca"
        }
      ],
      "recentExams": [
        {
          "date": "2026-02-10",
          "type": "Ressonância Magnética Crânio",
          "result": "Sem alterações"
        }
      ]
    }

IA → Médico: "📋 Histórico de Maria Santos (ID: pat-456)

🔴 Alergias:
   • Penicilina

📝 Condições Crônicas:
   • Enxaqueca

💊 Prescrições Recentes:
   • Naratriptana 2,5mg (15/03/2026)
     Indicação: Crises de enxaqueca

🔬 Exames Recentes:
   • Ressonância Magnética Crânio (10/02/2026)
     Resultado: Sem alterações

📅 Última Consulta: 15/03/2026

Precisa de mais detalhes?"
```

**Exemplo 3: Criar Prescrição**

```
Médico: "Prescrever Dipirona 500mg para João da Silva, 1 comprimido a cada 6 horas por 5 dias"

IA: [Chama search_patient(name="João da Silva")]
    Resultado: [{"id": "pat-123", "name": "João da Silva"}]

IA: [Chama create_prescription({
      patient_id: "pat-123",
      medication: "Dipirona 500mg",
      dosage: "1 comprimido",
      frequency: "A cada 6 horas",
      duration_days: 5,
      indication: "Dor"
    })]
    Resultado: {
      "success": true,
      "prescriptionId": "presc-987",
      "patientNotified": true
    }

IA → Médico: "✅ Prescrição criada com sucesso!

👤 Paciente: João da Silva
💊 Medicamento: Dipirona 500mg
📋 Posologia: 1 comprimido a cada 6 horas
⏱️ Duração: 5 dias

ID da Prescrição: presc-987
🔔 Paciente foi notificado via WhatsApp

A prescrição já está disponível no prontuário do paciente."
```

---

## 🎨 Personalização de Respostas

### Tons de Voz por Contexto

**Para Pacientes**: Amigável, empático, educativo

```python
PATIENT_SYSTEM_PROMPT = """
Você é o VitaliumAI, um assistente virtual amigável e empático.

Diretrizes:
- Use linguagem simples e acessível
- Seja paciente e educativo
- Use emojis para tornar a conversa mais amigável
- Explique termos médicos quando necessário
- Demonstre empatia com preocupações de saúde
- Sempre incentive consultar o médico para questões complexas

Exemplo de tom:
❌ "A prescrição foi registrada com sucesso no sistema."
✅ "Tudo certo! 😊 Sua receita está pronta e você já pode retirá-la na farmácia."
"""
```

**Para Médicos**: Profissional, preciso, objetivo

```python
DOCTOR_SYSTEM_PROMPT = """
Você é o VitaliumAI, assistente virtual para profissionais de saúde.

Diretrizes:
- Use terminologia médica apropriada
- Seja objetivo e direto
- Forneça informações estruturadas e organizadas
- Destaque informações críticas (alergias, contraindicações)
- Use formatação clara para facilitar leitura rápida

Exemplo de tom:
❌ "Oi doutor! Tudo bem? Então, o João tem algumas alergias que você precisa saber..."
✅ "Paciente João Silva (45a): Alergia documentada a Penicilina. Última consulta: 15/03/2026."
"""
```

---

## 🔧 Configuração de Funções Detalhada

### Patient Tool: get_appointments

```python
{
    "type": "function",
    "function": {
        "name": "get_appointments",
        "description": """
        Lista consultas agendadas do paciente.

        Use quando o paciente perguntar:
        - "Quais minhas consultas?"
        - "Quando é minha próxima consulta?"
        - "Tenho consulta essa semana?"
        - "Mostre minha agenda médica"

        Retorna lista de consultas com data, hora, médico e local.
        """,
        "parameters": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"],
                    "description": "Filtro por status. Use ALL para mostrar todas.",
                    "default": "SCHEDULED"
                },
                "limit": {
                    "type": "integer",
                    "description": "Número máximo de consultas a retornar",
                    "default": 5,
                    "minimum": 1,
                    "maximum": 20
                },
                "from_date": {
                    "type": "string",
                    "format": "date",
                    "description": "Data inicial (YYYY-MM-DD). Padrão: hoje"
                },
                "to_date": {
                    "type": "string",
                    "format": "date",
                    "description": "Data final (YYYY-MM-DD). Padrão: +30 dias"
                }
            }
        }
    }
}
```

### Doctor Tool: create_prescription

```python
{
    "type": "function",
    "function": {
        "name": "create_prescription",
        "description": """
        Cria uma nova prescrição médica para um paciente.

        IMPORTANTE:
        - Sempre busque o paciente antes (use search_patient)
        - Verifique alergias do paciente antes de prescrever
        - Notifique o paciente automaticamente após criar

        Use quando o médico disser:
        - "Prescrever [medicamento] para [paciente]"
        - "Criar receita de [medicamento]"
        - "Receitar [medicamento]"
        """,
        "parameters": {
            "type": "object",
            "properties": {
                "patient_id": {
                    "type": "string",
                    "description": "ID do paciente (obtenha com search_patient)"
                },
                "medication": {
                    "type": "string",
                    "description": "Nome do medicamento com dosagem (ex: 'Dipirona 500mg')"
                },
                "dosage": {
                    "type": "string",
                    "description": "Dose por administração (ex: '1 comprimido', '10ml')"
                },
                "frequency": {
                    "type": "string",
                    "description": "Frequência de uso (ex: 'A cada 6 horas', '2x ao dia')"
                },
                "duration_days": {
                    "type": "integer",
                    "description": "Duração do tratamento em dias (ex: 7, 30)",
                    "minimum": 1,
                    "maximum": 365
                },
                "indication": {
                    "type": "string",
                    "description": "Indicação terapêutica (ex: 'Dor', 'Infecção')"
                },
                "instructions": {
                    "type": "string",
                    "description": "Instruções especiais (ex: 'Tomar com alimentos')"
                }
            },
            "required": ["patient_id", "medication", "dosage", "frequency", "duration_days"]
        }
    }
}
```

---

## 🛡️ Error Handling

### Tratamento de Erros nas Funções

```python
# vitalium-ai/services/backend_api_service.py

def execute_function(self, function_name: str, arguments: Dict[str, Any]) -> Dict:
    try:
        endpoint = self._get_endpoint(function_name, arguments)
        method = self._get_method(function_name)

        logger.info(f"Executando {method} {endpoint}")

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
        return {
            "success": True,
            "data": response.json()
        }

    except requests.exceptions.Timeout:
        logger.error(f"Timeout ao executar {function_name}")
        return {
            "success": False,
            "error": "O sistema está demorando para responder. Tente novamente.",
            "error_type": "TIMEOUT"
        }

    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code

        if status_code == 401:
            return {
                "success": False,
                "error": "Sessão expirada. Por favor, faça login novamente.",
                "error_type": "UNAUTHORIZED"
            }
        elif status_code == 403:
            return {
                "success": False,
                "error": "Você não tem permissão para acessar esses dados.",
                "error_type": "FORBIDDEN"
            }
        elif status_code == 404:
            return {
                "success": False,
                "error": "Não encontrei os dados solicitados.",
                "error_type": "NOT_FOUND"
            }
        else:
            return {
                "success": False,
                "error": f"Erro ao processar sua solicitação (código {status_code}).",
                "error_type": "SERVER_ERROR"
            }

    except Exception as e:
        logger.error(f"Erro inesperado: {e}", exc_info=True)
        return {
            "success": False,
            "error": "Ocorreu um erro inesperado. Nossa equipe foi notificada.",
            "error_type": "UNKNOWN"
        }
```

### LLM Processa Erros

```python
# Quando function retorna erro, LLM explica de forma amigável

# Exemplo de resposta do LLM após erro 404:
"""
Não consegui encontrar as informações solicitadas.
Isso pode acontecer se:
- Os dados ainda não foram cadastrados no sistema
- Você digitou algo incorreto

Poderia verificar e tentar novamente?
"""
```

---

## 📊 Monitoramento

### Métricas a Coletar

```python
# vitalium-ai/services/metrics.py

class AIMetrics:
    def __init__(self):
        self.redis = redis.Redis()

    def log_function_call(self, function_name: str, user_role: str,
                          success: bool, duration_ms: float):
        """
        Registra chamada de função para analytics
        """
        key = f"ai:metrics:{date.today()}"
        self.redis.hincrby(key, f"{function_name}:calls", 1)
        self.redis.hincrby(key, f"{function_name}:success", 1 if success else 0)
        self.redis.hincrby(key, f"{function_name}:duration_ms", int(duration_ms))

        # TTL de 90 dias
        self.redis.expire(key, 90 * 24 * 60 * 60)

    def get_daily_stats(self) -> Dict:
        """
        Retorna estatísticas do dia
        """
        key = f"ai:metrics:{date.today()}"
        data = self.redis.hgetall(key)

        # Processa e retorna estatísticas
        return {
            "total_calls": sum(int(v) for k, v in data.items() if k.endswith(":calls")),
            "success_rate": self._calculate_success_rate(data),
            "avg_duration_ms": self._calculate_avg_duration(data),
            "by_function": self._group_by_function(data)
        }
```

### Dashboard de Métricas

```typescript
// vitalium-backend/src/presentation/controllers/admin/ai-metrics.controller.ts

@Controller("admin/ai-metrics")
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AIMetricsController {
  @Get("dashboard")
  async getDashboard() {
    return {
      today: {
        totalInteractions: 1523,
        functionCalls: 842,
        successRate: 0.967,
        avgResponseTime: 2.3,
        costUSD: 24.5,
      },
      topFunctions: [
        { name: "get_appointments", calls: 342, successRate: 0.98 },
        { name: "get_prescriptions", calls: 201, successRate: 0.99 },
        { name: "schedule_appointment", calls: 87, successRate: 0.94 },
      ],
      errors: [
        { type: "TIMEOUT", count: 12 },
        { type: "NOT_FOUND", count: 8 },
        { type: "FORBIDDEN", count: 3 },
      ],
    };
  }
}
```

---

## 🎓 Prompt Engineering Tips

### Melhorando Respostas

**Técnica 1: Few-Shot Examples no System Prompt**

```python
PATIENT_SYSTEM_PROMPT = """
Você é o VitaliumAI.

Exemplos de boas respostas:

Pergunta: "Quais minhas consultas?"
Resposta: "Você tem 2 consultas agendadas:
📅 30/05 às 14:00 - Dr. João Silva (Cardiologia)
📅 05/06 às 10:30 - Dra. Maria Santos (Dermatologia)"

Pergunta: "Estou com dor de cabeça forte"
Resposta: "Sinto muito que esteja com dor. 😟
Para dores de cabeça intensas, é importante consultar um médico.
Posso agendar uma consulta urgente para você?"

Agora responda ao paciente:
"""
```

**Técnica 2: Chain of Thought para Decisões Complexas**

```python
# Adicionar ao prompt quando necessário
"""
Antes de responder, pense passo a passo:
1. O que o usuário está pedindo?
2. Quais funções preciso chamar?
3. Os resultados fazem sentido?
4. Como apresentar de forma clara?
"""
```

---

## ✨ Features Avançadas (Futuro)

### 1. Multi-Step Workflows

```python
# Exemplo: Agendar consulta + enviar preparação para exame

async def schedule_exam_workflow(patient_id: str, exam_type: str, date: str):
    # Passo 1: Agendar
    appointment = await schedule_appointment(...)

    # Passo 2: Enviar instruções de preparação
    instructions = get_exam_prep_instructions(exam_type)
    await send_whatsapp_message(patient_id, instructions)

    # Passo 3: Adicionar lembrete 1 dia antes
    await schedule_reminder(appointment.id, date - 1)

    return {
        "appointment": appointment,
        "instructions_sent": True,
        "reminder_scheduled": True
    }
```

### 2. Context-Aware Long Conversations

```python
# Manter histórico de conversa no RabbitMQ payload
metadata: {
    "conversationHistory": [
        {"role": "user", "content": "Quais minhas consultas?"},
        {"role": "assistant", "content": "Você tem 2 consultas..."},
        {"role": "user", "content": "Cancele a primeira"}  # IA entende "primeira" = 30/05
    ]
}
```

### 3. Proactive Notifications

```python
# IA envia lembretes automaticamente
async def check_and_notify():
    # Busca consultas nas próximas 24h
    upcoming = await get_appointments(from_date=tomorrow, to_date=tomorrow)

    for appointment in upcoming:
        await send_ai_message(
            patient_id=appointment.patientId,
            message=f"Lembrete: Você tem consulta amanhã às {appointment.time} com {appointment.doctor}"
        )
```

---

**Este documento complementa o PLAN_AI_ASSISTANT.md com exemplos práticos de implementação.**
