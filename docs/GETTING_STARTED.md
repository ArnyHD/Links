# Getting Started - Первые шаги

## Текущее состояние проекта

✅ **Готово:**
- Структура монорепозитория
- Backend: NestJS с TypeORM и PostgreSQL
- Frontend: React с Vite и Ant Design
- Модели данных для всех сущностей
- Docker Compose для PostgreSQL
- Базовая документация
- Многоязычность (i18n)

⏳ **В разработке:**
- CRUD контроллеры для всех модулей
- Миграции базы данных
- Полная интеграция frontend и backend
- Визуализация графа
- Система рейтингов

## Структура проекта

```
knowledge-graph-platform/
│
├── apps/
│   ├── backend/                    # Backend (NestJS)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/          # Аутентификация
│   │   │   │   ├── users/         # Пользователи
│   │   │   │   ├── domains/       # ✅ Домены (реализовано)
│   │   │   │   ├── node-types/    # Типы узлов
│   │   │   │   ├── nodes/         # Узлы графа
│   │   │   │   ├── edge-types/    # Типы связей
│   │   │   │   ├── edges/         # Связи
│   │   │   │   └── ratings/       # Рейтинги
│   │   │   ├── app.module.ts      # ✅ Главный модуль
│   │   │   └── main.ts            # ✅ Entry point
│   │   ├── .env                   # ✅ Переменные окружения
│   │   └── package.json           # ✅ Зависимости
│   │
│   └── frontend/                   # Frontend (React)
│       ├── src/
│       │   ├── api/               # ✅ API клиенты
│       │   ├── components/        # ✅ Компоненты
│       │   ├── pages/             # ✅ Страницы
│       │   ├── i18n/              # ✅ Локализация
│       │   ├── App.tsx            # ✅ Главный компонент
│       │   └── main.tsx           # ✅ Entry point
│       └── package.json           # ✅ Зависимости
│
├── packages/
│   └── shared/                    # ✅ Общие типы
│       └── src/
│           ├── types/             # TypeScript типы
│           └── constants/         # Константы
│
├── docs/                          # ✅ Документация
│   ├── OVERVIEW.md               # Обзор проекта
│   ├── SETUP.md                  # Установка
│   ├── ARCHITECTURE.md           # Архитектура
│   ├── DATABASE.md               # База данных
│   ├── API.md                    # API документация
│   ├── EXAMPLES.md               # Примеры
│   └── ROADMAP.md                # План развития
│
├── docker/                        # ✅ Docker конфигурация
├── docker-compose.yml             # ✅ Docker Compose
├── package.json                   # ✅ Root package.json
└── README.md                      # ✅ Главный README
```

## Следующие шаги разработки

### Шаг 1: Завершение Backend (2-3 дня)

#### 1.1 Создать миграции TypeORM

```bash
cd apps/backend

# Создать миграцию
npm run typeorm migration:generate -- -n InitialSchema

# Проверить миграцию в src/migrations/
# Запустить миграцию
npm run migration:run
```

#### 1.2 Реализовать CRUD для остальных модулей

По аналогии с `DomainsModule`, создать:

**NodeTypesModule:**
- `node-types.service.ts` - CRUD операции
- `node-types.controller.ts` - REST endpoints
- `dto/create-node-type.dto.ts` - DTO для создания
- `dto/update-node-type.dto.ts` - DTO для обновления

**NodesModule:**
- `nodes.service.ts`
- `nodes.controller.ts`
- DTOs для создания/обновления узлов

**EdgeTypesModule:**
- `edge-types.service.ts`
- `edge-types.controller.ts`
- DTOs

**EdgesModule:**
- `edges.service.ts`
- `edges.controller.ts`
- DTOs

**RatingsModule:**
- `ratings.service.ts`
- `ratings.controller.ts`
- Логика расчета рейтингов

#### 1.3 Добавить валидацию

В каждый DTO добавить декораторы `class-validator`:

```typescript
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
```

#### 1.4 Тестирование API

Использовать Swagger UI: http://localhost:3000/api/docs

### Шаг 2: Завершение Frontend (2-3 дня)

#### 2.1 Создать формы

**Форма создания домена:**
```tsx
// src/components/Domains/CreateDomainForm.tsx
import { Form, Input, Switch, Button } from 'antd';

export const CreateDomainForm = () => {
  const onFinish = async (values) => {
    await domainsApi.create(values);
  };

  return (
    <Form onFinish={onFinish}>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="isPublic" label="Public" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Button type="primary" htmlType="submit">Create</Button>
    </Form>
  );
};
```

#### 2.2 Создать API клиенты для остальных модулей

```typescript
// src/api/nodes.ts
export const nodesApi = {
  getAll: (domainId: string) => { /* ... */ },
  getById: (id: string) => { /* ... */ },
  create: (data: CreateNodeDto) => { /* ... */ },
  update: (id: string, data: UpdateNodeDto) => { /* ... */ },
  delete: (id: string) => { /* ... */ },
};
```

#### 2.3 Создать страницы

- **Node Editor Page** - редактор узлов
- **Node Types Management** - управление типами узлов
- **Edge Types Management** - управление типами связей

### Шаг 3: Визуализация графа (3-4 дня)

#### 3.1 Установить Cytoscape.js

```bash
cd apps/frontend
npm install cytoscape cytoscape-fcose
npm install --save-dev @types/cytoscape
```

#### 3.2 Создать компонент GraphView

