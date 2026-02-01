const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  /**
   * Перенаправить на Google OAuth
   */
  loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  /**
   * Сохранить токен и данные пользователя
   */
  saveAuthData(token, user) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Получить токен
   */
  getToken() {
    return localStorage.getItem('access_token');
  },

  /**
   * Получить данные пользователя
   */
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Выйти из системы
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};
