export type Language =
  | 'en'
  | 'as'
  | 'bn'
  | 'brx'
  | 'doi'
  | 'gu'
  | 'hi'
  | 'kn'
  | 'ks'
  | 'kok'
  | 'mai'
  | 'ml'
  | 'mni'
  | 'mr'
  | 'ne'
  | 'or'
  | 'pa'
  | 'sa'
  | 'sat'
  | 'sd'
  | 'ta'
  | 'te'
  | 'ur';

export interface CitizenProfile {
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  otp: string;
  isOtpVerified: boolean;
  state: string;
  district: string;
  occupation: string;
  annualIncome: number;
  aadhaarLastFour: string;
  landHoldingAcres?: number;
  casteCategory?: 'General' | 'OBC' | 'SC' | 'ST' | string;
  landType?: 'Irrigated' | 'Dry';
  rationCardStatus?: 'BPL' | 'APL' | 'Antyodaya' | 'None';
  hasDisability?: boolean;
  isStudentEnrolled?: boolean;
  educationLevel?: string;
  isShgMember?: boolean;
}

export interface Scheme {
  id: string;
  title: string;
  titleVernacular: string;
  category: 'farmer' | 'student' | 'worker' | 'women' | 'rural' | 'msme';
  categoryLabel: string;
  ministry: string;
  benefitAmount: string;
  benefitType: string;
  description: string;
  eligibility: string[];
  documentsRequired: string[];
  officialUrl: string;
  matchScore: number;
  status: 'eligible' | 'documents_needed' | 'in_review';
  dbtEnabled: boolean;
  deadline?: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  tag: 'DISPATCHER' | 'PREDICTOR' | 'MUTEX_LOCK' | 'OCR_ALLOC' | 'QUEUE_OPTIMIZER' | 'CIRCUIT_BREAKER' | 'ORCHESTRATOR' | 'STREAM';
  message: string;
  level: 'info' | 'warn' | 'success' | 'alert';
}

export interface AgentNode {
  id: string;
  name: string;
  subtitle: string;
  status: 'Running' | 'Reserved' | 'Waiting' | 'Predicted' | 'Unavailable' | 'Idle';
  icon: string;
  colorClass: string;
}

export interface CitizenIngressUser {
  id: string;
  code: string;
  name: string;
  details: string;
  badge: string;
  status: 'Running' | 'Reserved' | 'Queued' | 'Completed';
  activeScheme: string;
  avatarBg: string;
}

export interface ResourcePool {
  id: string;
  name: string;
  capacityText: string;
  fractionText: string;
  color: string;
  progressPercent: number;
  icon: string;
}
