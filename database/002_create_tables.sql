-- ============================================================================
-- Knowledge Graph Platform - Database Initialization
-- Script 2: Create Tables (with OAuth support)
-- ============================================================================

-- ============================================================================
-- Table: users
-- Description: Пользователи системы (с поддержкой OAuth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255),  -- NULLABLE для OAuth пользователей
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),  -- Полное имя из OAuth
    avatar_url VARCHAR(500),
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    roles TEXT[] DEFAULT ARRAY['user'],
    metadata JSONB DEFAULT '{}',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Пользователи платформы (поддержка локальной авторизации и OAuth)';
COMMENT ON COLUMN users.email IS 'Email пользователя (UNIQUE, может быть получен от OAuth провайдера)';
COMMENT ON COLUMN users.password IS 'Хеш пароля (NULL для OAuth пользователей)';
COMMENT ON COLUMN users.display_name IS 'Отображаемое имя (из OAuth или заполненное вручную)';
COMMENT ON COLUMN users.is_email_verified IS 'Email подтвержден (автоматически true для OAuth)';
COMMENT ON COLUMN users.roles IS 'Роли пользователя: user, moderator, admin';
COMMENT ON COLUMN users.metadata IS 'Дополнительные данные пользователя';

-- ============================================================================
-- Table: oauth_accounts
-- Description: OAuth аккаунты пользователей (Google, GitHub, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,  -- google, github, facebook, etc.
    provider_user_id VARCHAR(255) NOT NULL,  -- ID пользователя у провайдера
    provider_email VARCHAR(255),
    provider_username VARCHAR(255),
    display_name VARCHAR(200),
    avatar_url VARCHAR(500),
    access_token TEXT,  -- Зашифрованный токен доступа
    refresh_token TEXT,  -- Зашифрованный refresh token
    token_expires_at TIMESTAMP,
    scopes TEXT[],  -- Разрешения (scopes)
    raw_data JSONB DEFAULT '{}',  -- Полный ответ от провайдера
    last_used_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_oauth_provider_user UNIQUE (provider, provider_user_id)
);

COMMENT ON TABLE oauth_accounts IS 'OAuth аккаунты пользователей (связь с внешними провайдерами)';
COMMENT ON COLUMN oauth_accounts.provider IS 'Провайдер: google, github, facebook, microsoft, etc.';
COMMENT ON COLUMN oauth_accounts.provider_user_id IS 'ID пользователя у провайдера (sub в Google JWT)';
COMMENT ON COLUMN oauth_accounts.access_token IS 'Токен доступа (зашифрован, для API запросов)';
COMMENT ON COLUMN oauth_accounts.refresh_token IS 'Refresh token для обновления access_token';
COMMENT ON COLUMN oauth_accounts.raw_data IS 'Полный ответ от провайдера (userInfo)';

-- ============================================================================
-- Table: sessions
-- Description: Сессии пользователей (для JWT refresh tokens)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}',  -- User-Agent, IP, device type
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE sessions IS 'Активные сессии пользователей (для управления refresh tokens)';
COMMENT ON COLUMN sessions.device_info IS 'Информация об устройстве: userAgent, ip, deviceType, location';

-- ============================================================================
-- Table: domains
-- Description: Домены знаний (физика, математика, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    translations JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    creator_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_domain_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE domains IS 'Домены знаний (темы/области исследований)';
COMMENT ON COLUMN domains.slug IS 'URL-friendly идентификатор';
COMMENT ON COLUMN domains.translations IS 'Переводы названия и описания: {"ru": {"name": "...", "description": "..."}}';
COMMENT ON COLUMN domains.settings IS 'Настройки домена: allowComments, requireModeration, ratingAlgorithm, etc.';

-- ============================================================================
-- Table: node_types
-- Description: Типы узлов, определяемые пользователем
-- ============================================================================
CREATE TABLE IF NOT EXISTS node_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    translations JSONB DEFAULT '{}',
    icon VARCHAR(100),
    color VARCHAR(20) DEFAULT '#1890ff',
    schema JSONB DEFAULT '{}',
    "order" INTEGER DEFAULT 0,
    domain_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_nodetype_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    CONSTRAINT uk_nodetype_domain_slug UNIQUE (domain_id, slug)
);

COMMENT ON TABLE node_types IS 'Типы узлов графа (Теория, Эксперимент, Аксиома, etc.)';
COMMENT ON COLUMN node_types.schema IS 'JSON Schema для валидации полей узлов этого типа';
COMMENT ON COLUMN node_types."order" IS 'Порядок отображения';

