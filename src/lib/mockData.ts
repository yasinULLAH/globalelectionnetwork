import type {
  Party, Province, Constituency, PollingStation,
  Candidate, Observer, ResultEntry, LiveUpdate,
  TurnoutDataPoint, RegionalSummary, ElectionConfig,
} from '@/types';

export const ELECTIONS: ElectionConfig[] = [
  {
    id: 'gb-general-2024',
    name: 'GB General Elections 2024',
    country: 'Pakistan',
    electionType: 'General',
    region: 'Gilgit-Baltistan',
    province: 'Gilgit-Baltistan',
    date: '2024-02-08',
    status: 'live',
    totalSeats: 24,
    totalRegisteredVoters: 745_423,
    description: 'General elections for the Gilgit-Baltistan Legislative Assembly.',
    flagEmoji: '🏔️',
  },
  {
    id: 'ajk-general-2021',
    name: 'AJK General Elections 2021',
    country: 'Pakistan',
    electionType: 'General',
    region: 'Azad Jammu & Kashmir',
    province: 'Azad Jammu & Kashmir',
    date: '2021-07-25',
    status: 'completed',
    totalSeats: 53,
    totalRegisteredVoters: 2_863_000,
    description: 'General elections for the Azad Jammu & Kashmir Legislative Assembly.',
    flagEmoji: '🏞️',
  },
  {
    id: 'pk-general-2024',
    name: 'General Election Pakistan 2024',
    country: 'Pakistan',
    electionType: 'General',
    region: 'National',
    province: 'All Provinces',
    date: '2024-02-08',
    status: 'completed',
    totalSeats: 336,
    totalRegisteredVoters: 128_585_760,
    description: 'National general elections for the National Assembly of Pakistan.',
    flagEmoji: '🇵🇰',
  },
  {
    id: 'pk-punjab-2023',
    name: 'Punjab Provincial Elections 2023',
    country: 'Pakistan',
    electionType: 'Provincial',
    region: 'Punjab',
    province: 'Punjab',
    date: '2023-10-15',
    status: 'completed',
    totalSeats: 297,
    totalRegisteredVoters: 71_230_000,
    description: 'Provincial Assembly elections for the Punjab province of Pakistan.',
    flagEmoji: '🌾',
  },
  {
    id: 'pk-kpk-2024',
    name: 'KPK Provincial Elections 2024',
    country: 'Pakistan',
    electionType: 'Provincial',
    region: 'Khyber Pakhtunkhwa',
    province: 'Khyber Pakhtunkhwa',
    date: '2024-02-08',
    status: 'completed',
    totalSeats: 145,
    totalRegisteredVoters: 22_500_000,
    description: 'Provincial Assembly elections for Khyber Pakhtunkhwa.',
    flagEmoji: '⛰️',
  },
  {
    id: 'pk-sindh-2024',
    name: 'Sindh Provincial Elections 2024',
    country: 'Pakistan',
    electionType: 'Provincial',
    region: 'Sindh',
    province: 'Sindh',
    date: '2024-02-08',
    status: 'upcoming',
    totalSeats: 168,
    totalRegisteredVoters: 26_500_000,
    description: 'Provincial Assembly elections for Sindh province.',
    flagEmoji: '🌊',
  },
  {
    id: 'pk-balochistan-2024',
    name: 'Balochistan Assembly Elections 2024',
    country: 'Pakistan',
    electionType: 'Provincial',
    region: 'Balochistan',
    province: 'Balochistan',
    date: '2024-02-08',
    status: 'completed',
    totalSeats: 65,
    totalRegisteredVoters: 5_200_000,
    description: 'Provincial Assembly elections for Balochistan.',
    flagEmoji: '🏜️',
  },
];

