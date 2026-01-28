import { Layout, Menu, Select } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Header: AntHeader } = Layout;

const Header = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <AntHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', fontSize: '20px', marginRight: '50px' }}>
          {t('app.title')}
        </Link>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/',
              label: <Link to="/">{t('nav.home')}</Link>,
            },
            {
              key: '/domains',
              label: <Link to="/domains">{t('nav.domains')}</Link>,
            },
          ]}
        />
      </div>
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        style={{ width: 100 }}
        options={[
          { value: 'en', label: 'English' },
          { value: 'ru', label: 'Русский' },
        ]}
      />
    </AntHeader>
  );
};

export default Header;
