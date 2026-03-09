// --- Storage schema ---

export interface BlockedSite {
  domain: string;
  startTimestamp: number; // ms since epoch
  emergencyUseCount: number;
}

export interface StorageData {
  blockedSites: Record<string, BlockedSite>;
  emergencyAccess: Record<string, { expiresAt: number }>; // active 60-min windows
  penalties: Record<string, { expiresAt: number }>; // active 5-min cooldowns
}

// --- OpenTDB API ---

export interface OpenTDBResponse {
  response_code: number; // 0 = success, 5 = rate-limited
  results: OpenTDBQuestion[];
}

export interface OpenTDBQuestion {
  type: string;
  difficulty: string;
  category: string;
  question: string; // HTML entities — decode via DOMParser
  correct_answer: string;
  incorrect_answers: string[];
}

export interface DisplayQuestion {
  question: string;
  answers: string[]; // shuffled array of all 4 options
  correctAnswer: string;
}

// --- Alarm name constants ---

export const ALARM_EXPIRE_PREFIX = "block66-expire-";
export const ALARM_EMERGENCY_PREFIX = "block66-emergency-";
export const ALARM_PENALTY_PREFIX = "block66-penalty-";

// --- Time constants ---

export const BLOCK_DURATION_DAYS = 66;
export const BLOCK_DURATION_MS = BLOCK_DURATION_DAYS * 24 * 60 * 60 * 1000;
export const EMERGENCY_DURATION_MS = 60 * 60 * 1000; // 60 min
export const PENALTY_DURATION_MS = 5 * 60 * 1000; // 5 min
export const TRIVIA_QUESTION_COUNT = 5;

// --- Extension message types (website <-> extension bridge) ---

export type ExtensionMessage =
  | { type: "GET_DATA" }
  | { type: "ADD_SITE"; domain: string }
  | { type: "REMOVE_SITE"; domain: string }
  | { type: "GRANT_EMERGENCY"; domain: string }
  | { type: "APPLY_PENALTY"; domain: string }
  | { type: "RETRY_TRIVIA"; domain: string }
  | { type: "SET_TOKEN"; token: string }
  | { type: "SYNC" };

export type ExtensionResponse =
  | { ok: true; data: StorageData }
  | { ok: true }
  | { ok: false; error: string };
