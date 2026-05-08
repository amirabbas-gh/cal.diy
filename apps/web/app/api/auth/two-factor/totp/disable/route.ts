import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";

// TODO: next/headers migration (R4f): `getCookie` / `getHeaders` / `setCookie` / `deleteCookie` / `getCookies` — TanStack Start server context only; `draftMode` / other `next/headers` usage — https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
import { getCookies, getHeaders } from "@tanstack/start/server";


// TODO: next/server migration (R4h): confirm `Request`/`Response` types match your runtime; port remaining `next/server` helpers — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes



import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { verifyPassword } from "@calcom/features/auth/lib/verifyPassword";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { symmetricDecrypt } from "@calcom/lib/crypto";
import { totpAuthenticatorCheck } from "@calcom/lib/totp";
import prisma from "@calcom/prisma";
import { IdentityProvider } from "@calcom/prisma/enums";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

async function handler(req: Request) {
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
    identifier: `api:totp-disable:${session.user.id}`,
  });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { password: true } });

  if (!user) {
    console.error(`Session references user that no longer exists.`);
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (!user.password?.hash && user.identityProvider === IdentityProvider.CAL) {
    return Response.json({ error: ErrorCode.UserMissingPassword }, { status: 400 });
  }

  if (!user.twoFactorEnabled) {
    return Response.json({ message: "Two factor disabled" });
  }

  if (user.password?.hash && user.identityProvider === IdentityProvider.CAL) {
    const isCorrectPassword = await verifyPassword(body.password, user.password.hash);
    if (!isCorrectPassword) {
      return Response.json({ error: ErrorCode.IncorrectPassword }, { status: 400 });
    }
  }

  // If user has 2FA and using backup code
  if (user.twoFactorEnabled && body.backupCode) {
    if (!process.env.CALENDSO_ENCRYPTION_KEY) {
      console.error("Missing encryption key; cannot proceed with backup code login.");
      throw new Error(ErrorCode.InternalServerError);
    }

    if (!user.backupCodes) {
      return Response.json({ error: ErrorCode.MissingBackupCodes }, { status: 400 });
    }

    const backupCodes = JSON.parse(symmetricDecrypt(user.backupCodes, process.env.CALENDSO_ENCRYPTION_KEY));

    // check if user-supplied code matches one
    const index = backupCodes.indexOf(body.backupCode.replaceAll("-", ""));
    if (index === -1) {
      return Response.json({ error: ErrorCode.IncorrectBackupCode }, { status: 400 });
    }

    // we delete all stored backup codes at the end, no need to do this here

    // if user has 2fa and NOT using backup code, try totp
  } else if (user.twoFactorEnabled) {
    if (!body.code) {
      return Response.json({ error: ErrorCode.SecondFactorRequired }, { status: 400 });
    }

    if (!user.twoFactorSecret) {
      console.error(`Two factor is enabled for user ${user.id} but they have no secret`);
      throw new Error(ErrorCode.InternalServerError);
    }

    if (!process.env.CALENDSO_ENCRYPTION_KEY) {
      console.error("Missing encryption key; cannot proceed with two factor login.");
      throw new Error(ErrorCode.InternalServerError);
    }

    const secret = symmetricDecrypt(user.twoFactorSecret, process.env.CALENDSO_ENCRYPTION_KEY);
    if (secret.length !== 32) {
      console.error(
        `Two factor secret decryption failed. Expected key with length 32 but got ${secret.length}`
      );
      throw new Error(ErrorCode.InternalServerError);
    }

    // If user has 2fa enabled, check if body.code is correct
    const isValidToken = totpAuthenticatorCheck(body.code, secret);
    if (!isValidToken) {
      return Response.json({ error: ErrorCode.IncorrectTwoFactorCode }, { status: 400 });
    }
  }

  // Disable 2FA
  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      backupCodes: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  return Response.json({ message: "Two factor disabled" });
}

export const POST = defaultResponderForAppDir(handler);
