export type UniversityStatus = "PENDING" | "APPROVED" | "REMOVED";

export interface University {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  accredited: boolean;
  status: UniversityStatus;
  createdAt?: string;
}

export interface Diploma {
  id: string;
  tokenId: string;
  studentWallet: string;
  studentName: string;
  degree: string;
  major?: string;
  metadataHash?: string;
  metadataUri?: string;
  revoked: boolean;
  issuedAt: string;
  universityId?: string;
  university?: Pick<University, "name" | "walletAddress" | "accredited">;
}

export interface VerifyResult {
  valid: boolean;
  diploma?: Diploma;
  message?: string;
}

export interface UniversityStats {
  total: number;
  active: number;
  revoked: number;
}

export interface BatchResult {
  success: boolean;
  tokenId?: string;
  studentName?: string;
  studentWallet?: string;
  error?: string;
}
