-- ============================================================================
-- Knowledge Graph Platform - Database Initialization
-- Script 4: Seed Data (для разработки и тестирования)
-- ============================================================================

-- ============================================================================
-- Seed: Default Users (OAuth ready)
-- ============================================================================

-- Admin user (с локальным паролем для тестирования)
-- Пароль: admin123 (bcrypt hash)
INSERT INTO users (id, email, username, password, first_name, last_name, display_name, language, is_active, is_email_verified, roles)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@example.com',
    'admin',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash для "password"
    'Admin',
    'User',
    'Admin User',
    'ru',
    true,
    true,
    ARRAY['user', 'admin']
) ON CONFLICT (email) DO NOTHING;

-- OAuth тестовый пользователь (без пароля)
INSERT INTO users (id, email, username, password, first_name, last_name, display_name, avatar_url, language, is_active, is_email_verified, roles)
VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'test.oauth@example.com',
    'testuser',
    NULL,  -- OAuth пользователь без пароля
    'Test',
    'OAuth User',
    'Test OAuth User',
    'https://lh3.googleusercontent.com/a/default-user',
    'en',
    true,
    true,  -- Email подтвержден через Google
    ARRAY['user']
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- Seed: OAuth Account (пример связи с Google)
-- ============================================================================
INSERT INTO oauth_accounts (
    id,
    user_id,
    provider,
    provider_user_id,
    provider_email,
    display_name,
    avatar_url,
    scopes,
    raw_data
)
VALUES (
    'o0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',  -- test.oauth@example.com
    'google',
    '1234567890',  -- Google user ID (sub)
    'test.oauth@example.com',
    'Test OAuth User',
    'https://lh3.googleusercontent.com/a/default-user',
    ARRAY['openid', 'email', 'profile'],
    '{
        "sub": "1234567890",
        "email": "test.oauth@example.com",
        "email_verified": true,
        "name": "Test OAuth User",
        "given_name": "Test",
        "family_name": "OAuth User",
        "picture": "https://lh3.googleusercontent.com/a/default-user",
        "locale": "en"
    }'::jsonb
) ON CONFLICT (provider, provider_user_id) DO NOTHING;

-- ============================================================================
-- Seed: Example Domain (Физические теории)
-- ============================================================================
INSERT INTO domains (id, name, slug, description, translations, is_public, creator_id, settings)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'Physics Theories',
    'physics-theories',
    'Domain for exploring alternative physics theories with focus on aether dynamics',
    '{
        "ru": {
            "name": "Физические теории",
            "description": "Домен для исследования альтернативных физических теорий с упором на эфиродинамику"
        },
        "en": {
            "name": "Physics Theories",
            "description": "Domain for exploring alternative physics theories with focus on aether dynamics"
        }
    }'::jsonb,
    true,
    'a0000000-0000-0000-0000-000000000001',
    '{
        "allowComments": true,
        "requireModeration": false,
        "ratingAlgorithm": "weighted_graph",
        "defaultLanguage": "en"
    }'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Seed: Node Types для физических теорий
-- ============================================================================

-- Node Type: Axiom (Аксиома)
INSERT INTO node_types (id, name, slug, description, translations, icon, color, schema, "order", domain_id)
VALUES (
    'n0000000-0000-0000-0000-000000000001',
    'Axiom',
    'axiom',
    'Fundamental postulate or principle',
    '{
        "ru": {"name": "Аксиома", "description": "Фундаментальный постулат или принцип"},
        "en": {"name": "Axiom", "description": "Fundamental postulate or principle"}
    }'::jsonb,
    'book',
    '#ff6b6b',
    '{
        "properties": {
            "statement": {
                "type": "string",
                "label": "Statement",
                "required": true
            },
            "author": {
                "type": "string",
                "label": "Author"
            },
            "year": {
                "type": "number",
                "label": "Year proposed"
            }
        }
    }'::jsonb,
    1,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- Node Type: Theory (Теория)
INSERT INTO node_types (id, name, slug, description, translations, icon, color, schema, "order", domain_id)
VALUES (
    'n0000000-0000-0000-0000-000000000002',
    'Theory',
    'theory',
    'Scientific theory or theoretical framework',
    '{
        "ru": {"name": "Теория", "description": "Научная теория или теоретическая концепция"},
        "en": {"name": "Theory", "description": "Scientific theory or theoretical framework"}
    }'::jsonb,
    'bulb',
    '#4ecdc4',
    '{
        "properties": {
            "equations": {
                "type": "string",
                "label": "Key Equations"
            },
            "domain": {
                "type": "string",
                "label": "Domain of Application"
            },
            "author": {
                "type": "string",
                "label": "Author"
            },
            "year": {
                "type": "number",
                "label": "Year published"
            }
        }
    }'::jsonb,
    2,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- Node Type: Experiment (Эксперимент)
INSERT INTO node_types (id, name, slug, description, translations, icon, color, schema, "order", domain_id)
VALUES (
    'n0000000-0000-0000-0000-000000000003',
    'Experiment',
    'experiment',
    'Scientific experiment with measurements',
    '{
        "ru": {"name": "Эксперимент", "description": "Научный эксперимент с измерениями"},
        "en": {"name": "Experiment", "description": "Scientific experiment with measurements"}
    }'::jsonb,
    'experiment',
    '#45b7d1',
    '{
        "properties": {
            "year": {
                "type": "number",
                "label": "Year conducted",
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
                "label": "Methodology"
            },
            "results": {
                "type": "string",
                "label": "Results"
            }
        }
    }'::jsonb,
    3,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- Node Type: Interpretation (Трактовка)
