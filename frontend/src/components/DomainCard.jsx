import { useNavigate } from 'react-router-dom';
import './DomainCard.css';

function DomainCard({ domain, onOpen }) {
  const navigate = useNavigate();
  return (
    <div className="domain-card">
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
        <button
          className="action-button primary"
          onClick={() => onOpen(domain.id)}
        >
          Открыть
        </button>
        <button
          className="action-button secondary"
          onClick={() => navigate(`/domains/${domain.id}/details`)}
        >
          Подробнее!
        </button>
      </div>
    </div>
  );
}

export default DomainCard;
