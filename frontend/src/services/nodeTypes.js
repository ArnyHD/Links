import api from './api';

export const nodeTypesService = {
  /**
   * Получить все типы узлов
   */
  async getAllNodeTypes(domainId = null) {
    const url = domainId ? `/node-types?domain_id=${domainId}` : '/node-types';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Получить один тип узла по ID
   */
  async getNodeType(id) {
    const response = await api.get(`/node-types/${id}`);
    return response.data;
  },

  /**
   * Получить типы узлов по домену
   */
  async getNodeTypesByDomain(domainId) {
    const response = await api.get(`/node-types/by-domain/${domainId}`);
    return response.data;
  },

  /**
   * Создать новый тип узла
   */
  async createNodeType(nodeTypeData) {
    const response = await api.post('/node-types', nodeTypeData);
    return response.data;
  },

  /**
   * Обновить тип узла
   */
  async updateNodeType(id, nodeTypeData) {
    const response = await api.put(`/node-types/${id}`, nodeTypeData);
    return response.data;
  },

  /**
   * Удалить тип узла
   */
  async deleteNodeType(id) {
    const response = await api.delete(`/node-types/${id}`);
    return response.data;
  },
};
