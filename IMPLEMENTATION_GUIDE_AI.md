# 🚀 Guia de Implementação: AI Assistant (Step by Step)

**Data**: 25 de maio de 2026  
**Estimativa**: 2-3 semanas  
**Status**: 📋 Planejado

---

## 📅 Cronograma de Implementação

### Semana 1: Foundation & Backend

#### Dia 1-2: Setup Inicial

- [ ] Criar branch `feature/ai-assistant`
- [ ] Criar módulos base no backend
- [ ] Implementar ServiceJWT

#### Dia 3-4: Endpoints Paciente

- [ ] Implementar endpoints de consulta (appointments, prescriptions)
- [ ] Testes unitários dos use-cases

#### Dia 5: Endpoints Médico

- [ ] Implementar endpoints do médico
- [ ] Integrar com consumers existentes

### Semana 2: AI Service

#### Dia 6-7: Function Calling Base

- [ ] Implementar BackendAPIService
- [ ] Definir tools para paciente e médico
- [ ] Modificar LLMService

#### Dia 8-9: Integração Completa

- [ ] Modificar AIConsumer para function calling
- [ ] Testes de integração AI → Backend
- [ ] Debugging e ajustes

#### Dia 10: Segurança & Rate Limiting

- [ ] Implementar guards de segurança
- [ ] Rate limiting
- [ ] Logs de auditoria

### Semana 3: Features Avançadas & Deploy

#### Dia 11-12: Features Extras

- [ ] Agendamento via IA
- [ ] Criação de prescrições
- [ ] Busca de pacientes

#### Dia 13-14: Testes & Documentação

- [ ] Testes E2E completos
- [ ] Documentação de API
- [ ] Guia de uso

#### Dia 15: Deploy & Monitoramento

- [ ] Deploy em staging
- [ ] Testes de carga
- [ ] Setup de monitoramento

---

## 🛠️ Comandos de Implementação

### 1. Setup do Projeto

```bash
# Criar branch
git checkout -b feature/ai-assistant

# Backend: Instalar dependências (se necessário)
cd vitalium-backend
npm install

# AI Service: Adicionar dependências
cd ../vitalium-ai
pip install httpx  # Cliente HTTP async
```

---

### 2. Backend: Criar Estrutura

```bash
# Criar diretórios
mkdir -p vitalium-backend/src/modules
mkdir -p vitalium-backend/src/application/use-cases/ai-assistant
mkdir -p vitalium-backend/src/presentation/controllers/ai-assistant
mkdir -p vitalium-backend/src/presentation/dto/ai-assistantDTO
mkdir -p vitalium-backend/src/shared/services
```

**Arquivos a criar** (ordem de implementação):

#### 2.1 ServiceJWT Service

```bash
# Arquivo: vitalium-backend/src/shared/services/service-jwt.service.ts
```

```typescript
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class ServiceJWTService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Gera token de serviço para IA
   * Token tem escopo limitado e curta duração
   */
  generateServiceToken(userId: string, role: string): string {
    return this.jwtService.sign(
      {
        sub: userId,
        role,
        type: "AI_SERVICE",
        scope: "ai_assistant",
      },
      {
        expiresIn: "5m", // 5 minutos
        issuer: "vitalium-backend",
        audience: "vitalium-ai",
      },
    );
  }

  /**
   * Valida se token é de serviço
   */
  isServiceToken(token: string): boolean {
    try {
      const decoded = this.jwtService.decode(token) as any;
      return decoded?.type === "AI_SERVICE";
    } catch {
      return false;
    }
  }
}
```

#### 2.2 DTOs

```bash
# Arquivo: vitalium-backend/src/presentation/dto/ai-assistantDTO/appointment-summary.dto.ts
```

```typescript
import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class AppointmentSummaryDTO {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  doctorName: string;

  @Expose()
  @ApiProperty()
  specialty: string;

  @Expose()
  @ApiProperty()
  date: string; // YYYY-MM-DD

  @Expose()
  @ApiProperty()
  time: string; // HH:MM

  @Expose()
  @ApiProperty()
  location: string;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @ApiProperty({ required: false })
  notes?: string;
}
```

```bash
# Arquivo: vitalium-backend/src/presentation/dto/ai-assistantDTO/prescription-summary.dto.ts
```

