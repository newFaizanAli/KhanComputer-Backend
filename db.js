
const { CONFIG } = require('./constant');

const { drizzle } = require('drizzle-orm/neon-serverless');
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: CONFIG.DATABASE_URL || process.env.DATABASE_URL });
const db = drizzle(pool);

module.exports = { db };