const { Client } = require('pg');

const config = {
  host: '16.171.198.166',
  port: 5432,
  user: 'postgres',
  password: 'Khan123@#',
  database: 'elections',
  connectionTimeoutMillis: 10000,
};

async function run() {
  const client = new Client(config);
  await client.connect();
  console.log('✓ Connected to elections DB as postgres superuser');

  const grants = [
    'GRANT ALL PRIVILEGES ON DATABASE elections TO pakload',
    'GRANT ALL ON SCHEMA public TO pakload',
    'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pakload',
    'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pakload',
    'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pakload',
    'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pakload',
  ];

  for (const sql of grants) {
    await client.query(sql);
    console.log('✓', sql.slice(0, 60));
  }

  await client.end();
  console.log('\n✓ All privileges granted to pakload');
}

run().catch(e => { console.error('✗ Error:', e.message); process.exit(1); });
