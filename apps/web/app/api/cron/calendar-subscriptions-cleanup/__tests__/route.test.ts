// TODO: Next.js pages/api route — convert the handler to TanStack Start server route handlers (Web Request/Response) — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes

import { describe, test, expect, vi, beforeEach } from "vitest";

import { CalendarCacheEventService } from "@calcom/features/calendar-subscription/lib/cache/CalendarCacheEventService";

type NextResponseInit = ResponseInit & { request?: { headers?: Headers } };

function __nextResponseJson(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  return new Response(JSON.stringify(body), { ...init, headers });
}

const NextResponse = Object.assign(
  function NextResponse(body?: BodyInit | null, init?: ResponseInit): Response {
    return new Response(body, init);
  },
  {
    json: __nextResponseJson,
    next: (init?: NextResponseInit) =>
      new Response(null, {
        status: 200,
        ...init,
        headers: {
          "x-middleware-next": "1",
          ...Object.fromEntries(new Headers(init?.headers)),
        },
      }),
    rewrite: (url: URL | string, init?: ResponseInit) => {
      const rewriteUrl = typeof url === "string" ? new URL(url, "http://localhost") : url;
      return new Response(null, {
        status: 200,
        ...init,
        headers: {
          "x-middleware-rewrite": rewriteUrl.toString(),
          ...Object.fromEntries(new Headers(init?.headers)),
        },
      });
    },
    redirect: (url: URL | string, statusOrInit?: number | ResponseInit) => {
      const redirectUrl = typeof url === "string" ? new URL(url, "http://localhost") : url;
      const status =
        typeof statusOrInit === "number"
          ? statusOrInit
          : (typeof statusOrInit === "object" && statusOrInit && "status" in statusOrInit
              ? (statusOrInit as ResponseInit).status
              : undefined) ?? 307;
      const baseInit =
        typeof statusOrInit === "object" && statusOrInit !== null && typeof statusOrInit !== "number"
          ? statusOrInit
          : {};
      const headers = new Headers((baseInit as ResponseInit).headers);
      headers.set("location", redirectUrl.toString());
      return new Response(null, { ...baseInit, status, headers });
    },
  },
);

class NextRequest extends Request {
  private readonly __cookieMap = new Map<string, string>();
  get nextUrl(): URL {
    return new URL(this.url);
  }
  cookies = {
    get: (name: string) => {
      const value = this.__cookieMap.get(name);
      return value !== undefined ? { name, value } : undefined;
    },
    set: (name: string, value: string) => {
      this.__cookieMap.set(name, value);
    },
  };
}




vi.mock("@calcom/features/calendar-subscription/lib/cache/CalendarCacheEventService");
vi.mock("@calcom/features/calendar-subscription/lib/cache/CalendarCacheEventRepository");
vi.mock("@calcom/lib/logger", () => ({
  default: {
    getSubLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
    })),
  },
}));
vi.mock("@calcom/lib/server/perfObserver", () => ({
  performance: {
    mark: vi.fn(),
    measure: vi.fn(),
  },
}));
vi.mock("@sentry/nextjs", () => ({
  wrapApiHandlerWithSentry: vi.fn((handler) => handler),
  captureException: vi.fn(),
}));
vi.mock("@calcom/lib/server/getServerErrorFromUnknown", () => ({
  getServerErrorFromUnknown: vi.fn((error) => ({
    message: error instanceof Error ? error.message : "Unknown error",
    statusCode: 500,
    url: "test-url",
    method: "GET",
  })),
}));
vi.mock("../../defaultResponderForAppDir", () => ({
  defaultResponderForAppDir: vi.fn((handler) => handler),
}));
vi.mock("@calcom/prisma", () => ({
  prisma: {},
}));

const mockCalendarCacheEventService = vi.mocked(CalendarCacheEventService);

describe("/api/cron/calendar-subscriptions-cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CRON_API_KEY", "test-cron-key");
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
  });

  describe("Authentication", () => {
    test("should return 403 when no API key is provided", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions-cleanup");

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.message).toBe("Forbidden");
    });

    test("should return 403 when invalid API key is provided", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions-cleanup");
      request.headers.set("authorization", "invalid-key");

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.message).toBe("Forbidden");
    });

    test("should accept CRON_API_KEY in authorization header", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions-cleanup");
      request.headers.set("authorization", "test-cron-key");

      const mockCleanupStaleCache = vi.fn().mockResolvedValue(undefined);
      mockCalendarCacheEventService.prototype.cleanupStaleCache = mockCleanupStaleCache;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      expect(mockCleanupStaleCache).toHaveBeenCalled();
    });

    test("should accept CRON_SECRET as Bearer token", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions-cleanup");
      request.headers.set("authorization", "Bearer test-cron-secret");

      const mockCleanupStaleCache = vi.fn().mockResolvedValue(undefined);
      mockCalendarCacheEventService.prototype.cleanupStaleCache = mockCleanupStaleCache;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      expect(mockCleanupStaleCache).toHaveBeenCalled();
    });

    test("should accept API key as query parameter", async () => {
      const request = new Request(
        "http://localhost/api/cron/calendar-subscriptions-cleanup?apiKey=test-cron-key"
      );

      const mockCleanupStaleCache = vi.fn().mockResolvedValue(undefined);
      mockCalendarCacheEventService.prototype.cleanupStaleCache = mockCleanupStaleCache;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      expect(mockCleanupStaleCache).toHaveBeenCalled();
    });
  });

  describe("Cleanup functionality", () => {
    test("should successfully cleanup stale cache", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions-cleanup");
      request.headers.set("authorization", "test-cron-key");

      const mockCleanupStaleCache = vi.fn().mockResolvedValue(undefined);
      mockCalendarCacheEventService.prototype.cleanupStaleCache = mockCleanupStaleCache;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(mockCleanupStaleCache).toHaveBeenCalledOnce();
    });

    test("should handle cleanup errors gracefully", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions-cleanup");
      request.headers.set("authorization", "test-cron-key");

      const mockError = new Error("Database connection failed");
      const mockCleanupStaleCache = vi.fn().mockRejectedValue(mockError);
      mockCalendarCacheEventService.prototype.cleanupStaleCache = mockCleanupStaleCache;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Database connection failed");
    });

    test("should handle non-Error exceptions", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions-cleanup");
      request.headers.set("authorization", "test-cron-key");

      const mockCleanupStaleCache = vi.fn().mockRejectedValue("String error");
      mockCalendarCacheEventService.prototype.cleanupStaleCache = mockCleanupStaleCache;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Unknown error");
    });
  });

  describe("Service instantiation", () => {
    test("should instantiate CalendarCacheEventService with correct dependencies", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions-cleanup");
      request.headers.set("authorization", "test-cron-key");

      const mockCleanupStaleCache = vi.fn().mockResolvedValue(undefined);
      mockCalendarCacheEventService.prototype.cleanupStaleCache = mockCleanupStaleCache;

      const { GET } = await import("../route");
      await GET(request, { params: Promise.resolve({}) });

      expect(mockCalendarCacheEventService).toHaveBeenCalledWith({
        calendarCacheEventRepository: expect.any(Object),
      });
    });
  });
});
