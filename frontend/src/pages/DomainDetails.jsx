import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { domainsService } from '../services/domains';
import { nodeTypesService } from '../services/nodeTypes';
import { edgeTypesService } from '../services/edgeTypes';
import NodeTypeCard from '../components/NodeTypeCard';
import EdgeTypeCard from '../components/EdgeTypeCard';
import CreateNodeTypeModal from '../components/CreateNodeTypeModal';
import CreateEdgeTypeModal from '../components/CreateEdgeTypeModal';
import './DomainDetails.css';

function DomainDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [domain, setDomain] = useState(null);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [edgeTypes, setEdgeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateNodeTypeModalOpen, setIsCreateNodeTypeModalOpen] = useState(false);
  const [isCreateEdgeTypeModalOpen, setIsCreateEdgeTypeModalOpen] = useState(false);

  useEffect(() => {
    fetchDomainAndNodeTypes();
  }, [id]);

  const fetchDomainAndNodeTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем домен
      const domainResponse = await domainsService.getDomain(id);
      if (domainResponse.success) {
        setDomain(domainResponse.data);
      }

      // Загружаем типы узлов для этого домена
      const nodeTypesResponse = await nodeTypesService.getNodeTypesByDomain(id);
      if (nodeTypesResponse.success) {
        setNodeTypes(nodeTypesResponse.data || []);
      }

      // Загружаем типы рёбер для этого домена
      const edgeTypesResponse = await edgeTypesService.getEdgeTypesByDomain(id);
      if (edgeTypesResponse.success) {
        setEdgeTypes(edgeTypesResponse.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch domain details:', err);
      setError('Не удалось загрузить информацию о домене');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNodeType = async (nodeTypeData) => {
    const response = await nodeTypesService.createNodeType(nodeTypeData);
    if (response.success) {
      // Обновляем список типов узлов
      const nodeTypesResponse = await nodeTypesService.getNodeTypesByDomain(id);
      if (nodeTypesResponse.success) {
        setNodeTypes(nodeTypesResponse.data || []);
      }
    }
  };

  const handleCreateEdgeType = async (edgeTypeData) => {
    const response = await edgeTypesService.createEdgeType(edgeTypeData);
    if (response.success) {
      // Обновляем список типов рёбер
      const edgeTypesResponse = await edgeTypesService.getEdgeTypesByDomain(id);
      if (edgeTypesResponse.success) {
        setEdgeTypes(edgeTypesResponse.data || []);
      }
    }
  };

  return (
    <div className="domain-details-container">
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
            <button className="back-button" onClick={() => navigate('/')}>
              ← Назад к доменам
            </button>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Загрузка...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchDomainAndNodeTypes} className="retry-button">
                Попробовать снова
              </button>
            </div>
          )}

          {!loading && !error && domain && (
            <>
              <div className="domain-info">
                <h2>{domain.name}</h2>
                {domain.description && (
                  <p className="domain-description-text">{domain.description}</p>
                )}
                <div className="domain-badges">
                  <span className={`badge ${domain.is_active ? 'active' : 'inactive'}`}>
                    {domain.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                  <span className={`badge ${domain.is_public ? 'public' : 'private'}`}>
                    {domain.is_public ? 'Публичный' : 'Приватный'}
                  </span>
                </div>
              </div>

              <div className="section-header">
                <div className="section-title-group">
                  <h3>Типы узлов</h3>
                  <span className="count-badge">{nodeTypes.length}</span>
                </div>
                <button
                  className="create-button-small"
                  onClick={() => setIsCreateNodeTypeModalOpen(true)}
                >
                  <span className="create-icon">+</span>
                  Создать тип узла
                </button>
              </div>

              {nodeTypes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h4>Типов узлов пока нет</h4>
                  <p>В этом домене еще не создано типов узлов</p>
                </div>
              ) : (
                <div className="nodetypes-grid">
                  {nodeTypes.map((nodeType) => (
                    <NodeTypeCard key={nodeType.id} nodeType={nodeType} />
                  ))}
                </div>
              )}

              <div className="section-header" style={{ marginTop: '48px' }}>
                <div className="section-title-group">
                  <h3>Типы рёбер</h3>
                  <span className="count-badge">{edgeTypes.length}</span>
                </div>
                <button
                  className="create-button-small"
                  onClick={() => setIsCreateEdgeTypeModalOpen(true)}
                >
                  <span className="create-icon">+</span>
                  Создать тип связи
                </button>
              </div>

              {edgeTypes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔗</div>
                  <h4>Типов рёбер пока нет</h4>
                  <p>В этом домене еще не создано типов рёбер</p>
                </div>
              ) : (
                <div className="edgetypes-grid">
                  {edgeTypes.map((edgeType) => (
                    <EdgeTypeCard key={edgeType.id} edgeType={edgeType} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <CreateNodeTypeModal
        isOpen={isCreateNodeTypeModalOpen}
        onClose={() => setIsCreateNodeTypeModalOpen(false)}
        onSuccess={handleCreateNodeType}
        domainId={id}
      />

      <CreateEdgeTypeModal
        isOpen={isCreateEdgeTypeModalOpen}
        onClose={() => setIsCreateEdgeTypeModalOpen(false)}
        onSuccess={handleCreateEdgeType}
        domainId={id}
      />
    </div>
  );
}

export default DomainDetails;
