const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  host: '16.171.198.166', port: 5432,
  user: 'pakload', password: 'Khan123@#', database: 'elections',
});

async function run() {
  const client = await pool.connect();
  try {
    // Hash the password using SHA-256 (same as observers)
    const passwordHash = crypto.createHash('sha256').update('Khan@#123').digest('hex');
    
    // Update or insert admin user
    await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin User', 'admin@gen.pk', $1, 'admin')
      ON CONFLICT (email) DO UPDATE SET password = $1
    `, [passwordHash]);
    
    console.log('✓ Admin user updated with credentials: admin / Khan123@#');
    
    const user = await client.query('SELECT name, email, role FROM users WHERE email = $1', ['admin@gen.pk']);
    console.log('User:', user.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => { console.error('✗ Error:', e.message); process.exit(1); });
