import { api } from "@/services/api/api"

export interface SymptomLog {
  id: string
  patientId: string
  description: string
  imageUrl?: string
  imageFileName?: string
  imageMimeType?: string
  createdAt: string
}

export interface SymptomMonthlyReport {
  patientId: string
  patientName: string
  month: string
  summary: string
  source: string
  symptomCount: number
}

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "")
}

export function getSymptomImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl
  }
  const base = getApiBaseUrl()
  return base ? `${base}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}` : imageUrl
}

export const symptomLogsApi = {
  create: async (
    description: string,
    imageFile?: File | null,
  ): Promise<SymptomLog> => {
    const trimmed = description.trim()

    if (imageFile) {
      const formData = new FormData()
      formData.append("description", trimmed)
      formData.append("image", imageFile)

      const { data } = await api.post<SymptomLog>("/symptom-logs", formData, {
        transformRequest: [
          (body, headers) => {
            if (headers && typeof headers === "object") {
              delete (headers as Record<string, unknown>)["Content-Type"]
            }
            return body
          },
        ],
      })
      return data
    }

    const { data } = await api.post<SymptomLog>("/symptom-logs", {
      description: trimmed,
    })
    return data
  },

  listMine: (): Promise<SymptomLog[]> =>
    api.get<SymptomLog[]>("/symptom-logs").then((r) => r.data),

  listByPatient: (patientId: string): Promise<SymptomLog[]> =>
    api
      .get<SymptomLog[]>(`/symptom-logs/patient/${patientId}`)
      .then((r) => r.data),

  monthlyReport: (
    patientId: string,
    month?: string,
  ): Promise<SymptomMonthlyReport> =>
    api
      .post<SymptomMonthlyReport>(
        `/symptom-logs/patient/${patientId}/monthly-report`,
        {},
        { params: month ? { month } : undefined },
      )
      .then((r) => r.data),
}
