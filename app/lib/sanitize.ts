// Input sanitization utilities

// Strip HTML tags and limit length
export function sanitizeText(input: string, maxLength = 1000): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML
    .replace(/javascript:/gi, "") // strip JS protocol
    .replace(/on\w+=/gi, "") // strip event handlers
    .trim()
    .slice(0, maxLength);
}

// Validate URL is safe to render/link
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    // Only allow http/https
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    // Block localhost and private IPs
    const hostname = parsed.hostname;
    if (
      hostname === "localhost" ||
      hostname.startsWith("127.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname === "0.0.0.0"
    ) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

// Validate image URL — only allow known image domains or direct image extensions
export function sanitizeImageUrl(url: string): string | null {
  const safe = sanitizeUrl(url);
  if (!safe) return null;
  try {
    const parsed = new URL(safe);
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const validHosts = [
      "i.imgur.com", "imgur.com",
      "images.unsplash.com",
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
    ];
    const hasValidExt = validExtensions.some(ext => parsed.pathname.toLowerCase().endsWith(ext));
    const hasValidHost = validHosts.some(host => parsed.hostname.endsWith(host));
    // Allow Supabase storage
    const isSupabase = parsed.hostname.endsWith(".supabase.co");
    if (hasValidExt || hasValidHost || isSupabase) return safe;
    return null;
  } catch {
    return null;
  }
}

// Validate GitHub URL
export function isValidGithubUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname === "github.com" || parsed.hostname === "www.github.com";
  } catch {
    return false;
  }
}

// Validate Devpost URL
export function isValidDevpostUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.endsWith("devpost.com");
  } catch {
    return false;
  }
}
