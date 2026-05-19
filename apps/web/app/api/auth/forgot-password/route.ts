import { passwordResetRequest } from "@calcom/features/auth/lib/passwordResetRequest";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { emailSchema } from "@calcom/lib/emailSchema";
import getIP from "@calcom/lib/getIP";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import prisma from "@calcom/prisma";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";

async function handler(req: Request) {
  const body = await parseRequestData(req);
  const email = emailSchema.transform((val) => val.toLowerCase()).safeParse(body?.email);

  if (!email.success) {
    return Response.json({ message: "email is required" }, { status: 400 });
  }

  const ip = getIP(req) ?? email.data;

  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `forgotPassword:${piiHasher.hash(ip)}`,
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.data },
      select: { name: true, email: true, locale: true },
    });
    // Don't leak info about whether the user exists
    if (user) passwordResetRequest(user).catch(console.error);
    return Response.json({ message: "password_reset_email_sent" }, { status: 201 });
  } catch (reason) {
    console.error(reason);
    return Response.json({ message: "Unable to create password reset request" }, { status: 500 });
  }
}

export const POST = defaultResponderForAppDir(handler);
