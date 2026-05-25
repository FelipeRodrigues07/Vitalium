"""
Consumer de IA
Consome mensagens da fila chat.to_ai, processa com LLM e publica em chat.from_ai
"""
import json
import logging
from services.llm_service import LLMService
from services.rabbitmq_service import RabbitMQService
from config import Config

logger = logging.getLogger(__name__)


class AIConsumer:
    """Consumer responsável por processar mensagens com IA"""

    def __init__(self):
        self.rabbitmq = RabbitMQService()
        self.llm_service = LLMService()
        logger.info("AIConsumer inicializado")

    def start(self):
        """Inicia o consumer"""
        logger.info("🚀 Iniciando AIConsumer...")
        logger.info(f"Provider: {Config.AI_PROVIDER}")
        logger.info(f"Fila de entrada: {Config.QUEUE_TO_AI}")
        logger.info(f"Fila de saída: {Config.QUEUE_FROM_AI}")
        
        # Health check do LLM
        if self.llm_service.health_check():
            logger.info("✅ LLM Service está funcionando corretamente")
        else:
            logger.warning("⚠️ LLM Service falhou no health check, mas continuando...")
        
        # Inicia consumo
        self.rabbitmq.consume(Config.QUEUE_TO_AI, self._on_message)

    def _on_message(self, ch, method, properties, body):
        """
        Callback chamado quando recebe mensagem
        
        Payload esperado (MessagePayloadDTO):
        {
            "channel": "WHATSAPP" | "WEB",
            "patientId": "string",
            "conversationId": "string",
            "message": "string",
            "timestamp": "ISO",
            "origin": "PATIENT",
            "metadata": {}
        }
        """
        try:
            # Parse do payload
            payload = json.loads(body)
            conversation_id = payload.get("conversationId", "unknown")
            patient_message = payload.get("message", "")
            channel = payload.get("channel", "WEB")
            patient_id = payload.get("patientId", "")
            
            logger.info(f"📨 Mensagem recebida | Conversa: {conversation_id} | Canal: {channel}")
            logger.debug(f"Mensagem do paciente: {patient_message[:100]}...")

            # Valida payload
            if not patient_message:
                logger.warning(f"Mensagem vazia ignorada | Conversa: {conversation_id}")
                self.rabbitmq.ack_message(method.delivery_tag)
                return

            # ─── Processa com LLM ─────────────────────────────
            
            # TODO: Futuramente, buscar histórico da conversa via API
            # conversation_history = self._fetch_conversation_history(conversation_id)
            conversation_history = []  # Por enquanto, sem contexto histórico

            ai_response = self.llm_service.generate_response(
                patient_message, conversation_history
            )

            logger.info(f"🤖 Resposta IA gerada: {len(ai_response)} caracteres")

            # ─── Publica resposta ─────────────────────────────

            response_payload = {
                "channel": channel,
                "patientId": patient_id,
                "conversationId": conversation_id,
                "message": ai_response,
                "timestamp": payload.get("timestamp"),
                "origin": "AI",
                "metadata": {
                    "model": self.llm_service.model,
                    "provider": self.llm_service.provider,
                    "original_message": patient_message[:100],  # Referência
                },
            }

            self.rabbitmq.publish(Config.QUEUE_FROM_AI, response_payload)
            logger.info(f"✅ Resposta publicada em {Config.QUEUE_FROM_AI}")

            # Confirma processamento
            self.rabbitmq.ack_message(method.delivery_tag)

        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
            # Rejeita sem requeue (vai para DLQ)
            self.rabbitmq.nack_message(method.delivery_tag, requeue=False)

        except Exception as e:
            logger.error(f"Erro ao processar mensagem: {e}", exc_info=True)
            # Tenta novamente (requeue=True)
            self.rabbitmq.nack_message(method.delivery_tag, requeue=True)

    def _fetch_conversation_history(self, conversation_id: str):
        """
        Busca histórico da conversa via API do backend
        
        TODO: Implementar quando necessário para contexto
        Por enquanto, IA responde sem histórico (stateless)
        """
        # import requests
        # response = requests.get(f"{BACKEND_URL}/chat/conversations/{conversation_id}/messages")
        # ...
        return []

    def stop(self):
        """Para o consumer gracefully"""
        logger.info("Encerrando AIConsumer...")
        self.rabbitmq.stop_consuming()
        self.rabbitmq.close()
