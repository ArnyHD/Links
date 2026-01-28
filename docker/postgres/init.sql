-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For indexing JSONB

-- Initial setup
SELECT 'PostgreSQL initialized for Knowledge Graph Platform' AS message;
