"""
Serviço de LLM para análise de sintomas
"""
import logging

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

        try:
            if self.provider == "openai":
                self._init_openai()
            elif self.provider == "anthropic":
                self._init_anthropic()
            elif self.provider == "gemini":
                self._init_gemini()
        except Exception as error:
            logger.error(
                "Falha ao inicializar LLM (%s): %s — usando fallback local",
                self.provider,
                error,
                exc_info=True,
            )
            self.client = None

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

    def _init_gemini(self):
        try:
            import google.generativeai as genai
        except ImportError as exc:
            raise ImportError(
                "Para usar Gemini, instale: pip install google-generativeai"
            ) from exc

        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.client = genai
        self.model = Config.GEMINI_MODEL
        logger.info(f"Gemini configurado com modelo: {self.model}")

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

        if self.provider == "gemini":
            generation_config = {
                "max_output_tokens": min(max(self.max_tokens, 1024), 2048),
                "temperature": self.temperature,
            }
            # Modelos "flash" novos usam tokens de raciocínio e cortam a resposta.
            try:
                from google.generativeai.types import ThinkingConfig

                generation_config["thinking_config"] = ThinkingConfig(
                    thinking_budget=0
                )
            except Exception:
                pass

            model = self.client.GenerativeModel(
                model_name=self.model,
                system_instruction=system_prompt,
                generation_config=generation_config,
            )
            response = model.generate_content(user_message)
            text = self._extract_gemini_text(response)
            if not text:
                raise RuntimeError("Gemini retornou resposta vazia ou incompleta")
            return text

        raise ValueError(f"Provider não suportado: {self.provider}")

    def _extract_gemini_text(self, response) -> str:
        try:
            if getattr(response, "text", None):
                return response.text.strip()
        except Exception:
            pass

        parts: list[str] = []
        for candidate in getattr(response, "candidates", []) or []:
            content = getattr(candidate, "content", None)
            for part in getattr(content, "parts", []) or []:
                value = getattr(part, "text", None)
                if value:
                    parts.append(value)
        return "\n".join(parts).strip()

    def health_check(self) -> bool:
        return True
