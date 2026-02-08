import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { domainsService } from '../services/domains';
import { useAuth } from '../context/AuthContext';
import './CreateDomain.css';

function EditDomain() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingDomain, setLoadingDomain] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_public: true,
    is_active: true,
  });
  const [originalSlug, setOriginalSlug] = useState('');

  useEffect(() => {
    fetchDomain();
  }, [id]);

  const fetchDomain = async () => {
    try {
      setLoadingDomain(true);
      setError(null);
      const response = await domainsService.getDomain(id);

      if (response.success && response.data) {
        const domain = response.data;
        setFormData({
          name: domain.name || '',
          slug: domain.slug || '',
          description: domain.description || '',
          is_public: domain.is_public !== undefined ? domain.is_public : true,
          is_active: domain.is_active !== undefined ? domain.is_active : true,
        });
        setOriginalSlug(domain.slug || '');
      }
    } catch (err) {
      console.error('Failed to fetch domain:', err);
      setError('Не удалось загрузить домен. Возможно, он не существует.');
    } finally {
      setLoadingDomain(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Название и slug обязательны для заполнения');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await domainsService.updateDomain(id, formData);

      if (response.success) {
        navigate('/', { state: { message: 'Домен успешно обновлен' } });
      }
    } catch (err) {
      console.error('Failed to update domain:', err);
      setError(
        err.response?.data?.message ||
        'Не удалось обновить домен. Проверьте данные и попробуйте снова.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот домен? Это действие необратимо.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await domainsService.deleteDomain(id);

      if (response.success) {
        navigate('/', { state: { message: 'Домен успешно удален' } });
      }
    } catch (err) {
      console.error('Failed to delete domain:', err);
      setError(
        err.response?.data?.message ||
        'Не удалось удалить домен. Возможно, у вас нет прав на это действие.'
      );
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loadingDomain) {
    return (
      <div className="create-domain-container">
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
          <div className="form-wrapper">
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Загрузка домена...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && loadingDomain === false && !formData.name) {
    return (
      <div className="create-domain-container">
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
          <div className="form-wrapper">
            <div className="error-state">
              <div className="error-icon-large">⚠️</div>
              <h2>{error}</h2>
              <button onClick={() => navigate('/')} className="button button-primary">
                Вернуться на главную
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="create-domain-container">
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
        <div className="form-wrapper">
          <div className="form-header">
            <h2>Редактирование домена</h2>
            <p className="form-description">
              Измените информацию о домене знаний
            </p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="domain-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label required">
                Название домена
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Например: Физика альтернативных теорий"
                className="form-input"
                required
                disabled={loading}
              />
              <span className="form-hint">
                Основное название домена, отображаемое пользователям
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="slug" className="form-label required">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="physics-alternative-theories"
                className="form-input"
                pattern="[a-z0-9-]+"
                required
                disabled={loading}
              />
              <span className="form-hint">
                Уникальный идентификатор для URL (только латиница, цифры и дефисы)
                {originalSlug && originalSlug !== formData.slug && (
                  <span className="form-warning"> • Изменение slug может сломать существующие ссылки</span>
                )}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Краткое описание домена..."
                className="form-textarea"
                rows="4"
                disabled={loading}
              />
              <span className="form-hint">
                Опишите цель и содержание этого домена знаний
              </span>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleChange}
                    className="form-checkbox"
                    disabled={loading}
                  />
                  <span className="checkbox-text">
                    <strong>Публичный домен</strong>
                    <span className="checkbox-hint">
                      Домен доступен для просмотра всем пользователям
                    </span>
                  </span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="form-checkbox"
                    disabled={loading}
                  />
                  <span className="checkbox-text">
                    <strong>Активный домен</strong>
                    <span className="checkbox-hint">
                      Домен активен и доступен для работы
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleDelete}
                className="button button-danger"
                disabled={loading}
              >
                {loading ? 'Удаление...' : 'Удалить домен'}
              </button>
              <div className="form-actions-right">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="button button-secondary"
                  disabled={loading}
                >
                  Отменить
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить изменения'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditDomain;