export const PARTIES: Party[] = [
  { id: 'pti', name: 'Pakistan Tehreek-e-Insaf', shortName: 'PTI', color: '#16a34a', bgColor: 'bg-green-600', seats: 5, totalVotes: 98_450, foundedYear: 1996, ideology: 'Centrist / Populist' },
  { id: 'pmln', name: 'Pakistan Muslim League (N)', shortName: 'PML-N', color: '#dc2626', bgColor: 'bg-red-600', seats: 4, totalVotes: 82_310, foundedYear: 1988, ideology: 'Conservative / Centre-right' },
  { id: 'ppp', name: 'Pakistan Peoples Party', shortName: 'PPP', color: '#ea580c', bgColor: 'bg-orange-600', seats: 2, totalVotes: 41_780, foundedYear: 1967, ideology: 'Social Democracy' },
  { id: 'juif', name: 'Jamiat Ulema-e-Islam (F)', shortName: 'JUI-F', color: '#0369a1', bgColor: 'bg-sky-700', seats: 1, totalVotes: 18_920, foundedYear: 1945, ideology: 'Islamic Conservatism' },
  { id: 'mqm', name: 'Majlis Wahdat-e-Muslimeen', shortName: 'MWM', color: '#7c3aed', bgColor: 'bg-violet-600', seats: 1, totalVotes: 12_300, foundedYear: 2001, ideology: 'Shia Political Party' },
  { id: 'ind', name: 'Independent', shortName: 'IND', color: '#64748b', bgColor: 'bg-slate-500', seats: 3, totalVotes: 29_870, foundedYear: 0, ideology: 'Non-partisan' },
];

export const PROVINCES: Province[] = [
  { id: 'gb', name: 'Gilgit-Baltistan', code: 'GB' },
  { id: 'ajk', name: 'Azad Jammu & Kashmir', code: 'AJK' },
];

export const CONSTITUENCIES: Constituency[] = [
  { id: 'na1', name: 'Hunza-Nagar', code: 'NA-1', provinceId: 'gb', district: 'Hunza', type: 'national', registeredVoters: 54_210, reportedStations: 38, totalStations: 40, lat: 36.3167, lng: 74.6500 },
  { id: 'na2', name: 'Gilgit-I', code: 'NA-2', provinceId: 'gb', district: 'Gilgit', type: 'national', registeredVoters: 87_432, reportedStations: 52, totalStations: 54, lat: 35.9208, lng: 74.3080 },
  { id: 'na3', name: 'Gilgit-II (Astore)', code: 'NA-3', provinceId: 'gb', district: 'Astore', type: 'national', registeredVoters: 68_540, reportedStations: 42, totalStations: 46, lat: 35.3667, lng: 74.9000 },
  { id: 'na4', name: 'Diamer', code: 'NA-4', provinceId: 'gb', district: 'Diamer', type: 'national', registeredVoters: 92_100, reportedStations: 58, totalStations: 62, lat: 35.7000, lng: 74.0000 },
  { id: 'na5', name: 'Ghanche-Skardu', code: 'NA-5', provinceId: 'gb', district: 'Skardu', type: 'national', registeredVoters: 123_456, reportedStations: 68, totalStations: 72, lat: 35.2970, lng: 75.6340 },
  { id: 'ajk1', name: 'Muzaffarabad-I', code: 'LA-1', provinceId: 'ajk', district: 'Muzaffarabad', type: 'provincial', registeredVoters: 98_765, reportedStations: 48, totalStations: 48, lat: 34.3700, lng: 73.4710 },
  { id: 'ajk2', name: 'Muzaffarabad-II', code: 'LA-2', provinceId: 'ajk', district: 'Muzaffarabad', type: 'provincial', registeredVoters: 76_340, reportedStations: 40, totalStations: 42, lat: 34.4100, lng: 73.5200 },
  { id: 'ajk3', name: 'Hattian Bala', code: 'LA-3', provinceId: 'ajk', district: 'Hattian', type: 'provincial', registeredVoters: 61_230, reportedStations: 35, totalStations: 36, lat: 34.5000, lng: 73.8000 },
  { id: 'ajk4', name: 'Neelum Valley', code: 'LA-4', provinceId: 'ajk', district: 'Neelum', type: 'provincial', registeredVoters: 48_900, reportedStations: 28, totalStations: 32, lat: 34.7000, lng: 73.9000 },
  { id: 'ajk5', name: 'Rawalakot-I', code: 'LA-10', provinceId: 'ajk', district: 'Poonch', type: 'provincial', registeredVoters: 82_450, reportedStations: 44, totalStations: 46, lat: 33.8500, lng: 73.7700 },
];

