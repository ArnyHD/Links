# Links - Frontend

React frontend для платформы управления знаниями с Google OAuth 2.0 аутентификацией.

## Технологии

- **React 18** - UI библиотека
- **Vite** - Build tool и dev server
- **React Router** - Маршрутизация
- **Axios** - HTTP клиент
- **CSS Modules** - Стилизация

## Установка

```bash
# Установка зависимостей
npm install
```

## Конфигурация

Создайте файл `.env` в корне frontend директории:

```env
VITE_API_URL=http://localhost:3000
```

## Запуск

```bash
# Development mode
npm run dev

# Build для production
npm run build

# Preview production build
npm run preview
```

Frontend будет доступен по адресу: http://localhost:5173

## Структура проекта

```
frontend/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   └── ProtectedRoute.jsx
│   ├── context/            # React Context
│   │   └── AuthContext.jsx
│   ├── pages/              # Страницы приложения
│   │   ├── Login.jsx       # Страница входа
│   │   ├── Login.css
│   │   ├── AuthCallback.jsx # OAuth callback
│   │   ├── AuthCallback.css
│   │   ├── Home.jsx        # Главная страница
│   │   └── Home.css
│   ├── services/           # API сервисы
│   │   ├── api.js          # Axios instance
│   │   ├── auth.js         # Auth service
│   │   └── domains.js      # Domains service
│   ├── App.jsx             # Root component
│   ├── App.css
│   └── main.jsx            # Entry point
├── index.html
├── .env                    # Environment variables
├── vite.config.js
└── package.json
```

## Маршруты

| Маршрут | Описание | Защищен |
|---------|----------|---------|
| `/login` | Страница входа с кнопкой Google OAuth | Нет |
| `/auth/callback` | OAuth callback для обработки токена | Нет |
| `/` | Главная страница со списком доменов | Да |

## Как работает авторизация

### 1. Вход через Google

1. Пользователь нажимает "Войти через Google" на странице `/login`
2. Происходит редирект на `http://localhost:3000/auth/google`
3. Backend перенаправляет на Google для авторизации
4. После успешной авторизации Google редиректит на `http://localhost:3000/auth/google/callback`
5. Backend обрабатывает callback и редиректит на frontend: `http://localhost:5173/auth/callback?token=JWT_TOKEN&user={...}`

### 2. Обработка токена

Страница `/auth/callback`:
1. Извлекает `token` и `user` из URL параметров
2. Сохраняет в localStorage:
   - `access_token` - JWT токен
   - `user` - данные пользователя (id, email, name, avatar, roles)
3. Обновляет AuthContext
4. Перенаправляет на главную страницу `/`

### 3. Защищенные маршруты

`ProtectedRoute` компонент:
- Проверяет наличие токена в localStorage
- Если токена нет → редирект на `/login`
- Если токен есть → рендерит дочерние компоненты

### 4. API запросы

Axios interceptor автоматически добавляет токен к каждому запросу:
```javascript
Authorization: Bearer YOUR_JWT_TOKEN
```

Если API возвращает `401 Unauthorized`:
- Токен удаляется из localStorage
- Пользователь перенаправляется на `/login`

## API Endpoints

### GET /domains
Получить список всех доменов.

**Требования:** JWT токен

**Пример запроса:**
```javascript
import { domainsService } from './services/domains';

const response = await domainsService.getAllDomains();
// response.data = [{ id, name, slug, description, ... }]
```

## Компоненты

### AuthContext

Управление состоянием авторизации:

```javascript
import { useAuth } from './context/AuthContext';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Привет, {user.name}!</p>
      ) : (
        <p>Войдите в систему</p>
      )}
    </div>
  );
}
```

### ProtectedRoute

Защита маршрутов от неавторизованных пользователей:

```javascript
<Route
  path="/protected"
  element={
    <ProtectedRoute>
      <ProtectedPage />
    </ProtectedRoute>
  }
/>
```

## Стилизация

Используется обычный CSS с BEM-подобной методологией:
- Каждая страница имеет свой CSS файл
- Классы именуются по принципу `block__element--modifier`
- Цветовая схема: фиолетовый градиент для фона, белые карточки

## Troubleshooting

### CORS ошибки

Убедитесь, что backend запущен с включенным CORS:
```javascript
app.enableCors();
```

### Токен не сохраняется

1. Проверьте, что backend правильно редиректит на frontend callback
2. Убедитесь, что URL callback в `.env` backend соответствует frontend URL
3. Проверьте консоль браузера на ошибки

### Домены не загружаются

1. Проверьте, что backend запущен на `http://localhost:3000`
2. Проверьте токен в localStorage: `localStorage.getItem('access_token')`
3. Проверьте консоль Network в DevTools

### Автоматический выход

Если происходит автоматический выход - токен истек или невалиден:
- Токены действуют 7 дней (настраивается в backend)
- Войдите снова через Google OAuth

## Development

### Добавление нового API endpoint

1. Создайте сервис в `src/services/`:
```javascript
// src/services/nodes.js
import api from './api';

export const nodesService = {
  async getAllNodes() {
    const response = await api.get('/nodes');
    return response.data;
  },
};
```

2. Используйте в компоненте:
```javascript
import { nodesService } from '../services/nodes';

const nodes = await nodesService.getAllNodes();
```

### Добавление новой страницы

1. Создайте компонент в `src/pages/`
2. Добавьте маршрут в `App.jsx`
3. Если нужна защита - оберните в `<ProtectedRoute>`

## Deployment

```bash
# Build для production
npm run build

# Результат в папке dist/
# Разверните на статическом хостинге (Vercel, Netlify, etc.)
```

Не забудьте обновить `VITE_API_URL` для production окружения!

## Лицензия

MIT
