# EditorJS Integration Guide

## Структура таблицы nodes

```sql
CREATE TABLE nodes (
    title VARCHAR(500),
    slug VARCHAR(500),
    excerpt TEXT,                 -- Краткое описание
    cover_image VARCHAR(500),     -- URL обложки
    content JSONB,                -- EditorJS JSON
    content_html TEXT,            -- HTML кэш для SEO
    reading_time INTEGER,         -- Минуты
    tags TEXT[],
    status VARCHAR(20),           -- draft/published/archived
    published_at TIMESTAMP
);
```

## Формат EditorJS

```json
{
  "time": 1635603431943,
  "blocks": [
    {"type": "header", "data": {"text": "Заголовок", "level": 2}},
    {"type": "paragraph", "data": {"text": "Текст с <b>жирным</b>"}},
    {"type": "list", "data": {"style": "unordered", "items": ["Item 1"]}},
    {"type": "code", "data": {"code": "console.log('hello');"}},
    {"type": "image", "data": {
      "file": {"url": "https://..."},
      "caption": "Подпись"
    }}
  ],
  "version": "2.28.0"
}
```

## Типы блоков

- **header** - Заголовки (h2-h6)
- **paragraph** - Параграфы
- **list** - Списки (ordered/unordered)
- **code** - Код
- **quote** - Цитаты
- **image** - Изображения
- **table** - Таблицы
- **delimiter** - Разделители
- **warning** - Предупреждения
- **raw** - HTML

## SQL примеры

### Создать статью
```sql
INSERT INTO nodes (title, slug, excerpt, content, reading_time, status)
VALUES (
  'Теория эфира',
  'theory-ether',
  'Краткое описание...',
  '{
    "blocks": [
      {"type": "header", "data": {"text": "Введение", "level": 2}},
      {"type": "paragraph", "data": {"text": "Текст статьи..."}}
    ],
    "version": "2.28.0"
  }'::jsonb,
  5,
  'published'
);
```

### Найти статьи с изображениями
```sql
SELECT title FROM nodes
WHERE content @> '{"blocks": [{"type": "image"}]}'::jsonb;
```

### Найти длинные статьи
```sql
SELECT title, reading_time FROM nodes
WHERE reading_time > 10 AND status = 'published'
ORDER BY published_at DESC;
```

## Frontend

### Установка
```bash
npm install @editorjs/editorjs @editorjs/header @editorjs/list
npm install @editorjs/code @editorjs/image @editorjs/table
```

### Инициализация
```typescript
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    header: {
      class: Header,
      config: { levels: [2, 3, 4], defaultLevel: 2 }
    },
    list: List,
    image: {
      class: Image,
      config: {
        uploader: {
          uploadByFile: async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            const data = await res.json();
            return { success: 1, file: { url: data.url } };
          }
        }
      }
    }
  },
  data: initialContent
});
```

### Сохранение
```typescript
const content = await editor.save();

// Расчет времени чтения
function calculateReadingTime(content: any): number {
  const wordsPerMinute = 200;
  let totalWords = 0;
  content.blocks?.forEach(block => {
    if (block.data?.text) {
      totalWords += block.data.text.split(/\s+/).length;
    }
  });
  return Math.ceil(totalWords / wordsPerMinute);
}

await fetch('/api/nodes', {
  method: 'POST',
  body: JSON.stringify({
    title, excerpt, content,
    readingTime: calculateReadingTime(content),
    status: 'published'
  })
});
```

## Backend (NestJS)

### Entity
```typescript
@Entity('nodes')
export class Node {
  @Column({ type: 'jsonb' })
  content: {
    time?: number;
    blocks: Array<{ type: string; data: any }>;
    version: string;
  };

  @Column({ type: 'text', nullable: true })
  contentHtml: string;

  @Column({ default: 0 })
  readingTime: number;
}
```

### Генерация HTML
```typescript
import * as edjsHTML from 'editorjs-html';

function generateHtml(content: any): string {
  const parser = edjsHTML();
  return parser.parse(content).join('');
}
```

## Ссылки

- [EditorJS](https://editorjs.io/)
- [GitHub](https://github.com/codex-team/editor.js)