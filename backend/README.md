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

### Nodes (Узлы графа)

Управление узлами графа знаний. Узлы представляют собой статьи/концепции с поддержкой EditorJS контента.

#### `GET /nodes`
Получить список всех узлов. Требует JWT аутентификацию.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query параметры (опциональные):**
- `domain_id` - UUID домена для фильтрации
- `type_id` - UUID типа узла для фильтрации
- `status` - статус узла (`draft`, `published`, `archived`)
- `tags` - теги через запятую (например: `physics,quantum`)

**Примеры запросов:**
```bash
# Получить все узлы
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/nodes

# Получить опубликованные узлы домена
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/nodes?domain_id=550e8400-e29b-41d4-a716-446655440000&status=published"

# Получить узлы по тегам
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/nodes?tags=physics,quantum"
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440001",
      "title": "Quantum Mechanics Basics",
      "slug": "quantum-mechanics-basics",
      "excerpt": "Introduction to quantum mechanics principles",
      "cover_image": "https://example.com/cover.jpg",
      "content": {
        "blocks": [
          {
            "type": "header",
            "data": { "text": "Quantum Mechanics", "level": 1 }
          },
          {
            "type": "paragraph",
            "data": { "text": "Quantum mechanics is..." }
          }
        ],
        "version": "2.28.0"
      },
      "reading_time": 5,
      "tags": ["physics", "quantum"],
      "status": "published",
      "domain_id": "550e8400-e29b-41d4-a716-446655440000",
      "type_id": "660e8400-e29b-41d4-a716-446655440001",
      "creator_id": "...",
      "published_at": "2024-02-01T10:00:00.000Z",
      "created_at": "2024-01-28T10:00:00.000Z",
      "updated_at": "2024-02-01T10:00:00.000Z",
      "domain": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Physics Theories",
        "slug": "physics-theories"
      },
      "type": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Theory",
        "icon": "science",
        "color": "#1890ff"
      },
      "creator": {
        "id": "...",
        "username": "user",
        "email": "user@example.com"
      }
    }
  ]
}
```

#### `GET /nodes/search`
Полнотекстовый поиск узлов по заголовку и описанию.

**Query параметры:**
- `q` - поисковый запрос

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/nodes/search?q=quantum"
```

**Response:** Список узлов, содержащих запрос в title или excerpt

#### `GET /nodes/:id`
Получить один узел по ID.

**Параметры:**
- `id` - UUID узла

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/nodes/880e8400-e29b-41d4-a716-446655440001
```

#### `GET /nodes/slug/:slug`
Получить узел по slug (URL-friendly идентификатор).

**Параметры:**
- `slug` - slug узла

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/nodes/slug/quantum-mechanics-basics
```

#### `GET /nodes/by-domain/:domainId`
Получить все узлы конкретного домена.

**Параметры:**
- `domainId` - UUID домена

**Query параметры:**
- `status` - опциональный фильтр по статусу

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/nodes/by-domain/550e8400-e29b-41d4-a716-446655440000?status=published
```

#### `GET /nodes/by-type/:typeId`
Получить все узлы конкретного типа.

**Параметры:**
- `typeId` - UUID типа узла

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/nodes/by-type/660e8400-e29b-41d4-a716-446655440001
```

#### `GET /nodes/by-tags`
Получить узлы по тегам.

**Query параметры:**
- `tags` - теги через запятую

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/nodes/by-tags?tags=physics,quantum"
```

