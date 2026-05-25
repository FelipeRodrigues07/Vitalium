import { api } from '@/services/api/api';

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'DOCTOR' | 'PATIENT' | 'NURSE' | 'CAREGIVER' | 'ADMIN';
    password: string;
    isActive: boolean;
}

export interface CreatedUserModel {
    id: string; 
    email: string;
    firstName: string; 
    lastName: string;
    phone: string;
    avatar: string | null;
    role: string;
    password: string; 
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const CreateUserService = {
    createUser: async (
        userData: CreateUserPayload
    ): Promise<CreatedUserModel> => {
        try {
            const response = await api.post('/users', userData);
            
            return response.data; 

        } catch (error) {
            console.error('Falha ao criar usuário base:', error);
            throw error;
        }
    },
};