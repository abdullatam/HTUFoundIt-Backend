require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT NOW()')
  .then(res => console.log('✅ Postgres connected at', res.rows[0].now))
  .catch(err => console.error('❌ Postgres error', err));

module.exports = pool;