```tsx
// src/components/Graph/GraphView.tsx
import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

cytoscape.use(fcose);

export const GraphView = ({ nodes, edges }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: {
        nodes: nodes.map(n => ({
          data: { id: n.id, label: n.title }
        })),
        edges: edges.map(e => ({
          data: { source: e.sourceId, target: e.targetId }
        }))
      },
      layout: { name: 'fcose' },
      style: [ /* стили */ ]
    });

    return () => cy.destroy();
  }, [nodes, edges]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
};
```

#### 3.3 Интегрировать в GraphViewPage

```tsx
// src/pages/GraphViewPage.tsx
const { data: graph } = useQuery({
  queryKey: ['graph', domainId],
  queryFn: () => graphApi.getGraph(domainId)
});

return <GraphView nodes={graph.nodes} edges={graph.edges} />;
```

### Шаг 4: Система рейтингов (2-3 дня)

#### 4.1 Реализовать алгоритмы расчета

```typescript
// apps/backend/src/modules/ratings/rating.calculator.ts
export class RatingCalculator {
  calculateConsistency(node: Node): number {
    const supportingEdges = /* подсчет поддерживающих связей */;
    const contradictingEdges = /* подсчет противоречащих связей */;

    return (supportingEdges - contradictingEdges) / totalEdges;
  }

  calculateCoherence(node: Node): number {
    // Логика расчета целостности
  }

  calculateConnectivity(node: Node): number {
    // Логика расчета связности
  }

  calculateOverall(node: Node): number {
    const consistency = this.calculateConsistency(node);
    const coherence = this.calculateCoherence(node);
    const connectivity = this.calculateConnectivity(node);

    return 0.4 * consistency + 0.3 * coherence + 0.3 * connectivity;
  }
}
```

#### 4.2 Создать endpoint для расчета

```typescript
@Post('ratings/calculate')
async calculateRating(@Body() dto: CalculateRatingDto) {
  return this.ratingsService.calculateAndSave(dto.nodeId, dto.metricTypes);
}
```

#### 4.3 Отображать рейтинги на UI

```tsx
// src/components/Ratings/RatingBadge.tsx
export const RatingBadge = ({ rating }) => {
  const color = rating > 0.7 ? 'green' : rating > 0.4 ? 'orange' : 'red';

  return (
    <Badge count={rating.toFixed(2)} style={{ backgroundColor: color }} />
  );
};
```

### Шаг 5: Аутентификация (2-3 дня)

#### 5.1 Реализовать AuthModule

```typescript
// apps/backend/src/modules/auth/auth.service.ts
@Injectable()
export class AuthService {
  async register(dto: RegisterDto): Promise<{ token: string }> {
    // Создать пользователя
    // Вернуть JWT токен
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    // Проверить credentials
    // Вернуть JWT токен
  }

  async validateToken(token: string): Promise<User> {
    // Валидировать JWT
    // Вернуть пользователя
  }
}
```

#### 5.2 Добавить JWT Guards

```typescript
// apps/backend/src/modules/auth/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### 5.3 Защитить endpoints

```typescript
@UseGuards(JwtAuthGuard)
@Post('domains')
createDomain(@CurrentUser() user: User, @Body() dto: CreateDomainDto) {
  return this.domainsService.create(dto, user.id);
}
```

#### 5.4 Реализовать Login/Register на фронте

```tsx
// src/pages/LoginPage.tsx
const LoginPage = () => {
  const login = async (credentials) => {
    const { token } = await authApi.login(credentials);
    localStorage.setItem('token', token);
    navigate('/domains');
  };

  return <LoginForm onSubmit={login} />;
};
```

## Команды для разработки

```bash
# Запустить все в dev режиме
npm run dev

# Запустить только backend
npm run dev:backend

# Запустить только frontend
npm run dev:frontend

# Собрать проект
npm run build

# Запустить тесты
npm run test

# Создать миграцию
npm run migration:generate --workspace=@kgp/backend -- -n MigrationName

# Запустить миграции
npm run migration:run --workspace=@kgp/backend

# Откатить миграцию
npm run migration:revert --workspace=@kgp/backend
```

## Полезные ресурсы

### Документация технологий
- [NestJS](https://docs.nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Cytoscape.js](https://js.cytoscape.org/)
- [React Query](https://tanstack.com/query/latest)

### Примеры кода
- Проекты на NestJS: [awesome-nestjs](https://github.com/nestjs/awesome-nestjs)
- Визуализация графов: [Cytoscape demos](https://js.cytoscape.org/demos/)
- TypeORM patterns: [TypeORM examples](https://github.com/typeorm/typeorm/tree/master/sample)

## Проверочный список MVP

- [ ] Backend CRUD для всех сущностей работает
- [ ] Swagger документация актуальна
- [ ] Миграции применены
- [ ] Frontend формы для создания доменов, узлов, связей
- [ ] Списки с пагинацией и фильтрацией
- [ ] Базовая визуализация графа (Cytoscape.js)
- [ ] Расчет рейтингов работает
- [ ] JWT аутентификация функционирует
- [ ] i18n работает (переключение EN/RU)
- [ ] Проект запускается одной командой
- [ ] Базовые тесты написаны

## Возможные проблемы и решения

### PostgreSQL не запускается
```bash
docker-compose down -v
docker-compose up -d postgres
docker-compose logs postgres
```

### TypeORM не находит entities
Проверьте путь в `app.module.ts`:
```typescript
entities: [__dirname + '/**/*.entity{.ts,.js}']
```

### CORS ошибки
Проверьте `CORS_ORIGIN` в `.env` и настройки в `main.ts`

### Frontend не может подключиться к API
Проверьте proxy в `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

## Контакты

Если у вас возникли вопросы:
1. Проверьте документацию в `/docs`
2. Посмотрите примеры в `EXAMPLES.md`
3. Создайте issue на GitHub

Удачи в разработке! 🚀
