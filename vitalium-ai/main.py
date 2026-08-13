"""
Vitalium AI Service
Análise de sintomas relatados pelo paciente (relatório para o médico)
"""
import logging

import colorlog
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from config import Config
from services.symptom_report_service import SymptomReportService

app = FastAPI(
    title="Vitalium AI",
    description="Serviço de análise de sintomas do paciente",
    version="2.0.0",
)

report_service = SymptomReportService()


class SymptomItem(BaseModel):
    description: str = Field(..., min_length=1)
    createdAt: str


class SymptomMonthlyReportRequest(BaseModel):
    patientId: str
    patientName: str = "Paciente"
    month: str = Field(..., description="YYYY-MM")
    symptoms: list[SymptomItem] = Field(default_factory=list)


class SymptomMonthlyReportResponse(BaseModel):
    summary: str
    source: str
    symptomCount: int
    patientId: str
    month: str


def setup_logging():
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
    logger.handlers.clear()
    logger.addHandler(handler)
    logger.setLevel(getattr(logging, Config.LOG_LEVEL, logging.INFO))


@app.on_event("startup")
def on_startup():
    setup_logging()
    logger = logging.getLogger(__name__)
    Config.validate()
    logger.info("Vitalium AI iniciado — modo análise de sintomas")
    if Config.has_llm_credentials():
        logger.info("LLM habilitado (%s)", Config.AI_PROVIDER)
    else:
        logger.warning("LLM sem credenciais — fallback local ativo")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "vitalium-ai",
        "mode": "symptom-reports",
        "llmConfigured": Config.has_llm_credentials(),
        "provider": Config.AI_PROVIDER,
    }


@app.post(
    "/reports/symptoms-monthly",
    response_model=SymptomMonthlyReportResponse,
)
def create_symptom_monthly_report(payload: SymptomMonthlyReportRequest):
    logger = logging.getLogger(__name__)

    if len(payload.month) != 7 or payload.month[4] != "-":
        raise HTTPException(
            status_code=400,
            detail="month deve estar no formato YYYY-MM",
        )

    logger.info(
        "Gerando relatório | patient=%s | month=%s | symptoms=%s",
        payload.patientId,
        payload.month,
        len(payload.symptoms),
    )

    result = report_service.generate(
        patient_name=payload.patientName,
        month=payload.month,
        symptoms=[item.model_dump() for item in payload.symptoms],
    )

    return SymptomMonthlyReportResponse(
        summary=result["summary"],
        source=result["source"],
        symptomCount=result["symptomCount"],
        patientId=payload.patientId,
        month=payload.month,
    )


def main():
    setup_logging()
    uvicorn.run(
        "main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=False,
        log_level=Config.LOG_LEVEL.lower(),
    )


if __name__ == "__main__":
    main()
