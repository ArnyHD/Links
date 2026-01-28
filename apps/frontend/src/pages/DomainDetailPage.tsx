import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Spin, Button, Descriptions } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { domainsApi } from '../api/domains';

const { Title } = Typography;

const DomainDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: domain, isLoading } = useQuery({
    queryKey: ['domain', id],
    queryFn: () => domainsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!domain) {
    return <div>Domain not found</div>;
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: '16px' }}
      >
        <Link to="/domains">Back to Domains</Link>
      </Button>

      <Title level={2}>{domain.name}</Title>

      <Descriptions bordered column={1} style={{ marginTop: '24px' }}>
        <Descriptions.Item label="Description">
          {domain.description || 'No description'}
        </Descriptions.Item>
        <Descriptions.Item label="Visibility">
          {domain.isPublic ? 'Public' : 'Private'}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {new Date(domain.createdAt).toLocaleDateString()}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: '24px' }}>
        <Link to={`/domains/${id}/graph`}>
          <Button type="primary" size="large">
            View Knowledge Graph
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DomainDetailPage;
