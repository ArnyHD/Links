# Инструкция по установке и запуску

## Требования

### Обязательные
- **Node.js** 18.x или выше
- **npm** 9.x или выше
- **PostgreSQL** 15.x или выше

### Опциональные
- **Docker** и **Docker Compose** (для запуска БД в контейнере)
- **Git** для клонирования репозитория

## Быстрый старт (Windows 10 Pro)

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd knowledge-graph-platform
```

### 2. Установка зависимостей

```bash
npm install
```

Эта команда установит зависимости для всех рабочих областей (backend, frontend, shared).

### 3. Настройка базы данных

#### Вариант A: Docker (рекомендуется)

```bash
# Запуск PostgreSQL в Docker
docker-compose up -d postgres

# База данных будет доступна на localhost:5432
```

#### Вариант B: Локальная установка PostgreSQL

1. Установите PostgreSQL 15+ с официального сайта
2. Создайте базу данных:

```sql
CREATE DATABASE knowledge_graph;
CREATE USER kgp_user WITH PASSWORD 'kgp_password';
GRANT ALL PRIVILEGES ON DATABASE knowledge_graph TO kgp_user;
```

### 4. Настройка переменных окружения

#### Backend

```bash
cd apps/backend
copy .env.example .env
```

Отредактируйте `.env` если необходимо:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kgp_user
DB_PASSWORD=kgp_password
DB_DATABASE=knowledge_graph

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

CORS_ORIGIN=http://localhost:5173
```

### 5. Запуск миграций

```bash
# Из корневой папки проекта
npm run migration:run --workspace=@kgp/backend
```

### 6. Запуск приложения

#### Вариант A: Запуск всего проекта

```bash
# Из корневой папки
npm run dev
```

Это запустит одновременно backend и frontend.

#### Вариант B: Запуск отдельно

В отдельных терминалах:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 7. Доступ к приложению

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs
- **GraphQL Playground**: http://localhost:3000/graphql

## Детальная настройка

### Структура базы данных

После запуска миграций будут созданы следующие таблицы:
- `users` - пользователи
- `domains` - домены знаний
- `node_types` - типы узлов
- `nodes` - узлы графа
- `edge_types` - типы связей
- `edges` - связи
- `ratings` - рейтинги

### Создание первого пользователя

Временно пользователи создаются без аутентификации. В будущем будет добавлена регистрация.

### Создание первого домена

1. Откройте http://localhost:5173/domains
2. Нажмите "Create Domain"
3. Заполните форму:
   - Name: "Physics Theories"
   - Description: "Domain for organizing physics theories"
   - Is Public: Yes

## Разработка

### Структура проекта

```
apps/
  backend/          # NestJS API
    src/
      modules/      # Функциональные модули
  frontend/         # React приложение
    src/
      api/          # API клиенты
      components/   # Компоненты
      pages/        # Страницы
packages/
  shared/           # Общие типы
```

### Полезные команды

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Тесты
npm run test

# Линтинг
npm run lint

# Создание миграции
npm run migration:generate --workspace=@kgp/backend -- -n MigrationName

# Запуск миграций
npm run migration:run --workspace=@kgp/backend

# Откат миграции
npm run migration:revert --workspace=@kgp/backend
```

### Работа с Backend

```bash
cd apps/backend

# Запуск в режиме разработки (с hot reload)
npm run dev

# Сборка
npm run build

# Запуск production версии
npm run start:prod
```

### Работа с Frontend

```bash
cd apps/frontend

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Preview production build
npm run preview
```

## Тестирование API

### Через Swagger UI

Откройте http://localhost:3000/api/docs

### Через curl

```bash
# Получить все домены
curl http://localhost:3000/api/domains

# Создать домен
curl -X POST http://localhost:3000/api/domains \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Physics Theories",
    "description": "A domain for physics",
    "isPublic": true
  }'

# Получить домен по ID
curl http://localhost:3000/api/domains/{id}
```

### Через GraphQL

```graphql
# В GraphQL Playground (http://localhost:3000/graphql)

query {
  domains {
    id
    name
    description
    isPublic
  }
}
```

## Troubleshooting

### Ошибка подключения к базе данных

1. Проверьте что PostgreSQL запущен:
   ```bash
   docker-compose ps
   ```

2. Проверьте настройки в `.env`:
   - DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE

3. Попробуйте подключиться через psql:
   ```bash
   psql -h localhost -U kgp_user -d knowledge_graph
   ```

### Порт уже занят

Если порт 3000 или 5173 занят:

1. Backend - измените PORT в `apps/backend/.env`
2. Frontend - измените port в `apps/frontend/vite.config.ts`

### Ошибки TypeScript

```bash
# Пересоздать node_modules
rm -rf node_modules
npm install

# Очистить кэш TypeScript
rm -rf apps/*/dist
rm -rf apps/*/.tsbuildinfo
```

### Ошибки миграций

```bash
# Откатить последнюю миграцию
npm run migration:revert --workspace=@kgp/backend

# Пересоздать базу данных
docker-compose down -v
docker-compose up -d postgres
npm run migration:run --workspace=@kgp/backend
```

## Production развертывание

### Сборка приложения

```bash
# Сборка всего проекта
npm run build

# Backend будет в apps/backend/dist
# Frontend будет в apps/frontend/dist
```

### Переменные окружения для Production

```env
NODE_ENV=production
PORT=3000

DB_HOST=your-prod-db-host
DB_PORT=5432
DB_USERNAME=your-prod-user
DB_PASSWORD=your-strong-password
DB_DATABASE=knowledge_graph

JWT_SECRET=your-very-strong-secret-key
JWT_EXPIRATION=7d

CORS_ORIGIN=https://your-domain.com
```

### Запуск в Production

#### Backend

```bash
cd apps/backend
npm run build
npm run start:prod
```

#### Frontend

Frontend должен быть развернут на CDN или веб-сервере (nginx, Apache):

```bash
cd apps/frontend
npm run build

# Файлы для развертывания в apps/frontend/dist
```

### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    root /path/to/apps/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Следующие шаги

1. Изучите [ARCHITECTURE.md](../ARCHITECTURE.md) для понимания архитектуры
2. Изучите [DATABASE.md](DATABASE.md) для работы с базой данных
3. Создайте свой первый домен и узлы
4. Настройте типы узлов и связей для вашей области знаний
