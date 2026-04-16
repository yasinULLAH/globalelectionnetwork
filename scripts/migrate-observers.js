const { Client } = require('pg');

const config = {
  host: '16.171.198.166', port: 5432,
  user: 'pakload', password: 'Khan123@#', database: 'elections',
  connectionTimeoutMillis: 10000,
};

async function run() {
  const client = new Client(config);
  await client.connect();
  console.log('✓ Connected');

  const steps = [
    `ALTER TABLE observers ADD COLUMN IF NOT EXISTS username    TEXT UNIQUE`,
    `ALTER TABLE observers ADD COLUMN IF NOT EXISTS password_hash TEXT`,
    `ALTER TABLE observers ADD COLUMN IF NOT EXISTS photo_url   TEXT`,
    // Make election_id nullable so new observers can be added without an active election
    `ALTER TABLE observers ALTER COLUMN election_id DROP NOT NULL`,
  ];

  for (const sql of steps) {
    try {
      await client.query(sql);
      console.log('✓', sql.slice(0, 70));
    } catch (e) {
      console.log('⚠', e.message.slice(0, 80));
    }
  }

  await client.end();
  console.log('\n✓ Migration complete');
}

run().catch(e => { console.error('✗', e.message); process.exit(1); });
