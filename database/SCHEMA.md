# Database Schema

## Entity Relationship Diagram

```
┌─────────────────────────────────────────┐
│              users                      │
├─────────────────────────────────────────┤
│ PK │ id (UUID)                          │
│    │ email (UNIQUE)                     │
│    │ username                           │
│    │ password (NULL for OAuth)          │◄── Nullable!
│    │ first_name, last_name              │
│    │ display_name                       │
│    │ avatar_url                         │
│    │ language (en/ru)                   │
│    │ is_active, is_email_verified       │
│    │ roles[] (user, admin)              │
│    │ metadata (JSONB)                   │
│    │ last_login_at                      │
│    │ created_at, updated_at             │
└──────────┬──────────────────┬────────────┘
           │ creates          │ has
           │ 1:N              │ 1:N
           ▼                  ▼
                    ┌─────────────────────┐
                    │   oauth_accounts    │◄── NEW!
                    ├─────────────────────┤
                    │ PK │ id              │
                    │ FK │ user_id         │
                    │    │ provider        │
                    │    │ provider_user_id│
                    │    │ provider_email  │
                    │    │ access_token    │
                    │    │ refresh_token   │
                    │    │ scopes[]        │
                    │    │ raw_data (JSONB)│
                    └─────────────────────┘

           ┌──────────┬────────────┐
           │          │            │
           ▼          ▼            ▼
                    ┌─────────────────────┐
                    │     sessions        │◄── NEW!
                    ├─────────────────────┤
                    │ PK │ id              │
                    │ FK │ user_id         │
                    │    │ refresh_token   │
                    │    │ device_info     │
                    │    │ expires_at      │
                    └─────────────────────┘
┌─────────────────────────────────────────┐
│            domains                      │
├─────────────────────────────────────────┤
│ PK │ id (UUID)                          │
│    │ name                               │
│    │ slug (UNIQUE)                      │
│    │ description                        │
│    │ translations (JSONB)               │
│    │ is_public, is_active               │
│    │ settings (JSONB)                   │
│ FK │ creator_id → users.id              │
│    │ created_at, updated_at             │
└──────────┬──────────────────────────────┘
           │ has
           │ 1:N
           ├────────────────────┬─────────────────┐
           ▼                    ▼                 ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   node_types     │  │   edge_types     │  │      nodes       │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ PK │ id (UUID)   │  │ PK │ id (UUID)   │  │ PK │ id (UUID)   │
│    │ name        │  │    │ name        │  │    │ title       │
│    │ slug        │  │    │ slug        │  │    │ slug (UNIQ) │
│    │ description │  │    │ description │  │    │ content     │
│    │ translations│  │    │ translations│  │    │ translations│
│    │ icon        │  │    │ semantic_type│ │    │ data (JSONB)│
│    │ color       │  │    │ icon        │  │    │ tags[]      │
│    │ schema (JSN)│  │    │ color       │  │    │ status      │
│    │ order       │  │    │ weight      │  │ FK │ domain_id   │
│ FK │ domain_id   │  │    │ is_directed │  │ FK │ type_id     │
│    │ created_at  │  │ FK │ domain_id   │  │ FK │ creator_id  │
│    │ updated_at  │  │    │ created_at  │  │    │ created_at  │
└─────────┬────────┘  │    │ updated_at  │  │    │ updated_at  │
          │ defines   └─────────┬────────┘  └─────────┬────────┘
          │ 1:N                 │ defines             │ has
          │                     │ 1:N                 │ 1:N
          │                     │                     │
          │                     ▼                     ▼
          │           ┌──────────────────┐  ┌──────────────────┐
          │           │      edges       │  │     ratings      │
          │           ├──────────────────┤  ├──────────────────┤
          │           │ PK │ id (UUID)   │  │ PK │ id (UUID)   │
          └───────────┤ FK │ source_id   │  │ FK │ node_id     │
                      │ FK │ target_id   │  │    │ metric_type │
                      │ FK │ type_id     │  │    │ score (float│
                      │    │ description │  │    │ details (JSN│
                      │    │ metadata    │  │    │ created_at  │
                      │    │ created_at  │  │    │ updated_at  │
                      │    │ updated_at  │  └──────────────────┘
                      └──────────────────┘

JSONB = JSON with indexing
JSN = JSONB field
FK = Foreign Key
PK = Primary Key
UNIQ = Unique constraint
```