-- ============================================================================
-- Table: nodes
-- Description: Узлы графа (статьи с EditorJS контентом)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    excerpt TEXT,  -- Краткое описание для превью
    cover_image VARCHAR(500),  -- URL обложки статьи

    -- EditorJS content
    content JSONB DEFAULT '{"blocks": [], "version": "2.28.0"}',  -- EditorJS JSON
    content_html TEXT,  -- Кэшированная HTML версия (для SEO)

    -- Metadata
    reading_time INTEGER DEFAULT 0,  -- Время чтения в минутах
    translations JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',  -- Пользовательские данные (согласно schema)
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Status and relations
    status VARCHAR(20) DEFAULT 'draft',
    domain_id UUID NOT NULL,
    type_id UUID NOT NULL,
    creator_id UUID NOT NULL,

    -- Timestamps
    published_at TIMESTAMP,  -- Когда опубликовано
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_node_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    CONSTRAINT fk_node_type FOREIGN KEY (type_id) REFERENCES node_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_node_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_node_slug UNIQUE (slug),
    CONSTRAINT chk_node_status CHECK (status IN ('draft', 'published', 'archived'))
);

COMMENT ON TABLE nodes IS 'Узлы графа знаний (статьи с EditorJS контентом)';
COMMENT ON COLUMN nodes.excerpt IS 'Краткое описание статьи для карточек и превью';
COMMENT ON COLUMN nodes.cover_image IS 'URL обложки статьи (опционально)';
COMMENT ON COLUMN nodes.content IS 'EditorJS JSON контент (блоки: paragraph, header, list, code, image, etc.)';
COMMENT ON COLUMN nodes.content_html IS 'Кэшированный HTML для быстрого отображения и SEO';
COMMENT ON COLUMN nodes.reading_time IS 'Расчетное время чтения в минутах';
COMMENT ON COLUMN nodes.data IS 'Пользовательские данные согласно schema из node_types';
COMMENT ON COLUMN nodes.status IS 'Статус: draft, published, archived';
COMMENT ON COLUMN nodes.published_at IS 'Дата и время публикации';

-- ============================================================================
-- Table: edge_types
-- Description: Типы связей между узлами
-- ============================================================================
CREATE TABLE IF NOT EXISTS edge_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    translations JSONB DEFAULT '{}',
    semantic_type VARCHAR(50) NOT NULL DEFAULT 'custom',
    icon VARCHAR(100),
    color VARCHAR(20) DEFAULT '#52c41a',
    weight FLOAT DEFAULT 0,
    is_directed BOOLEAN DEFAULT true,
    domain_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_edgetype_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    CONSTRAINT uk_edgetype_domain_slug UNIQUE (domain_id, slug),
    CONSTRAINT chk_edgetype_semantic CHECK (semantic_type IN ('supports', 'contradicts', 'derives_from', 'part_of', 'requires', 'custom'))
);

COMMENT ON TABLE edge_types IS 'Типы связей между узлами';
COMMENT ON COLUMN edge_types.semantic_type IS 'Семантический тип: supports (+1), contradicts (-1), derives_from (+0.5), part_of, requires, custom';
COMMENT ON COLUMN edge_types.weight IS 'Вес связи для расчета рейтингов';
COMMENT ON COLUMN edge_types.is_directed IS 'Направленная ли связь';

-- ============================================================================
-- Table: edges
-- Description: Связи между узлами графа
-- ============================================================================
CREATE TABLE IF NOT EXISTS edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL,
    target_id UUID NOT NULL,
    type_id UUID NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_edge_source FOREIGN KEY (source_id) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_edge_target FOREIGN KEY (target_id) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_edge_type FOREIGN KEY (type_id) REFERENCES edge_types(id) ON DELETE RESTRICT,
    CONSTRAINT uk_edge_source_target_type UNIQUE (source_id, target_id, type_id),
    CONSTRAINT chk_edge_no_self_loop CHECK (source_id != target_id)
);

COMMENT ON TABLE edges IS 'Связи между узлами графа';
COMMENT ON COLUMN edges.metadata IS 'Дополнительные данные: confidence, references, notes, etc.';

-- ============================================================================
-- Table: ratings
-- Description: Рейтинги узлов и концепций
-- ============================================================================
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    score FLOAT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_rating_node FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT chk_rating_metric CHECK (metric_type IN ('consistency', 'coherence', 'connectivity', 'overall')),
    CONSTRAINT chk_rating_score CHECK (score >= -1 AND score <= 1)
);

COMMENT ON TABLE ratings IS 'Рейтинги узлов графа';
COMMENT ON COLUMN ratings.metric_type IS 'Тип метрики: consistency, coherence, connectivity, overall';
COMMENT ON COLUMN ratings.score IS 'Оценка от -1 до 1';
COMMENT ON COLUMN ratings.details IS 'Детали расчета: supportingEdges, contradictingEdges, algorithm, factors, etc.';

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✓ All tables created successfully (with OAuth support)';
    RAISE NOTICE '  - users: Main user accounts';
    RAISE NOTICE '  - oauth_accounts: OAuth provider connections';
    RAISE NOTICE '  - sessions: JWT refresh token management';
END $$;