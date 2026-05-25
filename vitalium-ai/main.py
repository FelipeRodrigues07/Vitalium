"""
Vitalium AI Service
Microserviço de IA para processamento de mensagens de chat

Autor: Vitalium Team
Versão: 1.0.0
"""
import logging
import colorlog
import signal
import sys
from config import Config
from consumers.ai_consumer import AIConsumer

# ─── Configuração de Logging ──────────────────────────────

def setup_logging():
    """Configura logging colorido"""
    handler = colorlog.StreamHandler()
    handler.setFormatter(
        colorlog.ColoredFormatter(
            "%(log_color)s%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
            log_colors={
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "red,bg_white",
            },
        )
    )

    logger = logging.getLogger()
    logger.addHandler(handler)
    logger.setLevel(getattr(logging, Config.LOG_LEVEL))


# ─── Main ─────────────────────────────────────────────────

def main():
    """Entry point do serviço"""
    setup_logging()
    logger = logging.getLogger(__name__)

    logger.info("=" * 60)
    logger.info("🚀 Vitalium AI Service")
    logger.info("=" * 60)

    # Valida configurações
    try:
        Config.validate()
        logger.info("✅ Configurações validadas")
    except ValueError as e:
        logger.error(f"❌ {e}")
        sys.exit(1)

    # Inicializa consumer
    consumer = AIConsumer()

    # Graceful shutdown
    def signal_handler(sig, frame):
        logger.info(f"\n⚠️ Sinal {sig} recebido, encerrando...")
        consumer.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Inicia serviço
    try:
        consumer.start()
    except KeyboardInterrupt:
        logger.info("Serviço interrompido pelo usuário")
    except Exception as e:
        logger.error(f"Erro fatal: {e}", exc_info=True)
        sys.exit(1)
    finally:
        consumer.stop()
        logger.info("👋 Serviço encerrado")


if __name__ == "__main__":
    main()
