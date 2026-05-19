// TODO: Next.js pages/api route — convert the handler to TanStack Start server route handlers (Web Request/Response) — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
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

describe("/api/webhooks/calendar-subscription/[provider]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("Provider validation", () => {
    test("should accept google_calendar provider", async () => {
      const request = new Request("http://localhost/api/webhooks/calendar-subscription/google_calendar", {
        method: "POST",
      });

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(false);
      const mockProcessWebhook = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.processWebhook = mockProcessWebhook;

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "google_calendar" }),
      });

      expect(response.status).toBe(200);
      expect(mockProcessWebhook).toHaveBeenCalledWith("google_calendar", request);
    }, 10000);

    test("should accept office365_calendar provider", async () => {
      const request = new Request(
        "http://localhost/api/webhooks/calendar-subscription/office365_calendar",
        {
          method: "POST",
        }
      );

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(false);
      const mockProcessWebhook = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.processWebhook = mockProcessWebhook;

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "office365_calendar" }),
      });

      expect(response.status).toBe(200);
      expect(mockProcessWebhook).toHaveBeenCalledWith("office365_calendar", request);
    });

    test("should reject unsupported provider", async () => {
      const request = new Request(
        "http://localhost/api/webhooks/calendar-subscription/unsupported_calendar",
        {
          method: "POST",
        }
      );

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "unsupported_calendar" }),
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Unsupported provider");
    });
  });

  describe("Feature flag handling", () => {
    test("should return 200 when neither cache nor sync is enabled", async () => {
      const request = new Request("http://localhost/api/webhooks/calendar-subscription/google_calendar", {
        method: "POST",
      });

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(false);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(false);
      const mockProcessWebhook = vi.fn();

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.processWebhook = mockProcessWebhook;

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "google_calendar" }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("No cache or sync enabled");
      expect(mockProcessWebhook).not.toHaveBeenCalled();
    });

    test("should process webhook when cache is enabled", async () => {
      const request = new Request("http://localhost/api/webhooks/calendar-subscription/google_calendar", {
        method: "POST",
      });

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(false);
      const mockProcessWebhook = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.processWebhook = mockProcessWebhook;

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "google_calendar" }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("Webhook processed");
      expect(mockProcessWebhook).toHaveBeenCalledWith("google_calendar", request);
    });

    test("should process webhook when sync is enabled", async () => {
      const request = new Request("http://localhost/api/webhooks/calendar-subscription/google_calendar", {
        method: "POST",
      });

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(false);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(true);
      const mockProcessWebhook = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.processWebhook = mockProcessWebhook;

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "google_calendar" }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("Webhook processed");
      expect(mockProcessWebhook).toHaveBeenCalledWith("google_calendar", request);
    });

    test("should process webhook when both cache and sync are enabled", async () => {
      const request = new Request("http://localhost/api/webhooks/calendar-subscription/google_calendar", {
        method: "POST",
      });

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(true);
      const mockProcessWebhook = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.processWebhook = mockProcessWebhook;

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "google_calendar" }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("Webhook processed");
      expect(mockProcessWebhook).toHaveBeenCalledWith("google_calendar", request);
    });
  });

  describe("Error handling", () => {
    test("should handle webhook processing errors gracefully", async () => {
      const request = new Request("http://localhost/api/webhooks/calendar-subscription/google_calendar", {
        method: "POST",
      });

      const mockError = new Error("Webhook validation failed");
      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(false);
      const mockProcessWebhook = vi.fn().mockRejectedValue(mockError);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.processWebhook = mockProcessWebhook;

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "google_calendar" }),
      });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Webhook validation failed");
    });

    test("should handle non-Error exceptions", async () => {
      const request = new Request("http://localhost/api/webhooks/calendar-subscription/google_calendar", {
        method: "POST",
      });

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(false);
      const mockProcessWebhook = vi.fn().mockRejectedValue("String error");

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.processWebhook = mockProcessWebhook;

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "google_calendar" }),
      });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Unknown error");
    });

    test("should handle feature flag check errors", async () => {
      const request = new Request("http://localhost/api/webhooks/calendar-subscription/google_calendar", {
        method: "POST",
      });

      const mockError = new Error("Feature flag service unavailable");
      const mockIsCacheEnabled = vi.fn().mockRejectedValue(mockError);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(false);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;

      const { POST } = await import("../../[provider]/route");
      const response = await POST(request, {
        params: Promise.resolve({ provider: "google_calendar" }),
      });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe("Feature flag service unavailable");
    });
  });

  describe("Service instantiation", () => {
    test("should instantiate all services with correct dependencies", async () => {
      const request = new Request("http://localhost/api/webhooks/calendar-subscription/google_calendar", {
        method: "POST",
      });

      const mockIsCacheEnabled = vi.fn().mockResolvedValue(true);
      const mockIsSyncEnabled = vi.fn().mockResolvedValue(false);
      const mockProcessWebhook = vi.fn().mockResolvedValue(undefined);

      mockCalendarSubscriptionService.prototype.isCacheEnabled = mockIsCacheEnabled;
      mockCalendarSubscriptionService.prototype.isSyncEnabled = mockIsSyncEnabled;
      mockCalendarSubscriptionService.prototype.processWebhook = mockProcessWebhook;

      const { POST } = await import("../../[provider]/route");
      await POST(request, {
        params: Promise.resolve({ provider: "google_calendar" }),
      });

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
