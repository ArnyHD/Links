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
- Доступен всем авторизованным пользователям

#### `GET /domains/:id`
Получить один домен по ID.

**Параметры:**
- `id` - UUID домена

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/domains/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Physics Theories",
    "slug": "physics-theories",
    "description": "Classical and modern physics theories",
    "is_public": true,
    "is_active": true,
    "creator": {
      "id": "...",
      "email": "user@example.com",
      "username": "user"
    }
  }
}
```

#### `POST /domains`
Создать новый домен.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Mathematics",
  "slug": "mathematics",
  "description": "Mathematical theories and proofs",
  "is_public": true,
  "is_active": true,
  "translations": {},
  "settings": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Domain created successfully",
  "data": {
    "id": "...",
    "name": "Mathematics",
    "slug": "mathematics",
    "description": "Mathematical theories and proofs",
    "creator_id": "...",
    "created_at": "2024-02-01T10:00:00.000Z"
  }
}
```

**Обязательные поля:**
- `name` - название домена
- `slug` - URL-friendly идентификатор

**Опциональные поля:**
- `description` - описание
- `is_public` - публичный домен (default: true)
- `is_active` - активный (default: true)
- `translations` - переводы названия/описания
- `settings` - настройки домена

#### `PUT /domains/:id`
Обновить существующий домен.

**Параметры:**
- `id` - UUID домена

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:** (все поля опциональны)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Domain updated successfully",
  "data": {
    "id": "...",
    "name": "Updated Name",
    "description": "Updated description",
    "is_active": false,
    "updated_at": "2024-02-01T11:00:00.000Z"
  }
}
```

**Ограничения:**
- Только создатель домена может его обновлять
- Возвращает `403 Forbidden` если пользователь не создатель

#### `DELETE /domains/:id`
Удалить домен.

**Параметры:**
- `id` - UUID домена

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Domain deleted successfully"
}
```

**Ограничения:**
- Только создатель домена может его удалить
- Возвращает `403 Forbidden` если пользователь не создатель
- Возвращает `404 Not Found` если домен не существует

### Node Types (Типы узлов)

Управление типами узлов графа знаний. Типы узлов определяют категории для узлов в конкретном домене (например: Теория, Эксперимент, Аксиома).

#### `GET /node-types`
Получить список всех типов узлов. Требует JWT аутентификацию.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query параметры (опциональные):**
- `domain_id` - UUID домена для фильтрации

**Примеры запросов:**
```bash
# Получить все типы узлов
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/node-types

# Получить типы узлов для конкретного домена
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/node-types?domain_id=550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Theory",
      "slug": "theory",
      "description": "Theoretical framework or model",
      "translations": {},
      "icon": "science",
      "color": "#1890ff",
      "schema": {},
      "order": 0,
      "domain_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-02-01T10:00:00.000Z",
      "updated_at": "2024-02-01T10:00:00.000Z",
      "domain": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Physics Theories",
        "slug": "physics-theories"
      }
    }
  ]
}
```

**Доступ:**
- Требует валидный JWT токен
- Доступен всем авторизованным пользователям

#### `GET /node-types/:id`
Получить один тип узла по ID.

**Параметры:**
- `id` - UUID типа узла

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/node-types/660e8400-e29b-41d4-a716-446655440001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Theory",
    "slug": "theory",
    "description": "Theoretical framework or model",
    "icon": "science",
    "color": "#1890ff",
    "schema": {},
    "order": 0,
    "domain_id": "550e8400-e29b-41d4-a716-446655440000",
    "domain": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Physics Theories"
    }
  }
}
```

#### `GET /node-types/by-domain/:domainId`
Получить все типы узлов для конкретного домена.

**Параметры:**
- `domainId` - UUID домена

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/node-types/by-domain/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Theory",
      "slug": "theory",
      "order": 0,
      "color": "#1890ff",
      "domain_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "name": "Experiment",
      "slug": "experiment",
      "order": 1,
      "color": "#52c41a",
      "domain_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

#### `POST /node-types`
Создать новый тип узла.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Experiment",
  "slug": "experiment",
  "description": "Experimental validation",
  "domain_id": "550e8400-e29b-41d4-a716-446655440000",
  "icon": "experiment",
  "color": "#52c41a",
  "order": 1,
  "schema": {
    "type": "object",
    "properties": {
      "methodology": { "type": "string" },
      "date": { "type": "string" }
    }
  },
  "translations": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "NodeType created successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "name": "Experiment",
    "slug": "experiment",
    "description": "Experimental validation",
    "domain_id": "550e8400-e29b-41d4-a716-446655440000",
    "icon": "experiment",
    "color": "#52c41a",
    "order": 1,
    "created_at": "2024-02-01T10:00:00.000Z"
  }
}
```

