import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";




import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { symmetricDecrypt } from "@calcom/lib/crypto";
import { totpAuthenticatorCheck } from "@calcom/lib/totp";
import prisma from "@calcom/prisma";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

async function postHandler(req: Request) {
  const body = await parseRequestData(req);
  const session = await getServerSession({ req: buildLegacyRequest(new Headers(Object.entries(getHeaders()).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")] as [string, string])), { getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value: String(value ?? "") })) }) });

  if (!session) {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (!session.user?.id) {
    console.error("Session is missing a user id.");
    return Response.json({ error: ErrorCode.InternalServerError }, { status: 500 });
  }

  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `api:totp-enable:${session.user.id}`,
  });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    console.error(`Session references user that no longer exists.`);
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (user.twoFactorEnabled) {
    return Response.json({ error: ErrorCode.TwoFactorAlreadyEnabled }, { status: 400 });
  }

  if (!user.twoFactorSecret) {
    return Response.json({ error: ErrorCode.TwoFactorSetupRequired }, { status: 400 });
  }

  if (!process.env.CALENDSO_ENCRYPTION_KEY) {
    console.error("Missing encryption key; cannot proceed with two factor setup.");
    return Response.json({ error: ErrorCode.InternalServerError }, { status: 500 });
  }

  const secret = symmetricDecrypt(user.twoFactorSecret, process.env.CALENDSO_ENCRYPTION_KEY);
  if (secret.length !== 32) {
    console.error(
      `Two factor secret decryption failed. Expected key with length 32 but got ${secret.length}`
    );
    return Response.json({ error: ErrorCode.InternalServerError }, { status: 500 });
  }

  const isValidToken = totpAuthenticatorCheck(body.code, secret);
  if (!isValidToken) {
    return Response.json({ error: ErrorCode.IncorrectTwoFactorCode }, { status: 400 });
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      twoFactorEnabled: true,
    },
  });

  return Response.json({ message: "Two-factor enabled" });
}

export const POST = defaultResponderForAppDir(postHandler);
