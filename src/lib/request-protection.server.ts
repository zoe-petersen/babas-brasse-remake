import { getRequestHeaders } from "@tanstack/react-start/server";

function firstForwardedAddress(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

/**
 * Produces a privacy-preserving, deployment-portable client key for database
 * rate limits. Cloudflare and Netlify headers are preferred over the generic
 * forwarded header.
 */
export async function publicRequestKey() {
  const headers = getRequestHeaders();
  const address =
    headers.get("cf-connecting-ip") ??
    headers.get("x-nf-client-connection-ip") ??
    headers.get("true-client-ip") ??
    headers.get("x-real-ip") ??
    firstForwardedAddress(headers.get("x-forwarded-for")) ??
    "unknown";
  const userAgent = headers.get("user-agent")?.slice(0, 300) ?? "unknown";
  const language = headers.get("accept-language")?.slice(0, 100) ?? "unknown";
  const input = new TextEncoder().encode(`${address}\n${userAgent}\n${language}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
