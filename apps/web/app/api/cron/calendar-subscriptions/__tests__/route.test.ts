// TODO: Next.js pages/api route — convert the handler to TanStack Start server route handlers (Web Request/Response) — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes

import { describe, test, expect, vi, beforeEach } from "vitest";

import { CalendarSubscriptionService } from "@calcom/features/calendar-subscription/lib/CalendarSubscriptionService";

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




vi.mock("@calcom/features/calendar-subscription/lib/CalendarSubscriptionService");
vi.mock("@calcom/features/calendar-subscription/lib/cache/CalendarCacheEventService");
vi.mock("@calcom/features/calendar-subscription/lib/sync/CalendarSyncService");
vi.mock("@calcom/prisma", () => ({
  prisma: {},
}));

const mockCalendarSubscriptionService = vi.mocked(CalendarSubscriptionService);

describe("/api/cron/calendar-subscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv("CRON_API_KEY", "test-cron-key");
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
  });

  describe("Authentication", () => {
    test("should return 403 when no API key is provided", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions");

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.message).toBe("Forbiden");
    }, 10000);

    test("should return 403 when invalid API key is provided", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions");
      request.headers.set("authorization", "invalid-key");

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.message).toBe("Forbiden");
    });

    test("should accept valid API key", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions");
      request.headers.set("authorization", "test-cron-key");

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(true);
      const mockCheckForNewSubscriptions = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.checkForNewSubscriptions = mockCheckForNewSubscriptions;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
    });
  });

  describe("Feature flag checks", () => {
    test("should return early when cache AND sync are disabled", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions");
      request.headers.set("authorization", "test-cron-key");

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(false);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(false);
      const mockCheckForNewSubscriptions = vi.fn();

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.checkForNewSubscriptions = mockCheckForNewSubscriptions;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(mockCheckForNewSubscriptions).not.toHaveBeenCalled();
    });

    test("should proceed when both cache and sync are enabled", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions");
      request.headers.set("authorization", "test-cron-key");

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(true);
      const mockCheckForNewSubscriptions = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.checkForNewSubscriptions = mockCheckForNewSubscriptions;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(mockCheckForNewSubscriptions).toHaveBeenCalledOnce();
    });
  });

  describe("Subscription checking functionality", () => {
    test("should successfully check for new subscriptions", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions");
      request.headers.set("authorization", "test-cron-key");

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(true);
      const mockCheckForNewSubscriptions = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.checkForNewSubscriptions = mockCheckForNewSubscriptions;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(mockCheckForNewSubscriptions).toHaveBeenCalledOnce();
    });

    test("should handle subscription checking errors gracefully", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions");
      request.headers.set("authorization", "test-cron-key");

      const mockError = new Error("Subscription service unavailable");
      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(true);
      const mockCheckForNewSubscriptions = vi.fn().mockRejectedValue(mockError);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.checkForNewSubscriptions = mockCheckForNewSubscriptions;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Subscription service unavailable");
    });

    test("should handle non-Error exceptions", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions");
      request.headers.set("authorization", "test-cron-key");

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(true);
      const mockCheckForNewSubscriptions = vi.fn().mockRejectedValue("String error");

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.checkForNewSubscriptions = mockCheckForNewSubscriptions;

      const { GET } = await import("../route");
      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Unknown error");
    });
  });

  describe("Service instantiation", () => {
    test("should instantiate all services with correct dependencies", async () => {
      const request = new Request("http://localhost/api/cron/calendar-subscriptions");
      request.headers.set("authorization", "test-cron-key");

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(true);
      const mockCheckForNewSubscriptions = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.checkForNewSubscriptions = mockCheckForNewSubscriptions;

      const { GET } = await import("../route");
      await GET(request, { params: Promise.resolve({}) });

      expect(mockCalendarSubscriptionService).toHaveBeenCalledWith({
        adapterFactory: expect.any(Object),
        selectedCalendarRepository: expect.any(Object),
        featureRepository: expect.any(Object),
        teamFeatureRepository: expect.any(Object),
        userFeatureRepository: expect.any(Object),
        calendarSyncService: expect.any(Object),
        calendarCacheEventService: expect.any(Object),
      });
    });
  });
});