**Обязательные поля:**
- `name` - название типа узла
- `slug` - URL-friendly идентификатор
- `domain_id` - UUID домена

**Опциональные поля:**
- `description` - описание типа
- `icon` - иконка (например: "science", "experiment")
- `color` - цвет в hex формате (default: "#1890ff")
- `order` - порядок отображения (default: 0)
- `schema` - JSON Schema для валидации полей узлов этого типа
- `translations` - переводы названия/описания

**Ограничения:**
- `slug` должен быть уникальным в пределах одного домена
- Возвращает `409 Conflict` если slug уже существует в домене

#### `PUT /node-types/:id`
Обновить существующий тип узла.

**Параметры:**
- `id` - UUID типа узла

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:** (все поля опциональны)
```json
{
  "name": "Updated Theory",
  "description": "Updated description",
  "color": "#ff4d4f",
  "order": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "NodeType updated successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Updated Theory",
    "description": "Updated description",
    "color": "#ff4d4f",
    "order": 5,
    "updated_at": "2024-02-01T11:00:00.000Z"
  }
}
```

#### `DELETE /node-types/:id`
Удалить тип узла.

**Параметры:**
- `id` - UUID типа узла

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "NodeType deleted successfully"
}
```

**Ограничения:**
- Возвращает `404 Not Found` если тип узла не существует
- Если к типу узла привязаны существующие узлы, удаление будет заблокировано БД (RESTRICT constraint)

### Edge Types (Типы связей)

Управление типами связей между узлами графа знаний. Типы связей определяют семантику отношений между узлами (например: Поддерживает, Противоречит, Выводится из).

#### `GET /edge-types`
Получить список всех типов связей. Требует JWT аутентификацию.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query параметры (опциональные):**
- `domain_id` - UUID домена для фильтрации

**Примеры запросов:**
```bash
# Получить все типы связей
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edge-types

# Получить типы связей для конкретного домена
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edge-types?domain_id=550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "name": "Supports",
      "slug": "supports",
      "description": "Evidence that supports the theory",
      "translations": {},
      "semantic_type": "supports",
      "icon": "arrow-up",
      "color": "#52c41a",
      "weight": 1.0,
      "is_directed": true,
      "domain_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-02-01T10:00:00.000Z",
      "updated_at": "2024-02-01T10:00:00.000Z",
      "domain": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Physics Theories",
        "slug": "physics-theories"
      }
    }
  ]
}
```

**Доступ:**
- Требует валидный JWT токен
- Доступен всем авторизованным пользователям

#### `GET /edge-types/:id`
Получить один тип связи по ID.

**Параметры:**
- `id` - UUID типа связи

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edge-types/770e8400-e29b-41d4-a716-446655440001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "name": "Supports",
    "slug": "supports",
    "description": "Evidence that supports the theory",
    "semantic_type": "supports",
    "icon": "arrow-up",
    "color": "#52c41a",
    "weight": 1.0,
    "is_directed": true,
    "domain_id": "550e8400-e29b-41d4-a716-446655440000",
    "domain": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Physics Theories"
    }
  }
}
```

#### `GET /edge-types/by-domain/:domainId`
Получить все типы связей для конкретного домена.

**Параметры:**
- `domainId` - UUID домена

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edge-types/by-domain/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "name": "Supports",
      "slug": "supports",
      "semantic_type": "supports",
      "weight": 1.0,
      "color": "#52c41a",
      "is_directed": true,
      "domain_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Contradicts",
      "slug": "contradicts",
      "semantic_type": "contradicts",
      "weight": -1.0,
      "color": "#ff4d4f",
      "is_directed": true,
      "domain_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

