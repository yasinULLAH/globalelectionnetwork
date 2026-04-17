const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '16.171.198.166',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'elections',
  user: process.env.DB_USER || 'pakload',
  password: process.env.DB_PASSWORD || 'Khan123@#',
});

async function createPostsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image TEXT,
        video_url TEXT,
        author TEXT,
        category TEXT DEFAULT 'news',
        status TEXT DEFAULT 'published',
        published_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Posts table created successfully');
  } catch (error) {
    console.error('Error creating posts table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createPostsTable();