export const POLLING_STATIONS: PollingStation[] = [
  { id: 'ps1', name: 'Govt Boys High School Gilgit', address: 'Airport Road, Gilgit City', constituencyId: 'na2', registeredVoters: 1_850, reported: true, observerId: 'obs1' },
  { id: 'ps2', name: 'Karakoram International University', address: 'University Road, Gilgit', constituencyId: 'na2', registeredVoters: 2_100, reported: true, observerId: 'obs2' },
  { id: 'ps3', name: 'Jutial Girls Primary School', address: 'Jutial Mohalla, Gilgit', constituencyId: 'na2', registeredVoters: 1_420, reported: true, observerId: 'obs3' },
  { id: 'ps4', name: 'Hunza Model School Karimabad', address: 'Karimabad Bazaar, Hunza', constituencyId: 'na1', registeredVoters: 1_640, reported: true, observerId: 'obs4' },
  { id: 'ps5', name: 'Aliabad Middle School', address: 'Main Rd, Aliabad, Hunza', constituencyId: 'na1', registeredVoters: 1_230, reported: false },
  { id: 'ps6', name: 'Skardu Degree College', address: 'College Road, Skardu', constituencyId: 'na5', registeredVoters: 2_450, reported: true, observerId: 'obs1' },
  { id: 'ps7', name: 'Muzaffarabad City School', address: 'Chattar Domel, Muzaffarabad', constituencyId: 'ajk1', registeredVoters: 1_780, reported: true, observerId: 'obs2' },
  { id: 'ps8', name: 'Govt Girls High School Muzaffarabad', address: 'Bank Road, Muzaffarabad', constituencyId: 'ajk1', registeredVoters: 1_560, reported: false, observerId: 'obs3' },
];

