import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'paperowl',
  user: process.env.DB_USER || 'paperowl',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Only log performance metrics in production, never query content or params
  if (process.env.NODE_ENV !== 'production') {
    console.log('Query executed', { duration, rows: res.rowCount });
  }
  
  return res;
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export default pool;
