import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { domainsService } from '../services/domains';
import { useAuth } from '../context/AuthContext';
import './CreateDomain.css';

function CreateDomain() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_public: true,
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from name
    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
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

      const response = await domainsService.createDomain(formData);

      if (response.success) {
        navigate('/', { state: { message: 'Домен успешно создан' } });
      }
    } catch (err) {
      console.error('Failed to create domain:', err);
      setError(
        err.response?.data?.message ||
        'Не удалось создать домен. Проверьте данные и попробуйте снова.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

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
            <h2>Создание нового домена</h2>
            <p className="form-description">
              Заполните информацию о домене знаний
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
                    Создание...
                  </>
                ) : (
                  'Создать домен'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateDomain;
