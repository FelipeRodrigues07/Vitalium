"""
Serviço de LLM para análise de sintomas
"""
import logging
from typing import List

from config import Config

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        self.provider = Config.AI_PROVIDER
        self.client = None
        self.model = Config.OPENAI_MODEL
        self.max_tokens = Config.OPENAI_MAX_TOKENS
        self.temperature = Config.OPENAI_TEMPERATURE

        logger.info(f"Inicializando LLM Service com provider: {self.provider}")

        if not Config.has_llm_credentials():
            logger.warning(
                "Credenciais de LLM ausentes — modo fallback local ativo"
            )
            return

        if self.provider == "openai":
            self._init_openai()
        elif self.provider == "anthropic":
            self._init_anthropic()

    def _init_openai(self):
        from openai import OpenAI

        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        self.model = Config.OPENAI_MODEL
        logger.info(f"OpenAI configurado com modelo: {self.model}")

    def _init_anthropic(self):
        try:
            from anthropic import Anthropic
        except ImportError as exc:
            raise ImportError(
                "Para usar Anthropic, instale: pip install anthropic"
            ) from exc

        self.client = Anthropic(api_key=Config.ANTHROPIC_API_KEY)
        self.model = Config.ANTHROPIC_MODEL
        logger.info(f"Anthropic configurado com modelo: {self.model}")

    def generate_with_system(self, system_prompt: str, user_message: str) -> str:
        if not self.client:
            raise RuntimeError("LLM não configurado")

        if self.provider == "openai":
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )
            return response.choices[0].message.content or ""

        if self.provider == "anthropic":
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}],
            )
            return response.content[0].text

        raise ValueError(f"Provider não suportado: {self.provider}")

    def health_check(self) -> bool:
        return True
