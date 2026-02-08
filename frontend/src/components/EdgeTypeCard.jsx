import './EdgeTypeCard.css';

function EdgeTypeCard({ edgeType }) {
  return (
    <div className="edgetype-card">
      <div className="edgetype-header">
        <h3>{edgeType.name}</h3>
        <span className={`status-badge ${edgeType.is_active ? 'active' : 'inactive'}`}>
          {edgeType.is_active ? 'Активен' : 'Неактивен'}
        </span>
      </div>

      <p className="edgetype-description">
        {edgeType.description || 'Описание отсутствует'}
      </p>

      <div className="edgetype-meta">
        <div className="meta-item">
          <span className="meta-label">Slug:</span>
          <span className="meta-value">{edgeType.slug}</span>
        </div>
        {edgeType.color && (
          <div className="meta-item">
            <span className="meta-label">Цвет:</span>
            <span className="meta-value">
              <span
                className="color-badge"
                style={{ backgroundColor: edgeType.color }}
              ></span>
              {edgeType.color}
            </span>
          </div>
        )}
        {edgeType.is_directed !== undefined && (
          <div className="meta-item">
            <span className="meta-label">Направленность:</span>
            <span className="meta-value">
              {edgeType.is_directed ? 'Направленная' : 'Ненаправленная'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default EdgeTypeCard;