#### `POST /nodes`
Создать новый узел.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Double Slit Experiment",
  "slug": "double-slit-experiment",
  "excerpt": "Famous quantum mechanics experiment",
  "cover_image": "https://example.com/double-slit.jpg",
  "content": {
    "blocks": [
      {
        "type": "header",
        "data": {
          "text": "The Double Slit Experiment",
          "level": 1
        }
      },
      {
        "type": "paragraph",
        "data": {
          "text": "This experiment demonstrates the wave-particle duality..."
        }
      },
      {
        "type": "image",
        "data": {
          "url": "https://example.com/diagram.png",
          "caption": "Experiment setup"
        }
      }
    ],
    "version": "2.28.0"
  },
  "content_html": "<h1>The Double Slit Experiment</h1><p>This experiment...</p>",
  "reading_time": 8,
  "tags": ["experiment", "quantum", "wave-particle"],
  "status": "draft",
  "domain_id": "550e8400-e29b-41d4-a716-446655440000",
  "type_id": "660e8400-e29b-41d4-a716-446655440002",
  "data": {
    "methodology": "Laboratory experiment",
    "year": "1801"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Node created successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440002",
    "title": "Double Slit Experiment",
    "slug": "double-slit-experiment",
    "status": "draft",
    "creator_id": "...",
    "created_at": "2024-02-01T10:00:00.000Z"
  }
}
```

**Обязательные поля:**
- `title` - заголовок узла
- `slug` - URL-friendly идентификатор (уникальный)
- `domain_id` - UUID домена
- `type_id` - UUID типа узла

**Опциональные поля:**
- `excerpt` - краткое описание для превью
- `cover_image` - URL обложки
- `content` - EditorJS JSON контент
- `content_html` - кэшированный HTML
- `reading_time` - время чтения в минутах
- `translations` - переводы
- `data` - пользовательские данные согласно schema типа
- `tags` - массив тегов
- `status` - статус (default: "draft")
- `published_at` - дата публикации

#### `PUT /nodes/:id`
Обновить существующий узел.

**Параметры:**
- `id` - UUID узла

**Body:** (все поля опциональны)
```json
{
  "title": "Updated Title",
  "content": {
    "blocks": [...]
  },
  "tags": ["physics", "quantum", "updated"],
  "reading_time": 10
}
```

**Ограничения:**
- Только создатель узла может его обновлять
- Возвращает `403 Forbidden` если пользователь не создатель

#### `PATCH /nodes/:id/publish`
Опубликовать узел (изменить статус на "published").

**Параметры:**
- `id` - UUID узла

**Пример:**
```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/nodes/880e8400-e29b-41d4-a716-446655440001/publish
```

**Response:**
```json
{
  "success": true,
  "message": "Node published successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440001",
    "status": "published",
    "published_at": "2024-02-01T10:00:00.000Z"
  }
}
```

#### `PATCH /nodes/:id/archive`
Архивировать узел (изменить статус на "archived").

**Параметры:**
- `id` - UUID узла

**Пример:**
```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/nodes/880e8400-e29b-41d4-a716-446655440001/archive
```

#### `DELETE /nodes/:id`
Удалить узел.

**Параметры:**
- `id` - UUID узла

**Response:**
```json
{
  "success": true,
  "message": "Node deleted successfully"
}
```

**Ограничения:**
- Только создатель узла может его удалить
- Возвращает `403 Forbidden` если пользователь не создатель
- При удалении узла также удаляются все его связи (edges) в силу CASCADE constraint

**Node Statuses (Статусы узлов):**

| Статус | Описание | Использование |
|--------|----------|---------------|
| `draft` | Черновик | Узел в процессе создания, виден только автору |
| `published` | Опубликован | Узел опубликован и виден всем пользователям |
| `archived` | Архивирован | Узел скрыт из основного списка, но не удален |

**EditorJS Content Structure:**

Поле `content` использует формат [Editor.js](https://editorjs.io/):
```json
{
  "blocks": [
    {
      "type": "header",
      "data": { "text": "Header text", "level": 1 }
    },
    {
      "type": "paragraph",
      "data": { "text": "Paragraph text" }
    },
    {
      "type": "list",
      "data": {
        "style": "unordered",
        "items": ["Item 1", "Item 2"]
      }
    },
    {
      "type": "code",
      "data": { "code": "const x = 1;" }
    },
    {
      "type": "image",
      "data": {
        "url": "https://example.com/image.jpg",
        "caption": "Image caption"
      }
    }
  ],
  "version": "2.28.0"
}
```

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

### Edges (Связи между узлами)

Управление связями между узлами графа знаний. Связи (edges) соединяют узлы (nodes) и имеют определенный тип (edge_type).

#### `GET /edges`
Получить список всех связей. Требует JWT аутентификацию.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query параметры (опциональные):**
- `node_id` - UUID узла для фильтрации (возвращает все связи узла: входящие и исходящие)
- `domain_id` - UUID домена для фильтрации

**Примеры запросов:**
```bash
# Получить все связи
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edges

