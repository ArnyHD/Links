import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthCallback.css';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (!token || !userStr) {
      console.error('OAuth callback: missing token or user data');
      setError('Не удалось получить данные авторизации');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      login(token, user);

      // Даем время на обновление состояния перед редиректом
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError('Ошибка обработки данных авторизации: ' + err.message);
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate, login]);

  if (error) {
    return (
      <div className="callback-container">
        <div className="callback-card error">
          <div className="error-icon">❌</div>
          <h2>Ошибка авторизации</h2>
          <p>{error}</p>
          <p className="redirect-text">Перенаправление на страницу входа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-container">
      <div className="callback-card">
        <div className="spinner"></div>
        <h2>Авторизация...</h2>
        <p>Перенаправление на главную страницу</p>
      </div>
    </div>
  );
}

export default AuthCallback;
