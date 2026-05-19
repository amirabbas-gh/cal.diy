// TODO: Next.js pages/api route — convert the handler to TanStack Start server route handlers (Web Request/Response) — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
import { confirmHandler } from "@calcom/trpc/server/routers/viewer/bookings/confirm.handler";

import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConfirmHandler = confirmHandler as unknown as Mock<typeof confirmHandler>;

vi.mock("app/api/defaultResponderForAppDir", () => ({
  defaultResponderForAppDir:
    (handler: (req: Request) => Promise<Response>) =>
    (req: Request, _context: { params: Promise<Record<string, string>> }) =>
      handler(req),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ getAll: () => [] }),
}));



vi.mock("@calcom/lib/crypto", () => ({
  symmetricDecrypt: vi.fn().mockReturnValue(
    JSON.stringify({
      bookingUid: "test-booking-uid",
      userId: 1,
    })
  ),
}));

vi.mock("@calcom/prisma", () => {
  const mockBookingFindUniqueOrThrow = vi.fn().mockResolvedValue({
    id: 1,
    uid: "test-booking-uid",
    recurringEventId: null,
  });
  const mockUserFindUniqueOrThrow = vi.fn().mockResolvedValue({
    id: 1,
    uuid: "user-uuid",
    email: "test@example.com",
    username: "testuser",
    role: "USER",
    destinationCalendar: null,
  });
  const mockPrismaObj = {
    booking: {
      findUniqueOrThrow: mockBookingFindUniqueOrThrow,
    },
    user: {
      findUniqueOrThrow: mockUserFindUniqueOrThrow,
    },
  };
  return {
    default: mockPrismaObj,
    prisma: mockPrismaObj,
  };
});

vi.mock("@calcom/trpc/server/routers/viewer/bookings/confirm.handler", () => ({
  confirmHandler: vi.fn(),
}));

vi.mock("@calcom/lib/tracing/factory", () => ({
  distributedTracing: {
    createTrace: vi.fn().mockReturnValue({}),
  },
}));

vi.mock("@calcom/features/booking-audit/lib/makeActor", () => ({
  makeUserActor: vi.fn().mockReturnValue({ type: "user", id: "test-uuid" }),
}));

import prisma from "@calcom/prisma";
// Import after mocks are set up
import { GET } from "../route";

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


const createMockRequest = (url: string): Request => {
  const urlObj = new URL(url);
  return {
    method: "GET",
    url,
    nextUrl: {
      searchParams: urlObj.searchParams,
    },
  } as unknown as Request;
};

// Vitest sets NEXT_PUBLIC_WEBAPP_URL to http://app.cal.local:3000 (see vitest.config.mts)
const EXPECTED_REDIRECT_ORIGIN = "http://app.cal.local:3000";

