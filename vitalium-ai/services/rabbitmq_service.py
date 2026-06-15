"""
Serviço RabbitMQ
Gerencia conexão, consumers e producers para as filas do sistema
"""
import json
import logging
import pika
from typing import Callable
from tenacity import retry, stop_after_attempt, wait_exponential
from config import Config

logger = logging.getLogger(__name__)


class RabbitMQService:
    """Serviço para comunicação com RabbitMQ"""

    def __init__(self):
        self.connection = None
        self.channel = None
        self.connect()

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        reraise=True,
    )
    def connect(self):
        """Conecta ao RabbitMQ com retry exponencial"""
        try:
            logger.info(f"Conectando ao RabbitMQ: {Config.RABBITMQ_URL}")
            
            parameters = pika.URLParameters(Config.RABBITMQ_URL)
            parameters.heartbeat = 600  # Heartbeat de 10 minutos
            parameters.blocked_connection_timeout = 300
            
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declara as filas (idempotente)
            self._declare_queues()
            
            logger.info("✅ Conectado ao RabbitMQ com sucesso")
        except Exception as e:
            logger.error(f"Erro ao conectar ao RabbitMQ: {e}")
            raise

    def _declare_queues(self):
        """Verifica que as filas necessárias existem (declaradas pelo backend)"""
        queues = [Config.QUEUE_TO_AI, Config.QUEUE_FROM_AI]

        for queue in queues:
            self.channel.queue_declare(
                queue=queue,
                passive=True,  # Apenas verifica existência; não recria com args diferentes
            )
            logger.info(f"Fila verificada: {queue}")

    def consume(self, queue: str, callback: Callable):
        """
        Consome mensagens de uma fila
        
        Args:
            queue: Nome da fila
            callback: Função callback(ch, method, properties, body)
        """
        try:
            # Prefetch de 1: processa uma mensagem por vez
            self.channel.basic_qos(prefetch_count=1)
            
            self.channel.basic_consume(
                queue=queue,
                on_message_callback=callback,
                auto_ack=False,  # ACK manual para garantir processamento
            )
            
            logger.info(f"🎧 Aguardando mensagens em '{queue}'...")
            self.channel.start_consuming()
            
        except KeyboardInterrupt:
            logger.info("Encerrando consumer...")
            self.stop_consuming()
        except Exception as e:
            logger.error(f"Erro no consumer: {e}", exc_info=True)
            raise

    def publish(self, queue: str, message: dict):
        """
        Publica mensagem em uma fila
        
        Args:
            queue: Nome da fila
            message: Dicionário com payload
        """
        try:
            self.channel.basic_publish(
                exchange="",
                routing_key=queue,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Mensagem persistente
                    content_type="application/json",
                ),
            )
            logger.debug(f"Mensagem publicada em '{queue}': {message.get('conversationId', 'N/A')}")
        except Exception as e:
            logger.error(f"Erro ao publicar mensagem: {e}", exc_info=True)
            # Tenta reconectar
            self.connect()
            raise

    def ack_message(self, delivery_tag):
        """Confirma processamento de mensagem"""
        try:
            self.channel.basic_ack(delivery_tag=delivery_tag)
        except Exception as e:
            logger.error(f"Erro ao fazer ACK: {e}")

    def nack_message(self, delivery_tag, requeue=True):
        """Rejeita mensagem (envia para DLQ se requeue=False)"""
        try:
            self.channel.basic_nack(delivery_tag=delivery_tag, requeue=requeue)
        except Exception as e:
            logger.error(f"Erro ao fazer NACK: {e}")

    def stop_consuming(self):
        """Para de consumir mensagens"""
        if self.channel:
            self.channel.stop_consuming()

    def close(self):
        """Fecha conexão com RabbitMQ"""
        try:
            if self.channel and self.channel.is_open:
                self.channel.close()
            if self.connection and self.connection.is_open:
                self.connection.close()
            logger.info("Conexão RabbitMQ fechada")
        except Exception as e:
            logger.error(f"Erro ao fechar conexão: {e}")