## Table Details

### users
**Назначение:** Пользователи платформы

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| email | VARCHAR(255) | Email (UNIQUE) |
| username | VARCHAR(100) | Имя пользователя |
| password | VARCHAR(255) | Хеш пароля (bcrypt) |
| first_name | VARCHAR(100) | Имя |
| last_name | VARCHAR(100) | Фамилия |
| language | VARCHAR(10) | Язык интерфейса (en, ru) |
| is_active | BOOLEAN | Активен ли аккаунт |
| is_verified | BOOLEAN | Подтвержден ли email |
| roles | TEXT[] | Роли ['user', 'admin'] |
| avatar_url | VARCHAR(500) | URL аватара |
| metadata | JSONB | Дополнительные данные |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**Индексы:**
- `idx_users_email` на `email`
- `idx_users_username` на `username`
- `idx_users_active` на `is_active`
- `idx_users_last_login` на `last_login_at DESC`

---

### oauth_accounts
**Назначение:** OAuth аккаунты пользователей (Google, GitHub, etc.)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| user_id | UUID | FK → users.id |
| provider | VARCHAR(50) | Провайдер: google, github, facebook |
| provider_user_id | VARCHAR(255) | ID у провайдера (sub в Google) |
| provider_email | VARCHAR(255) | Email от провайдера |
| provider_username | VARCHAR(255) | Username от провайдера |
| display_name | VARCHAR(200) | Отображаемое имя |
| avatar_url | VARCHAR(500) | URL аватара |
| access_token | TEXT | Зашифрованный access token |
| refresh_token | TEXT | Зашифрованный refresh token |
| token_expires_at | TIMESTAMP | Когда истекает access token |
| scopes | TEXT[] | OAuth scopes ['openid', 'email'] |
| raw_data | JSONB | Полный ответ от провайдера |
| last_used_at | TIMESTAMP | Последнее использование |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**raw_data структура (Google):**
```json
{
  "sub": "1234567890",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "locale": "en"
}
```

**Индексы:**
- `idx_oauth_user` на `user_id`
- `idx_oauth_provider` на `provider`
- `idx_oauth_provider_user` на `(provider, provider_user_id)`
- `idx_oauth_provider_email` на `provider_email`
- `idx_oauth_last_used` на `last_used_at DESC`

**Constraints:**
- UNIQUE `(provider, provider_user_id)` - один OAuth аккаунт = один пользователь

**Важно:**
- `access_token` и `refresh_token` должны быть зашифрованы!
- Один пользователь может иметь несколько OAuth аккаунтов (Google + GitHub)

---

### sessions
**Назначение:** Активные сессии пользователей (JWT refresh tokens)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| user_id | UUID | FK → users.id |
| refresh_token | VARCHAR(500) | JWT refresh token (UNIQUE) |
| device_info | JSONB | Информация об устройстве |
| expires_at | TIMESTAMP | Когда истекает сессия |
| last_activity_at | TIMESTAMP | Последняя активность |
| created_at | TIMESTAMP | Дата создания |

**device_info структура:**
```json
{
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "deviceType": "desktop",
  "browser": "Chrome",
  "os": "Windows 10",
  "location": "Russia, Moscow"
}
```

**Индексы:**
- `idx_sessions_user` на `user_id`
- `idx_sessions_token` на `refresh_token`
- `idx_sessions_expires` на `expires_at`
- `idx_sessions_last_activity` на `last_activity_at DESC`

**Constraints:**
- UNIQUE на `refresh_token`

**Важно:**
- Используется для управления JWT refresh tokens
- Позволяет пользователю видеть активные сессии
- Позволяет завершить конкретную сессию или все сразу
- Истекшие сессии нужно удалять cron job'ом

---

### domains
**Назначение:** Домены знаний (области исследований)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| name | VARCHAR(255) | Название домена |
| slug | VARCHAR(255) | URL-friendly ID (UNIQUE) |
| description | TEXT | Описание |
| translations | JSONB | Переводы `{"ru": {...}, "en": {...}}` |
| is_public | BOOLEAN | Публичный домен? |
| is_active | BOOLEAN | Активный домен? |
| settings | JSONB | Настройки домена |
| creator_id | UUID | FK → users.id |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**translations структура:**
```json
{
  "ru": {"name": "...", "description": "..."},
  "en": {"name": "...", "description": "..."}
}
```

