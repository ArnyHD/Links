import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { domainsService } from '../services/domains';
import DomainCard from '../components/DomainCard';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchDomains();

    // Show success message if redirected after domain creation
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  const handleOpenDomain = (domainId) => {
    navigate(`/domains/${domainId}/edit`);
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
            <div className="page-title-section">
              <h2>Домены знаний</h2>
              <p className="page-description">
                Список доступных доменов для работы с графами знаний
              </p>
            </div>
            <button
              className="create-button"
              onClick={() => navigate('/domains/create')}
            >
              <span className="create-icon">+</span>
              Создать домен
            </button>
          </div>

          {successMessage && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

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
                <DomainCard
                  key={domain.id}
                  domain={domain}
                  onOpen={handleOpenDomain}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
