import { Typography, Card, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Title>{t('app.title')}</Title>
      <Paragraph style={{ fontSize: '18px' }}>
        {t('app.description')}
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: '40px' }}>
        <Col xs={24} md={8}>
          <Card title="Flexible Structure" hoverable>
            <Paragraph>
              Create custom node types and edge types for any domain of knowledge.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Rating System" hoverable>
            <Paragraph>
              Automatic calculation of consistency, coherence, and connectivity ratings.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Graph Visualization" hoverable>
            <Paragraph>
              Interactive visualization of knowledge graphs with advanced analytics.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/domains">
          <Card hoverable style={{ maxWidth: 400, margin: '0 auto' }}>
            <Title level={3}>Explore Domains</Title>
            <Paragraph>Browse existing knowledge domains or create your own</Paragraph>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
