-- ============================================================================
-- Knowledge Graph Platform - Database Initialization
-- Script 3: Create Indexes
-- ============================================================================

-- ============================================================================
-- Indexes for: users
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);

-- ============================================================================
-- Indexes for: oauth_accounts
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_oauth_user ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_provider ON oauth_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_provider_user ON oauth_accounts(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_provider_email ON oauth_accounts(provider_email);
CREATE INDEX IF NOT EXISTS idx_oauth_last_used ON oauth_accounts(last_used_at DESC);

-- ============================================================================
-- Indexes for: sessions
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity_at DESC);

-- ============================================================================
-- Indexes for: domains
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_domains_slug ON domains(slug);
CREATE INDEX IF NOT EXISTS idx_domains_creator ON domains(creator_id);
CREATE INDEX IF NOT EXISTS idx_domains_public_active ON domains(is_public, is_active);
CREATE INDEX IF NOT EXISTS idx_domains_name_trgm ON domains USING gin(name gin_trgm_ops);

-- ============================================================================
-- Indexes for: node_types
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_nodetypes_domain ON node_types(domain_id);
CREATE INDEX IF NOT EXISTS idx_nodetypes_slug ON node_types(domain_id, slug);
CREATE INDEX IF NOT EXISTS idx_nodetypes_order ON node_types(domain_id, "order");

-- ============================================================================
-- Indexes for: nodes
-- ============================================================================
-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_nodes_domain_type ON nodes(domain_id, type_id);
CREATE INDEX IF NOT EXISTS idx_nodes_slug ON nodes(slug);
CREATE INDEX IF NOT EXISTS idx_nodes_creator ON nodes(creator_id);
CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);
CREATE INDEX IF NOT EXISTS idx_nodes_created ON nodes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nodes_published ON nodes(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nodes_reading_time ON nodes(reading_time);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_nodes_title_trgm ON nodes USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_nodes_excerpt_trgm ON nodes USING gin(excerpt gin_trgm_ops);

-- Array indexes
CREATE INDEX IF NOT EXISTS idx_nodes_tags ON nodes USING gin(tags);

-- JSONB indexes
CREATE INDEX IF NOT EXISTS idx_nodes_content ON nodes USING gin(content);  -- EditorJS content
CREATE INDEX IF NOT EXISTS idx_nodes_data ON nodes USING gin(data);
CREATE INDEX IF NOT EXISTS idx_nodes_translations ON nodes USING gin(translations);

-- ============================================================================
-- Indexes for: edge_types
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_edgetypes_domain ON edge_types(domain_id);
CREATE INDEX IF NOT EXISTS idx_edgetypes_slug ON edge_types(domain_id, slug);
CREATE INDEX IF NOT EXISTS idx_edgetypes_semantic ON edge_types(semantic_type);

-- ============================================================================
-- Indexes for: edges (критичные для производительности графа!)
-- ============================================================================
-- Основные индексы для обхода графа
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id);
CREATE INDEX IF NOT EXISTS idx_edges_type ON edges(type_id);

-- Композитные индексы для сложных запросов
CREATE INDEX IF NOT EXISTS idx_edges_source_type ON edges(source_id, type_id);
CREATE INDEX IF NOT EXISTS idx_edges_target_type ON edges(target_id, type_id);
CREATE INDEX IF NOT EXISTS idx_edges_source_target ON edges(source_id, target_id);

-- ============================================================================
-- Indexes for: ratings
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ratings_node ON ratings(node_id);
CREATE INDEX IF NOT EXISTS idx_ratings_node_metric ON ratings(node_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_ratings_metric_score ON ratings(metric_type, score DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_created ON ratings(created_at DESC);

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✓ All indexes created successfully';
    RAISE NOTICE '✓ Total indexes: %', (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public');
END $$;
