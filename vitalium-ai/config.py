"""
Configurações do serviço de IA Vitalium
Foco: análise de sintomas relatados pelo paciente
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configurações centralizadas do serviço"""

    PORT = int(os.getenv("PORT", "3003"))
    HOST = os.getenv("HOST", "0.0.0.0")

    AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").lower()

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
    OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "900"))
    OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))

    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

    SYSTEM_PROMPT = os.getenv(
        "SYSTEM_PROMPT",
        """Você é um assistente clínico do Vitalium que resume relatos de sintomas
escritos pelo paciente para o médico responsável.

Regras:
- Resuma apenas com base nos relatos fornecidos.
- Não faça diagnóstico definitivo.
- Não invente sintomas que não estejam na lista.
- Destaque frequência, padrões e possíveis sinais de alerta.
- Use português do Brasil, claro e objetivo.
- Estruture em: Resumo, Principais queixas, Frequência/padrões, Pontos de atenção.
""",
    )

    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    @classmethod
    def has_llm_credentials(cls) -> bool:
        if cls.AI_PROVIDER == "openai":
            key = cls.OPENAI_API_KEY or ""
            return bool(key) and not key.startswith("sk-placeholder")
        if cls.AI_PROVIDER == "anthropic":
            return bool(cls.ANTHROPIC_API_KEY)
        return False

    @classmethod
    def validate(cls):
        if cls.AI_PROVIDER not in ["openai", "anthropic"]:
            raise ValueError(
                f"AI_PROVIDER inválido: {cls.AI_PROVIDER}. Use 'openai' ou 'anthropic'"
            )
        return True