export const CANDIDATES: Candidate[] = [
  // NA-1 Hunza-Nagar
  { id: 'c1', name: 'Muhammad Khalid Khurshid', partyId: 'pti', constituencyId: 'na1', votes: 24_560, likes: 8_400, bio: 'Former Chief Minister GB, champion of mountain tourism and Karakoram Highway infrastructure.', age: 51, education: 'MA Political Science (Quaid-e-Azam University)', initials: 'MK', profession: 'Politician' },
  { id: 'c2', name: 'Mir Ghazanfar Ali Khan', partyId: 'pmln', constituencyId: 'na1', votes: 19_820, likes: 5_100, bio: 'Former Governor GB and senior PML-N leader from Hunza.', age: 67, education: 'LLB (University of Peshawar)', initials: 'MG', profession: 'Lawyer / Politician' },
  { id: 'c3', name: 'Syed Shah Bacha', partyId: 'ppp', constituencyId: 'na1', votes: 9_830, likes: 2_800, bio: 'PPP stalwart advocating for Hunza Valley farmers and water rights.', age: 48, education: 'BA (University of Karachi)', initials: 'SB', profession: 'Agriculturalist / Politician' },
  // NA-2 Gilgit-I
  { id: 'c4', name: 'Amjad Hussain Advocate', partyId: 'pti', constituencyId: 'na2', votes: 38_100, likes: 12_200, bio: 'Rights advocate championing education access and digital connectivity in Gilgit.', age: 44, education: 'LLB Hons (University of Punjab)', initials: 'AH', profession: 'Lawyer' },
  { id: 'c5', name: 'Shabbir Ahmed Qaimkhani', partyId: 'pmln', constituencyId: 'na2', votes: 31_450, likes: 9_300, bio: 'Seasoned legislator with 20 years in Gilgit city politics.', age: 58, education: 'MA (Karakoram International University)', initials: 'SQ', profession: 'Businessman / Politician' },
  { id: 'c6', name: 'Imtiaz Ahmed', partyId: 'ind', constituencyId: 'na2', votes: 12_780, likes: 3_900, bio: 'Independent candidate and entrepreneur focused on youth employment in GB.', age: 39, education: 'MBA (SZABIST)', initials: 'IA', profession: 'Entrepreneur' },
  // NA-3 Gilgit-II / Astore
  { id: 'c7', name: 'Raja Jalal Hussain Maqpoon', partyId: 'ppp', constituencyId: 'na3', votes: 22_100, likes: 6_400, bio: 'Development-focused candidate from the historic Maqpoon family of Astore.', age: 47, education: 'MBA (LUMS)', initials: 'RJ', profession: 'Businessman' },
  { id: 'c8', name: 'Hafizur Rehman', partyId: 'pmln', constituencyId: 'na3', votes: 19_890, likes: 5_800, bio: 'Astore district development champion and PML-N loyal organiser.', age: 52, education: 'MSc Engineering', initials: 'HR', profession: 'Engineer / Politician' },
  { id: 'c9', name: 'Qasim Ali Shah', partyId: 'pti', constituencyId: 'na3', votes: 16_230, likes: 4_700, bio: 'Young PTI leader pushing for road connectivity to remote Astore valleys.', age: 36, education: 'BEng (NED University)', initials: 'QA', profession: 'Civil Engineer' },
  // NA-5 Ghanche-Skardu
  { id: 'c10', name: 'Syed Abid Raza', partyId: 'mqm', constituencyId: 'na5', votes: 12_300, likes: 3_200, bio: 'MWM leader representing the Shia community of Baltistan.', age: 45, education: 'MA Islamic Studies', initials: 'SR', profession: 'Scholar / Politician' },
  { id: 'c11', name: 'Chaudhry Muhammad Barjees', partyId: 'pmln', constituencyId: 'na5', votes: 29_780, likes: 9_200, bio: 'Former GB Assembly Speaker and senior PML-N figure in Skardu.', age: 60, education: 'LLB', initials: 'CM', profession: 'Lawyer / Politician' },
  { id: 'c12', name: 'Gulbar Khan', partyId: 'juif', constituencyId: 'na5', votes: 18_920, likes: 4_100, bio: 'JUI-F leader with deep roots in Skardu religious and tribal networks.', age: 56, education: 'Islamic Studies (Darul Uloom Karachi)', initials: 'GK', profession: 'Scholar' },
  // AJK-1 Muzaffarabad-I
  { id: 'c13', name: 'Sardar Attique Ahmed Khan', partyId: 'pti', constituencyId: 'ajk1', votes: 41_560, likes: 14_500, bio: 'Former AJK Prime Minister pushing for infrastructure, water rights, and constitutional reform.', age: 55, education: 'BA (University of Azad Kashmir)', initials: 'SA', profession: 'Politician' },
  { id: 'c14', name: 'Sultan Mahmood Chaudhry', partyId: 'pmln', constituencyId: 'ajk1', votes: 36_780, likes: 11_300, bio: 'Former AJK President with decades of legislative experience.', age: 62, education: 'MA (University of the Punjab)', initials: 'SM', profession: 'Politician' },
  { id: 'c15', name: 'Chaudhry Anwar ul Haq', partyId: 'ppp', constituencyId: 'ajk1', votes: 14_230, likes: 4_200, bio: 'Current AJK PM, PPP representative advocating social welfare.', age: 50, education: 'LLB (Peshawar University)', initials: 'CA', profession: 'Lawyer / Politician' },
  // AJK-5 Rawalakot
  { id: 'c16', name: 'Farooq Haider Khan', partyId: 'pmln', constituencyId: 'ajk5', votes: 27_890, likes: 7_800, bio: 'Former AJK PM focused on development of Poonch district and Rawalakot city.', age: 61, education: 'MSc (University of Azad Kashmir)', initials: 'FH', profession: 'Politician' },
];