**settings структура:**
```json
{
  "allowComments": true,
  "requireModeration": false,
  "ratingAlgorithm": "weighted_graph",
  "defaultLanguage": "en"
}
```

**Индексы:**
- `idx_domains_slug` на `slug`
- `idx_domains_creator` на `creator_id`
- `idx_domains_public_active` на `(is_public, is_active)`
- `idx_domains_name_trgm` на `name` (триграм для поиска)

---

### node_types
**Назначение:** Типы узлов графа (Теория, Эксперимент, Аксиома, etc.)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| name | VARCHAR(255) | Название типа |
| slug | VARCHAR(255) | URL-friendly ID |
| description | TEXT | Описание |
| translations | JSONB | Переводы |
| icon | VARCHAR(100) | Иконка (ant-design icon name) |
| color | VARCHAR(20) | Цвет (hex) |
| schema | JSONB | JSON Schema для валидации |
| order | INTEGER | Порядок отображения |
| domain_id | UUID | FK → domains.id |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**schema структура (JSON Schema):**
```json
{
  "properties": {
    "year": {
      "type": "number",
      "label": "Year",
      "required": true
    },
    "accuracy": {
      "type": "number",
      "label": "Accuracy (%)",
      "min": 0,
      "max": 100
    }
  }
}
```

**Индексы:**
- `idx_nodetypes_domain` на `domain_id`
- `idx_nodetypes_slug` на `(domain_id, slug)`
- `idx_nodetypes_order` на `(domain_id, order)`

**Constraints:**
- UNIQUE `(domain_id, slug)`

---

### nodes
**Назначение:** Узлы графа знаний (статьи с EditorJS контентом)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| title | VARCHAR(500) | Заголовок статьи |
| slug | VARCHAR(500) | URL-friendly ID (UNIQUE) |
| excerpt | TEXT | Краткое описание для превью |
| cover_image | VARCHAR(500) | URL обложки статьи |
| content | JSONB | EditorJS JSON контент |
| content_html | TEXT | Кэшированный HTML (для SEO) |
| reading_time | INTEGER | Время чтения (минуты) |
| translations | JSONB | Переводы контента |
| data | JSONB | Пользовательские данные (по schema) |
| tags | TEXT[] | Теги для поиска |
| status | VARCHAR(20) | Статус: draft/published/archived |
| domain_id | UUID | FK → domains.id |
| type_id | UUID | FK → node_types.id |
| creator_id | UUID | FK → users.id |
| published_at | TIMESTAMP | Дата публикации |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**content структура (EditorJS JSON):**
```json
{
  "time": 1635603431943,
  "blocks": [
    {
      "id": "sheNwCUP5A",
      "type": "header",
      "data": {
        "text": "Заголовок",
        "level": 2
      }
    },
    {
      "type": "paragraph",
      "data": {
        "text": "Параграф текста с <b>жирным</b> и <i>курсивом</i>."
      }
    },
    {
      "type": "image",
      "data": {
        "file": {"url": "https://..."},
        "caption": "Подпись"
      }
    }
  ],
  "version": "2.28.0"
}
```

**data структура (пользовательские поля из schema):**
```json
{
  "year": 1887,
  "accuracy": 99.9,
  "methodology": "Interferometer",
  "anyCustomField": "..."
}
```

**Индексы:**
- `idx_nodes_domain_type` на `(domain_id, type_id)`
- `idx_nodes_slug` на `slug`
- `idx_nodes_creator` на `creator_id`
- `idx_nodes_status` на `status`
- `idx_nodes_created` на `created_at DESC`
- `idx_nodes_published` на `published_at DESC` (только для опубликованных)
- `idx_nodes_reading_time` на `reading_time`
- `idx_nodes_title_trgm` на `title` (триграм)
- `idx_nodes_excerpt_trgm` на `excerpt` (триграм)
- `idx_nodes_tags` на `tags` (GIN)
- `idx_nodes_content` на `content` (GIN для EditorJS JSON)
- `idx_nodes_data` на `data` (GIN)
- `idx_nodes_translations` на `translations` (GIN)

**Constraints:**
- UNIQUE на `slug`
- CHECK `status IN ('draft', 'published', 'archived')`

---

