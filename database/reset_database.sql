-- ============================================================================
-- Knowledge Graph Platform - Reset Database
-- ВНИМАНИЕ: Этот скрипт УДАЛЯЕТ ВСЕ ДАННЫЕ!
-- Используйте только для разработки и тестирования!
-- ============================================================================

\echo '=================================================='
\echo '⚠️  WARNING: This will DELETE ALL DATA!'
\echo '=================================================='
\echo ''

-- Удаляем все таблицы в правильном порядке (из-за внешних ключей)
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS edge_types CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS node_types CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS users CASCADE;

\echo '✓ All tables dropped'
\echo ''
\echo 'Run run_all.sql to recreate the database'
