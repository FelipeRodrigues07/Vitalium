"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Activity, Loader2, ImageIcon } from "lucide-react"
import {
  getSymptomImageUrl,
  symptomLogsApi,
  type SymptomLog,
} from "@/services/api/symptom-logs"

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export function PatientSymptomLogs() {
  const [logs, setLogs] = useState<SymptomLog[]>([])
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await symptomLogsApi.listMine()
      setLogs(list)
    } catch {
      setError("Não foi possível carregar seus relatos.")
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = description.trim()
    if (trimmed.length < 3) {
      setError("Descreva o sintoma com pelo menos 3 caracteres.")
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const created = await symptomLogsApi.create(trimmed, imageFile)
      setLogs((prev) => [created, ...prev])
      setDescription("")
      setImageFile(null)
      setSuccess("Sintoma registrado com sucesso.")
    } catch {
      setError("Não foi possível registrar o sintoma. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Novo relato</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptom-description">Como você está se sentindo?</Label>
              <Textarea
                id="symptom-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: Dor de cabeça desde a manhã, piora ao olhar para a luz."
                rows={4}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptom-image">Foto (opcional)</Label>
              <Input
                id="symptom-image"
                type="file"
                accept="image/*"
                disabled={saving}
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              {imageFile && (
                <p className="text-xs text-muted-foreground">{imageFile.name}</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-700">{success}</p>}

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar sintoma
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seus relatos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center">
              <Activity className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nenhum sintoma registrado ainda.
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
