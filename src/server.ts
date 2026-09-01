import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type ExecutionContextLike = {
  waitUntil?: (promise: Promise<unknown>) => void;
};

type CloudflareCacheStorage = CacheStorage & { default?: Cache };

const PUBLIC_PAGE_CACHE_SECONDS = 60;

function isPublicPageRequest(request: Request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (url.search) return false;
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/api") ||
    url.pathname === "/sitemap.xml"
  ) {
    return false;
  }
  if (request.headers.has("authorization") || request.headers.has("cookie")) return false;
  return request.headers.get("accept")?.includes("text/html") ?? false;
}

function defaultEdgeCache() {
  return (globalThis.caches as CloudflareCacheStorage | undefined)?.default;
}

function withPublicPageCacheHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set(
    "Cache-Control",
    `public, max-age=${PUBLIC_PAGE_CACHE_SECONDS}, stale-while-revalidate=300`,
  );
  headers.set(
    "CDN-Cache-Control",
    `public, max-age=${PUBLIC_PAGE_CACHE_SECONDS}, stale-while-revalidate=300`,
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const cacheable = isPublicPageRequest(request);
      const edgeCache = cacheable ? defaultEdgeCache() : undefined;
      if (edgeCache) {
        const cached = await edgeCache.match(request);
        if (cached) return cached;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      const isCacheableResponse =
        cacheable &&
        normalized.ok &&
        normalized.headers.get("content-type")?.includes("text/html") &&
        !normalized.headers.has("set-cookie");
      if (!isCacheableResponse) return normalized;

      const cachedResponse = withPublicPageCacheHeaders(normalized);
      if (edgeCache) {
        const put = edgeCache.put(request, cachedResponse.clone());
        const executionContext = ctx as ExecutionContextLike;
        if (executionContext.waitUntil) executionContext.waitUntil(put);
        else await put;
      }
      return cachedResponse;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
