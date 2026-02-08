import './NodeTypeCard.css';

function NodeTypeCard({ nodeType }) {
  return (
    <div className="nodetype-card">
      <div className="nodetype-header">
        <h3>{nodeType.name}</h3>
        <span className={`status-badge ${nodeType.is_active ? 'active' : 'inactive'}`}>
          {nodeType.is_active ? 'Активен' : 'Неактивен'}
        </span>
      </div>

      <p className="nodetype-description">
        {nodeType.description || 'Описание отсутствует'}
      </p>

      <div className="nodetype-meta">
        <div className="meta-item">
          <span className="meta-label">Slug:</span>
          <span className="meta-value">{nodeType.slug}</span>
        </div>
        {nodeType.color && (
          <div className="meta-item">
            <span className="meta-label">Цвет:</span>
            <span className="meta-value">
              <span
                className="color-badge"
                style={{ backgroundColor: nodeType.color }}
              ></span>
              {nodeType.color}
            </span>
          </div>
        )}
        <div className="meta-item">
          <span className="meta-label">Создан:</span>
          <span className="meta-value">
            {new Date(nodeType.created_at).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default NodeTypeCard;
