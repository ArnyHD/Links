# База данных - Список изменений

## 🔐 OAuth авторизация (Google)

**Новые таблицы:**
- `oauth_accounts` - связь с OAuth провайдерами (Google, GitHub, etc.)
- `sessions` - управление JWT refresh tokens

**Изменения в users:**
- `password` теперь NULLABLE (для OAuth пользователей)
- Добавлены: `display_name`, `last_login_at`

## 📝 EditorJS для статей

**Изменения в nodes:**
- `content` TEXT → `content` JSONB (EditorJS JSON формат)
- Новые поля: `excerpt`, `cover_image`, `content_html`, `reading_time`, `published_at`

**Формат EditorJS:**
```json
{
  "blocks": [
    {"type": "header", "data": {"text": "Заголовок", "level": 2}},
    {"type": "paragraph", "data": {"text": "Текст"}},
    {"type": "image", "data": {"file": {"url": "..."}, "caption": "..."}}
  ],
  "version": "2.28.0"
}
```

## 📊 Итого

**Таблицы:** 9 (users, oauth_accounts, sessions, domains, node_types, nodes, edge_types, edges, ratings)
**Индексы:** 40+

## 📚 Документация

- [database/README.md](database/README.md) - Инструкции по установке
- [database/SCHEMA.md](database/SCHEMA.md) - Схема таблиц
- [database/OAUTH_GUIDE.md](database/OAUTH_GUIDE.md) - OAuth интеграция
- [database/EDITORJS_GUIDE.md](database/EDITORJS_GUIDE.md) - EditorJS интеграция