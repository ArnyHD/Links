-- ============================================================================
-- Knowledge Graph Platform - Database Initialization
-- Script 1: Extensions
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search support
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- GIN indexes for JSONB
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Show installed extensions
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm', 'btree_gin');