# Получить все связи конкретного узла
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edges?node_id=880e8400-e29b-41d4-a716-446655440001

# Получить связи по домену
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edges?domain_id=550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "source_id": "880e8400-e29b-41d4-a716-446655440001",
      "target_id": "880e8400-e29b-41d4-a716-446655440002",
      "type_id": "770e8400-e29b-41d4-a716-446655440001",
      "description": "This experiment supports the theory",
      "metadata": {
        "confidence": 0.95,
        "references": ["doi:10.1234/example"]
      },
      "created_at": "2024-02-01T10:00:00.000Z",
      "updated_at": "2024-02-01T10:00:00.000Z",
      "source": {
        "id": "880e8400-e29b-41d4-a716-446655440001",
        "title": "Quantum Theory",
        "slug": "quantum-theory"
      },
      "target": {
        "id": "880e8400-e29b-41d4-a716-446655440002",
        "title": "Double Slit Experiment",
        "slug": "double-slit-experiment"
      },
      "type": {
        "id": "770e8400-e29b-41d4-a716-446655440001",
        "name": "Supports",
        "slug": "supports",
        "semantic_type": "supports",
        "color": "#52c41a"
      }
    }
  ]
}
```

**Доступ:**
- Требует валидный JWT токен
- Доступен всем авторизованным пользователям

#### `GET /edges/:id`
Получить одну связь по ID.

**Параметры:**
- `id` - UUID связи

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edges/990e8400-e29b-41d4-a716-446655440001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440001",
    "source_id": "880e8400-e29b-41d4-a716-446655440001",
    "target_id": "880e8400-e29b-41d4-a716-446655440002",
    "type_id": "770e8400-e29b-41d4-a716-446655440001",
    "description": "This experiment supports the theory",
    "metadata": {
      "confidence": 0.95
    },
    "source": {
      "id": "880e8400-e29b-41d4-a716-446655440001",
      "title": "Quantum Theory"
    },
    "target": {
      "id": "880e8400-e29b-41d4-a716-446655440002",
      "title": "Double Slit Experiment"
    },
    "type": {
      "name": "Supports",
      "semantic_type": "supports"
    }
  }
}
```

#### `GET /edges/node/:nodeId`
Получить все связи узла (входящие и исходящие).

**Параметры:**
- `nodeId` - UUID узла

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edges/node/880e8400-e29b-41d4-a716-446655440001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "outgoing": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440001",
        "target_id": "880e8400-e29b-41d4-a716-446655440002",
        "type": {
          "name": "Supports",
          "semantic_type": "supports"
        },
        "target": {
          "title": "Double Slit Experiment"
        }
      }
    ],
    "incoming": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440003",
        "source_id": "880e8400-e29b-41d4-a716-446655440003",
        "type": {
          "name": "Derives From",
          "semantic_type": "derives_from"
        },
        "source": {
          "title": "Classical Mechanics"
        }
      }
    ]
  },
  "count": {
    "outgoing": 1,
    "incoming": 1,
    "total": 2
  }
}
```

#### `GET /edges/node/:nodeId/outgoing`
Получить исходящие связи узла (где узел является источником).

**Параметры:**
- `nodeId` - UUID узла

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edges/node/880e8400-e29b-41d4-a716-446655440001/outgoing
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "source_id": "880e8400-e29b-41d4-a716-446655440001",
      "target_id": "880e8400-e29b-41d4-a716-446655440002",
      "type": {
        "name": "Supports"
      },
      "target": {
        "title": "Double Slit Experiment"
      }
    }
  ]
}
```

