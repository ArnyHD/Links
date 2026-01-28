import { useParams } from 'react-router-dom';
import { Typography } from 'antd';

const { Title } = Typography;

const GraphViewPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <Title level={2}>Knowledge Graph View</Title>
      <p>Domain ID: {id}</p>
      <div style={{
        width: '100%',
        height: '600px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: '#999' }}>Graph visualization will be implemented here using Cytoscape.js</p>
      </div>
    </div>
  );
};

export default GraphViewPage;
