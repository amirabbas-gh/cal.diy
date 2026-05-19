// TODO: Next.js pages/api route — convert the handler to TanStack Start server route handlers (Web Request/Response) — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
import prismaMock from "@calcom/testing/lib/__mocks__/prismaMock";

import jwt from "jsonwebtoken";
// Import mocked dependencies after mocks are set up

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { generateSecret } from "@calcom/features/oauth/utils/generateSecret";
import { verifyCodeChallenge } from "@calcom/lib/pkce";

import { POST } from "../route";

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


// Create mock NextResponse.json function using hoisted
const mockNextResponseJson = vi.hoisted(() => {
  return vi.fn((data: unknown, options?: { status?: number; headers?: Record<string, string> }) => ({
    json: vi.fn().mockResolvedValue(data),
    status: options?.status || 200,
    headers: new Headers(options?.headers || {}),
  }));
});

// Mock next/server before importing anything that uses it


// Mock dependencies
vi.mock("@calcom/lib/pkce", () => ({
  verifyCodeChallenge: vi.fn(),
}));

vi.mock("@calcom/features/oauth/utils/generateSecret", () => ({
  generateSecret: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mock_jwt_token"),
  },
}));

vi.mock("@calcom/prisma", () => ({
  default: prismaMock,
}));

vi.mock("app/api/defaultResponderForAppDir", async () => {
  const { NextResponse } = await import("next/server");
  return {
    defaultResponderForAppDir:
      (
        handler: (req: Request, context: { params: Promise<Record<string, string>> }) => Promise<Response>
      ) =>
      async (req: Request, context?: { params: Promise<Record<string, string>> }) => {
        try {
          const result = await handler(req, context || { params: Promise.resolve({}) });
          if (result) {
            return result;
          }
          return Response.json({});
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Internal server error";
          return Response.json(
            {
              message: errorMessage,
            },
            { status: 500 }
          );
        }
      },
  };
});

vi.mock("app/api/parseRequestData", () => ({
  parseUrlFormData: async (req: Request): Promise<Record<string, string>> => {
    const text = await req.text();
    const params = new URLSearchParams(text);
    return Object.fromEntries(params);
  },
}));

const mockVerifyCodeChallenge = vi.mocked(verifyCodeChallenge);
const mockGenerateSecret = vi.mocked(generateSecret);
const mockJwt = vi.mocked(jwt);

// Set up environment
vi.stubEnv("CALENDSO_ENCRYPTION_KEY", "test_encryption_key");

