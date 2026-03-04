import { BLOCK_DURATION_MS } from "./types";

/** Strip protocol, www., trailing slashes and paths — return bare hostname */
export function normalizeDomain(input: string): string {
  let s = input.trim().toLowerCase();
  // Remove protocol
  s = s.replace(/^https?:\/\//, "");
  // Remove www.
  s = s.replace(/^www\./, "");
  // Remove path, query, hash
  s = s.split("/")[0].split("?")[0].split("#")[0];
  return s;
}

/** Returns true if the string looks like a valid domain */
export function isValidDomain(domain: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(domain);
}

/** Days remaining on a 66-day block (0 if expired) */
export function daysRemaining(startTimestamp: number): number {
  const elapsed = Date.now() - startTimestamp;
  const remaining = BLOCK_DURATION_MS - elapsed;
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
}

/** Human-readable countdown string from ms remaining, e.g. "4m 32s" */
export function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "0s";
  const totalSeconds = Math.ceil(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Decode HTML entities in OpenTDB strings safely (no XSS risk) */
export function decodeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.documentElement.textContent ?? html;
}

/** Fisher-Yates shuffle — returns a new array */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** djb2 hash of a string, clamped to a positive non-zero 31-bit int */
export function domainToRuleId(domain: string): number {
  let hash = 5381;
  for (let i = 0; i < domain.length; i++) {
    hash = ((hash << 5) + hash) ^ domain.charCodeAt(i);
  }
  return (Math.abs(hash) % 2_000_000_000) + 1;
}
