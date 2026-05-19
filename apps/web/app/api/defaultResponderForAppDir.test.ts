// TODO: Next.js pages/api route — convert the handler to TanStack Start server route handlers (Web Request/Response) — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
import type { Params } from "app/_types";

import { describe, expect, it, vi } from "vitest";

import { ErrorCode } from "@calcom/lib/errorCodes";

import { TRPCError } from "@trpc/server";

import { defaultResponderForAppDir } from "./defaultResponderForAppDir";

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




describe("defaultResponderForAppDir", () => {
  it("should return a JSON response when handler resolves with a result", async () => {
    const f = vi.fn().mockResolvedValue(Response.json({ success: true }));
    const req = { method: "GET", url: "/api/test" } as unknown as Request;
    const params = Promise.resolve<Params>({});

    const response = await defaultResponderForAppDir(f)(req, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true });
  });

  it("should return an empty JSON response when handler resolves with no result", async () => {
    const f = vi.fn().mockResolvedValue(null);
    const req = { method: "GET", url: "/api/test" } as unknown as Request;
    const params = Promise.resolve<Params>({});

    const response = await defaultResponderForAppDir(f)(req, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({});
  });

  it("should respond with status code 409 for NoAvailableUsersFound", async () => {
    const f = vi.fn().mockRejectedValue(new Error(ErrorCode.NoAvailableUsersFound));
    const req = { method: "GET", url: "/api/test" } as unknown as Request;
    const params = Promise.resolve<Params>({});

    const response = await defaultResponderForAppDir(f)(req, { params });
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json).toEqual({
      message: ErrorCode.NoAvailableUsersFound,
      url: undefined,
      method: undefined,
    });
  });

  it("should respond with a 429 status code for rate limit errors", async () => {
    const f = vi.fn().mockRejectedValue(new TRPCError({ code: "TOO_MANY_REQUESTS" }));
    const req = { method: "POST", url: "/api/test" } as unknown as Request;
    const params = Promise.resolve<Params>({});

    const response = await defaultResponderForAppDir(f)(req, { params });
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json).toEqual({
      message: "TOO_MANY_REQUESTS",
      url: undefined,
      method: undefined,
    });
  });
});