```typescript
import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class PrescriptionSummaryDTO {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  medication: string;

  @Expose()
  @ApiProperty()
  dosage: string;

  @Expose()
  @ApiProperty()
  frequency: string;

  @Expose()
  @ApiProperty()
  prescribedBy: string;

  @Expose()
  @ApiProperty()
  startDate: string;

  @Expose()
  @ApiProperty()
  endDate: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;
}
```

#### 2.3 Use Cases

```bash
# Arquivo: vitalium-backend/src/application/use-cases/ai-assistant/get-patient-appointments.use-case.ts
```

```typescript
import { Injectable, Inject } from "@nestjs/common";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/appointment/appointment.repository.interface";
import { AppointmentSummaryDTO } from "../../../presentation/dto/ai-assistantDTO/appointment-summary.dto";
import { plainToInstance } from "class-transformer";

export interface GetPatientAppointmentsParams {
  patientId: string;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "ALL";
  limit?: number;
  fromDate?: Date;
  toDate?: Date;
}

@Injectable()
export class GetPatientAppointmentsUseCase {
  constructor(
    @Inject("IAppointmentRepository")
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    params: GetPatientAppointmentsParams,
  ): Promise<AppointmentSummaryDTO[]> {
    const {
      patientId,
      status = "SCHEDULED",
      limit = 5,
      fromDate = new Date(),
      toDate,
    } = params;

    const appointments = await this.appointmentRepository.findByPatient(
      patientId,
      {
        status: status === "ALL" ? undefined : status,
        fromDate,
        toDate,
        limit,
      },
    );

    // Transforma para DTO otimizado para LLM
    return appointments.map((apt) =>
      plainToInstance(
        AppointmentSummaryDTO,
        {
          id: apt.id,
          doctorName: apt.doctor?.user?.name || "Não informado",
          specialty: apt.doctor?.specialty || "Não informado",
          date: apt.date.toISOString().split("T")[0],
          time: apt.time,
          location: apt.unit?.name || "Não informado",
          status: apt.status,
          notes: apt.notes,
        },
        { excludeExtraneousValues: true },
      ),
    );
  }
}
```

#### 2.4 Controller

```bash
# Arquivo: vitalium-backend/src/presentation/controllers/ai-assistant/ai-assistant-patient.controller.ts
```

```typescript
import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../../../shared/guards/auth.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { Role } from "../../../shared/enums/role.enum";
import { GetPatientAppointmentsUseCase } from "../../../application/use-cases/ai-assistant/get-patient-appointments.use-case";
import { AppointmentSummaryDTO } from "../../dto/ai-assistantDTO/appointment-summary.dto";

@ApiTags("ai-assistant")
@ApiBearerAuth()
@Controller("api/ai-assistant/patient")
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.PATIENT, Role.ADMIN) // Permite ADMIN para testes
export class AIAssistantPatientController {
  constructor(
    private readonly getAppointmentsUseCase: GetPatientAppointmentsUseCase,
  ) {}

  @Get("appointments")
  async getAppointments(
    @Request() req,
    @Query("status") status?: string,
    @Query("limit") limit?: string,
  ): Promise<AppointmentSummaryDTO[]> {
    const userId = req.user.sub;

    // Busca patientId a partir do userId
    // TODO: Implementar mapeamento userId → patientId

    return this.getAppointmentsUseCase.execute({
      patientId: userId, // Simplificado
      status: status as any,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
```

#### 2.5 Module

```bash
# Arquivo: vitalium-backend/src/modules/ai-assistant.module.ts
```

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../infrastructure/database/prisma.module";
import { ServiceJWTService } from "../shared/services/service-jwt.service";
import { AIAssistantPatientController } from "../presentation/controllers/ai-assistant/ai-assistant-patient.controller";
import { GetPatientAppointmentsUseCase } from "../application/use-cases/ai-assistant/get-patient-appointments.use-case";
import { AppointmentRepository } from "../infrastructure/repositories/appointment/appointment.repository";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "5m" },
    }),
  ],
  controllers: [AIAssistantPatientController],
  providers: [
    ServiceJWTService,
    GetPatientAppointmentsUseCase,
    { provide: "IAppointmentRepository", useClass: AppointmentRepository },
  ],
  exports: [ServiceJWTService],
})
export class AIAssistantModule {}
```

#### 2.6 Integrar no AppModule

```typescript
// vitalium-backend/src/modules/app.module.ts
import { AIAssistantModule } from "./ai-assistant.module";

