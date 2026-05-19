// TODO: Next.js pages/api route — convert the handler to TanStack Start server route handlers (Web Request/Response) — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
import type { MockResponse } from "@calcom/features/auth/signup/handlers/__tests__/mocks/next.mocks";
import {
  prismaMock,
  resetPrismaMock,
} from "@calcom/features/auth/signup/handlers/__tests__/mocks/prisma.mocks";
import type { SignupBody } from "@calcom/features/auth/signup/handlers/__tests__/mocks/signup.factories";
import {
  createMockFoundToken,
  createMockTeam,
} from "@calcom/features/auth/signup/handlers/__tests__/mocks/signup.factories";
import type { Mock } from "vitest";
import { vi } from "vitest";

const mockFindTokenByToken: Mock = vi.fn();
const mockValidateAndGetCorrectedUsernameForTeam: Mock = vi.fn();

type UsernameStatus = {
  statusCode: 200 | 402 | 418;
  requestedUserName: string;
  json: { available: boolean; premium: boolean };
};

type InnerHandler = (body: Record<string, string>, status: UsernameStatus) => Promise<MockResponse>;

var mockCapturedHandler: InnerHandler | null;


vi.mock("next/headers", async () => {
  const { createNextHeadersMock } = await import(
    "@calcom/features/auth/signup/handlers/__tests__/mocks/next.mocks"
  );
  return createNextHeadersMock();
});
vi.mock("@calcom/prisma", async () => {
  const { createPrismaMock } = await import(
    "@calcom/features/auth/signup/handlers/__tests__/mocks/prisma.mocks"
  );
  return createPrismaMock();
});
vi.mock("@calcom/prisma/client", async () => {
  const { createPrismaMock } = await import(
    "@calcom/features/auth/signup/handlers/__tests__/mocks/prisma.mocks"
  );
  return createPrismaMock();
});
vi.mock("@calcom/lib/logger", () => ({
  default: { getSubLogger: () => ({ warn: vi.fn(), error: vi.fn(), debug: vi.fn(), info: vi.fn() }) },
}));
vi.mock("@calcom/lib/auth/hashPassword", () => ({ hashPassword: vi.fn().mockResolvedValue("hashed") }));
vi.mock("@calcom/lib/constants", () => ({ WEBAPP_URL: "http://localhost:3000" }));
vi.mock("@calcom/lib/tracking", () => ({ getTrackingFromCookies: vi.fn().mockReturnValue({}) }));
vi.mock("@calcom/app-store/stripepayment/lib/utils", () => ({ getPremiumMonthlyPlanPriceId: vi.fn() }));
vi.mock("@calcom/features/auth/lib/getLocaleFromRequest", () => ({
  getLocaleFromRequest: vi.fn().mockResolvedValue("en"),
}));
vi.mock("@calcom/features/auth/lib/verifyEmail", () => ({ sendEmailVerification: vi.fn() }));
vi.mock("@calcom/features/auth/signup/utils/createOrUpdateMemberships", () => ({
  createOrUpdateMemberships: vi.fn(),
}));
vi.mock("@calcom/features/auth/signup/utils/prefillAvatar", () => ({ prefillAvatar: vi.fn() }));
vi.mock("@calcom/features/auth/signup/utils/validateUsername", () => ({
  validateAndGetCorrectedUsernameAndEmail: vi.fn().mockResolvedValue({ isValid: true, username: "testuser" }),
}));
vi.mock("@calcom/features/watchlist/lib/telemetry", () => ({ sentrySpan: {} }));
vi.mock("@calcom/features/watchlist/operations/check-if-email-in-watchlist.controller", () => ({
  checkIfEmailIsBlockedInWatchlistController: vi.fn().mockResolvedValue(false),
}));
vi.mock("@calcom/features/di/containers/FeatureRepository", () => ({
  getFeatureRepository: vi.fn().mockReturnValue({
    checkIfFeatureIsEnabledGlobally: vi.fn().mockResolvedValue(false),
  }),
}));
vi.mock("@calcom/features/watchlist/lib/repository/GlobalWatchlistRepository", () => {
  return {
    GlobalWatchlistRepository: class {
      findBlockedEmail = vi.fn().mockResolvedValue(null);
      createEntry = vi.fn().mockResolvedValue({});
    },
  };
});
vi.mock("@calcom/features/watchlist/lib/utils/normalization", () => ({
  normalizeEmail: vi.fn((e: string) => e.toLowerCase()),
}));
vi.mock("@calcom/web/lib/buildLegacyCtx", () => ({ buildLegacyRequest: vi.fn() }));
vi.mock("@calcom/features/auth/signup/utils/organization", () => ({ joinAnyChildTeamOnOrgInvite: vi.fn() }));
vi.mock("@calcom/features/auth/signup/utils/token", () => ({
  findTokenByToken: (...args: unknown[]) => mockFindTokenByToken(...args),
  throwIfTokenExpired: vi.fn(),
  validateAndGetCorrectedUsernameForTeam: (...args: unknown[]) =>
    mockValidateAndGetCorrectedUsernameForTeam(...args),
}));

// Capture inner handler from usernameHandler wrapper
vi.mock("@calcom/lib/server/username", () => ({
  usernameHandler: (handler: InnerHandler) => {
    mockCapturedHandler = handler;
    return handler;
  },
}));

// Import after mocks
import "./calcomSignupHandler";
import { runP2002TestSuite } from "@calcom/features/auth/signup/handlers/__tests__/p2002.test-suite";

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


function callHandler(body: SignupBody): Promise<MockResponse> {
  if (!mockCapturedHandler) throw new Error("Handler not captured");
  return mockCapturedHandler(body as unknown as Record<string, string>, {
    statusCode: 200,
    requestedUserName: body.username || "testuser",
    json: { available: true, premium: false },
  });
}

runP2002TestSuite("calcomHandler", callHandler, () => {
  vi.clearAllMocks();
  resetPrismaMock();
  mockFindTokenByToken.mockResolvedValue(createMockFoundToken());
  mockValidateAndGetCorrectedUsernameForTeam.mockResolvedValue("testuser");
  prismaMock.team.findUnique.mockResolvedValue(createMockTeam() as never);
  prismaMock.verificationToken.delete.mockResolvedValue({} as never);
});
