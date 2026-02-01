import api from './api';

export const domainsService = {
  /**
   * Получить все домены
   */
  async getAllDomains() {
    const response = await api.get('/domains');
    return response.data;
  },
};
