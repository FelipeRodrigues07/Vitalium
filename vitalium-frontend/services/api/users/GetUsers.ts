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
}

export const GetUsersService = {
  getUsers: async (): Promise<ListedUserModel[]> => {
    const response = await api.get('/users');
    return response.data;
  },
};
