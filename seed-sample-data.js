const { Pool } = require('pg');

const pool = new Pool({
  host: '16.171.198.166',
  port: 5432,
  user: 'pakload',
  password: 'Khan123@#',
  database: 'elections',
});

async function seed() {
  try {
    console.log('Seeding parties...');
    await pool.query(`
      INSERT INTO parties (id, name, short_name, color, bg_color, founded_year, ideology, election_id)
      VALUES 
        ('pti', 'Pakistan Tehreek-e-Insaf', 'PTI', '#16a34a', 'bg-green-600', 1996, 'Centrist / Populist', 'gb-general-2024'),
        ('pmln', 'Pakistan Muslim League (N)', 'PML-N', '#dc2626', 'bg-red-600', 1988, 'Conservative / Centre-right', 'gb-general-2024'),
        ('ppp', 'Pakistan Peoples Party', 'PPP', '#ea580c', 'bg-orange-600', 1967, 'Social Democracy', 'gb-general-2024')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Seeding constituencies...');
    await pool.query(`
      INSERT INTO constituencies (id, name, code, province_id, district, type, registered_voters, reported_stations, total_stations, election_id)
      VALUES 
        ('na1', 'Hunza-Nagar', 'NA-1', 'gb', 'Hunza', 'national', 54210, 38, 40, 'gb-general-2024'),
        ('na2', 'Gilgit-I', 'NA-2', 'gb', 'Gilgit', 'national', 87432, 52, 54, 'gb-general-2024'),
        ('na3', 'Gilgit-II (Astore)', 'NA-3', 'gb', 'Astore', 'national', 68540, 42, 46, 'gb-general-2024')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Seeding candidates...');
    await pool.query(`
      INSERT INTO candidates (id, name, party_id, constituency_id, election_id, votes, likes, bio, age, education, initials, profession)
      VALUES 
        ('c1', 'Muhammad Khalid Khurshid', 'pti', 'na1', 'gb-general-2024', 24560, 8400, 'Former Chief Minister GB.', 51, 'MA Political Science', 'MK', 'Politician'),
        ('c2', 'Mir Ghazanfar Ali Khan', 'pmln', 'na1', 'gb-general-2024', 19820, 5100, 'Former Governor GB.', 67, 'LLB', 'MG', 'Lawyer'),
        ('c3', 'Syed Shah Bacha', 'ppp', 'na1', 'gb-general-2024', 9830, 2800, 'PPP stalwart.', 48, 'BA', 'SB', 'Politician')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
