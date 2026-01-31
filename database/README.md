# Database Scripts

SQL скрипты для инициализации базы данных.

## Установка

### Windows (автоматически)
```bash
setup.bat
```

### Вручную
```bash
set PGPASSWORD=your_password
psql -h host -U user -d database -f run_all.sql
```

### Node.js тест
```bash
cd ..
npm install
npm run db:test
```

## Файлы

| Файл | Описание |
|------|----------|
| `001_init_extensions.sql` | PostgreSQL расширения |
| `002_create_tables.sql` | Создание 9 таблиц |
| `003_create_indexes.sql` | Создание 40+ индексов |
| `004_seed_data.sql` | Начальные данные |
| `run_all.sql` | Запуск всех скриптов |
| `reset_database.sql` | Удаление всех таблиц |
| `setup.bat` | Автоустановка (Windows) |
| `reset.bat` | Автосброс (Windows) |

## Структура

```
users (OAuth support)
  ├─ oauth_accounts
  └─ sessions

domains
  ├─ node_types → nodes (EditorJS)
  │                └─ ratings
  └─ edge_types → edges
```

## Начальные данные

**Пользователи:**
- `admin@example.com` / `password` (admin)
- `test.oauth@example.com` (OAuth)

**Домен:** Physics Theories
- 5 типов узлов
- 5 типов связей

## Сброс

```bash
reset.bat
```

## Документация

- [SCHEMA.md](SCHEMA.md) - Схема таблиц
- [OAUTH_GUIDE.md](OAUTH_GUIDE.md) - OAuth интеграция
- [EDITORJS_GUIDE.md](EDITORJS_GUIDE.md) - EditorJS интеграция