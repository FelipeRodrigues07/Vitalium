import { api } from '@/services/api/api';

export interface SecretaryUnitModel {
  id: string;
  name: string;
  type?: string;
}

export interface SecretaryDetailModel {
  id: string;
  userId: string;
  isActive: boolean;
  units?: SecretaryUnitModel[];
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const GetSecretaryService = {
  getMine: async (): Promise<SecretaryDetailModel> => {
    const response = await api.get<SecretaryDetailModel>('/secretaries/me');
    return response.data;
  },
};

export interface CreateSecretaryPayload {
  userId: string;
  isActive?: boolean;
}

export interface CreatedSecretaryModel {
  id: string;
  userId: string;
  isActive: boolean;
}

export const CreateSecretaryService = {
  createSecretary: async (
    payload: CreateSecretaryPayload,
  ): Promise<CreatedSecretaryModel> => {
    const response = await api.post<CreatedSecretaryModel>(
      '/secretaries',
      payload,
    );
    return response.data;
  },
};

export interface CreateSecretaryUnitPayload {
  secretaryId: string;
  unitId: string;
  isPrimary?: boolean;
}

export const CreateSecretaryUnitService = {
  createSecretaryUnit: async (payload: CreateSecretaryUnitPayload) => {
    const response = await api.post('/secretary-units', payload);
    return response.data;
  },
};
