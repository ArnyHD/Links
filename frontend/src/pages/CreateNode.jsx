import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { nodesService } from '../services/nodes';
import { domainsService } from '../services/domains';
import { nodeTypesService } from '../services/nodeTypes';
import './CreateNode.css';

function CreateNode() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    cover_image: '',
    tags: '',
    status: 'draft',
    domain_id: '',
    type_id: '',
  });

  const [domains, setDomains] = useState([]);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    if (formData.domain_id) {
      fetchNodeTypes(formData.domain_id);
    } else {
      setNodeTypes([]);
      setFormData(prev => ({ ...prev, type_id: '' }));
    }
  }, [formData.domain_id]);

  const fetchDomains = async () => {
    try {
      setLoadingData(true);
      const response = await domainsService.getAllDomains();
      if (response.success) {
        setDomains(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch domains:', err);
      setError('Не удалось загрузить список доменов');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchNodeTypes = async (domainId) => {
    try {
      const response = await nodeTypesService.getNodeTypesByDomain(domainId);
      if (response.success) {
        setNodeTypes(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch node types:', err);
      setError('Не удалось загрузить типы узлов');
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'title' && !slugEdited) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === 'slug') {
      setSlugEdited(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Название обязательно');
      return;
    }

    if (!formData.slug.trim()) {
      setError('Slug обязателен');
      return;
    }

    if (!formData.domain_id) {
      setError('Выберите домен');
      return;
    }

    if (!formData.type_id) {
      setError('Выберите тип узла');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const nodeData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim() || undefined,
        cover_image: formData.cover_image.trim() || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        status: formData.status,
        domain_id: formData.domain_id,
        type_id: formData.type_id,
      };

      const response = await nodesService.createNode(nodeData);

      if (response.success) {
        navigate('/', {
          state: {
            message: `Узел "${formData.title}" успешно создан!`
          }
        });
      }
    } catch (err) {
      console.error('Failed to create node:', err);
      setError(err.response?.data?.message || 'Не удалось создать узел');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loadingData) {
    return (
      <div className="create-node-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-node-container">
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
        <div className="form-container">
          <div className="form-header">
            <h2>Создать новый узел</h2>
            <p className="form-subtitle">Заполните информацию о новом узле графа знаний</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="node-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="domain_id" className="form-label required">
                  Домен
                </label>
                <select
                  id="domain_id"
                  name="domain_id"
                  value={formData.domain_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Выберите домен</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type_id" className="form-label required">
                  Тип узла
                </label>
                <select
                  id="type_id"
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={!formData.domain_id}
                >
                  <option value="">
                    {formData.domain_id ? 'Выберите тип узла' : 'Сначала выберите домен'}
                  </option>
                  {nodeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title" className="form-label required">
                Название
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="Введите название узла"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug" className="form-label required">
                Slug
                <span className="field-hint">URL-дружественный идентификатор</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="form-input"
                placeholder="url-friendly-slug"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="excerpt" className="form-label">
                Краткое описание
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Краткое описание узла (опционально)"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cover_image" className="form-label">
                URL изображения обложки
              </label>
              <input
                type="url"
                id="cover_image"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tags" className="form-label">
                  Теги
                  <span className="field-hint">Через запятую</span>
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="физика, теория, эксперимент"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Статус
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликован</option>
                  <option value="archived">Архивирован</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="button button-secondary"
                disabled={loading}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={loading}
              >
                {loading ? 'Создание...' : 'Создать узел'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateNode;
