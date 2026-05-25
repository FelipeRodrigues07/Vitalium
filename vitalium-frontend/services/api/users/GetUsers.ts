import { api } from '@/services/api/api';

export type UserRole = 'DOCTOR' | 'PATIENT' | 'NURSE' | 'ADMIN' | 'CAREGIVER';

export interface ListedUserModel {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  responsibleDoctorName?: string;
  responsibleDoctorCrm?: string;
}

export const GetUsersService = {
  getUsers: async (unitId?: string): Promise<ListedUserModel[]> => {
    const response = await api.get('/users', {
      params: unitId ? { unitId } : undefined,
    });
    return response.data;
  },
};
