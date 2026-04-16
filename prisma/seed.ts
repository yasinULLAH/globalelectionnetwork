import { PrismaClient, ElectionType, ElectionStatus, ConstituencyType, ObserverStatus, UserRole, LiveUpdateType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean existing data ──
  await prisma.resultEntry.deleteMany();
  await prisma.liveUpdate.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.pollingStation.deleteMany();
  await prisma.constituency.deleteMany();
  await prisma.observer.deleteMany();
  await prisma.partySeats.deleteMany();
  await prisma.party.deleteMany();
  await prisma.province.deleteMany();
  await prisma.user.deleteMany();
  await prisma.election.deleteMany();

  console.log('✓ Cleared old data');

  // ── Election ──
  const election = await prisma.election.create({
    data: {
      name: 'GB General Elections 2024',
      country: 'Pakistan',
      electionType: ElectionType.General,
      region: 'Gilgit-Baltistan',
      province: 'Gilgit-Baltistan',
      date: new Date('2024-02-08'),
      status: ElectionStatus.live,
      totalSeats: 24,
      totalRegisteredVoters: 745423,
      description: 'General elections for the Gilgit-Baltistan Legislative Assembly.',
      flagEmoji: '🏔️',
      isActive: true,
    },
  });
  console.log('✓ Election created:', election.name);

  // ── Provinces ──
  const gb = await prisma.province.create({ data: { name: 'Gilgit-Baltistan', code: 'GB', electionId: election.id } });
  const ajk = await prisma.province.create({ data: { name: 'Azad Jammu & Kashmir', code: 'AJK', electionId: election.id } });
  console.log('✓ Provinces created');

  // ── Parties ──
  const pti  = await prisma.party.create({ data: { name: 'Pakistan Tehreek-e-Insaf', shortName: 'PTI',   color: '#16a34a', bgColor: 'bg-green-600', foundedYear: 1996, ideology: 'Centrist / Populist',          electionId: election.id } });
  const pmln = await prisma.party.create({ data: { name: 'Pakistan Muslim League (N)', shortName: 'PML-N', color: '#dc2626', bgColor: 'bg-red-600',   foundedYear: 1988, ideology: 'Conservative / Centre-right', electionId: election.id } });
  const ppp  = await prisma.party.create({ data: { name: 'Pakistan Peoples Party', shortName: 'PPP',   color: '#ea580c', bgColor: 'bg-orange-600', foundedYear: 1967, ideology: 'Social Democracy',              electionId: election.id } });
  const juif = await prisma.party.create({ data: { name: 'Jamiat Ulema-e-Islam (F)', shortName: 'JUI-F', color: '#0369a1', bgColor: 'bg-sky-700',    foundedYear: 1945, ideology: 'Islamic Conservatism',        electionId: election.id } });
  const mqm  = await prisma.party.create({ data: { name: 'Majlis Wahdat-e-Muslimeen', shortName: 'MWM',   color: '#7c3aed', bgColor: 'bg-violet-600', foundedYear: 2001, ideology: 'Shia Political Party',       electionId: election.id } });
  const ind  = await prisma.party.create({ data: { name: 'Independent', shortName: 'IND',   color: '#64748b', bgColor: 'bg-slate-500', foundedYear: 0,    ideology: 'Non-partisan',                          electionId: election.id } });

  await prisma.partySeats.createMany({
    data: [
      { partyId: pti.id,  seats: 5, totalVotes: 98450  },
      { partyId: pmln.id, seats: 4, totalVotes: 82310  },
      { partyId: ppp.id,  seats: 2, totalVotes: 41780  },
      { partyId: juif.id, seats: 1, totalVotes: 18920  },
      { partyId: mqm.id,  seats: 1, totalVotes: 12300  },
      { partyId: ind.id,  seats: 3, totalVotes: 29870  },
    ],
  });
  console.log('✓ Parties created');

  // ── Constituencies ──
  const na1  = await prisma.constituency.create({ data: { name: 'Hunza-Nagar',         code: 'NA-1',  provinceId: gb.id,  district: 'Hunza',         type: ConstituencyType.national,    registeredVoters: 54210,  reportedStations: 38, totalStations: 40, lat: 36.3167, lng: 74.6500, electionId: election.id } });
  const na2  = await prisma.constituency.create({ data: { name: 'Gilgit-I',             code: 'NA-2',  provinceId: gb.id,  district: 'Gilgit',        type: ConstituencyType.national,    registeredVoters: 87432,  reportedStations: 52, totalStations: 54, lat: 35.9208, lng: 74.3080, electionId: election.id } });
  const na3  = await prisma.constituency.create({ data: { name: 'Gilgit-II (Astore)',   code: 'NA-3',  provinceId: gb.id,  district: 'Astore',        type: ConstituencyType.national,    registeredVoters: 68540,  reportedStations: 42, totalStations: 46, lat: 35.3667, lng: 74.9000, electionId: election.id } });
  const na5  = await prisma.constituency.create({ data: { name: 'Ghanche-Skardu',       code: 'NA-5',  provinceId: gb.id,  district: 'Skardu',        type: ConstituencyType.national,    registeredVoters: 123456, reportedStations: 68, totalStations: 72, lat: 35.2970, lng: 75.6340, electionId: election.id } });
  const ajk1 = await prisma.constituency.create({ data: { name: 'Muzaffarabad-I',       code: 'LA-1',  provinceId: ajk.id, district: 'Muzaffarabad',  type: ConstituencyType.provincial,  registeredVoters: 98765,  reportedStations: 48, totalStations: 48, lat: 34.3700, lng: 73.4710, electionId: election.id } });
  const ajk2 = await prisma.constituency.create({ data: { name: 'Muzaffarabad-II',      code: 'LA-2',  provinceId: ajk.id, district: 'Muzaffarabad',  type: ConstituencyType.provincial,  registeredVoters: 76340,  reportedStations: 40, totalStations: 42, lat: 34.4100, lng: 73.5200, electionId: election.id } });
  console.log('✓ Constituencies created');

  // ── Observers ──
  const obs1 = await prisma.observer.create({ data: { name: 'Yasir Ali Shah',  email: 'yasir.shah@gen.pk',   phone: '0301-1234567', cnic: '14201-1234567-1', pollingStationName: 'Govt Boys High School Gilgit',       status: ObserverStatus.active, resultsSubmitted: 5, electionId: election.id } });
  const obs2 = await prisma.observer.create({ data: { name: 'Sana Batool',     email: 'sana.batool@gen.pk',  phone: '0321-7654321', cnic: '14201-7654321-2', pollingStationName: 'Karakoram International University',  status: ObserverStatus.active, resultsSubmitted: 3, electionId: election.id } });
  const obs3 = await prisma.observer.create({ data: { name: 'Imran Hussain',   email: 'imran.h@gen.pk',      phone: '0311-9876543', cnic: '14301-9876543-3', pollingStationName: 'Jutial Girls Primary School',          status: ObserverStatus.active, resultsSubmitted: 7, electionId: election.id } });
  const obs4 = await prisma.observer.create({ data: { name: 'Fatima Zahra',    email: 'fatima.z@gen.pk',     phone: '0331-1122334', cnic: '14401-1122334-4', pollingStationName: 'Hunza Model School Karimabad',         status: ObserverStatus.pending, resultsSubmitted: 0, electionId: election.id } });
  console.log('✓ Observers created');

  // ── Polling Stations ──
  const ps1 = await prisma.pollingStation.create({ data: { name: 'Govt Boys High School Gilgit',         address: 'Airport Road, Gilgit City',        constituencyId: na2.id,  registeredVoters: 1850, reported: true,  observerId: obs1.id } });
  const ps2 = await prisma.pollingStation.create({ data: { name: 'Karakoram International University',   address: 'University Road, Gilgit',          constituencyId: na2.id,  registeredVoters: 2100, reported: true,  observerId: obs2.id } });
  const ps3 = await prisma.pollingStation.create({ data: { name: 'Jutial Girls Primary School',          address: 'Jutial Mohalla, Gilgit',           constituencyId: na2.id,  registeredVoters: 1420, reported: true,  observerId: obs3.id } });
  const ps4 = await prisma.pollingStation.create({ data: { name: 'Hunza Model School Karimabad',         address: 'Karimabad Bazaar, Hunza',          constituencyId: na1.id,  registeredVoters: 1640, reported: true,  observerId: obs4.id } });
  const ps5 = await prisma.pollingStation.create({ data: { name: 'Aliabad Middle School',                address: 'Main Rd, Aliabad, Hunza',          constituencyId: na1.id,  registeredVoters: 1230, reported: false } });
  const ps6 = await prisma.pollingStation.create({ data: { name: 'Skardu Degree College',               address: 'College Road, Skardu',             constituencyId: na5.id,  registeredVoters: 2450, reported: true,  observerId: obs1.id } });
  const ps7 = await prisma.pollingStation.create({ data: { name: 'Muzaffarabad City School',             address: 'Chattar Domel, Muzaffarabad',      constituencyId: ajk1.id, registeredVoters: 1780, reported: true,  observerId: obs2.id } });
  const ps8 = await prisma.pollingStation.create({ data: { name: 'Govt Girls High School Muzaffarabad', address: 'Bank Road, Muzaffarabad',           constituencyId: ajk1.id, registeredVoters: 1560, reported: false, observerId: obs3.id } });
  console.log('✓ Polling stations created');

  // ── Candidates ──
  const candidates = await prisma.candidate.createManyAndReturn({
    data: [
      { name: 'Muhammad Khalid Khurshid', partyId: pti.id,  constituencyId: na1.id,  electionId: election.id, votes: 24560, likes: 8400,  bio: 'Former Chief Minister GB.',               age: 51, education: 'MA Political Science', initials: 'MK', profession: 'Politician'             },
      { name: 'Mir Ghazanfar Ali Khan',   partyId: pmln.id, constituencyId: na1.id,  electionId: election.id, votes: 19820, likes: 5100,  bio: 'Former Governor GB.',                     age: 67, education: 'LLB',                  initials: 'MG', profession: 'Lawyer / Politician'    },
      { name: 'Syed Shah Bacha',          partyId: ppp.id,  constituencyId: na1.id,  electionId: election.id, votes: 9830,  likes: 2800,  bio: 'PPP stalwart from Hunza Valley.',         age: 48, education: 'BA',                   initials: 'SB', profession: 'Agriculturalist'        },
      { name: 'Amjad Hussain Advocate',   partyId: pti.id,  constituencyId: na2.id,  electionId: election.id, votes: 38100, likes: 12200, bio: 'Rights advocate, digital connectivity.', age: 44, education: 'LLB Hons',             initials: 'AH', profession: 'Lawyer'                 },
      { name: 'Shabbir Ahmed Qaimkhani', partyId: pmln.id, constituencyId: na2.id,  electionId: election.id, votes: 31450, likes: 9300,  bio: '20 years in Gilgit city politics.',       age: 58, education: 'MA',                   initials: 'SQ', profession: 'Businessman / Politician'},
      { name: 'Imtiaz Ahmed',             partyId: ind.id,  constituencyId: na2.id,  electionId: election.id, votes: 12780, likes: 3900,  bio: 'Independent entrepreneur, youth focus.', age: 39, education: 'MBA',                  initials: 'IA', profession: 'Entrepreneur'           },
      { name: 'Raja Jalal Hussain Maqpoon',partyId: ppp.id, constituencyId: na3.id,  electionId: election.id, votes: 22100, likes: 6400,  bio: 'Development-focused from Astore.',       age: 47, education: 'MBA',                  initials: 'RJ', profession: 'Businessman'            },
      { name: 'Hafizur Rehman',           partyId: pmln.id, constituencyId: na3.id,  electionId: election.id, votes: 19890, likes: 5800,  bio: 'Astore development champion.',           age: 52, education: 'MSc Engineering',      initials: 'HR', profession: 'Engineer / Politician'  },
      { name: 'Qasim Ali Shah',           partyId: pti.id,  constituencyId: na3.id,  electionId: election.id, votes: 16230, likes: 4700,  bio: 'PTI leader, road connectivity focus.',   age: 36, education: 'BEng',                 initials: 'QA', profession: 'Civil Engineer'         },
      { name: 'Syed Abid Raza',           partyId: mqm.id,  constituencyId: na5.id,  electionId: election.id, votes: 12300, likes: 3200,  bio: 'MWM leader, Shia community, Baltistan.', age: 45, education: 'MA Islamic Studies',   initials: 'SR', profession: 'Scholar / Politician'   },
      { name: 'Chaudhry Muhammad Barjees',partyId: pmln.id, constituencyId: na5.id,  electionId: election.id, votes: 29780, likes: 9200,  bio: 'Former GB Assembly Speaker.',            age: 60, education: 'LLB',                  initials: 'CM', profession: 'Lawyer / Politician'    },
      { name: 'Agha Hassan Motazid',      partyId: ind.id,  constituencyId: na5.id,  electionId: election.id, votes: 11200, likes: 2900,  bio: 'Independent candidate, Skardu.',         age: 42, education: 'BA',                   initials: 'AM', profession: 'Businessman'            },
      { name: 'Sardar Tanveer Ilyas',     partyId: pti.id,  constituencyId: ajk1.id, electionId: election.id, votes: 41200, likes: 14500, bio: 'Former AJK Prime Minister.',             age: 50, education: 'MBA',                  initials: 'ST', profession: 'Politician'             },
      { name: 'Chaudhry Anwar ul Haq',    partyId: pmln.id, constituencyId: ajk1.id, electionId: election.id, votes: 33400, likes: 10200, bio: 'Former AJK PM, PML-N senior leader.',   age: 55, education: 'LLB',                  initials: 'CA', profession: 'Lawyer / Politician'    },
      { name: 'Farooq Haider Khan',       partyId: ppp.id,  constituencyId: ajk2.id, electionId: election.id, votes: 28900, likes: 8700,  bio: 'AJK former PM, PPP leader.',             age: 57, education: 'MA',                   initials: 'FH', profession: 'Politician'             },
      { name: 'Mustafa Butt',             partyId: ind.id,  constituencyId: ajk2.id, electionId: election.id, votes: 14300, likes: 3800,  bio: 'Independent, business community.',       age: 45, education: 'BBA',                  initials: 'MB', profession: 'Businessman'            },
    ],
  });
  console.log('✓ Candidates created:', candidates.length);

  // ── Result Entries ──
  await prisma.resultEntry.createMany({
    data: [
      { candidateId: candidates[0].id, candidateName: candidates[0].name, partyId: pti.id,  pollingStationId: ps4.id, pollingStationName: ps4.name, constituencyId: na1.id,  electionId: election.id, votes: 1240, submittedBy: obs4.id, verified: true,  flagged: false, observerId: obs4.id },
      { candidateId: candidates[3].id, candidateName: candidates[3].name, partyId: pti.id,  pollingStationId: ps1.id, pollingStationName: ps1.name, constituencyId: na2.id,  electionId: election.id, votes: 1820, submittedBy: obs1.id, verified: true,  flagged: false, observerId: obs1.id },
      { candidateId: candidates[4].id, candidateName: candidates[4].name, partyId: pmln.id, pollingStationId: ps2.id, pollingStationName: ps2.name, constituencyId: na2.id,  electionId: election.id, votes: 1480, submittedBy: obs2.id, verified: false, flagged: true,  observerId: obs2.id },
      { candidateId: candidates[5].id, candidateName: candidates[5].name, partyId: ind.id,  pollingStationId: ps3.id, pollingStationName: ps3.name, constituencyId: na2.id,  electionId: election.id, votes: 610,  submittedBy: obs3.id, verified: true,  flagged: false, observerId: obs3.id },
      { candidateId: candidates[12].id,candidateName: candidates[12].name,partyId: pti.id,  pollingStationId: ps7.id, pollingStationName: ps7.name, constituencyId: ajk1.id, electionId: election.id, votes: 2100, submittedBy: obs2.id, verified: true,  flagged: false, observerId: obs2.id },
    ],
  });
  console.log('✓ Result entries created');

  // ── Live Updates ──
  await prisma.liveUpdate.createMany({
    data: [
      { message: 'PTI leads in Hunza-Nagar with 65% votes counted',           type: LiveUpdateType.result,    constituencyCode: 'NA-1', electionId: election.id },
      { message: 'Turnout in Gilgit-I crosses 58%',                           type: LiveUpdateType.milestone, constituencyCode: 'NA-2', electionId: election.id },
      { message: 'Results certified from Skardu Degree College polling booth', type: LiveUpdateType.update,    electionId: election.id },
      { message: 'All quiet at Muzaffarabad City School polling station',      type: LiveUpdateType.update,    electionId: election.id },
      { message: 'Suspicious report flagged at KIU booth — under review',      type: LiveUpdateType.alert,     constituencyCode: 'NA-2', electionId: election.id },
      { message: 'PTI secures NA-1 seat — Hunza declared',                    type: LiveUpdateType.milestone, constituencyCode: 'NA-1', electionId: election.id },
    ],
  });
  console.log('✓ Live updates created');

  // ── Admin User ──
  await prisma.user.create({
    data: {
      name: 'Admin Malik',
      email: 'admin@gen.pk',
      password: 'hashed_in_production',
      role: UserRole.admin,
    },
  });
  console.log('✓ Admin user created');

  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