### edge_types
**Назначение:** Типы связей между узлами

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| name | VARCHAR(255) | Название типа связи |
| slug | VARCHAR(255) | URL-friendly ID |
| description | TEXT | Описание |
| translations | JSONB | Переводы |
| semantic_type | VARCHAR(50) | Семантический тип |
| icon | VARCHAR(100) | Иконка |
| color | VARCHAR(20) | Цвет (hex) |
| weight | FLOAT | Вес для рейтингов |
| is_directed | BOOLEAN | Направленная связь? |
| domain_id | UUID | FK → domains.id |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**semantic_type значения:**
- `supports` (+1.0) - поддерживает
- `contradicts` (-1.0) - противоречит
- `derives_from` (+0.8) - следует из
- `part_of` (+0.6) - является частью
- `requires` - требует
- `custom` - пользовательский

**Индексы:**
- `idx_edgetypes_domain` на `domain_id`
- `idx_edgetypes_slug` на `(domain_id, slug)`
- `idx_edgetypes_semantic` на `semantic_type`

**Constraints:**
- UNIQUE `(domain_id, slug)`
- CHECK `semantic_type IN (...))`

---

### edges
**Назначение:** Связи между узлами графа

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| source_id | UUID | FK → nodes.id (откуда) |
| target_id | UUID | FK → nodes.id (куда) |
| type_id | UUID | FK → edge_types.id |
| description | TEXT | Описание связи |
| metadata | JSONB | Дополнительные данные |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**metadata структура:**
```json
{
  "confidence": 0.95,
  "references": ["paper1", "paper2"],
  "notes": "Strong evidence"
}
```

**Индексы (КРИТИЧНЫЕ для производительности!):**
- `idx_edges_source` на `source_id`
- `idx_edges_target` на `target_id`
- `idx_edges_type` на `type_id`
- `idx_edges_source_type` на `(source_id, type_id)`
- `idx_edges_target_type` на `(target_id, type_id)`
- `idx_edges_source_target` на `(source_id, target_id)`

**Constraints:**
- UNIQUE `(source_id, target_id, type_id)`
- CHECK `source_id != target_id` (запрет петель)

---

### ratings
**Назначение:** Рейтинги узлов и концепций

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| node_id | UUID | FK → nodes.id |
| metric_type | VARCHAR(50) | Тип метрики |
| score | FLOAT | Оценка (-1 до 1) |
| details | JSONB | Детали расчета |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

**metric_type значения:**
- `consistency` - непротиворечивость
- `coherence` - целостность
- `connectivity` - связность
- `overall` - общий рейтинг

**details структура:**
```json
{
  "supportingEdges": 10,
  "contradictingEdges": 2,
  "derivedNodes": 5,
  "algorithm": "weighted_graph_v1",
  "factors": {
    "directSupport": 0.8,
    "indirectSupport": 0.15
  }
}
```

**Индексы:**
- `idx_ratings_node` на `node_id`
- `idx_ratings_node_metric` на `(node_id, metric_type)`
- `idx_ratings_metric_score` на `(metric_type, score DESC)`
- `idx_ratings_created` на `created_at DESC`

**Constraints:**
- CHECK `metric_type IN ('consistency', 'coherence', 'connectivity', 'overall')`
- CHECK `score >= -1 AND score <= 1`

---

## Indexes Summary

**Total: 40+ индексов**

### Critical for Graph Performance:
- Edges: 6 индексов для быстрого обхода графа
- Nodes: 10 индексов включая GIN для JSONB и триграмы для поиска

### Search & Filtering:
- Триграм индексы на `title` и `content` для полнотекстового поиска
- GIN индексы на JSONB полях для быстрого поиска по вложенным данным
- GIN индексы на массивах (tags, roles)

### Foreign Keys & Joins:
- Все FK автоматически имеют индексы для быстрых JOIN

---

## Extensions Used

1. **uuid-ossp** - генерация UUID
2. **pg_trgm** - триграм индексы для полнотекстового поиска
3. **btree_gin** - GIN индексы для JSONB и массивов

---

## Storage Estimates

При 10,000 узлов, 50,000 связей и 1,000 пользователей:
- **users**: ~1 MB
- **oauth_accounts**: ~500 KB
- **sessions**: ~200 KB (активные)
- **domains**: ~100 KB
- **node_types**: ~50 KB
- **nodes**: ~50 MB (с content)
- **edge_types**: ~20 KB
- **edges**: ~5 MB
- **ratings**: ~2 MB

**Total**: ~60 MB для средней базы знаний

Индексы добавляют примерно 30-40% от размера данных.