export const OBSERVERS: Observer[] = [
  { id: 'obs1', name: 'Yasir Ali Shah', email: 'yasir.shah@gen.pk', phone: '+92-5811-000001', cnic: '15401-1234567-1', pollingStationId: 'ps1', pollingStationName: 'Govt Boys High School Gilgit', status: 'active', resultsSubmitted: 4, lastActivity: '2024-02-08T10:23:00Z', joinedAt: '2024-01-15' },
  { id: 'obs2', name: 'Sana Batool', email: 'sana.batool@gen.pk', phone: '+92-5811-000002', cnic: '15202-2345678-2', pollingStationId: 'ps2', pollingStationName: 'Karakoram International University', status: 'active', resultsSubmitted: 5, lastActivity: '2024-02-08T11:45:00Z', joinedAt: '2024-01-16' },
  { id: 'obs3', name: 'Tariq Mehmood Hunzai', email: 'tariq.hunzai@gen.pk', phone: '+92-5811-000003', cnic: '15401-3456789-3', pollingStationId: 'ps3', pollingStationName: 'Jutial Girls Primary School', status: 'active', resultsSubmitted: 3, lastActivity: '2024-02-08T09:15:00Z', joinedAt: '2024-01-18' },
  { id: 'obs4', name: 'Nadia Hussain Mir', email: 'nadia.mir@gen.pk', phone: '+92-5811-000004', cnic: '15401-4567890-4', pollingStationId: 'ps4', pollingStationName: 'Hunza Model School Karimabad', status: 'pending', resultsSubmitted: 0, lastActivity: '2024-02-07T15:30:00Z', joinedAt: '2024-01-20' },
  { id: 'obs5', name: 'Zahir Shah Baig', email: 'zahir.baig@gen.pk', phone: '+92-5811-000005', cnic: '15401-5678901-5', pollingStationId: 'ps6', pollingStationName: 'Skardu Degree College', status: 'active', resultsSubmitted: 2, lastActivity: '2024-02-08T12:10:00Z', joinedAt: '2024-01-22' },
];

export const RESULT_ENTRIES: ResultEntry[] = [
  { id: 'r1', candidateId: 'c4', candidateName: 'Amjad Hussain Advocate', partyId: 'pti', pollingStationId: 'ps1', pollingStationName: 'Govt Boys High School Gilgit', constituencyId: 'na2', votes: 892, submittedAt: '2024-02-08T10:23:00Z', submittedBy: 'obs1', verified: true, flagged: false },
  { id: 'r2', candidateId: 'c5', candidateName: 'Shabbir Ahmed Qaimkhani', partyId: 'pmln', pollingStationId: 'ps1', pollingStationName: 'Govt Boys High School Gilgit', constituencyId: 'na2', votes: 730, submittedAt: '2024-02-08T10:23:00Z', submittedBy: 'obs1', verified: true, flagged: false },
  { id: 'r3', candidateId: 'c4', candidateName: 'Amjad Hussain Advocate', partyId: 'pti', pollingStationId: 'ps2', pollingStationName: 'Karakoram International University', constituencyId: 'na2', votes: 1_023, submittedAt: '2024-02-08T11:45:00Z', submittedBy: 'obs2', verified: true, flagged: false },
  { id: 'r4', candidateId: 'c5', candidateName: 'Shabbir Ahmed Qaimkhani', partyId: 'pmln', pollingStationId: 'ps2', pollingStationName: 'Karakoram International University', constituencyId: 'na2', votes: 845, submittedAt: '2024-02-08T11:45:00Z', submittedBy: 'obs2', verified: true, flagged: false },
  { id: 'r5', candidateId: 'c13', candidateName: 'Sardar Attique Ahmed Khan', partyId: 'pti', pollingStationId: 'ps7', pollingStationName: 'Muzaffarabad City School', constituencyId: 'ajk1', votes: 612, submittedAt: '2024-02-08T09:15:00Z', submittedBy: 'obs2', verified: false, flagged: true },
];

