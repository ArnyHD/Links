#!/usr/bin/env node

/**
 * Test database connection
 * Usage: node test-connection.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

console.log('================================');
console.log('Testing Database Connection');
console.log('================================\n');

console.log('Configuration:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  User: ${config.user}`);
console.log(`  Database: ${config.database}`);
console.log();

const client = new Client(config);

async function test() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✓ Connected successfully!\n');

    // Test query
    console.log('Running test query...');
    const result = await client.query('SELECT version()');
    console.log('✓ PostgreSQL version:');
    console.log(`  ${result.rows[0].version}\n`);

    // Check tables
    console.log('Checking tables...');
    const tables = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    if (tables.rows.length === 0) {
      console.log('⚠ No tables found. Run setup.bat to create schema.\n');
    } else {
      console.log(`✓ Found ${tables.rows.length} tables:`);
      tables.rows.forEach(row => {
        console.log(`  - ${row.tablename}`);
      });
      console.log();

      // Get counts
      console.log('Getting statistics...');
      const stats = await client.query(`
        SELECT
          'Users' as table_name,
          COUNT(*) as count
        FROM users
        UNION ALL
        SELECT 'Domains', COUNT(*) FROM domains
        UNION ALL
        SELECT 'Node Types', COUNT(*) FROM node_types
        UNION ALL
        SELECT 'Edge Types', COUNT(*) FROM edge_types
        UNION ALL
        SELECT 'Nodes', COUNT(*) FROM nodes
        UNION ALL
        SELECT 'Edges', COUNT(*) FROM edges
        UNION ALL
        SELECT 'Ratings', COUNT(*) FROM ratings
        ORDER BY table_name
      `);

      console.log('✓ Record counts:');
      stats.rows.forEach(row => {
        console.log(`  ${row.table_name}: ${row.count}`);
      });
      console.log();
    }

    console.log('================================');
    console.log('✓ All tests passed!');
    console.log('================================');
  } catch (error) {
    console.error('\n================================');
    console.error('✗ Error:', error.message);
    console.error('================================');
    console.error('\nPossible causes:');
    console.error('  1. Wrong credentials in .env file');
    console.error('  2. Database server is not accessible');
    console.error('  3. Database does not exist');
    console.error('  4. Firewall blocking connection');
    console.error();
    process.exit(1);
  } finally {
    await client.end();
  }
}

test();