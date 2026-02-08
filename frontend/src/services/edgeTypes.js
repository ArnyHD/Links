import api from './api';

export const edgeTypesService = {
  /**
   * Получить все типы рёбер
   */
  async getAllEdgeTypes(domainId = null) {
    const url = domainId ? `/edge-types?domain_id=${domainId}` : '/edge-types';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Получить один тип ребра по ID
   */
  async getEdgeType(id) {
    const response = await api.get(`/edge-types/${id}`);
    return response.data;
  },

  /**
   * Получить типы рёбер по домену
   */
  async getEdgeTypesByDomain(domainId) {
    const response = await api.get(`/edge-types/by-domain/${domainId}`);
    return response.data;
  },

  /**
   * Создать новый тип ребра
   */
  async createEdgeType(edgeTypeData) {
    const response = await api.post('/edge-types', edgeTypeData);
    return response.data;
  },

  /**
   * Обновить тип ребра
   */
  async updateEdgeType(id, edgeTypeData) {
    const response = await api.put(`/edge-types/${id}`, edgeTypeData);
    return response.data;
  },

  /**
   * Удалить тип ребра
   */
  async deleteEdgeType(id) {
    const response = await api.delete(`/edge-types/${id}`);
    return response.data;
  },
};