export const LIVE_UPDATES: LiveUpdate[] = [
  { id: 'u1', message: 'NA-2 Gilgit-I: Amjad Hussain leads with 38,100 votes — 52/54 stations reporting', timestamp: '2024-02-08T12:01:00Z', type: 'result', constituencyCode: 'NA-2' },
  { id: 'u2', message: 'Milestone: 250,000 votes counted across Gilgit-Baltistan & AJK', timestamp: '2024-02-08T11:55:00Z', type: 'milestone' },
  { id: 'u3', message: 'NA-5 Ghanche-Skardu: 68/72 polling stations have reported', timestamp: '2024-02-08T11:50:00Z', type: 'update', constituencyCode: 'NA-5' },
  { id: 'u4', message: 'Alert: Duplicate submission detected and rejected from PS-8 Muzaffarabad', timestamp: '2024-02-08T11:42:00Z', type: 'alert' },
  { id: 'u5', message: 'NA-1 Hunza-Nagar: PTI leads by 4,740 votes — all 40 stations reporting', timestamp: '2024-02-08T11:38:00Z', type: 'result', constituencyCode: 'NA-1' },
  { id: 'u6', message: 'LA-1 Muzaffarabad-I: All 48 stations reported — Sardar Attique wins', timestamp: '2024-02-08T11:30:00Z', type: 'milestone', constituencyCode: 'LA-1' },
  { id: 'u7', message: 'NA-3 Gilgit-II / Astore: 42/46 polling stations reporting', timestamp: '2024-02-08T11:22:00Z', type: 'update', constituencyCode: 'NA-3' },
  { id: 'u8', message: 'Voter turnout in Hunza crosses 62% — highest in GB history', timestamp: '2024-02-08T11:10:00Z', type: 'milestone' },
];

export const TURNOUT_DATA: TurnoutDataPoint[] = [
  { time: '08:00', turnout: 6.1, votes: 16_800 },
  { time: '09:00', turnout: 14.2, votes: 39_000 },
  { time: '10:00', turnout: 24.5, votes: 67_200 },
  { time: '11:00', turnout: 35.8, votes: 98_300 },
  { time: '12:00', turnout: 43.2, votes: 118_600 },
  { time: '13:00', turnout: 49.7, votes: 136_400 },
  { time: '14:00', turnout: 55.1, votes: 151_200 },
  { time: '15:00', turnout: 59.4, votes: 163_100 },
  { time: '16:00', turnout: 62.3, votes: 171_000 },
  { time: '17:00', turnout: 63.1, votes: 173_200 },
];

export const REGIONAL_SUMMARIES: RegionalSummary[] = [
  { provinceId: 'gb', provinceName: 'Gilgit-Baltistan', seatsTotal: 5, seatsDeclared: 4, leadingParty: 'PTI', leadingPartyColor: '#16a34a', turnout: 63.1, totalVotes: 173_200 },
  { provinceId: 'ajk', provinceName: 'Azad Kashmir', seatsTotal: 5, seatsDeclared: 3, leadingParty: 'PTI', leadingPartyColor: '#16a34a', turnout: 58.4, totalVotes: 110_630 },
];

export const ELECTION_META = {
  name: 'GB & AJK General Elections 2024',
  date: '2024-02-08',
  status: 'live' as const,
  totalSeats: 16,
  seatsDeclared: 14,
  totalRegisteredVoters: 745_423,
  totalVotesCast: 283_830,
  nationalTurnout: 63.1,
  lastUpdated: '2024-02-08T12:01:00Z',
};
