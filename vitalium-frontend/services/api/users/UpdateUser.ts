import { api } from '@/services/api/api';
import type { UserRole } from '@/services/api/users/GetUsers';

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  role?: UserRole;
}

export interface UpdatedUserModel {
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

export const UpdateUserService = {
  updateUser: async (userId: string, payload: UpdateUserPayload): Promise<UpdatedUserModel> => {
    const response = await api.patch<UpdatedUserModel>(`/users/${userId}`, payload);
    return response.data;
  },
};
