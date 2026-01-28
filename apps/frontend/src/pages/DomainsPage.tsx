import { useQuery } from '@tanstack/react-query';
import { Card, Button, List, Typography, Spin, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { domainsApi } from '../api/domains';

const { Title } = Typography;

const DomainsPage = () => {
  const { t } = useTranslation();
  const { data: domains, isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => domainsApi.getAll(),
  });

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Title level={2}>{t('domains.title')}</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('domains.create')}
        </Button>
      </div>

      {!domains || domains.length === 0 ? (
        <Empty description={t('domains.empty')} />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
          dataSource={domains}
          renderItem={(domain) => (
            <List.Item>
              <Link to={`/domains/${domain.id}`}>
                <Card
                  hoverable
                  title={domain.name}
                  extra={domain.isPublic ? 'Public' : 'Private'}
                >
                  <p>{domain.description || 'No description'}</p>
                  <Button type="link" style={{ padding: 0 }}>
                    {t('domains.viewGraph')}
                  </Button>
                </Card>
              </Link>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default DomainsPage;