#### `GET /edges/node/:nodeId/incoming`
Получить входящие связи узла (где узел является целью).

**Параметры:**
- `nodeId` - UUID узла

**Пример:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/edges/node/880e8400-e29b-41d4-a716-446655440001/incoming
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440003",
      "source_id": "880e8400-e29b-41d4-a716-446655440003",
      "target_id": "880e8400-e29b-41d4-a716-446655440001",
      "type": {
        "name": "Derives From"
      },
      "source": {
        "title": "Classical Mechanics"
      }
    }
  ]
}
```

#### `POST /edges`
Создать новую связь между узлами.

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "source_id": "880e8400-e29b-41d4-a716-446655440001",
  "target_id": "880e8400-e29b-41d4-a716-446655440002",
  "type_id": "770e8400-e29b-41d4-a716-446655440001",
  "description": "This experiment provides evidence for the theory",
  "metadata": {
    "confidence": 0.95,
    "references": ["doi:10.1234/example"],
    "notes": "Strong correlation observed"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Edge created successfully",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "source_id": "880e8400-e29b-41d4-a716-446655440001",
    "target_id": "880e8400-e29b-41d4-a716-446655440002",
    "type_id": "770e8400-e29b-41d4-a716-446655440001",
    "description": "This experiment provides evidence for the theory",
    "metadata": {
      "confidence": 0.95,
      "references": ["doi:10.1234/example"]
    },
    "created_at": "2024-02-01T10:00:00.000Z"
  }
}
```

**Обязательные поля:**
- `source_id` - UUID узла-источника
- `target_id` - UUID узла-цели
- `type_id` - UUID типа связи

**Опциональные поля:**
- `description` - текстовое описание связи
- `metadata` - дополнительные данные в формате JSON
  - `confidence` - уровень уверенности (0-1)
  - `references` - массив ссылок на источники
  - `notes` - заметки
  - Любые другие пользовательские поля

**Ограничения:**
- Self-loops запрещены: `source_id` и `target_id` должны быть разными
- Комбинация `(source_id, target_id, type_id)` должна быть уникальной
- Возвращает `400 Bad Request` при попытке создать self-loop
- Возвращает `409 Conflict` если такая связь уже существует

#### `PUT /edges/:id`
Обновить существующую связь.

**Параметры:**
- `id` - UUID связи

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:** (все поля опциональны)
```json
{
  "type_id": "770e8400-e29b-41d4-a716-446655440002",
  "description": "Updated description",
  "metadata": {
    "confidence": 0.98,
    "updated_notes": "Additional evidence found"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Edge updated successfully",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440001",
    "type_id": "770e8400-e29b-41d4-a716-446655440002",
    "description": "Updated description",
    "metadata": {
      "confidence": 0.98
    },
    "updated_at": "2024-02-01T11:00:00.000Z"
  }
}
```

**Примечание:** Нельзя изменить `source_id` и `target_id` после создания связи. Для изменения узлов нужно удалить старую связь и создать новую.

#### `DELETE /edges/:id`
Удалить связь.

**Параметры:**
- `id` - UUID связи

