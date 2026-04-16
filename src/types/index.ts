export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  seats: number;
  totalVotes: number;
  foundedYear: number;
  ideology: string;
}

export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface Constituency {
  id: string;
  name: string;
  code: string;
  provinceId: string;
  district: string;
  type: 'national' | 'provincial';
  registeredVoters: number;
  reportedStations: number;
  totalStations: number;
  lat: number;
  lng: number;
}

export interface PollingStation {
  id: string;
  name: string;
  address: string;
  constituencyId: string;
  registeredVoters: number;
  reported: boolean;
  observerId?: string;
}

export interface Candidate {
  id: string;
  name: string;
  partyId: string;
  constituencyId: string;
  votes: number;
  likes: number;
  bio: string;
  age: number;
  education: string;
  initials: string;
  profession: string;
  photoUrl?: string;
}

export interface Observer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  pollingStationId: string;
  pollingStationName: string;
  status: 'active' | 'inactive' | 'pending';
  resultsSubmitted: number;
  lastActivity: string;
  joinedAt: string;
}

export interface ResultEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  partyId: string;
  pollingStationId: string;
  pollingStationName: string;
  constituencyId: string;
  votes: number;
  submittedAt: string;
  submittedBy: string;
  verified: boolean;
  flagged: boolean;
}

export interface LiveUpdate {
  id: string;
  message: string;
  timestamp: string;
  type: 'result' | 'alert' | 'update' | 'milestone';
  constituencyCode?: string;
}

export interface TurnoutDataPoint {
  time: string;
  turnout: number;
  votes: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'observer' | 'public';
  observerId?: string;
}

export interface RegionalSummary {
  provinceId: string;
  provinceName: string;
  seatsTotal: number;
  seatsDeclared: number;
  leadingParty: string;
  leadingPartyColor: string;
  turnout: number;
  totalVotes: number;
}

export type ElectionType = 'General' | 'Provincial' | 'By-Election' | 'Senate' | 'Local Bodies';
export type ElectionStatus = 'upcoming' | 'live' | 'completed';

export interface ElectionConfig {
  id: string;
  name: string;
  country: string;
  electionType: ElectionType;
  region: string;
  province: string;
  date: string;
  status: ElectionStatus;
  totalSeats: number;
  totalRegisteredVoters: number;
  description: string;
  flagEmoji: string;
}
