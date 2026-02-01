import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { domainsService } from '../services/domains';
import './Home.css';

function Home() {
  const { user, logout } = useAuth();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await domainsService.getAllDomains();
      setDomains(response.data || []);
    } catch (err) {
      console.error('Failed to fetch domains:', err);
      setError('Не удалось загрузить домены. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <h1>Links</h1>
          <div className="user-section">
            <div className="user-info">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="user-avatar"
                />
              )}
              <span className="user-name">{user?.name || user?.email}</span>
            </div>
            <button className="logout-button" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h2>Домены знаний</h2>
            <p className="page-description">
              Список доступных доменов для работы с графами знаний
            </p>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Загрузка доменов...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchDomains} className="retry-button">
                Попробовать снова
              </button>
            </div>
          )}

          {!loading && !error && domains.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Доменов пока нет</h3>
              <p>Создайте первый домен для начала работы</p>
            </div>
          )}

          {!loading && !error && domains.length > 0 && (
            <div className="domains-grid">
              {domains.map((domain) => (
                <div key={domain.id} className="domain-card">
                  <div className="domain-header">
                    <h3>{domain.name}</h3>
                    <span className={`status-badge ${domain.is_active ? 'active' : 'inactive'}`}>
                      {domain.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>

                  <p className="domain-description">
                    {domain.description || 'Описание отсутствует'}
                  </p>

                  <div className="domain-meta">
                    <div className="meta-item">
                      <span className="meta-label">Создатель:</span>
                      <span className="meta-value">
                        {domain.creator?.username || 'Неизвестно'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Доступ:</span>
                      <span className="meta-value">
                        {domain.is_public ? 'Публичный' : 'Приватный'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Создан:</span>
                      <span className="meta-value">
                        {new Date(domain.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  <div className="domain-actions">
                    <button className="action-button primary">
                      Открыть
                    </button>
                    <button className="action-button secondary">
                      Подробнее!
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
