# Knowledge Graph Platform

Универсальная платформа для графов знаний. Создана для альтернативных физических теорий и эфиродинамики.

## 🚀 Быстрый старт

### 1. Установка PostgreSQL расширений и таблиц

**Windows (автоматически):**
```bash
cd database
setup.bat
```

**Вручную:**
```bash
cd database
set PGPASSWORD=your_password
psql -h host -U user -d dbname -f run_all.sql
```

### 2. Проверка

```bash
npm install
npm run db:test
```

## 📊 Структура БД

```
users ──┬─ oauth_accounts (Google OAuth)
        ├─ sessions (JWT tokens)
        └─ domains
            ├─ node_types → nodes (статьи EditorJS)
            │                └─ ratings
            └─ edge_types → edges
```

**9 таблиц, 40+ индексов**

## ✨ Возможности

- ✅ **Google OAuth** - авторизация через Google
- ✅ **EditorJS** - блочный редактор для статей
- ✅ **Граф знаний** - узлы и связи с рейтингами
- ✅ **Многоязычность** - переводы в JSONB
- ✅ **Типизация** - пользовательские типы узлов/связей

## 🗄️ Основные таблицы

| Таблица | Описание |
|---------|----------|
| `users` | Пользователи (password nullable для OAuth) |
| `oauth_accounts` | Google OAuth связи |
| `sessions` | JWT refresh tokens |
| `domains` | Домены знаний |
| `node_types` | Типы узлов (Теория, Эксперимент, etc.) |
| `nodes` | Узлы (статьи с EditorJS) |
| `edge_types` | Типы связей (поддерживает, противоречит) |
| `edges` | Связи между узлами |
| `ratings` | Рейтинги узлов |

## 📝 EditorJS

Узлы хранят контент в JSON формате:

```json
{
  "blocks": [
    {"type": "header", "data": {"text": "Заголовок", "level": 2}},
    {"type": "paragraph", "data": {"text": "Текст с <b>жирным</b>"}},
    {"type": "image", "data": {"file": {"url": "..."}, "caption": "..."}}
  ]
}
```

## 🔐 OAuth

Поддержка Google OAuth:
- `oauth_accounts` - связь с провайдерами
- `sessions` - управление токенами
- `password` nullable в `users`

## 📚 Документация

- [CHANGES.md](CHANGES.md) - Что изменилось
- [database/README.md](database/README.md) - Установка БД
- [database/SCHEMA.md](database/SCHEMA.md) - Схема таблиц
- [database/OAUTH_GUIDE.md](database/OAUTH_GUIDE.md) - OAuth
- [database/EDITORJS_GUIDE.md](database/EDITORJS_GUIDE.md) - EditorJS

## ⚙️ Настройки

Скопируйте `.env.example` в `.env` и настройте:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=knowledge_graph

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT & Encryption
JWT_SECRET=your-secret
ENCRYPTION_KEY=your-32-byte-key
```

## 🛠️ Команды

```bash
npm run db:test       # Тест подключения
npm run db:setup      # Установка БД (Windows)
npm run db:reset      # Пересоздать БД (Windows)
```

## 📖 Примеры

### Создать OAuth пользователя
```sql
INSERT INTO users (email, username, display_name, is_email_verified)
VALUES ('user@gmail.com', 'username', 'User Name', true);

INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
VALUES ('user-id', 'google', 'google-sub-id');
```

### Создать статью с EditorJS
```sql
INSERT INTO nodes (title, slug, content, status, domain_id, type_id, creator_id)
VALUES (
  'Теория эфира',
  'theory-ether',
  '{"blocks": [{"type": "header", "data": {"text": "Введение", "level": 2}}]}'::jsonb,
  'published',
  'domain-id', 'type-id', 'user-id'
);
```

## 📦 Начальные данные

После установки:
- 2 пользователя (admin с паролем, test.oauth через Google)
- 1 домен "Physics Theories"
- 5 типов узлов (Axiom, Theory, Experiment, Interpretation, Concept)
- 5 типов связей (Derives From, Supports, Contradicts, Part Of, Interprets)

## 🎯 Следующие шаги

1. ✅ База данных готова
2. ⏳ Backend API (NestJS + TypeORM)
3. ⏳ Frontend (React + EditorJS)
4. ⏳ OAuth реализация
5. ⏳ Визуализация графа (Cytoscape.js)

## 📄 Лицензия

MIT