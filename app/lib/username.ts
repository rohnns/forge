const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "callback",
  "hackathons",
  "match",
  "matches",
  "messages",
  "profile",
  "projects",
  "score",
  "settings",
  "u",
  "www",
]);

export function normalizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_][a-zA-Z0-9_-]{2,29}$/.test(username) && !isReservedUsername(username);
}

export function usernameFromName(name: string): string {
  return normalizeUsername(name);
}
