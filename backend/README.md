# Links Backend

Backend API для платформы управления знаниями, построенный на NestJS с Google OAuth 2.0 аутентификацией.

## Технологии

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **TypeORM** - ORM для работы с базой данных
- **PostgreSQL** - Реляционная база данных
- **Passport** - Authentication middleware
- **Google OAuth 2.0** - User authentication
- **JWT** - Token-based authorization

## Требования

- Node.js 18+
- npm или yarn
- PostgreSQL 14+
- Google Cloud Platform account (для OAuth)

## Установка

```bash
# Установка зависимостей
npm install

# Копирование файла окружения
cp .env.example .env
```

## Конфигурация

### 1. Настройка базы данных

Сначала создайте и инициализируйте базу данных PostgreSQL. См. [../database/README.md](../database/README.md) для подробностей.

Быстрая установка (Windows):
```bash
cd ../database
setup.bat
```

### 2. Настройка переменных окружения

Создайте файл [.env](.env) в корне backend директории:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=knowledge_graph

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Frontend URL (для редиректа после авторизации)
FRONTEND_URL=http://localhost:5173
```

### 3. Настройка Google OAuth 2.0

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. Скопируйте Client ID и Client Secret в [.env](.env)

## Как работает OAuth с базой данных

При первом входе через Google OAuth:

1. **Пользователь перенаправляется на Google** для авторизации
2. **Google возвращает профиль пользователя** (email, имя, фото)
3. **Backend проверяет базу данных:**
   - Ищет OAuth аккаунт с `provider='google'` и `provider_user_id`
   - Если не найден, ищет пользователя по email
   - Если пользователя нет, **создается новый** в таблице `users`
4. **Создается запись в `oauth_accounts`:**
   - Связь пользователя с Google аккаунтом
   - Сохраняется профиль от Google
5. **Генерируется JWT токен** и пользователь перенаправляется на frontend

**Структура данных:**
```
users (id, email, username, display_name, avatar_url, ...)
  └─ oauth_accounts (provider='google', provider_user_id, raw_data, ...)
```

**Пример данных после авторизации:**
- `users.email`: "ivan@gmail.com"
- `users.display_name`: "Иван Иванов"
- `users.is_email_verified`: true (автоматически для Google)
- `oauth_accounts.provider`: "google"
- `oauth_accounts.provider_user_id`: "103485926294857"

## Запуск

```bash
# Development mode с hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Standard start
npm start
```

Сервер будет доступен по адресу: http://localhost:3000

## API Endpoints

### Аутентификация

#### `GET /auth/google`
Инициирует OAuth flow с Google.

**Пример:**
```
http://localhost:3000/auth/google
```

#### `GET /auth/google/callback`
Callback endpoint для Google OAuth. После успешной аутентификации пользователь перенаправляется на frontend с токеном.

**Response:** Redirect на frontend с параметрами:
- `token` - JWT access token
- `user` - Данные пользователя (JSON)

#### `GET /auth/status`
Проверка статуса аутентификационного модуля.

**Response:**
```json
{
  "message": "Auth module is working",
  "googleOAuth": {
    "configured": true,
    "callbackUrl": "http://localhost:3000/auth/google/callback"
  }
}
```

### Domains (Домены знаний)

#### `GET /domains`
Получить список всех доменов. Требует JWT аутентификацию.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Пример запроса:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/domains
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Physics Theories",
      "slug": "physics-theories",
      "description": "Classical and modern physics theories",
      "translations": {},
      "is_public": true,
      "is_active": true,
      "settings": {},
      "creator_id": "...",
      "created_at": "2024-02-01T10:00:00.000Z",
      "updated_at": "2024-02-01T10:00:00.000Z",
      "creator": {
        "id": "...",
        "email": "admin@example.com",
        "username": "admin"
      }
    }
  ]
}
```

**Доступ:**
- Требует валидный JWT токен
- Доступен всем авторизованным пользователям независимо от роли
- Возвращает все домены с информацией о создателе

### Тестовые endpoints

#### `GET /just-test`
Тестовый endpoint для проверки работы сервера.

**Query параметры:**
- `query` - Тестовая строка

**Пример:**
```
http://localhost:3000/just-test?query=hello
```

**Response:**
```json
{
  "query": "hello",
  "timestamp": "2024-02-01T12:00:00.000Z"
}
```

## Структура проекта

```
backend/
├── src/
│   ├── auth/                    # Модуль аутентификации
│   │   ├── strategies/
│   │   │   └── google.strategy.ts
│   │   ├── auth.controller.ts   # Auth endpoints
│   │   ├── auth.module.ts
│   │   └── auth.service.ts      # JWT generation
│   ├── app.controller.ts        # Основные endpoints
│   ├── app.module.ts            # Root module
│   ├── app.service.ts
│   └── main.ts                  # Entry point
├── dist/                        # Compiled files
├── node_modules/
├── .env                         # Environment variables (не в git)
├── .env.example                 # Example environment file
├── nest-cli.json               # NestJS configuration
├── package.json
├── tsconfig.json               # TypeScript configuration
└── README.md
```

## Разработка

### Добавление нового endpoint

1. Создайте контроллер:
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class ApiController {
  @Get('endpoint')
  getEndpoint() {
    return { message: 'Hello World' };
  }
}
```

2. Зарегистрируйте в модуле:
```typescript
@Module({
  controllers: [ApiController],
})
export class AppModule {}
```

### Защита endpoints с помощью JWT

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Get('protected')
@UseGuards(AuthGuard('jwt'))
getProtected() {
  return { message: 'This is protected' };
}
```

## Troubleshooting

### Ошибка: `redirect_uri_mismatch`

**Причина:** Callback URL не добавлен в Google Cloud Console.

**Решение:**
1. Откройте [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Выберите ваш OAuth 2.0 Client ID
3. Добавьте в "Authorized redirect URIs": `http://localhost:3000/auth/google/callback`
4. Сохраните изменения (применяется в течение 1-2 минут)

### CORS ошибки

CORS уже включен в [main.ts](src/main.ts#L9). Если нужна дополнительная конфигурация:

```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

### Порт уже занят

Если порт 3000 занят, измените в [.env](.env):
```env
PORT=3001
```

## Тестирование

### Проверка работоспособности

```bash
# Проверка тестового endpoint
curl http://localhost:3000/just-test?query=test

# Проверка статуса авторизации
curl http://localhost:3000/auth/status
```

### Тестирование Google OAuth

1. Откройте браузер: http://localhost:3000/auth/google
2. Выполните вход через Google
3. Должен произойти редирект на frontend с токеном

## Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Environment Variables для Production

Обязательно установите в production окружении:
- `NODE_ENV=production`
- Надежный `JWT_SECRET`
- Production URL в `GOOGLE_CALLBACK_URL` и `FRONTEND_URL`
- Добавьте production callback URL в Google Cloud Console

## Безопасность

- JWT токены используются для аутентификации
- Пароли не хранятся (используется Google OAuth)
- CORS настроен для защиты от CSRF
- Environment переменные не попадают в git

## Лицензия

MIT
