# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knowledge Graph Platform - A full-stack application for building and managing knowledge graphs, created for alternative physics theories and aether dynamics. The platform supports graph-based knowledge representation with nodes (articles with EditorJS content), edges (relationships), and sophisticated rating systems.

**Stack:**
- Backend: NestJS + TypeORM + PostgreSQL
- Frontend: React 19 + Vite + React Router
- Database: PostgreSQL with UUID-OSSP, pg_trgm, btree_gin extensions
- Auth: Google OAuth 2.0 + JWT

## Development Commands

### Database Setup

**Initial setup (Windows):**
```bash
cd database
setup.bat
```

**Manual setup:**
```bash
cd database
set PGPASSWORD=your_password
psql -h host -U user -d dbname -f run_all.sql
```

**Test database connection:**
```bash
npm run db:test
```

**Reset database (WARNING: destroys all data):**
```bash
cd database
reset.bat
```

### Backend (NestJS)

**Setup:**
```bash
cd backend
npm install
cp .env.example .env  # Configure database and OAuth credentials
```

**Development:**
```bash
cd backend
npm run start:dev  # Run in watch mode
npm run start      # Run normally
npm run build      # Build for production
npm run start:prod # Run production build
```

Backend runs on `http://localhost:3000` by default (configurable via PORT env var).

### Frontend (React + Vite)

**Setup:**
```bash
cd frontend
npm install
```

**Development:**
```bash
cd frontend
npm run dev     # Start dev server (default: http://localhost:5173)
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

## Architecture

### Database Schema (9 Tables)

The database uses PostgreSQL with 40+ indexes for performance. Key relationships:

```
users (OAuth support, password nullable)
  ├─ oauth_accounts (Google OAuth, encrypted tokens)
  ├─ sessions (JWT refresh tokens)
  └─ domains (knowledge domains)
      ├─ node_types (Axiom, Theory, Experiment, etc.)
      │   └─ nodes (articles with EditorJS JSON content)
      │       └─ ratings (consistency, coherence, connectivity)
      └─ edge_types (semantic relationships)
          └─ edges (directed graph connections)
```

**Critical tables:**
- `nodes`: Store articles with EditorJS content in JSONB format. Fields: title, slug, content (JSONB), excerpt, cover_image, content_html, reading_time, translations, data, tags[], status (draft/published/archived)
- `edges`: Graph relationships with source_id → target_id. Has composite indexes on (source_id, type_id) and (target_id, type_id) for fast graph traversal
- `oauth_accounts`: Google OAuth integration. Stores encrypted access_token and refresh_token. Links to users via user_id
- `sessions`: JWT refresh token management with device_info JSONB

See `database/SCHEMA.md` for complete schema documentation.

### Backend Structure (NestJS)

**Module organization:**
- `src/auth/` - Google OAuth + JWT authentication
  - `strategies/google.strategy.ts` - Passport Google OAuth20
  - `strategies/jwt.strategy.ts` - JWT validation
- `src/domains/` - Domain CRUD operations
- `src/node-types/` - Node type definitions
- `src/nodes/` - Node (article) management with EditorJS
- `src/edge-types/` - Edge type definitions
- `src/edges/` - Graph edge management
- `src/entities/` - TypeORM entities matching database schema

**Key files:**
- `src/main.ts` - App bootstrap with CORS enabled
- `src/app.module.ts` - Root module with TypeORM configuration (synchronize: false - uses manual migrations)
- `src/entities/index.ts` - Entity exports

**TypeORM Configuration:**
- Uses manual SQL migrations (in `database/` folder) instead of synchronize
- Entities: User, OAuthAccount, Domain, NodeType, EdgeType, Node, Edge
- Logging enabled in development mode

### Frontend Structure (React)

**Key patterns:**
- React 19 with StrictMode enabled
- Context API for auth state management (`context/AuthContext.jsx`)
- Protected routes with `components/ProtectedRoute.jsx`
- Service layer pattern (`services/api.js`, `services/auth.js`, `services/domains.js`)

**Routes:**
- `/login` - Login page with Google OAuth button
- `/auth/callback` - OAuth callback handler
- `/` - Protected home page (requires authentication)

**Authentication flow:**
1. User clicks Google login → redirects to backend `/auth/google`
2. Google redirects to `/auth/google/callback` → backend validates
3. Backend redirects to frontend `/auth/callback?token=...`
4. Frontend saves token + user data in localStorage
5. AuthContext provides auth state globally via `useAuth()` hook

### EditorJS Integration

Nodes store content as EditorJS JSON in the `content` JSONB field:

```json
{
  "time": 1635603431943,
  "blocks": [
    {"type": "header", "data": {"text": "Title", "level": 2}},
    {"type": "paragraph", "data": {"text": "Text with <b>bold</b>"}},
    {"type": "image", "data": {"file": {"url": "..."}, "caption": "..."}}
  ],
  "version": "2.28.0"
}
```

Additional fields: `content_html` (cached HTML for SEO), `reading_time` (minutes), `excerpt` (preview text).

See `database/EDITORJS_GUIDE.md` for implementation details.

## Environment Configuration

**Required environment variables:**

Backend (`backend/.env`):
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=knowledge_graph
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Frontend uses `FRONTEND_URL` from backend for OAuth redirects.

## Key Constraints and Patterns

### Database Constraints
- `users.password` is NULLABLE (required for OAuth-only users)
- `nodes.slug` must be UNIQUE across all nodes
- `edges` cannot create self-loops (source_id != target_id)
- `oauth_accounts` has UNIQUE constraint on (provider, provider_user_id)
- All UUIDs are generated by PostgreSQL uuid-ossp extension

### Security
- OAuth tokens in `oauth_accounts` should be encrypted (access_token, refresh_token fields)
- JWT tokens have 7-day expiration (configurable in auth.module.ts)
- CORS is enabled globally in backend main.ts
- Passwords are stored as bcrypt hashes (when used)

### Performance
- Graph traversal queries MUST use indexes on edges (source_id, target_id, type_id)
- Use GIN indexes for JSONB queries (content, data, translations fields)
- Use pg_trgm indexes for fuzzy text search (title, excerpt fields)
- The `sessions` table requires periodic cleanup of expired tokens

### Entity Relationships
- When deleting a domain, cascade deletes node_types, edge_types, nodes, and edges
- When deleting a user, consider their created domains/nodes (may want soft delete)
- Edges require both source and target nodes to exist (FK constraints)

## Seed Data

After running database setup scripts, the following test data is available:
- Admin user: `admin@example.com` / `password`
- OAuth test user: `test.oauth@example.com` (requires Google OAuth)
- Domain: "Physics Theories"
- 5 node types: Axiom, Theory, Experiment, Interpretation, Concept
- 5 edge types: Derives From, Supports, Contradicts, Part Of, Interprets

## Common Operations

### Adding a new entity module (backend)
1. Create entity in `src/entities/[name].entity.ts` with TypeORM decorators
2. Export from `src/entities/index.ts`
3. Add to entities array in `app.module.ts` TypeOrmModule.forRoot()
4. Create module/service/controller with `nest g resource [name]`
5. Add module to imports in `app.module.ts`

### Modifying database schema
1. Edit SQL files in `database/` directory (002_create_tables.sql, 003_create_indexes.sql)
2. Run `reset.bat` (WARNING: destroys data) or manually apply migration
3. Update corresponding TypeORM entities in `src/entities/`
4. Restart backend server

### Adding new frontend routes
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx` Routes
3. Use `<ProtectedRoute>` wrapper for authenticated routes
4. Add API service methods in `src/services/` if needed
