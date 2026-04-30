const { Pool } = require('pg');

const pool = new Pool({
  host: '16.171.198.166', port: 5432,
  user: 'pakload', password: 'Khan123@#', database: 'elections',
});

const SQL = `
-- ELECTIONS
CREATE TABLE IF NOT EXISTS elections (
  id                     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name                   TEXT NOT NULL,
  country                TEXT NOT NULL DEFAULT 'Pakistan',
  election_type          TEXT NOT NULL DEFAULT 'General',
  region                 TEXT NOT NULL,
  province               TEXT NOT NULL,
  date                   DATE NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'upcoming',
  total_seats            INT NOT NULL DEFAULT 0,
  total_registered_voters BIGINT NOT NULL DEFAULT 0,
  description            TEXT,
  flag_emoji             TEXT DEFAULT '🗳️',
  is_active              BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- PROVINCES
CREATE TABLE IF NOT EXISTS provinces (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  code        TEXT NOT NULL,
  election_id TEXT NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  UNIQUE(code, election_id)
);

-- PARTIES
CREATE TABLE IF NOT EXISTS parties (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name         TEXT NOT NULL,
  short_name   TEXT NOT NULL,
  color        TEXT NOT NULL,
  bg_color     TEXT,
  founded_year INT,
  ideology     TEXT,
  seats        INT DEFAULT 0,
  total_votes  BIGINT DEFAULT 0,
  election_id  TEXT NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  UNIQUE(short_name, election_id)
);

-- CONSTITUENCIES
CREATE TABLE IF NOT EXISTS constituencies (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name                TEXT NOT NULL,
  code                TEXT NOT NULL,
  province_id         TEXT NOT NULL REFERENCES provinces(id),
  district            TEXT,
  type                TEXT NOT NULL DEFAULT 'national',
  registered_voters   INT DEFAULT 0,
  reported_stations   INT DEFAULT 0,
  total_stations      INT DEFAULT 0,
  lat                 DOUBLE PRECISION,
  lng                 DOUBLE PRECISION,
  election_id         TEXT NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  UNIQUE(code, election_id)
);

-- POLLING STATIONS
CREATE TABLE IF NOT EXISTS polling_stations (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name              TEXT NOT NULL,
  address           TEXT,
  constituency_id   TEXT NOT NULL REFERENCES constituencies(id) ON DELETE CASCADE,
  registered_voters INT DEFAULT 0,
  reported          BOOLEAN DEFAULT FALSE,
  observer_id       TEXT
);

-- CANDIDATES
CREATE TABLE IF NOT EXISTS candidates (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  party_id        TEXT NOT NULL REFERENCES parties(id),
  constituency_id TEXT NOT NULL REFERENCES constituencies(id),
  election_id     TEXT NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  votes           INT DEFAULT 0,
  likes           INT DEFAULT 0,
  bio             TEXT,
  age             INT,
  education       TEXT,
  initials        TEXT,
  profession      TEXT,
  photo_url       TEXT
);

-- OBSERVERS
CREATE TABLE IF NOT EXISTS observers (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name                 TEXT NOT NULL,
  email                TEXT UNIQUE NOT NULL,
  phone                TEXT,
  cnic                 TEXT,
  polling_station_name TEXT,
  status               TEXT DEFAULT 'pending',
  results_submitted    INT DEFAULT 0,
  last_activity        TIMESTAMPTZ,
  joined_at            TIMESTAMPTZ DEFAULT NOW(),
  election_id          TEXT NOT NULL REFERENCES elections(id) ON DELETE CASCADE
);

-- RESULT ENTRIES
CREATE TABLE IF NOT EXISTS result_entries (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  candidate_id         TEXT NOT NULL REFERENCES candidates(id),
  candidate_name       TEXT NOT NULL,
  party_id             TEXT NOT NULL REFERENCES parties(id),
  polling_station_id   TEXT NOT NULL REFERENCES polling_stations(id),
  polling_station_name TEXT NOT NULL,
  constituency_id      TEXT NOT NULL REFERENCES constituencies(id),
  election_id          TEXT NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  votes                INT NOT NULL,
  submitted_at         TIMESTAMPTZ DEFAULT NOW(),
  submitted_by         TEXT NOT NULL,
  verified             BOOLEAN DEFAULT FALSE,
  flagged              BOOLEAN DEFAULT FALSE,
  observer_id          TEXT REFERENCES observers(id)
);

-- LIVE UPDATES
CREATE TABLE IF NOT EXISTS live_updates (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  message           TEXT NOT NULL,
  timestamp         TIMESTAMPTZ DEFAULT NOW(),
  type              TEXT NOT NULL DEFAULT 'update',
  constituency_code TEXT,
  election_id       TEXT NOT NULL REFERENCES elections(id) ON DELETE CASCADE
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'public',
  observer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const SEED = `
