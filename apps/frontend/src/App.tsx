import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import DomainsPage from './pages/DomainsPage';
import DomainDetailPage from './pages/DomainDetailPage';
import GraphViewPage from './pages/GraphViewPage';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px 50px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/domains" element={<DomainsPage />} />
          <Route path="/domains/:id" element={<DomainDetailPage />} />
          <Route path="/domains/:id/graph" element={<GraphViewPage />} />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  );
}

export default App;