// Helper to create token exchange request
function createTokenRequest(data: Record<string, string>) {
  const formData = new URLSearchParams(data);
  const request = new Request("http://localhost:3000/api/auth/oauth/token", {
    method: "POST",
    body: formData.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return request;
}

describe("POST /api/auth/oauth/token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJwt.sign.mockReturnValue("mock_jwt_token" as never);
    mockVerifyCodeChallenge.mockReturnValue(false);
    mockGenerateSecret.mockReturnValue(["hashed_secret", "plain_secret"]);
    // Reset the mock for NextResponse.json
    mockNextResponseJson.mockImplementation(
      (data: unknown, options?: { status?: number; headers?: Record<string, string> }) => ({
        json: vi.fn().mockResolvedValue(data),
        status: options?.status || 200,
        headers: new Headers(options?.headers || {}),
      })
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("PUBLIC clients", () => {
    const mockPublicClient = {
      redirectUri: "https://app.example.com/callback",
      clientSecret: null,
      clientType: "PUBLIC" as const,
      status: "APPROVED" as const,
    } as const;

    const mockAccessCode = {
      userId: 1,
      teamId: null,
      scopes: [] as const,
      codeChallenge: "test_challenge",
      codeChallengeMethod: "S256",
    } as const;

    it("should exchange authorization code for tokens with valid PKCE", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue(
        mockPublicClient as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>
      );
      prismaMock.accessCode.findFirst.mockResolvedValue(
        mockAccessCode as unknown as Awaited<ReturnType<typeof prismaMock.accessCode.findFirst>>
      );
      prismaMock.accessCode.deleteMany.mockResolvedValue({ count: 1 });
      mockVerifyCodeChallenge.mockReturnValue(true);

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "public_client_123",
        redirect_uri: "https://app.example.com/callback",
        code_verifier: "test_verifier",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        access_token: "mock_jwt_token",
        token_type: "bearer",
        refresh_token: "mock_jwt_token",
        expires_in: 1800,
      });

      expect(mockVerifyCodeChallenge).toHaveBeenCalledWith("test_verifier", "test_challenge", "S256");
      expect(prismaMock.accessCode.deleteMany).toHaveBeenCalled();
    });

    it("should reject PUBLIC client without code_verifier", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue(
        mockPublicClient as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>
      );
      prismaMock.accessCode.findFirst.mockResolvedValue(
        mockAccessCode as unknown as Awaited<ReturnType<typeof prismaMock.accessCode.findFirst>>
      );

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "public_client_123",
        redirect_uri: "https://app.example.com/callback",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("invalid_request");
    });

    it("should reject PUBLIC client with missing code challenge in access code", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue(
        mockPublicClient as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>
      );
      prismaMock.accessCode.findFirst.mockResolvedValue({
        ...mockAccessCode,
        codeChallenge: null,
      } as unknown as Awaited<ReturnType<typeof prismaMock.accessCode.findFirst>>);
      prismaMock.accessCode.deleteMany.mockResolvedValue({ count: 1 });

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "public_client_123",
        redirect_uri: "https://app.example.com/callback",
        code_verifier: "test_verifier",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("invalid_request");
    });

    it("should reject PUBLIC client with invalid code_verifier", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue(
        mockPublicClient as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>
      );
      prismaMock.accessCode.findFirst.mockResolvedValue(
        mockAccessCode as unknown as Awaited<ReturnType<typeof prismaMock.accessCode.findFirst>>
      );
      prismaMock.accessCode.deleteMany.mockResolvedValue({ count: 1 });
      mockVerifyCodeChallenge.mockReturnValue(false);

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "public_client_123",
        redirect_uri: "https://app.example.com/callback",
        code_verifier: "wrong_verifier",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("invalid_grant");
      expect(mockVerifyCodeChallenge).toHaveBeenCalledWith("wrong_verifier", "test_challenge", "S256");
    });
  });

  describe("CONFIDENTIAL clients", () => {
    const mockConfidentialClient = {
      redirectUri: "https://app.example.com/callback",
      clientSecret: "hashed_secret",
      clientType: "CONFIDENTIAL" as const,
      status: "APPROVED" as const,
    } as const;

    const mockAccessCode = {
      userId: 1,
      teamId: null,
      scopes: [] as const,
      codeChallenge: null,
      codeChallengeMethod: null,
    } as const;

    it("should exchange authorization code for tokens with valid client secret", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue(
        mockConfidentialClient as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>
      );
      prismaMock.accessCode.findFirst.mockResolvedValue(
        mockAccessCode as unknown as Awaited<ReturnType<typeof prismaMock.accessCode.findFirst>>
      );
      prismaMock.accessCode.deleteMany.mockResolvedValue({ count: 1 });
      mockGenerateSecret.mockReturnValue(["hashed_secret", "plain_secret"]);

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "confidential_client_456",
        client_secret: "plain_secret",
        redirect_uri: "https://app.example.com/callback",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        access_token: "mock_jwt_token",
        token_type: "bearer",
        refresh_token: "mock_jwt_token",
        expires_in: 1800,
      });

      expect(mockGenerateSecret).toHaveBeenCalledWith("plain_secret");
      expect(prismaMock.accessCode.deleteMany).toHaveBeenCalled();
    });

    it("should reject CONFIDENTIAL client without client_secret", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue(
        mockConfidentialClient as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>
      );

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "confidential_client_456",
        redirect_uri: "https://app.example.com/callback",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("invalid_client");
    });

    it("should reject CONFIDENTIAL client with invalid client_secret", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue(
        mockConfidentialClient as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>
      );
      mockGenerateSecret.mockReturnValue(["different_hashed_secret", "wrong_secret"]);

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "confidential_client_456",
        client_secret: "wrong_secret",
        redirect_uri: "https://app.example.com/callback",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("invalid_client");
    });

    it("should accept CONFIDENTIAL client with code_verifier for enhanced security", async () => {
      const mockAccessCodeWithPKCE = {
        userId: 1,
        teamId: null,
        scopes: [] as const,
        codeChallenge: "test_challenge",
        codeChallengeMethod: "S256",
      } as const;

      prismaMock.oAuthClient.findUnique.mockResolvedValue(
        mockConfidentialClient as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>
      );
      prismaMock.accessCode.findFirst.mockResolvedValue(
        mockAccessCodeWithPKCE as unknown as Awaited<ReturnType<typeof prismaMock.accessCode.findFirst>>
      );
      prismaMock.accessCode.deleteMany.mockResolvedValue({ count: 1 });
      mockGenerateSecret.mockReturnValue(["hashed_secret", "plain_secret"]);
      mockVerifyCodeChallenge.mockReturnValue(true);

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "confidential_client_456",
        client_secret: "plain_secret",
        redirect_uri: "https://app.example.com/callback",
        code_verifier: "test_verifier",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        access_token: "mock_jwt_token",
        token_type: "bearer",
        refresh_token: "mock_jwt_token",
        expires_in: 1800,
      });

      expect(mockGenerateSecret).toHaveBeenCalledWith("plain_secret");
      expect(mockVerifyCodeChallenge).toHaveBeenCalledWith("test_verifier", "test_challenge", "S256");
    });

    it("should reject CONFIDENTIAL client with invalid code_verifier", async () => {
      const mockAccessCodeWithPKCE = {
        userId: 1,
        teamId: null,
        scopes: [] as const,
        codeChallenge: "test_challenge",
        codeChallengeMethod: "S256",
      } as const;

      prismaMock.oAuthClient.findUnique.mockResolvedValue(
        mockConfidentialClient as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>
      );
      prismaMock.accessCode.findFirst.mockResolvedValue(
        mockAccessCodeWithPKCE as unknown as Awaited<ReturnType<typeof prismaMock.accessCode.findFirst>>
      );
      prismaMock.accessCode.deleteMany.mockResolvedValue({ count: 1 });
      mockGenerateSecret.mockReturnValue(["hashed_secret", "plain_secret"]);
      mockVerifyCodeChallenge.mockReturnValue(false);

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "confidential_client_456",
        client_secret: "plain_secret",
        redirect_uri: "https://app.example.com/callback",
        code_verifier: "wrong_verifier",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("invalid_grant");
      expect(mockVerifyCodeChallenge).toHaveBeenCalledWith("wrong_verifier", "test_challenge", "S256");
    });
  });

  describe("General validation", () => {
    it("should reject invalid grant_type", async () => {
      const tokenRequest = createTokenRequest({
        grant_type: "implicit",
        code: "test_auth_code",
        client_id: "test_client",
        redirect_uri: "https://app.example.com/callback",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("invalid_request");
    });

    it("should reject invalid client_id", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue(null);

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "invalid_client",
        redirect_uri: "https://app.example.com/callback",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("invalid_client");
    });

    it("should reject mismatched redirect_uri", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue({
        redirectUri: "https://app.example.com/callback",
        clientSecret: null,
        clientType: "PUBLIC" as const,
        status: "APPROVED" as const,
      } as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>);

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "test_auth_code",
        client_id: "test_client",
        redirect_uri: "https://malicious.com/callback",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("invalid_grant");
    });

    it("should reject expired authorization code", async () => {
      prismaMock.oAuthClient.findUnique.mockResolvedValue({
        redirectUri: "https://app.example.com/callback",
        clientSecret: null,
        clientType: "PUBLIC" as const,
        status: "APPROVED" as const,
      } as Awaited<ReturnType<typeof prismaMock.oAuthClient.findUnique>>);
      prismaMock.accessCode.findFirst.mockResolvedValue(null);

      const tokenRequest = createTokenRequest({
        grant_type: "authorization_code",
        code: "expired_auth_code",
        client_id: "test_client",
        redirect_uri: "https://app.example.com/callback",
        code_verifier: "test_verifier",
      });

      const response = await POST(tokenRequest, { params: Promise.resolve({}) });
      expect(response).toBeDefined();
      if (!response) throw new Error("Response is undefined");
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("invalid_grant");
    });
  });
});
