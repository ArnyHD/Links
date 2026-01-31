-- ============================================================================
-- Knowledge Graph Platform - Master Migration Script
-- Запускает все миграции по порядку
-- ============================================================================

\echo '=================================================='
\echo 'Knowledge Graph Platform - Database Setup'
\echo '=================================================='
\echo ''

\echo '→ Step 1/4: Installing extensions...'
\i 001_init_extensions.sql
\echo ''

\echo '→ Step 2/4: Creating tables...'
\i 002_create_tables.sql
\echo ''

\echo '→ Step 3/4: Creating indexes...'
\i 003_create_indexes.sql
\echo ''

\echo '→ Step 4/4: Inserting seed data...'
\i 004_seed_data.sql
\echo ''

\echo '=================================================='
\echo '✓ Database setup completed successfully!'
\echo '=================================================='
\echo ''

-- Показываем статистику
\echo 'Database Statistics:'
\echo '-------------------'
SELECT
    'Tables' as type,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT
    'Indexes' as type,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT
    'Users' as type,
    COUNT(*) as count
FROM users
UNION ALL
SELECT
    'Domains' as type,
    COUNT(*) as count
FROM domains
UNION ALL
SELECT
    'Node Types' as type,
    COUNT(*) as count
FROM node_types
UNION ALL
SELECT
    'Edge Types' as type,
    COUNT(*) as count
FROM edge_types;

\echo ''
\echo 'Ready to use! 🚀'
