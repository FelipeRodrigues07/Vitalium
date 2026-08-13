"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity, ImageIcon, Loader2, Sparkles } from "lucide-react"
import {
  getLinkedPersonDisplayName,
  patientDoctorApi,
  type PatientDoctorLink,
} from "@/services/api/patient-doctors/patientsByDoctor"
import {
  getSymptomImageUrl,
  symptomLogsApi,
  type SymptomLog,
  type SymptomMonthlyReport,
} from "@/services/api/symptom-logs"
import { useAuth } from "@/providers/auth-provider"

const MONTH_OPTIONS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
]

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function currentMonthValue(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function buildYearOptions(): string[] {
  const current = new Date().getFullYear()
  return [String(current), String(current - 1), String(current - 2)]
}

function formatMonthLabel(monthValue: string): string {
  const [year, month] = monthValue.split("-")
  const label =
    MONTH_OPTIONS.find((item) => item.value === month)?.label ?? month
  return `${label} de ${year}`
}

export function DoctorPatientSymptoms() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const patientFromQuery = searchParams.get("patientId")

  const [patients, setPatients] = useState<PatientDoctorLink[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [logs, setLogs] = useState<SymptomLog[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportMonth, setReportMonth] = useState(currentMonthValue())
  const [report, setReport] = useState<SymptomMonthlyReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  const reportYear = reportMonth.slice(0, 4)
  const reportMonthOnly = reportMonth.slice(5, 7)
  const yearOptions = useMemo(() => buildYearOptions(), [])

  const patientNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const link of patients) {
      map.set(
        link.patientId,
        getLinkedPersonDisplayName(link.patient, "Paciente"),
      )
    }
    return map
  }, [patients])

  const loadPatients = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoadingPatients(true)
      setError(null)
      const links = await patientDoctorApi.listPatientsByUserDoctor(user.id)
      setPatients(links)

      const preferred =
        (patientFromQuery &&
          links.some((link) => link.patientId === patientFromQuery) &&
          patientFromQuery) ||
        links[0]?.patientId ||
        ""
      setSelectedPatientId(preferred)
    } catch {
      setError("Não foi possível carregar seus pacientes.")
      setPatients([])
    } finally {
      setLoadingPatients(false)
    }
  }, [user?.id, patientFromQuery])

  const loadLogs = useCallback(async (patientId: string) => {
    if (!patientId) {
      setLogs([])
      return
    }

    try {
      setLoadingLogs(true)
      setError(null)
      const list = await symptomLogsApi.listByPatient(patientId)
      setLogs(list)
    } catch {
      setError("Não foi possível carregar os sintomas deste paciente.")
      setLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }, [])

  useEffect(() => {
    void loadPatients()
  }, [loadPatients])

  useEffect(() => {
    if (selectedPatientId) {
      void loadLogs(selectedPatientId)
      setReport(null)
      setReportError(null)
    }
  }, [selectedPatientId, loadLogs])

  const handleGenerateReport = async () => {
    if (!selectedPatientId) return

    try {
      setLoadingReport(true)
      setReportError(null)
      const result = await symptomLogsApi.monthlyReport(
        selectedPatientId,
        reportMonth,
      )
      setReport(result)
    } catch {
      setReport(null)
      setReportError("Não foi possível gerar o relatório. Tente novamente.")
    } finally {
      setLoadingReport(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPatients ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando pacientes...
            </div>
          ) : patients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Você ainda não tem pacientes vinculados.
            </p>
          ) : (
            <Select
              value={selectedPatientId}
              onValueChange={setSelectedPatientId}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((link) => (
                  <SelectItem key={link.patientId} value={link.patientId}>
                    {getLinkedPersonDisplayName(link.patient, "Paciente")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedPatientId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relatório do mês</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Mês</p>
                <Select
                  value={reportMonthOnly}
                  onValueChange={(month) =>
                    setReportMonth(`${reportYear}-${month}`)
                  }
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ano</p>
                <Select
                  value={reportYear}
                  onValueChange={(year) =>
                    setReportMonth(`${year}-${reportMonthOnly}`)
                  }
                >
                  <SelectTrigger className="w-full sm:w-28">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerateReport}
                disabled={loadingReport}
                className="gap-2"
              >
                {loadingReport ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Gerar análise
              </Button>
            </div>

            {reportError && (
              <p className="text-sm text-destructive">{reportError}</p>
            )}

            {report && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  {report.patientName} · {formatMonthLabel(report.month)} ·{" "}
                  {report.symptomCount} relato(s)
                  {report.source === "llm" ? " · IA" : " · resumo local"}
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {report.summary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedPatientId
              ? `Sintomas — ${patientNameById.get(selectedPatientId) ?? "Paciente"}`
              : "Sintomas"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {loadingLogs ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando sintomas...
            </div>
          ) : !selectedPatientId ? (
            <p className="text-sm text-muted-foreground">
              Selecione um paciente para ver os relatos.
            </p>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center">
              <Activity className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Este paciente ainda não registrou sintomas.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const imageSrc = getSymptomImageUrl(log.imageUrl)
              return (
                <div
                  key={log.id}
                  className="rounded-lg border border-border p-4 space-y-2"
                >
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {log.description}
                  </p>
                  {imageSrc && (
                    <a
                      href={imageSrc}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:underline"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Ver imagem
                    </a>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