-- Prevent duplicate seeding
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM elections LIMIT 1) THEN
    RAISE NOTICE 'Already seeded — skipping';
    RETURN;
  END IF;

  -- Election
  INSERT INTO elections (id,name,country,election_type,region,province,date,status,total_seats,total_registered_voters,description,flag_emoji,is_active)
  VALUES ('el-gb-2024','GB General Elections 2024','Pakistan','General','Gilgit-Baltistan','Gilgit-Baltistan','2024-02-08','live',24,745423,'General elections for the Gilgit-Baltistan Legislative Assembly.','🏔️',TRUE);

  -- Provinces
  INSERT INTO provinces (id,name,code,election_id) VALUES
    ('prov-gb','Gilgit-Baltistan','GB','el-gb-2024'),
    ('prov-ajk','Azad Jammu & Kashmir','AJK','el-gb-2024');

  -- Parties
  INSERT INTO parties (id,name,short_name,color,bg_color,founded_year,ideology,seats,total_votes,election_id) VALUES
    ('p-pti','Pakistan Tehreek-e-Insaf','PTI','#16a34a','bg-green-600',1996,'Centrist / Populist',5,98450,'el-gb-2024'),
    ('p-pmln','Pakistan Muslim League (N)','PML-N','#dc2626','bg-red-600',1988,'Conservative / Centre-right',4,82310,'el-gb-2024'),
    ('p-ppp','Pakistan Peoples Party','PPP','#ea580c','bg-orange-600',1967,'Social Democracy',2,41780,'el-gb-2024'),
    ('p-juif','Jamiat Ulema-e-Islam (F)','JUI-F','#0369a1','bg-sky-700',1945,'Islamic Conservatism',1,18920,'el-gb-2024'),
    ('p-mqm','Majlis Wahdat-e-Muslimeen','MWM','#7c3aed','bg-violet-600',2001,'Shia Political Party',1,12300,'el-gb-2024'),
    ('p-ind','Independent','IND','#64748b','bg-slate-500',0,'Non-partisan',3,29870,'el-gb-2024');

  -- Constituencies
  INSERT INTO constituencies (id,name,code,province_id,district,type,registered_voters,reported_stations,total_stations,lat,lng,election_id) VALUES
    ('con-na1','Hunza-Nagar','NA-1','prov-gb','Hunza','national',54210,38,40,36.3167,74.6500,'el-gb-2024'),
    ('con-na2','Gilgit-I','NA-2','prov-gb','Gilgit','national',87432,52,54,35.9208,74.3080,'el-gb-2024'),
    ('con-na3','Gilgit-II (Astore)','NA-3','prov-gb','Astore','national',68540,42,46,35.3667,74.9000,'el-gb-2024'),
    ('con-na5','Ghanche-Skardu','NA-5','prov-gb','Skardu','national',123456,68,72,35.2970,75.6340,'el-gb-2024'),
    ('con-la1','Muzaffarabad-I','LA-1','prov-ajk','Muzaffarabad','provincial',98765,48,48,34.3700,73.4710,'el-gb-2024'),
    ('con-la2','Muzaffarabad-II','LA-2','prov-ajk','Muzaffarabad','provincial',76340,40,42,34.4100,73.5200,'el-gb-2024');

  -- Polling Stations
  INSERT INTO polling_stations (id,name,address,constituency_id,registered_voters,reported) VALUES
    ('ps-1','Govt Boys High School Gilgit','Airport Road, Gilgit City','con-na2',1850,TRUE),
    ('ps-2','Karakoram International University','University Road, Gilgit','con-na2',2100,TRUE),
    ('ps-3','Jutial Girls Primary School','Jutial Mohalla, Gilgit','con-na2',1420,TRUE),
    ('ps-4','Hunza Model School Karimabad','Karimabad Bazaar, Hunza','con-na1',1640,TRUE),
    ('ps-5','Aliabad Middle School','Main Rd, Aliabad, Hunza','con-na1',1230,FALSE),
    ('ps-6','Skardu Degree College','College Road, Skardu','con-na5',2450,TRUE),
    ('ps-7','Muzaffarabad City School','Chattar Domel, Muzaffarabad','con-la1',1780,TRUE),
    ('ps-8','Govt Girls High School Muzaffarabad','Bank Road, Muzaffarabad','con-la1',1560,FALSE);

  -- Observers
  INSERT INTO observers (id,name,email,phone,cnic,polling_station_name,status,results_submitted,election_id) VALUES
    ('obs-1','Yasir Ali Shah','yasir.shah@gen.pk','0301-1234567','14201-1234567-1','Govt Boys High School Gilgit','active',5,'el-gb-2024'),
    ('obs-2','Sana Batool','sana.batool@gen.pk','0321-7654321','14201-7654321-2','Karakoram International University','active',3,'el-gb-2024'),
    ('obs-3','Imran Hussain','imran.h@gen.pk','0311-9876543','14301-9876543-3','Jutial Girls Primary School','active',7,'el-gb-2024'),
    ('obs-4','Fatima Zahra','fatima.z@gen.pk','0331-1122334','14401-1122334-4','Hunza Model School Karimabad','pending',0,'el-gb-2024');

  -- Candidates
  INSERT INTO candidates (id,name,party_id,constituency_id,election_id,votes,likes,bio,age,education,initials,profession) VALUES
    ('cand-1','Muhammad Khalid Khurshid','p-pti','con-na1','el-gb-2024',24560,8400,'Former Chief Minister GB.',51,'MA Political Science','MK','Politician'),
    ('cand-2','Mir Ghazanfar Ali Khan','p-pmln','con-na1','el-gb-2024',19820,5100,'Former Governor GB.',67,'LLB','MG','Lawyer / Politician'),
    ('cand-3','Syed Shah Bacha','p-ppp','con-na1','el-gb-2024',9830,2800,'PPP stalwart from Hunza Valley.',48,'BA','SB','Agriculturalist'),
    ('cand-4','Amjad Hussain Advocate','p-pti','con-na2','el-gb-2024',38100,12200,'Rights advocate, digital connectivity.',44,'LLB Hons','AH','Lawyer'),
    ('cand-5','Shabbir Ahmed Qaimkhani','p-pmln','con-na2','el-gb-2024',31450,9300,'20 years in Gilgit city politics.',58,'MA','SQ','Businessman / Politician'),
    ('cand-6','Imtiaz Ahmed','p-ind','con-na2','el-gb-2024',12780,3900,'Independent entrepreneur, youth focus.',39,'MBA','IA','Entrepreneur'),
    ('cand-7','Raja Jalal Hussain Maqpoon','p-ppp','con-na3','el-gb-2024',22100,6400,'Development-focused from Astore.',47,'MBA','RJ','Businessman'),
    ('cand-8','Hafizur Rehman','p-pmln','con-na3','el-gb-2024',19890,5800,'Astore development champion.',52,'MSc Engineering','HR','Engineer / Politician'),
    ('cand-9','Qasim Ali Shah','p-pti','con-na3','el-gb-2024',16230,4700,'PTI leader, road connectivity focus.',36,'BEng','QA','Civil Engineer'),
    ('cand-10','Syed Abid Raza','p-mqm','con-na5','el-gb-2024',12300,3200,'MWM leader, Shia community, Baltistan.',45,'MA Islamic Studies','SR','Scholar / Politician'),
    ('cand-11','Chaudhry Muhammad Barjees','p-pmln','con-na5','el-gb-2024',29780,9200,'Former GB Assembly Speaker.',60,'LLB','CM','Lawyer / Politician'),
    ('cand-12','Agha Hassan Motazid','p-ind','con-na5','el-gb-2024',11200,2900,'Independent candidate, Skardu.',42,'BA','AM','Businessman'),
    ('cand-13','Sardar Tanveer Ilyas','p-pti','con-la1','el-gb-2024',41200,14500,'Former AJK Prime Minister.',50,'MBA','ST','Politician'),
    ('cand-14','Chaudhry Anwar ul Haq','p-pmln','con-la1','el-gb-2024',33400,10200,'Former AJK PM, PML-N senior leader.',55,'LLB','CA','Lawyer / Politician'),
    ('cand-15','Farooq Haider Khan','p-ppp','con-la2','el-gb-2024',28900,8700,'AJK former PM, PPP leader.',57,'MA','FH','Politician'),
    ('cand-16','Mustafa Butt','p-ind','con-la2','el-gb-2024',14300,3800,'Independent, business community.',45,'BBA','MB','Businessman');

  -- Result Entries
  INSERT INTO result_entries (candidate_id,candidate_name,party_id,polling_station_id,polling_station_name,constituency_id,election_id,votes,submitted_by,verified,flagged,observer_id) VALUES
    ('cand-1','Muhammad Khalid Khurshid','p-pti','ps-4','Hunza Model School Karimabad','con-na1','el-gb-2024',1240,'obs-4',TRUE,FALSE,'obs-4'),
    ('cand-4','Amjad Hussain Advocate','p-pti','ps-1','Govt Boys High School Gilgit','con-na2','el-gb-2024',1820,'obs-1',TRUE,FALSE,'obs-1'),
    ('cand-5','Shabbir Ahmed Qaimkhani','p-pmln','ps-2','Karakoram International University','con-na2','el-gb-2024',1480,'obs-2',FALSE,TRUE,'obs-2'),
    ('cand-6','Imtiaz Ahmed','p-ind','ps-3','Jutial Girls Primary School','con-na2','el-gb-2024',610,'obs-3',TRUE,FALSE,'obs-3'),
    ('cand-13','Sardar Tanveer Ilyas','p-pti','ps-7','Muzaffarabad City School','con-la1','el-gb-2024',2100,'obs-2',TRUE,FALSE,'obs-2');

  -- Live Updates
  INSERT INTO live_updates (message,type,constituency_code,election_id) VALUES
    ('PTI leads in Hunza-Nagar with 65% votes counted','result','NA-1','el-gb-2024'),
    ('Turnout in Gilgit-I crosses 58%','milestone','NA-2','el-gb-2024'),
    ('Results certified from Skardu Degree College polling booth','update',NULL,'el-gb-2024'),
    ('Suspicious report flagged at KIU booth — under review','alert','NA-2','el-gb-2024'),
    ('PTI secures NA-1 seat — Hunza declared','milestone','NA-1','el-gb-2024');

  -- Admin User
  INSERT INTO users (name,email,password,role) VALUES
    ('Admin Malik','admin@gen.pk','Khan@#123','admin');

END $$;
`;

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔧 Creating tables...');
    await client.query(SQL);
    console.log('✓ All tables created');

    console.log('🌱 Seeding data...');
    await client.query(SEED);
    console.log('✓ Seed complete');

    const elections = await client.query('SELECT id, name, status FROM elections');
    const candidates = await client.query('SELECT COUNT(*) FROM candidates');
    const parties = await client.query('SELECT COUNT(*) FROM parties');
    console.log('\n📊 Database summary:');
    console.log('  Elections:', elections.rows.map(e => `${e.name} (${e.status})`).join(', '));
    console.log('  Candidates:', candidates.rows[0].count);
    console.log('  Parties:', parties.rows[0].count);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => { console.error('✗', e.message); process.exit(1); });
