import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter style={{ textAlign: 'center' }}>
      Knowledge Graph Platform ©{new Date().getFullYear()}
    </AntFooter>
  );
};

export default Footer;