describe("link route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET handler - redirect URL construction", () => {
    it("should redirect to booking page using WEBAPP_URL (fixes localhost redirect when behind proxy)", async () => {
      const baseUrl = "https://app.example.com/api/link?action=accept&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      const res = await GET(req, { params: Promise.resolve({}) });
      const location = res.headers.get("location");

      expect(location).toBeTruthy();
      const redirectUrl = new URL(location!);

      expect(redirectUrl.origin).toBe(EXPECTED_REDIRECT_ORIGIN);
      expect(redirectUrl.pathname).toBe("/booking/test-booking-uid");
    });

    it("should use WEBAPP_URL for redirects, not request.url (avoids localhost when proxy sends localhost)", async () => {
      const baseUrl = "https://custom-domain.company.com/api/link?action=accept&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      const res = await GET(req, { params: Promise.resolve({}) });
      const location = res.headers.get("location");

      expect(location).toBeTruthy();
      const redirectUrl = new URL(location!);

      expect(redirectUrl.origin).toBe(EXPECTED_REDIRECT_ORIGIN);
      expect(location).not.toContain("localhost");
    });

    it("should use WEBAPP_URL for self-hosted deployments", async () => {
      const baseUrl = "https://calcom.internal.company.net/api/link?action=reject&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      const res = await GET(req, { params: Promise.resolve({}) });
      const location = res.headers.get("location");

      expect(location).toBeTruthy();
      const redirectUrl = new URL(location!);

      expect(redirectUrl.origin).toBe(EXPECTED_REDIRECT_ORIGIN);
      expect(redirectUrl.pathname).toBe("/booking/test-booking-uid");
    });

    it("should construct redirect URLs using WEBAPP_URL regardless of request origin", async () => {
      const testOrigins = [
        "https://app.cal.com",
        "https://acme.cal.com",
        "https://calcom.company.internal",
        "http://192.168.1.100:3000",
      ];

      for (const origin of testOrigins) {
        vi.clearAllMocks();
        const baseUrl = `${origin}/api/link?action=accept&token=encrypted-token`;
        const req = createMockRequest(baseUrl);

        const res = await GET(req, { params: Promise.resolve({}) });
        const location = res.headers.get("location");

        expect(location).toBeTruthy();
        const redirectUrl = new URL(location!);

        expect(redirectUrl.origin).toBe(EXPECTED_REDIRECT_ORIGIN);
        expect(redirectUrl.pathname).toBe("/booking/test-booking-uid");
      }
    });
  });

  describe("GET handler - error handling", () => {
    it("should redirect with error message when confirmHandler throws a TRPCError", async () => {
      const { TRPCError } = await import("@trpc/server");

      mockConfirmHandler.mockRejectedValueOnce(
        new TRPCError({ code: "BAD_REQUEST", message: "Custom error" })
      );

      const baseUrl = "https://app.example.com/api/link?action=accept&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      const res = await GET(req, { params: Promise.resolve({}) });
      const location = res.headers.get("location");

      expect(location).toBeTruthy();
      const redirectUrl = new URL(location!);

      expect(redirectUrl.origin).toBe(EXPECTED_REDIRECT_ORIGIN);
      expect(redirectUrl.pathname).toBe("/booking/test-booking-uid");
      expect(redirectUrl.searchParams.get("error")).toBe("Custom error");
    });

    it("should use WEBAPP_URL for error redirects (not localhost when behind proxy)", async () => {
      const { TRPCError } = await import("@trpc/server");

      mockConfirmHandler.mockRejectedValueOnce(new TRPCError({ code: "INTERNAL_SERVER_ERROR" }));

      const baseUrl = "https://self-hosted.company.org/api/link?action=accept&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      const res = await GET(req, { params: Promise.resolve({}) });
      const location = res.headers.get("location");

      expect(location).toBeTruthy();
      const redirectUrl = new URL(location!);

      expect(redirectUrl.origin).toBe(EXPECTED_REDIRECT_ORIGIN);
      expect(location).not.toContain("localhost");
    });
  });

  describe("confirmHandler flow", () => {
    it("should call confirmHandler with correct arguments for accept action", async () => {
      const baseUrl = "https://app.example.com/api/link?action=accept&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      await GET(req, { params: Promise.resolve({}) });

      expect(mockConfirmHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            bookingId: 1,
            confirmed: true,
            emailsEnabled: true,
          }),
        })
      );
    });

    it("should call confirmHandler with confirmed=false for reject action", async () => {
      const baseUrl = "https://app.example.com/api/link?action=reject&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      await GET(req, { params: Promise.resolve({}) });

      expect(mockConfirmHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            bookingId: 1,
            confirmed: false,
            emailsEnabled: true,
          }),
        })
      );
    });

    it("should call confirmHandler with reason when provided in query params", async () => {
      const baseUrl =
        "https://app.example.com/api/link?action=reject&token=encrypted-token&reason=test-reason";
      const req = createMockRequest(baseUrl);

      await GET(req, { params: Promise.resolve({}) });

      expect(mockConfirmHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            bookingId: 1,
            confirmed: false,
            reason: "test-reason",
            emailsEnabled: true,
          }),
        })
      );
    });

    it("should pass recurringEventId when booking has one", async () => {
      // Update mock to return booking with recurringEventId
      vi.mocked(prisma.booking.findUniqueOrThrow).mockResolvedValueOnce({
        id: 1,
        uid: "test-booking-uid",
        recurringEventId: "recurring-123",
      } as Awaited<ReturnType<typeof prisma.booking.findUniqueOrThrow>>);

      const baseUrl = "https://app.example.com/api/link?action=accept&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      await GET(req, { params: Promise.resolve({}) });

      expect(mockConfirmHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            bookingId: 1,
            recurringEventId: "recurring-123",
            confirmed: true,
          }),
        })
      );
    });

    it("should pass user context to confirmHandler", async () => {
      const baseUrl = "https://app.example.com/api/link?action=accept&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      await GET(req, { params: Promise.resolve({}) });

      expect(mockConfirmHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          ctx: expect.objectContaining({
            user: expect.objectContaining({
              id: 1,
              uuid: "user-uuid",
              email: "test@example.com",
              username: "testuser",
              role: "USER",
            }),
          }),
        })
      );
    });

    it("should pass user context to confirmHandler input", async () => {
      const baseUrl = "https://app.example.com/api/link?action=accept&token=encrypted-token";
      const req = createMockRequest(baseUrl);

      await GET(req, { params: Promise.resolve({}) });

      // After EE removal, actor/actionSource are no longer passed to confirmHandler
      expect(mockConfirmHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            bookingId: 1,
            confirmed: true,
          }),
        })
      );
    });
  });
});
