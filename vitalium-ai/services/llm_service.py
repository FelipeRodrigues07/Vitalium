"""
Serviço de LLM (Large Language Model)
Abstração para diferentes provedores de IA (OpenAI, Anthropic, etc.)
"""
import logging
from typing import List, Dict
from config import Config

logger = logging.getLogger(__name__)


class LLMService:
    """Serviço abstrato para interação com modelos de linguagem"""

    def __init__(self):
        self.provider = Config.AI_PROVIDER
        logger.info(f"Inicializando LLM Service com provider: {self.provider}")

        if self.provider == "openai":
            self._init_openai()
        elif self.provider == "anthropic":
            self._init_anthropic()
        else:
            raise ValueError(f"Provider não suportado: {self.provider}")

    def _init_openai(self):
        """Inicializa cliente OpenAI"""
        if not Config.OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY não configurada — LLM desabilitado")
            self.client = None
            return

        from openai import OpenAI

        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        self.model = Config.OPENAI_MODEL
        self.max_tokens = Config.OPENAI_MAX_TOKENS
        self.temperature = Config.OPENAI_TEMPERATURE
        logger.info(f"OpenAI configurado com modelo: {self.model}")

    def _init_anthropic(self):
        """Inicializa cliente Anthropic (Claude)"""
        try:
            from anthropic import Anthropic

            self.client = Anthropic(api_key=Config.ANTHROPIC_API_KEY)
            self.model = Config.ANTHROPIC_MODEL
            self.max_tokens = Config.OPENAI_MAX_TOKENS  # Reutiliza configuração
            logger.info(f"Anthropic configurado com modelo: {self.model}")
        except ImportError:
            raise ImportError(
                "Para usar Anthropic, instale: pip install anthropic"
            )

    def generate_response(
        self, message: str, conversation_history: List[Dict] = None
    ) -> str:
        """
        Gera resposta usando o LLM configurado

        Args:
            message: Mensagem do usuário
            conversation_history: Lista de mensagens anteriores
                Formato: [{"role": "user|assistant", "content": "..."}]

        Returns:
            Resposta gerada pelo modelo
        """
        try:
            if self.provider == "openai":
                return self._generate_openai(message, conversation_history)
            elif self.provider == "anthropic":
                return self._generate_anthropic(message, conversation_history)
        except Exception as e:
            logger.error(f"Erro ao gerar resposta: {e}", exc_info=True)
            return self._get_error_response()

    def _generate_openai(
        self, message: str, conversation_history: List[Dict] = None
    ) -> str:
        """Gera resposta usando OpenAI"""
        if not self.client:
            return self._get_error_response()

        messages = [{"role": "system", "content": Config.SYSTEM_PROMPT}]

        # Adiciona histórico se disponível
        if conversation_history:
            messages.extend(conversation_history[-10:])  # Últimas 10 mensagens

        # Adiciona mensagem atual
        messages.append({"role": "user", "content": message})

        logger.debug(f"Enviando para OpenAI: {len(messages)} mensagens")

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
        )

        answer = response.choices[0].message.content
        logger.info(
            f"Resposta OpenAI gerada: {len(answer)} caracteres | Tokens: {response.usage.total_tokens}"
        )
        return answer

    def _generate_anthropic(
        self, message: str, conversation_history: List[Dict] = None
    ) -> str:
        """Gera resposta usando Anthropic (Claude)"""
        messages = []

        # Claude não usa system no array de messages, vai separado
        if conversation_history:
            messages.extend(conversation_history[-10:])

        messages.append({"role": "user", "content": message})

        logger.debug(f"Enviando para Anthropic: {len(messages)} mensagens")

        response = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            system=Config.SYSTEM_PROMPT,
            messages=messages,
        )

        answer = response.content[0].text
        logger.info(f"Resposta Anthropic gerada: {len(answer)} caracteres")
        return answer

    def _get_error_response(self) -> str:
        """Resposta padrão em caso de erro"""
        return (
            "Desculpe, estou com dificuldades técnicas no momento. "
            "Por favor, tente novamente em alguns instantes ou "
            "entre em contato diretamente com sua equipe médica."
        )

    def health_check(self) -> bool:
        """Verifica se o serviço está funcionando"""
        try:
            test_response = self.generate_response(
                "Olá, você está funcionando?", []
            )
            return len(test_response) > 0
        except Exception as e:
            logger.error(f"Health check falhou: {e}")
            return False
