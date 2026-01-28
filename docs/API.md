# API Documentation

## Base URL

```
http://localhost:3000/api
```

В production замените на ваш домен.

## Authentication

Аутентификация через JWT токены (будет реализована в следующей версии).

```
Authorization: Bearer <token>
```

## REST API Endpoints

### Domains

#### GET /domains

Получить список всех доменов.

**Query Parameters:**
- `public` (boolean, optional) - фильтр по публичности

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Physics Theories",
    "slug": "physics-theories",
    "description": "Domain for physics theories",
    "isPublic": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /domains/:id

Получить домен по ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Physics Theories",
  "slug": "physics-theories",
  "description": "Domain for physics theories",
  "translations": {
    "ru": {
      "name": "Физические теории",
      "description": "Домен для физических теорий"
    }
  },
  "isPublic": true,
  "settings": {
    "allowComments": true,
    "requireModeration": false
  },
  "creator": {
    "id": "uuid",
    "username": "user123"
  },
  "nodeTypes": [...],
  "edgeTypes": [...]
}
```

#### GET /domains/slug/:slug

Получить домен по slug.

#### POST /domains

Создать новый домен.

**Request Body:**
```json
{
  "name": "Physics Theories",
  "description": "Domain for physics theories",
  "isPublic": true,
  "settings": {
    "allowComments": true
  }
}
```

**Response:** Созданный домен (как в GET /domains/:id)

#### PATCH /domains/:id

Обновить домен.

**Request Body:** Partial<CreateDomainDto>

#### DELETE /domains/:id

Удалить домен.

### Node Types

#### GET /node-types

Получить все типы узлов.

**Query Parameters:**
- `domainId` (string, required)

#### POST /node-types

Создать тип узла.

**Request Body:**
```json
{
  "name": "Experiment",
  "slug": "experiment",
  "description": "Scientific experiment",
  "domainId": "uuid",
  "icon": "experiment-icon",
  "color": "#FF5733",
  "schema": {
    "properties": {
      "year": {
        "type": "number",
        "label": "Year",
        "required": true
      },
      "accuracy": {
        "type": "number",
        "label": "Accuracy (%)"
      }
    }
  }
}
```

### Nodes

#### GET /nodes

Получить узлы.

**Query Parameters:**
- `domainId` (string, required)
- `typeId` (string, optional)
- `status` (string, optional) - draft, published, archived
- `page` (number, optional) - default: 1
- `limit` (number, optional) - default: 20

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Michelson-Morley Experiment",
      "slug": "michelson-morley-experiment",
      "content": "Description...",
      "data": {
        "year": 1887,
        "accuracy": 99.9
      },
      "tags": ["optics", "interference"],
      "status": "published",
      "type": {
        "id": "uuid",
        "name": "Experiment"
      },
      "creator": {
        "id": "uuid",
        "username": "user123"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### GET /nodes/:id

Получить узел по ID с его связями.

**Response:**
```json
{
  "id": "uuid",
  "title": "Michelson-Morley Experiment",
  "content": "...",
  "data": {...},
  "outgoingEdges": [
    {
      "id": "uuid",
      "target": {
        "id": "uuid",
        "title": "Special Relativity"
      },
      "type": {
        "name": "supports",
        "semanticType": "supports"
      }
    }
  ],
  "incomingEdges": [...],
  "ratings": [
    {
      "metricType": "consistency",
      "score": 0.95
    }
  ]
}
```

#### POST /nodes

Создать узел.

**Request Body:**
```json
{
  "title": "Michelson-Morley Experiment",
  "content": "Description of the experiment...",
  "domainId": "uuid",
  "typeId": "uuid",
  "data": {
    "year": 1887,
    "accuracy": 99.9
  },
  "tags": ["optics", "interference"],
  "status": "published"
}
```

#### PATCH /nodes/:id

Обновить узел.

#### DELETE /nodes/:id

Удалить узел.

### Edges

#### GET /edges

Получить связи.

**Query Parameters:**
- `sourceId` (string, optional)
- `targetId` (string, optional)
- `typeId` (string, optional)

#### POST /edges

Создать связь.

**Request Body:**
```json
{
  "sourceId": "uuid",
  "targetId": "uuid",
  "typeId": "uuid",
  "description": "This experiment supports the theory",
  "metadata": {
    "confidence": 0.95,
    "references": ["paper1"]
  }
}
```

#### DELETE /edges/:id

Удалить связь.

### Ratings

#### GET /ratings

Получить рейтинги узла.

**Query Parameters:**
- `nodeId` (string, required)

**Response:**
```json
[
  {
    "id": "uuid",
    "metricType": "consistency",
    "score": 0.95,
    "details": {
      "supportingEdges": 10,
      "contradictingEdges": 1,
      "algorithm": "weighted_graph_v1"
    }
  },
  {
    "metricType": "coherence",
    "score": 0.88
  }
]
```

#### POST /ratings/calculate

Рассчитать рейтинг узла.

**Request Body:**
```json
{
  "nodeId": "uuid",
  "metricTypes": ["consistency", "coherence", "overall"]
}
```

## GraphQL API

Endpoint: `http://localhost:3000/graphql`

