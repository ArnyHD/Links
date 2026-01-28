# Архитектура проекта

## Обзор

Knowledge Graph Platform построена по принципу монорепозитория с четким разделением на backend, frontend и общие модули.

## Структура проекта

```
knowledge-graph-platform/
├── apps/
│   ├── backend/              # NestJS API сервер
│   │   ├── src/
│   │   │   ├── modules/      # Функциональные модули
│   │   │   │   ├── auth/     # Аутентификация
│   │   │   │   ├── users/    # Пользователи
│   │   │   │   ├── domains/  # Домены знаний
│   │   │   │   ├── node-types/   # Типы узлов
│   │   │   │   ├── nodes/    # Узлы графа
│   │   │   │   ├── edge-types/   # Типы связей
│   │   │   │   ├── edges/    # Связи между узлами
│   │   │   │   └── ratings/  # Рейтинги
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── frontend/             # React приложение
│       ├── src/
│       │   ├── api/          # API клиенты
│       │   ├── components/   # React компоненты
│       │   ├── pages/        # Страницы
│       │   ├── i18n/         # Локализация
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   └── shared/               # Общие типы и константы
│       ├── src/
│       │   ├── types/
│       │   └── constants/
│       └── package.json
│
├── docker/                   # Docker конфигурация
│   └── postgres/
│       └── init.sql
│
├── docker-compose.yml
└── package.json
```

## Технологический стек

### Backend (NestJS)

**Основные технологии:**
- NestJS 10 - модульный фреймворк на Node.js
- TypeORM - ORM для работы с PostgreSQL
- PostgreSQL 15 - реляционная БД с поддержкой JSONB
- Passport + JWT - аутентификация
- GraphQL + Apollo - дополнительный API
- Swagger - документация API

**Модульная структура:**

Каждый модуль содержит:
- `entities/` - TypeORM сущности
- `dto/` - Data Transfer Objects
- `*.service.ts` - бизнес-логика
- `*.controller.ts` - REST endpoints
- `*.module.ts` - NestJS модуль

### Frontend (React)

**Основные технологии:**
- React 18 + TypeScript
- Vite - сборщик
- React Router - маршрутизация
- React Query - управление серверным состоянием
- Zustand - локальное состояние
- Ant Design - UI библиотека
- Cytoscape.js - визуализация графов
- i18next - интернационализация

### Database Schema

**Основные таблицы:**

1. **users** - пользователи
   - id, email, username, password, roles
   - Связи: создает domains и nodes

2. **domains** - домены знаний
   - id, name, slug, description, translations
   - settings (JSONB) - настройки домена
   - Связи: принадлежит creator (User)

3. **node_types** - типы узлов
   - id, name, slug, icon, color
   - schema (JSONB) - JSON Schema для валидации данных узла
   - Связи: принадлежит domain

4. **nodes** - узлы графа
   - id, title, slug, content, status
   - data (JSONB) - кастомные данные согласно схеме
   - translations (JSONB) - переводы
   - Связи: принадлежит domain, type, creator

5. **edge_types** - типы связей
   - id, name, semanticType, weight
   - Связи: принадлежит domain

6. **edges** - связи между узлами
   - id, sourceId, targetId, typeId
   - metadata (JSONB) - дополнительные данные
   - Уникальность: (sourceId, targetId, typeId)

7. **ratings** - рейтинги узлов
   - id, nodeId, metricType, score
   - details (JSONB) - детали расчета

## Ключевые архитектурные решения

### 1. Гибкая схема данных

Использование JSONB полей в PostgreSQL позволяет:
- Пользователям определять собственные типы узлов
- Хранить произвольные данные без изменения схемы БД
- Быстро индексировать и запрашивать JSON данные

### 2. Граф в реляционной БД

Граф реализован через таблицы узлов и связей:
- **Преимущества**: простота, знакомая технология, хорошая производительность для средних графов
- **Индексы**: создаются на sourceId, targetId, typeId для быстрого обхода
- **Рекурсивные запросы**: для поиска путей и подграфов
- **Возможность расширения**: при необходимости можно добавить Neo4j

### 3. Многоязычность

Реализована на трех уровнях:
- **Backend**: nestjs-i18n для сообщений API
- **Frontend**: react-i18next для интерфейса
- **Data**: поле translations (JSONB) в сущностях для контента

### 4. Типизация

Общие типы вынесены в `packages/shared`:
- Используются и в backend, и в frontend
- Обеспечивают type safety при обмене данными
- Упрощают рефакторинг

## Паттерны и практики

### Backend

1. **Модульная архитектура**
   - Каждый домен в отдельном модуле
   - Четкое разделение ответственности
   - Легкое тестирование

2. **DTO и валидация**
   - class-validator для валидации входящих данных
   - Автоматическая трансформация типов
   - Защита от невалидных данных

3. **Repository pattern**
   - TypeORM repositories для доступа к данным
   - Инкапсуляция логики запросов
   - Возможность замены источника данных

### Frontend

1. **Component-driven development**
   - Переиспользуемые компоненты
   - Композиция вместо наследования
   - Изоляция логики

2. **Server state management**
   - React Query для кэширования данных
   - Автоматическая ревалидация
   - Оптимистичные обновления

3. **Route-based code splitting**
   - Ленивая загрузка страниц
   - Уменьшение начального бандла
   - Улучшение производительности

## Масштабирование

### Вертикальное

1. **Database optimization**
   - Индексы на часто запрашиваемых полях
   - Материализованные представления для сложных запросов
   - Партиционирование больших таблиц

2. **Caching**
   - Redis для кэширования часто запрашиваемых данных
   - HTTP кэширование на уровне API
   - Кэш запросов в React Query

### Горизонтальное

1. **Stateless backend**
   - JWT токены без серверного состояния
   - Возможность запуска нескольких инстансов
   - Load balancing через nginx/haproxy

2. **CDN для frontend**
   - Статические файлы на CDN
   - Уменьшение нагрузки на сервер
   - Быстрая доставка контента

3. **Database replication**
   - Master-slave репликация PostgreSQL
   - Чтение со slave, запись в master
   - Автоматический failover

## Безопасность

1. **Authentication & Authorization**
   - JWT токены с коротким временем жизни
   - Refresh tokens для продления сессии
   - Роли и permissions для доступа

2. **Input validation**
   - Валидация на уровне DTO
   - Sanitization входящих данных
   - Защита от SQL injection через ORM

3. **CORS & CSP**
   - Настройка CORS для разрешенных доменов
   - Content Security Policy headers
   - HTTPS only в production

## Мониторинг и логирование

1. **Application logging**
   - Структурированные логи (JSON)
   - Различные уровни логирования
   - Централизованный сбор логов

2. **Performance monitoring**
   - Метрики API endpoints
   - Database query performance
   - Frontend performance metrics

3. **Error tracking**
   - Sentry для отслеживания ошибок
   - Source maps для production
   - Алерты при критических ошибках