#### `POST /edge-types`
Создать новый тип связи.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Derives From",
  "slug": "derives-from",
  "description": "One concept derives from another",
  "domain_id": "550e8400-e29b-41d4-a716-446655440000",
  "semantic_type": "derives_from",
  "icon": "arrow-right",
  "color": "#1890ff",
  "weight": 0.5,
  "is_directed": true,
  "translations": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "EdgeType created successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "name": "Derives From",
    "slug": "derives-from",
    "description": "One concept derives from another",
    "domain_id": "550e8400-e29b-41d4-a716-446655440000",
    "semantic_type": "derives_from",
    "icon": "arrow-right",
    "color": "#1890ff",
    "weight": 0.5,
    "is_directed": true,
    "created_at": "2024-02-01T10:00:00.000Z"
  }
}
```

**Обязательные поля:**
- `name` - название типа связи
- `slug` - URL-friendly идентификатор
- `domain_id` - UUID домена

**Опциональные поля:**
- `description` - описание типа связи
- `semantic_type` - семантический тип (default: "custom")
  - Допустимые значения: `supports`, `contradicts`, `derives_from`, `part_of`, `requires`, `custom`
- `icon` - иконка (например: "arrow-up", "arrow-down")
- `color` - цвет в hex формате (default: "#52c41a")
- `weight` - вес связи для расчета рейтингов (default: 0)
- `is_directed` - направленная ли связь (default: true)
- `translations` - переводы названия/описания

**Ограничения:**
- `slug` должен быть уникальным в пределах одного домена
- Возвращает `409 Conflict` если slug уже существует в домене
- `semantic_type` должен быть одним из допустимых значений

#### `PUT /edge-types/:id`
Обновить существующий тип связи.

**Параметры:**
- `id` - UUID типа связи

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:** (все поля опциональны)
```json
{
  "name": "Updated Supports",
  "description": "Updated description",
  "color": "#73d13d",
  "weight": 1.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "EdgeType updated successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "name": "Updated Supports",
    "description": "Updated description",
    "color": "#73d13d",
    "weight": 1.5,
    "updated_at": "2024-02-01T11:00:00.000Z"
  }
}
```

#### `DELETE /edge-types/:id`
Удалить тип связи.

**Параметры:**
- `id` - UUID типа связи

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "EdgeType deleted successfully"
}
```

**Ограничения:**
- Возвращает `404 Not Found` если тип связи не существует
- Если к типу связи привязаны существующие связи (edges), удаление будет заблокировано БД (RESTRICT constraint)

**Semantic Types (Семантические типы):**

| Тип | Описание | Типичный вес | Использование |
|-----|----------|--------------|---------------|
| `supports` | Поддерживает, подтверждает | +1.0 | Экспериментальное подтверждение теории |
| `contradicts` | Противоречит, опровергает | -1.0 | Противоречащие факты или наблюдения |
| `derives_from` | Выводится из, следует из | +0.5 | Математический вывод или логическое следствие |
| `part_of` | Является частью | 0 | Иерархическая связь, компонент системы |
| `requires` | Требует, зависит от | 0 | Зависимость или предусловие |
| `custom` | Пользовательский тип | 0 | Для нестандартных типов связей |

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
│   │   │   ├── google.strategy.ts  # Google OAuth strategy
│   │   │   └── jwt.strategy.ts     # JWT validation strategy
│   │   ├── auth.controller.ts   # Auth endpoints
│   │   ├── auth.module.ts
│   │   └── auth.service.ts      # JWT generation
│   ├── domains/                 # Модуль доменов знаний
│   │   ├── dto/
│   │   │   ├── create-domain.dto.ts
│   │   │   └── update-domain.dto.ts
│   │   ├── domains.controller.ts
│   │   ├── domains.module.ts
│   │   └── domains.service.ts
│   ├── node-types/              # Модуль типов узлов
│   │   ├── dto/
│   │   │   ├── create-node-type.dto.ts
│   │   │   └── update-node-type.dto.ts
│   │   ├── node-types.controller.ts
│   │   ├── node-types.module.ts
│   │   └── node-types.service.ts
│   ├── edge-types/              # Модуль типов связей
│   │   ├── dto/
│   │   │   ├── create-edge-type.dto.ts
│   │   │   └── update-edge-type.dto.ts
│   │   ├── edge-types.controller.ts
│   │   ├── edge-types.module.ts
│   │   └── edge-types.service.ts
│   ├── entities/                # TypeORM entities
│   │   ├── domain.entity.ts
│   │   ├── node-type.entity.ts
│   │   ├── edge-type.entity.ts
│   │   ├── oauth-account.entity.ts
│   │   ├── user.entity.ts
│   │   └── index.ts
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