### Queries

#### domains

```graphql
query {
  domains {
    id
    name
    slug
    description
    isPublic
    nodeTypes {
      id
      name
    }
  }
}
```

#### domain

```graphql
query GetDomain($id: ID!) {
  domain(id: $id) {
    id
    name
    nodeTypes {
      id
      name
      nodes {
        id
        title
      }
    }
  }
}
```

#### node

```graphql
query GetNode($id: ID!) {
  node(id: $id) {
    id
    title
    content
    data
    outgoingEdges {
      id
      target {
        id
        title
      }
      type {
        name
        semanticType
      }
    }
  }
}
```

### Mutations

#### createDomain

```graphql
mutation CreateDomain($input: CreateDomainInput!) {
  createDomain(input: $input) {
    id
    name
    slug
  }
}
```

Variables:
```json
{
  "input": {
    "name": "Physics Theories",
    "description": "Domain for physics",
    "isPublic": true
  }
}
```

#### createNode

```graphql
mutation CreateNode($input: CreateNodeInput!) {
  createNode(input: $input) {
    id
    title
  }
}
```

#### createEdge

```graphql
mutation CreateEdge($input: CreateEdgeInput!) {
  createEdge(input: $input) {
    id
    source {
      title
    }
    target {
      title
    }
  }
}
```

## Error Handling

Все ошибки возвращаются в формате:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "name",
      "message": "name should not be empty"
    }
  ]
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (валидация)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

(будет добавлено)

## Webhooks

(будет добавлено)

## Examples

### Создание физической теории

```javascript
// 1. Создать домен
const domain = await fetch('http://localhost:3000/api/domains', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Physics Theories',
    description: 'Alternative physics theories',
    isPublic: true
  })
}).then(r => r.json());

// 2. Создать типы узлов
const axiomType = await fetch('http://localhost:3000/api/node-types', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Axiom',
    slug: 'axiom',
    domainId: domain.id,
    color: '#FF6B6B'
  })
}).then(r => r.json());

const experimentType = await fetch('http://localhost:3000/api/node-types', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Experiment',
    slug: 'experiment',
    domainId: domain.id,
    color: '#4ECDC4',
    schema: {
      properties: {
        year: { type: 'number', label: 'Year', required: true },
        accuracy: { type: 'number', label: 'Accuracy (%)' }
      }
    }
  })
}).then(r => r.json());

// 3. Создать узлы
const axiom = await fetch('http://localhost:3000/api/nodes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Principle of Relativity',
    content: 'Laws of physics are the same in all inertial frames',
    domainId: domain.id,
    typeId: axiomType.id,
    status: 'published'
  })
}).then(r => r.json());

const experiment = await fetch('http://localhost:3000/api/nodes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Michelson-Morley Experiment',
    content: 'Experiment to detect ether wind',
    domainId: domain.id,
    typeId: experimentType.id,
    data: { year: 1887, accuracy: 99.9 },
    status: 'published'
  })
}).then(r => r.json());

// 4. Создать типы связей
const supportsType = await fetch('http://localhost:3000/api/edge-types', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Supports',
    slug: 'supports',
    domainId: domain.id,
    semanticType: 'supports',
    weight: 1.0,
    color: '#51CF66'
  })
}).then(r => r.json());

// 5. Создать связь
await fetch('http://localhost:3000/api/edges', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceId: experiment.id,
    targetId: axiom.id,
    typeId: supportsType.id,
    description: 'Experiment supports the principle'
  })
});
```