@Module({
  imports: [
    // ... outros módulos
    AIAssistantModule,
  ],
})
export class AppModule {}
```

---

### 3. Modificar Consumer para Enviar JWT

```bash
# Arquivo: vitalium-backend/src/shared/messaging/consumers/whatsapp-incoming.consumer.ts
```

```typescript
// Adicionar injeção do ServiceJWTService
constructor(
  // ... dependências existentes
  private readonly serviceJwtService: ServiceJWTService,
) {}

// No método handle(), após persisitir mensagem:
const serviceToken = this.serviceJwtService.generateServiceToken(
  resolvedPatientId,
  'PATIENT'
);

await this.chatProducer.publishToAI({
  ...payload,
  patientId: resolvedPatientId,
  conversationId,
  metadata: {
    ...payload.metadata,
    userRole: 'PATIENT',
    jwt: serviceToken,
    userId: resolvedPatientId,
  },
});
```

---

### 4. AI Service: Function Calling

```bash
# Criar arquivos
touch vitalium-ai/services/backend_api_service.py
touch vitalium-ai/services/function_caller.py
touch vitalium-ai/tools/patient_tools.py
touch vitalium-ai/tools/doctor_tools.py
```

#### 4.1 Backend API Service

```python
# vitalium-ai/services/backend_api_service.py
import httpx
import logging
from typing import Dict, Any, Optional
from config import Config

logger = logging.getLogger(__name__)


class BackendAPIService:
    """
    Cliente HTTP para comunicação com backend
    Usa JWT do usuário para requisições autenticadas
    """

    def __init__(self, user_jwt: str, user_role: str):
        self.base_url = Config.BACKEND_API_URL
        self.headers = {
            "Authorization": f"Bearer {user_jwt}",
            "Content-Type": "application/json"
        }
        self.user_role = user_role
        self.client = httpx.Client(timeout=10.0)

    def execute_function(self, function_name: str, arguments: Dict[str, Any]) -> Dict:
        """Executa função chamando endpoint do backend"""
        try:
            endpoint = self._get_endpoint(function_name, arguments)
            method = self._get_method(function_name)

            logger.info(f"🔧 Executando {method} {endpoint}")

            if method == "GET":
                response = self.client.get(
                    f"{self.base_url}{endpoint}",
                    headers=self.headers,
                    params=arguments
                )
            elif method == "POST":
                response = self.client.post(
                    f"{self.base_url}{endpoint}",
                    headers=self.headers,
                    json=arguments
                )

            response.raise_for_status()
            return {
                "success": True,
                "data": response.json()
            }

        except httpx.HTTPStatusError as e:
            return self._handle_http_error(e)
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "O sistema está demorando para responder."
            }
        except Exception as e:
            logger.error(f"Erro ao executar função: {e}", exc_info=True)
            return {
                "success": False,
                "error": "Ocorreu um erro inesperado."
            }

    def _get_endpoint(self, function_name: str, arguments: Dict) -> str:
        """Mapeia função para endpoint"""
        role_prefix = "patient" if self.user_role == "PATIENT" else "doctor"

        ENDPOINTS = {
            "get_appointments": f"/api/ai-assistant/{role_prefix}/appointments",
            "get_prescriptions": f"/api/ai-assistant/{role_prefix}/prescriptions",
            # ... mais endpoints
        }

        endpoint = ENDPOINTS.get(function_name, "")

        # Substitui placeholders (ex: {patient_id})
        for key, value in arguments.items():
            endpoint = endpoint.replace(f"{{{key}}}", str(value))

        return endpoint

    def _get_method(self, function_name: str) -> str:
        """Define método HTTP"""
        POST_FUNCTIONS = ["schedule_appointment", "create_prescription"]
        return "POST" if function_name in POST_FUNCTIONS else "GET"

    def _handle_http_error(self, error: httpx.HTTPStatusError) -> Dict:
        """Traduz erros HTTP para mensagens amigáveis"""
        status_code = error.response.status_code

        ERROR_MESSAGES = {
            401: "Sessão expirada. Por favor, faça login novamente.",
            403: "Você não tem permissão para acessar esses dados.",
            404: "Não encontrei os dados solicitados.",
            500: "O sistema está com problemas. Tente novamente mais tarde."
        }

        return {
            "success": False,
            "error": ERROR_MESSAGES.get(status_code, "Erro ao processar solicitação.")
        }
