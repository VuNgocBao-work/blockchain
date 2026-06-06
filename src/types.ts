export interface Candidate {
  id: string;
  name: string;
  role: string;
  class: string;
  slogan: string;
  description: string;
  imageUrl: string;
}

export interface Vote {
  voterName: string;
  studentId: string;
  candidateId: string;
  candidateName: string;
  timestamp: number;
  signature: string;
}

export interface Block {
  index: number;
  timestamp: number;
  votes: Vote[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface BlockchainStatus {
  isValid: boolean;
  tamperedBlockIndex: number | null;
  message: string;
  corruptedBlockIndices: number[];
}

export interface UserSession {
  name: string;
  studentId: string;
  hasVoted: boolean;
}
