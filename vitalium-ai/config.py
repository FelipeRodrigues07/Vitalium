"""
Configurações do serviço de IA Vitalium
Carrega variáveis de ambiente e expõe constantes
"""
import os
from dotenv import load_dotenv

# Carrega variáveis do .env
load_dotenv()


class Config:
    """Configurações centralizadas do serviço"""

    # ─── RabbitMQ ──────────────────────────────────────────
    RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
    QUEUE_TO_AI = os.getenv("RABBITMQ_QUEUE_TO_AI", "chat.to_ai")
    QUEUE_FROM_AI = os.getenv("RABBITMQ_QUEUE_FROM_AI", "chat.from_ai")

    # ─── AI Provider ───────────────────────────────────────
    AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").lower()  # openai | anthropic

    # ─── OpenAI ────────────────────────────────────────────
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
    OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "500"))
    OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))

    # ─── Anthropic (Claude) ────────────────────────────────
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

    # ─── System Prompt ─────────────────────────────────────
    SYSTEM_PROMPT = os.getenv(
        "SYSTEM_PROMPT",
        """Você é um assistente médico virtual chamado VitaliumAI. 
Sua função é ajudar pacientes com informações gerais sobre saúde, 
agendar consultas e responder dúvidas não emergenciais. 
Seja empático, claro e objetivo. 
NUNCA faça diagnósticos médicos. 
Em casos graves, oriente buscar atendimento presencial imediato.""",
    )

    # ─── Logging ───────────────────────────────────────────
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    @classmethod
    def validate(cls):
        """Valida se as configurações obrigatórias estão presentes"""
        errors = []

        if cls.AI_PROVIDER == "openai" and not cls.OPENAI_API_KEY:
            errors.append("OPENAI_API_KEY é obrigatório quando AI_PROVIDER=openai")

        if cls.AI_PROVIDER == "anthropic" and not cls.ANTHROPIC_API_KEY:
            errors.append(
                "ANTHROPIC_API_KEY é obrigatório quando AI_PROVIDER=anthropic"
            )

        if cls.AI_PROVIDER not in ["openai", "anthropic"]:
            errors.append(
                f"AI_PROVIDER inválido: {cls.AI_PROVIDER}. Use 'openai' ou 'anthropic'"
            )

        if errors:
            raise ValueError(
                f"Erro de configuração:\n" + "\n".join(f"  - {e}" for e in errors)
            )

        return True