```

#### 4.2 Patient Tools

```python
# vitalium-ai/tools/patient_tools.py

PATIENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_appointments",
            "description": "Lista consultas agendadas do paciente",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["SCHEDULED", "ALL"],
                        "description": "Filtrar por status",
                        "default": "SCHEDULED"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Número máximo de resultados",
                        "default": 5
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_prescriptions",
            "description": "Lista prescrições médicas do paciente",
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
    }
]
```

#### 4.3 Modificar LLMService

```python
# vitalium-ai/services/llm_service.py

# Adicionar método para function calling
def generate_with_tools(
    self,
    message: str,
    tools: List[Dict],
    user_jwt: str,
    user_role: str
) -> str:
    """Gera resposta com function calling habilitado"""
    from services.backend_api_service import BackendAPIService

    api_service = BackendAPIService(user_jwt, user_role)

    messages = [
        {"role": "system", "content": self._get_system_prompt(user_role)},
        {"role": "user", "content": message}
    ]

    # Primeira chamada: decisão de chamar função
    response = self.client.chat.completions.create(
        model=self.model,
        messages=messages,
        tools=tools,
        tool_choice="auto"
    )

    # Se chamou função
    if response.choices[0].message.tool_calls:
        for tool_call in response.choices[0].message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)

            logger.info(f"🤖 IA chamando: {function_name}({function_args})")

            # Executa no backend
            result = api_service.execute_function(function_name, function_args)

            # Adiciona ao contexto
            messages.append({
                "role": "function",
                "name": function_name,
                "content": json.dumps(result)
            })

        # Segunda chamada: processa resultados
        final_response = self.client.chat.completions.create(
            model=self.model,
            messages=messages
        )

        return final_response.choices[0].message.content

    # Sem função, retorna direto
    return response.choices[0].message.content
```

#### 4.4 Modificar AI Consumer

```python
# vitalium-ai/consumers/ai_consumer.py

from tools.patient_tools import PATIENT_TOOLS
from tools.doctor_tools import DOCTOR_TOOLS

def _on_message(self, ch, method, properties, body):
    payload = json.loads(body)
    user_message = payload.get("message", "")
    metadata = payload.get("metadata", {})

    # Extrai contexto do usuário
    user_role = metadata.get("userRole", "PATIENT")
    user_jwt = metadata.get("jwt", "")

    # Escolhe tools baseado no role
    tools = PATIENT_TOOLS if user_role == "PATIENT" else DOCTOR_TOOLS

    # Chama LLM com function calling
    ai_response = self.llm_service.generate_with_tools(
        message=user_message,
        tools=tools,
        user_jwt=user_jwt,
        user_role=user_role
    )

    # Publica resposta...
```

---

### 5. Configurações

```bash
# vitalium-ai/.env
BACKEND_API_URL=http://vitalium-backend:3000
```

```python
# vitalium-ai/config.py
class Config:
    # ... configurações existentes
    BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:3000")
```

---

### 6. Testes

```bash
# Backend: Teste unitário
cd vitalium-backend
npm test src/application/use-cases/ai-assistant/get-patient-appointments.use-case.spec.ts

# AI Service: Teste integração
cd vitalium-ai
python -m pytest tests/test_backend_api_service.py -v
```

---

### 7. Deploy

```bash
# Build imagens
docker-compose build vitalium-backend vitalium-ai

# Deploy completo
docker-compose up -d

# Logs
docker-compose logs -f vitalium-ai vitalium-backend
```

---

## ✅ Checklist de Validação

Após implementação, validar:

- [ ] Paciente pergunta "Quais minhas consultas?" e recebe lista correta
- [ ] Médico pergunta "Consultas de hoje?" e recebe agenda
- [ ] JWT expira após 5 minutos
- [ ] Usuário não acessa dados de outros usuários
- [ ] Rate limiting funciona (máx 10 calls/conversa)
- [ ] Logs de auditoria registram todas as ações
- [ ] Erros 401/403/404 retornam mensagens amigáveis
- [ ] Custos OpenAI dentro do esperado ($1,500/mês)

---

**Siga este guia passo a passo para implementação incremental e segura do AI Assistant.**