**Заголовки:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Edge deleted successfully"
}
```

**Ограничения:**
- Возвращает `404 Not Found` если связь не существует

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
│   ├── nodes/                   # Модуль узлов графа
│   │   ├── dto/
│   │   │   ├── create-node.dto.ts
│   │   │   └── update-node.dto.ts
│   │   ├── nodes.controller.ts
│   │   ├── nodes.module.ts
│   │   └── nodes.service.ts
│   ├── edge-types/              # Модуль типов связей
│   │   ├── dto/
│   │   │   ├── create-edge-type.dto.ts
│   │   │   └── update-edge-type.dto.ts
│   │   ├── edge-types.controller.ts
│   │   ├── edge-types.module.ts
│   │   └── edge-types.service.ts
│   ├── edges/                   # Модуль связей между узлами
│   │   ├── dto/
│   │   │   ├── create-edge.dto.ts
│   │   │   └── update-edge.dto.ts
│   │   ├── edges.controller.ts
│   │   ├── edges.module.ts
│   │   └── edges.service.ts
│   ├── entities/                # TypeORM entities
│   │   ├── domain.entity.ts
│   │   ├── node-type.entity.ts
│   │   ├── edge-type.entity.ts
│   │   ├── node.entity.ts
│   │   ├── edge.entity.ts
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

### Test Infrastructure

The backend includes comprehensive unit test coverage using Jest and @nestjs/testing.

**Current Test Statistics:**
- ✅ 110 tests passing across 11 test suites
- 🎯 Modules covered: Auth (9), Domains (24), NodeTypes (21), EdgeTypes (16), Nodes (24), Edges (16)
- ⚡ Execution time: ~6 seconds

**Test Stack:**
- Jest 30.2.0 - Test runner and assertion library
- @nestjs/testing 10.4.22 - NestJS testing utilities
- supertest 7.2.2 - HTTP assertions for e2e tests
- ts-jest 29.4.6 - TypeScript preprocessor

### Running Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run e2e tests (when implemented)
npm run test:e2e

# Run e2e tests in watch mode
npm run test:e2e:watch

# Debug tests
npm run test:debug
```

### Test Structure

**Unit Tests** (co-located with source files):
```
src/
├── auth/
│   └── auth.service.spec.ts           # Auth service tests (9 tests)
├── domains/
│   ├── domains.service.spec.ts        # Domains service tests (14 tests)
│   └── domains.controller.spec.ts     # Domains controller tests (10 tests)
├── node-types/
│   ├── node-types.service.spec.ts     # NodeTypes service tests (11 tests)
│   └── node-types.controller.spec.ts  # NodeTypes controller tests (10 tests)
├── edge-types/
│   ├── edge-types.service.spec.ts     # EdgeTypes service tests (9 tests)
│   └── edge-types.controller.spec.ts  # EdgeTypes controller tests (7 tests)
├── nodes/
│   ├── nodes.service.spec.ts          # Nodes service tests (13 tests)
│   └── nodes.controller.spec.ts       # Nodes controller tests (11 tests)
└── edges/
    ├── edges.service.spec.ts          # Edges service tests (9 tests)
    └── edges.controller.spec.ts       # Edges controller tests (7 tests)
```

**E2E Tests** (integration tests - future implementation):
```
test/
├── jest-e2e.json                      # E2E test configuration
├── test-utils.ts                      # Test utilities and fixtures
├── auth.e2e-spec.ts                   # Auth flow e2e tests
├── domains.e2e-spec.ts                # Domains CRUD e2e tests
├── node-types.e2e-spec.ts             # NodeTypes e2e tests
├── edge-types.e2e-spec.ts             # EdgeTypes e2e tests
├── nodes.e2e-spec.ts                  # Nodes e2e tests
└── edges.e2e-spec.ts                  # Edges e2e tests
```

### Test Database Setup

E2E tests use a separate test database: `knowledge_graph_test`

**Create test database:**
```bash
# Connect to PostgreSQL
set PGPASSWORD=postgres
psql -h localhost -U postgres

# Create test database
CREATE DATABASE knowledge_graph_test;
\q

# Run database setup scripts
cd database
psql -h localhost -U postgres -d knowledge_graph_test -f run_all.sql
```

**Test environment configuration** (`.env.test`):
```env
NODE_ENV=test
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=knowledge_graph_test
JWT_SECRET=test-jwt-secret-key-12345
GOOGLE_CLIENT_ID=test-google-client-id
GOOGLE_CLIENT_SECRET=test-google-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### Test Utilities

**`test/test-utils.ts`** provides:
- `generateTestJWT(user)` - Generate JWT tokens for authenticated endpoint testing
- `cleanDatabase(repositories)` - Clean test data between tests
- `createMockRepository()` - Create mock TypeORM repositories for unit tests
- `TEST_USER` - Standard test user fixture
- `TEST_DOMAIN` - Standard test domain fixture

**Example usage:**
```typescript
import { generateTestJWT, TEST_USER, createMockRepository } from '../../test/test-utils';

