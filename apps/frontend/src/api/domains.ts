import apiClient from './client';

export interface Domain {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDomainDto {
  name: string;
  description?: string;
  isPublic?: boolean;
  settings?: Record<string, any>;
}

export const domainsApi = {
  getAll: async (isPublic?: boolean) => {
    const params = isPublic !== undefined ? { public: isPublic } : {};
    const response = await apiClient.get<Domain[]>('/domains', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Domain>(`/domains/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Domain>(`/domains/slug/${slug}`);
    return response.data;
  },

  create: async (data: CreateDomainDto) => {
    const response = await apiClient.post<Domain>('/domains', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateDomainDto>) => {
    const response = await apiClient.patch<Domain>(`/domains/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/domains/${id}`);
  },
};