INSERT INTO node_types (id, name, slug, description, translations, icon, color, schema, "order", domain_id)
VALUES (
    'n0000000-0000-0000-0000-000000000004',
    'Interpretation',
    'interpretation',
    'Interpretation of experimental results',
    '{
        "ru": {"name": "Трактовка", "description": "Интерпретация результатов эксперимента"},
        "en": {"name": "Interpretation", "description": "Interpretation of experimental results"}
    }'::jsonb,
    'eye',
    '#96ceb4',
    '{
        "properties": {
            "interpretation_type": {
                "type": "string",
                "label": "Type of interpretation"
            },
            "confidence_level": {
                "type": "number",
                "label": "Confidence level (%)",
                "min": 0,
                "max": 100
            }
        }
    }'::jsonb,
    4,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- Node Type: Concept (Концепция)
INSERT INTO node_types (id, name, slug, description, translations, icon, color, schema, "order", domain_id)
VALUES (
    'n0000000-0000-0000-0000-000000000005',
    'Concept',
    'concept',
    'High-level worldview or paradigm',
    '{
        "ru": {"name": "Концепция", "description": "Высокоуровневая картина мира или парадигма"},
        "en": {"name": "Concept", "description": "High-level worldview or paradigm"}
    }'::jsonb,
    'crown',
    '#ffeaa7',
    '{
        "properties": {
            "paradigm": {
                "type": "string",
                "label": "Paradigm"
            },
            "completeness_score": {
                "type": "number",
                "label": "Completeness (%)",
                "min": 0,
                "max": 100
            }
        }
    }'::jsonb,
    5,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- ============================================================================
-- Seed: Edge Types для физических теорий
-- ============================================================================

-- Edge Type: Derives From (Следует из)
INSERT INTO edge_types (id, name, slug, description, translations, semantic_type, icon, color, weight, is_directed, domain_id)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'Derives From',
    'derives-from',
    'Theory derives from axioms or other theories',
    '{
        "ru": {"name": "Следует из", "description": "Теория следует из аксиом или других теорий"},
        "en": {"name": "Derives From", "description": "Theory derives from axioms or other theories"}
    }'::jsonb,
    'derives_from',
    'arrow-right',
    '#1890ff',
    0.8,
    true,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- Edge Type: Supports (Подтверждает)
INSERT INTO edge_types (id, name, slug, description, translations, semantic_type, icon, color, weight, is_directed, domain_id)
VALUES (
    'e0000000-0000-0000-0000-000000000002',
    'Supports',
    'supports',
    'Experiment supports or confirms theory',
    '{
        "ru": {"name": "Подтверждает", "description": "Эксперимент подтверждает теорию"},
        "en": {"name": "Supports", "description": "Experiment supports or confirms theory"}
    }'::jsonb,
    'supports',
    'check-circle',
    '#52c41a',
    1.0,
    true,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- Edge Type: Contradicts (Противоречит)
INSERT INTO edge_types (id, name, slug, description, translations, semantic_type, icon, color, weight, is_directed, domain_id)
VALUES (
    'e0000000-0000-0000-0000-000000000003',
    'Contradicts',
    'contradicts',
    'Experiment contradicts theory',
    '{
        "ru": {"name": "Противоречит", "description": "Эксперимент противоречит теории"},
        "en": {"name": "Contradicts", "description": "Experiment contradicts theory"}
    }'::jsonb,
    'contradicts',
    'close-circle',
    '#f5222d',
    -1.0,
    true,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- Edge Type: Part Of (Является частью)
INSERT INTO edge_types (id, name, slug, description, translations, semantic_type, icon, color, weight, is_directed, domain_id)
VALUES (
    'e0000000-0000-0000-0000-000000000004',
    'Part Of',
    'part-of',
    'Theory is part of a larger concept',
    '{
        "ru": {"name": "Является частью", "description": "Теория является частью концепции"},
        "en": {"name": "Part Of", "description": "Theory is part of a larger concept"}
    }'::jsonb,
    'part_of',
    'folder',
    '#722ed1',
    0.6,
    true,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- Edge Type: Interprets (Интерпретирует)
INSERT INTO edge_types (id, name, slug, description, translations, semantic_type, icon, color, weight, is_directed, domain_id)
VALUES (
    'e0000000-0000-0000-0000-000000000005',
    'Interprets',
    'interprets',
    'Interpretation explains experimental results',
    '{
        "ru": {"name": "Интерпретирует", "description": "Трактовка объясняет результаты эксперимента"},
        "en": {"name": "Interprets", "description": "Interpretation explains experimental results"}
    }'::jsonb,
    'custom',
    'file-text',
    '#fa8c16',
    0.5,
    true,
    'd0000000-0000-0000-0000-000000000001'
) ON CONFLICT (domain_id, slug) DO NOTHING;

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
DECLARE
    user_count INTEGER;
    domain_count INTEGER;
    nodetype_count INTEGER;
    edgetype_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO domain_count FROM domains;
    SELECT COUNT(*) INTO nodetype_count FROM node_types;
    SELECT COUNT(*) INTO edgetype_count FROM edge_types;

    RAISE NOTICE '✓ Seed data inserted successfully';
    RAISE NOTICE '  - Users: %', user_count;
    RAISE NOTICE '  - Domains: %', domain_count;
    RAISE NOTICE '  - Node Types: %', nodetype_count;
    RAISE NOTICE '  - Edge Types: %', edgetype_count;
END $$;
