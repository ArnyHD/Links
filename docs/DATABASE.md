# Database Schema

## Диаграмма связей

```
┌──────────────┐
│    users     │
└──────┬───────┘
       │ creates
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────┐
│   domains    │   │    nodes     │
└──────┬───────┘   └──────┬───────┘
       │ has             │ has
       ├─────────────┐   ├──────────────┐
       │             │   │              │
       ▼             ▼   ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ node_types  │ │ edge_types  │ │   edges     │
└─────────────┘ └─────────────┘ └──────┬──────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │   ratings   │
                                └─────────────┘
```

## Таблицы

### users

Пользователи системы.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  language VARCHAR(10) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  roles TEXT[] DEFAULT ARRAY['user'],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### domains

Домены знаний (физика, математика, etc.).

```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  translations JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  creator_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_domains_slug ON domains(slug);
CREATE INDEX idx_domains_creator ON domains(creator_id);
CREATE INDEX idx_domains_public ON domains(is_public, is_active);
```

**Пример settings:**
```json
{
  "allowComments": true,
  "requireModeration": false,
  "ratingAlgorithm": "weighted_graph",
  "customFields": {}
}
```

### node_types

Типы узлов, определяемые пользователем.

```sql
CREATE TABLE node_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  translations JSONB DEFAULT '{}',
  icon VARCHAR(100),
  color VARCHAR(20),
  schema JSONB DEFAULT '{}',
  "order" INTEGER DEFAULT 0,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(domain_id, slug)
);

CREATE INDEX idx_node_types_domain ON node_types(domain_id);
```

**Пример schema (JSON Schema):**
```json
{
  "properties": {
    "year": {
      "type": "number",
      "label": "Year of experiment",
      "required": true
    },
    "accuracy": {
      "type": "number",
      "label": "Accuracy (%)",
      "min": 0,
      "max": 100
    },
    "methodology": {
      "type": "string",
      "label": "Methodology description"
    }
  }
}
```

### nodes

Узлы графа (теории, эксперименты, аксиомы, etc.).

```sql
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT,
  translations JSONB DEFAULT '{}',
  data JSONB DEFAULT '{}',
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'draft',
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES node_types(id),
  creator_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nodes_domain_type ON nodes(domain_id, type_id);
CREATE INDEX idx_nodes_slug ON nodes(slug);
CREATE INDEX idx_nodes_status ON nodes(status);
CREATE INDEX idx_nodes_tags ON nodes USING GIN(tags);
CREATE INDEX idx_nodes_data ON nodes USING GIN(data);
```

**Пример data:**
```json
{
  "year": 1887,
  "accuracy": 99.9,
  "methodology": "Interferometer measurements",
  "customField": "any value"
}
```

### edge_types

Типы связей между узлами.

```sql
CREATE TABLE edge_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  translations JSONB DEFAULT '{}',
  semantic_type VARCHAR(50) NOT NULL,
  icon VARCHAR(100),
  color VARCHAR(20),
  weight FLOAT DEFAULT 0,
  is_directed BOOLEAN DEFAULT false,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(domain_id, slug)
);

CREATE INDEX idx_edge_types_domain ON edge_types(domain_id);
```

**semantic_type значения:**
- `supports` - поддерживает (вес +1)
- `contradicts` - противоречит (вес -1)
- `derives_from` - следует из (вес +0.5)
- `part_of` - является частью
- `custom` - пользовательский

### edges

Связи между узлами графа.

```sql
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES edge_types(id),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_id, target_id, type_id)
);

CREATE INDEX idx_edges_source ON edges(source_id, type_id);
CREATE INDEX idx_edges_target ON edges(target_id, type_id);
CREATE INDEX idx_edges_type ON edges(type_id);
```

**Пример metadata:**
```json
{
  "confidence": 0.95,
  "notes": "Strong experimental evidence",
  "references": ["paper1", "paper2"]
}
```

### ratings

Рейтинги узлов и концепций.

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL,
  score FLOAT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ratings_node_metric ON ratings(node_id, metric_type);
```

**metric_type значения:**
- `consistency` - непротиворечивость
- `coherence` - целостность
- `connectivity` - связность
- `overall` - общий рейтинг

**Пример details:**
```json
{
  "supportingEdges": 15,
  "contradictingEdges": 2,
  "derivedNodes": 8,
  "algorithm": "weighted_graph_v1",
  "factors": {
    "directSupport": 0.8,
    "indirectSupport": 0.15,
    "contradictions": -0.3
  }
}
```

## Запросы для работы с графом

### Получить все связи узла

```sql
-- Исходящие связи
SELECT e.*, et.name as type_name, n.title as target_title
FROM edges e
JOIN edge_types et ON e.type_id = et.id
JOIN nodes n ON e.target_id = n.id
WHERE e.source_id = :nodeId;

-- Входящие связи
SELECT e.*, et.name as type_name, n.title as source_title
FROM edges e
JOIN edge_types et ON e.type_id = et.id
JOIN nodes n ON e.source_id = n.id
WHERE e.target_id = :nodeId;
```

### Найти путь между узлами

```sql
WITH RECURSIVE path AS (
  -- Начальный узел
  SELECT
    source_id,
    target_id,
    ARRAY[source_id, target_id] as path,
    1 as depth
  FROM edges
  WHERE source_id = :startNodeId

  UNION ALL

  -- Рекурсивный шаг
  SELECT
    e.source_id,
    e.target_id,
    p.path || e.target_id,
    p.depth + 1
  FROM edges e
  JOIN path p ON e.source_id = p.target_id
  WHERE NOT e.target_id = ANY(p.path)  -- Избегаем циклов
    AND p.depth < 10  -- Ограничение глубины
)
SELECT * FROM path
WHERE target_id = :endNodeId
ORDER BY depth
LIMIT 1;
```

### Подсчет рейтинга узла

```sql
SELECT
  n.id,
  n.title,
  COUNT(CASE WHEN et.semantic_type = 'supports' THEN 1 END) as supports,
  COUNT(CASE WHEN et.semantic_type = 'contradicts' THEN 1 END) as contradicts,
  SUM(et.weight) as total_weight
FROM nodes n
LEFT JOIN edges e ON n.id = e.target_id
LEFT JOIN edge_types et ON e.type_id = et.id
WHERE n.id = :nodeId
GROUP BY n.id, n.title;
```

## Миграции

Миграции создаются через TypeORM CLI:

```bash
# Генерация миграции
npm run migration:generate -- -n MigrationName

# Запуск миграций
npm run migration:run

# Откат миграции
npm run migration:revert
```

## Индексы и оптимизация

1. **GIN индексы для JSONB**
   - Быстрый поиск по вложенным полям
   - Поддержка операторов @>, ?

2. **Индексы для графовых запросов**
   - Composite индексы на (source_id, type_id)
   - Ускоряют обход графа

3. **Партиционирование** (для больших объемов)
   - Партиционирование nodes по domain_id
   - Партиционирование edges по дате создания
