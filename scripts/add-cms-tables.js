const { Pool } = require('pg');

const pool = new Pool({
  host: '16.171.198.166', port: 5432,
  user: 'pakload', password: 'Khan123@#', database: 'elections',
});

const SQL = `
-- Custom pages (admin-authored)
CREATE TABLE IF NOT EXISTS pages (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  content          TEXT NOT NULL DEFAULT '',
  meta_description TEXT,
  is_published     BOOLEAN DEFAULT FALSE,
  show_in_nav      BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Site-wide settings (key/value store)
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings if not already present
INSERT INTO site_settings (key, value) VALUES
  ('site_name',          'Global Election Network'),
  ('site_tagline',       'Transparent Elections for a Better Democracy'),
  ('footer_about',       'The Global Election Network provides real-time, transparent election monitoring and results for the people of Gilgit-Baltistan and Azad Jammu & Kashmir.'),
  ('footer_email',       'info@gen.pk'),
  ('footer_phone',       '+92-51-1234567'),
  ('footer_address',     'F-8/1, Islamabad, Pakistan'),
  ('footer_facebook',    'https://facebook.com/globalelectionnetwork'),
  ('footer_twitter',     'https://twitter.com/genelections'),
  ('footer_youtube',     ''),
  ('footer_copyright',   '© 2024 Global Election Network. All rights reserved.'),
  ('footer_links_col1_title', 'Quick Links'),
  ('footer_links_col2_title', 'Resources'),
  ('nav_show_pages',     'true')
ON CONFLICT (key) DO NOTHING;

-- Seed a sample page
INSERT INTO pages (id, title, slug, content, meta_description, is_published, show_in_nav)
VALUES (
  'page-about',
  'About Us',
  'about',
  '<section style="max-width:800px;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif">
  <h1 style="font-size:2rem;font-weight:900;color:#0f172a;margin-bottom:1rem">About Global Election Network</h1>
  <p style="color:#475569;line-height:1.7;margin-bottom:1rem">
    The Global Election Network (GEN) is an independent, non-partisan platform dedicated to transparent and accurate election monitoring across Pakistan, with a special focus on Gilgit-Baltistan and Azad Jammu &amp; Kashmir.
  </p>
  <p style="color:#475569;line-height:1.7;margin-bottom:1rem">
    Our mission is to empower citizens with real-time, verifiable election data — from candidate profiles and party standings to live result updates from every polling station.
  </p>
  <h2 style="font-size:1.4rem;font-weight:800;color:#0f172a;margin:2rem 0 1rem">Our Values</h2>
  <ul style="color:#475569;line-height:2;padding-left:1.5rem">
    <li><strong>Transparency</strong> — Every data point is traceable to a verified source</li>
    <li><strong>Accuracy</strong> — Results are cross-verified by field observers</li>
    <li><strong>Accessibility</strong> — Available in Urdu and English on all devices</li>
    <li><strong>Independence</strong> — No political affiliations or external funding biases</li>
  </ul>
</section>',
  'About the Global Election Network — transparent election monitoring for GB and AJK',
  TRUE,
  TRUE
) ON CONFLICT (slug) DO NOTHING;
`;

async function run() {
  const client = await pool.connect();
  try {
    await client.query(SQL);
    const pages = await client.query('SELECT title, slug, is_published FROM pages');
    const settings = await client.query('SELECT COUNT(*) FROM site_settings');
    console.log('✓ Tables created');
    console.log('✓ Pages:', pages.rows.map(p => `"${p.title}" (/${p.slug})`).join(', '));
    console.log('✓ Settings rows:', settings.rows[0].count);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => { console.error('✗', e.message); process.exit(1); });