// Generate JWT for authenticated requests
const token = generateTestJWT(TEST_USER);

// Create mock repository for unit tests
const mockRepository = createMockRepository();
mockRepository.find.mockResolvedValue([mockData]);
```

### Test Patterns

**Service Tests:**
- Mock TypeORM repositories using `createMockRepository()`
- Test business logic and data validation
- Test authorization checks (ownership, permissions)
- Test error handling (NotFoundException, ForbiddenException, BadRequestException)

**Controller Tests:**
- Mock service layer with `jest.fn()`
- Test response formatting: `{ success, count, data }` or `{ success, message, data }`
- Test user ID extraction from request object
- Don't test auth guards (covered in e2e tests)

**Complex Query Tests:**
- Simple CRUD operations tested in unit tests
- Complex query builder operations deferred to e2e tests
- Example: `findAll()` with multiple filters tested in e2e

### API Documentation

Interactive API documentation is available via Swagger UI:

**Access Swagger:**
```bash
npm run start:dev
# Visit: http://localhost:3000/api/docs
```

**Swagger Features:**
- 📚 Complete API reference for all 41 endpoints
- 🔐 JWT authentication testing ("Authorize" button)
- 🧪 Interactive request/response testing
- 📖 English language documentation
- 🏷️ Organized by tags: auth, domains, node-types, edge-types, nodes, edges

**Current Documentation Status:**
- ✅ Swagger infrastructure configured
- ✅ Domains module fully documented (template)
- ⏳ Auth, NodeTypes, EdgeTypes, Nodes, Edges modules - pending documentation

### Coverage Reports

Run coverage analysis:
```bash
npm run test:cov
```

Coverage reports are generated in `coverage/` directory:
- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/coverage-final.json` - JSON coverage data

**Coverage excludes:**
- Module files (`*.module.ts`)
- DTOs (`*.dto.ts`)
- Entities (`*.entity.ts`)
- Index files (`index.ts`)
- Bootstrap file (`main.ts`)

### Future Testing Steps

**Priority 1: E2E Tests Implementation**
- [ ] Auth flow e2e tests (Google OAuth callback, JWT validation)
- [ ] Domains CRUD e2e tests with authorization checks
- [ ] NodeTypes and EdgeTypes e2e tests with domain filtering
- [ ] Nodes e2e tests (EditorJS content, search, status transitions)
- [ ] Edges e2e tests (graph operations, self-loop prevention)
- [ ] Target: 7 e2e test suites covering critical user journeys

**Priority 2: Complete API Documentation**
- [ ] Document Auth controller endpoints with @ApiOperation decorators
- [ ] Document NodeTypes controller (6 endpoints)
- [ ] Document EdgeTypes controller (6 endpoints)
- [ ] Document Nodes controller (12 endpoints - most complex)
- [ ] Document Edges controller (8 endpoints)
- [ ] Add DTOs documentation with @ApiProperty decorators (8 remaining DTOs)

**Priority 3: CI/CD Integration**
- [ ] GitHub Actions workflow for automated testing
- [ ] Run tests on pull requests
- [ ] Coverage reporting integration (Codecov/Coveralls)
- [ ] Automated Swagger documentation deployment

**Priority 4: Advanced Testing**
- [ ] Integration tests with real database transactions
- [ ] Performance tests for graph traversal queries
- [ ] Load testing for API endpoints
- [ ] Security testing (OWASP top 10)

### Проверка работоспособности

```bash
# Проверка тестового endpoint
curl http://localhost:3000/just-test?query=test

# Проверка статуса авторизации
curl http://localhost:3000/auth/status

# Проверка Swagger UI
curl http://localhost:3000/api/docs
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
