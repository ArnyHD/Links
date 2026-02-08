import api from './api';

export const nodesService = {
  /**
   * Получить все узлы с фильтрами
   */
  async getAllNodes(filters = {}) {
    const params = new URLSearchParams();
    if (filters.domain_id) params.append('domain_id', filters.domain_id);
    if (filters.type_id) params.append('type_id', filters.type_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.tags) params.append('tags', filters.tags);

    const url = `/nodes${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Получить один узел по ID
   */
  async getNode(id) {
    const response = await api.get(`/nodes/${id}`);
    return response.data;
  },

  /**
   * Получить узел по slug
   */
  async getNodeBySlug(slug) {
    const response = await api.get(`/nodes/by-slug/${slug}`);
    return response.data;
  },

  /**
   * Получить узлы по домену
   */
  async getNodesByDomain(domainId, status = null) {
    const url = status
      ? `/nodes/by-domain/${domainId}?status=${status}`
      : `/nodes/by-domain/${domainId}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Получить узлы по типу
   */
  async getNodesByType(typeId, status = null) {
    const url = status
      ? `/nodes/by-type/${typeId}?status=${status}`
      : `/nodes/by-type/${typeId}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Поиск узлов
   */
  async searchNodes(query) {
    const response = await api.get(`/nodes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Создать новый узел
   */
  async createNode(nodeData) {
    const response = await api.post('/nodes', nodeData);
    return response.data;
  },

  /**
   * Обновить узел
   */
  async updateNode(id, nodeData) {
    const response = await api.put(`/nodes/${id}`, nodeData);
    return response.data;
  },

  /**
   * Опубликовать узел
   */
  async publishNode(id) {
    const response = await api.patch(`/nodes/${id}/publish`);
    return response.data;
  },

  /**
   * Архивировать узел
   */
  async archiveNode(id) {
    const response = await api.patch(`/nodes/${id}/archive`);
    return response.data;
  },

  /**
   * Удалить узел
   */
  async deleteNode(id) {
    const response = await api.delete(`/nodes/${id}`);
    return response.data;
  },
};
