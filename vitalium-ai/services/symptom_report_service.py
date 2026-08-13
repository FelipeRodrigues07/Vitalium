"""
Geração de relatório mensal a partir dos relatos de sintomas do paciente.
"""
from __future__ import annotations

import logging
from collections import Counter
from typing import List

from config import Config
from services.llm_service import LLMService

logger = logging.getLogger(__name__)


class SymptomReportService:
    def __init__(self, llm_service: LLMService | None = None):
        self.llm = llm_service or LLMService()

    def generate(
        self,
        *,
        patient_name: str,
        month: str,
        symptoms: List[dict],
    ) -> dict:
        if not symptoms:
            summary = (
                f"Não há relatos de sintomas de {patient_name} no período {month}."
            )
            return {
                "summary": summary,
                "source": "local",
                "symptomCount": 0,
            }

        if Config.has_llm_credentials():
            try:
                summary = self._generate_with_llm(patient_name, month, symptoms)
                return {
                    "summary": summary.strip(),
                    "source": "llm",
                    "symptomCount": len(symptoms),
                }
            except Exception as error:
                logger.error(f"Falha no LLM, usando fallback: {error}", exc_info=True)

        summary = self._generate_fallback(patient_name, month, symptoms)
        return {
            "summary": summary,
            "source": "local",
            "symptomCount": len(symptoms),
        }

    def _generate_with_llm(
        self,
        patient_name: str,
        month: str,
        symptoms: List[dict],
    ) -> str:
        lines = []
        for index, item in enumerate(symptoms, start=1):
            created_at = item.get("createdAt", "")
            description = item.get("description", "").strip()
            lines.append(f"{index}. [{created_at}] {description}")

        user_message = (
            f"Paciente: {patient_name}\n"
            f"Período: {month}\n"
            f"Total de relatos: {len(symptoms)}\n\n"
            f"Relatos:\n" + "\n".join(lines)
        )

        return self.llm.generate_with_system(Config.SYSTEM_PROMPT, user_message)

    def _generate_fallback(
        self,
        patient_name: str,
        month: str,
        symptoms: List[dict],
    ) -> str:
        descriptions = [
            (item.get("description") or "").strip()
            for item in symptoms
            if (item.get("description") or "").strip()
        ]
        counter = Counter(descriptions)
        top = counter.most_common(5)

        top_lines = "\n".join(
            f"- {text} ({count}x)" for text, count in top
        ) or "- Sem descrições válidas"

        recent = descriptions[-3:]
        recent_lines = "\n".join(f"- {text}" for text in recent) or "- Nenhum"

        return (
            f"## Resumo\n"
            f"No período {month}, {patient_name} registrou {len(symptoms)} relato(s) de sintomas.\n\n"
            f"## Principais queixas\n"
            f"{top_lines}\n\n"
            f"## Relatos recentes\n"
            f"{recent_lines}\n\n"
            f"## Pontos de atenção\n"
            f"- Revisar evolução clínica com base nos relatos acima.\n"
            f"- Este resumo foi gerado localmente (sem LLM configurado)."
        )
