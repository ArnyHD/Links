import api from './api';

export const domainsService = {
  /**
   * Получить все домены
   */
  async getAllDomains() {
    const response = await api.get('/domains');
    return response.data;
  },

  /**
   * Получить один домен по ID
   */
  async getDomain(id) {
    const response = await api.get(`/domains/${id}`);
    return response.data;
  },

  /**
   * Создать новый домен
   */
  async createDomain(domainData) {
    const response = await api.post('/domains', domainData);
    return response.data;
  },

  /**
   * Обновить домен
   */
  async updateDomain(id, domainData) {
    const response = await api.put(`/domains/${id}`, domainData);
    return response.data;
  },

  /**
   * Удалить домен
   */
  async deleteDomain(id) {
    const response = await api.delete(`/domains/${id}`);
    return response.data;
  },
};
