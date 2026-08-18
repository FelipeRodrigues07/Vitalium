import { api } from "@/services/api/api"

export interface DoctorUnitModel {
  id: string
  name: string
  type?: string
}

export interface DoctorDetailModel {
  id: string
  userId: string
  crm: string
  crmState: boolean
  isActive: boolean
  units?: DoctorUnitModel[]
  user?: {
    firstName: string
    lastName: string
    email: string
  }
}

export const GetDoctorByIdService = {
  getById: async (doctorId: string): Promise<DoctorDetailModel> => {
    const response = await api.get<DoctorDetailModel>(`/doctors/${doctorId}`)
    return response.data
  },
  getMine: async (): Promise<DoctorDetailModel> => {
    const response = await api.get<DoctorDetailModel>('/doctors/me')
    return response.data
  },
}
