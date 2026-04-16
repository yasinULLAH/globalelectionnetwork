const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const tests = [
    ['/api/elections',               r => `${r.body.elections?.length} elections`],
    ['/api/elections/active',        r => r.body.election?.name],
    ['/api/candidates?electionId=el-gb-2024', r => `${r.body.candidates?.length} candidates, top: ${r.body.candidates?.[0]?.name} (${r.body.candidates?.[0]?.votes} votes)`],
    ['/api/parties?electionId=el-gb-2024',    r => r.body.parties?.map(p => `${p.short_name}(${p.seats})`).join(', ')],
    ['/api/constituencies?electionId=el-gb-2024', r => `${r.body.constituencies?.length} constituencies`],
    ['/api/observers?electionId=el-gb-2024',  r => `${r.body.observers?.length} observers`],
    ['/api/results?electionId=el-gb-2024',    r => `${r.body.results?.length} result entries`],
    ['/api/live-updates?electionId=el-gb-2024', r => `${r.body.updates?.length} live updates`],
    ['/api/stats?electionId=el-gb-2024',      r => `votes=${r.body.totalVotesCast}, candidates=${r.body.totalCandidates}`],
    ['/api/pages',                            r => `${r.body.pages?.length} pages`],
    ['/api/pages/about',                      r => `"${r.body.page?.title}" published=${r.body.page?.is_published}`],
    ['/api/settings',                         r => `${Object.keys(r.body.settings ?? {}).length} settings keys`],
  ];

  console.log('\n🧪 API Tests\n' + '─'.repeat(60));
  let pass = 0;
  for (const [path, summary] of tests) {
    try {
      const r = await get(path);
      const ok = r.status === 200;
      console.log(`${ok ? '✓' : '✗'} ${path.padEnd(50)} ${summary(r)}`);
      if (ok) pass++;
    } catch (e) {
      console.log(`✗ ${path.padEnd(50)} ERROR: ${e.message}`);
    }
  }
  console.log('─'.repeat(60));
  console.log(`\n${pass}/${tests.length} passed`);
}

run();
