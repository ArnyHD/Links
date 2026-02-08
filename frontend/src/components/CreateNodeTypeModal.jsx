import { useState } from 'react';
import './CreateNodeTypeModal.css';

function CreateNodeTypeModal({ isOpen, onClose, onSuccess, domainId }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#667eea',
    icon: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'name' && !slugEdited) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    if (name === 'slug') {
      setSlugEdited(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Название обязательно');
      return;
    }

    if (!formData.slug.trim()) {
      setError('Slug обязателен');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const nodeTypeData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        icon: formData.icon.trim() || undefined,
        is_active: formData.is_active,
        domain_id: domainId,
      };

      await onSuccess(nodeTypeData);
      handleClose();
    } catch (err) {
      console.error('Failed to create node type:', err);
      setError(err.response?.data?.message || 'Не удалось создать тип узла');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#667eea',
      icon: '',
      is_active: true,
    });
    setError(null);
    setSlugEdited(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Создать тип узла</h3>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label required">
              Название
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Введите название типа узла"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug" className="form-label required">
              Slug
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
            <label htmlFor="description" className="form-label">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Описание типа узла (опционально)"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color" className="form-label">
                Цвет
              </label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="form-color-input"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={handleChange}
                  name="color"
                  className="form-input form-color-text"
                  placeholder="#667eea"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="icon" className="form-label">
                Иконка (emoji)
              </label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="form-input"
                placeholder="📋"
                maxLength="2"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span>Активный</span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateNodeTypeModal;
