import { SoapFaultDetails } from "ews-javascript-api";
import { z } from "zod";

import { symmetricEncrypt } from "@calcom/lib/crypto";
import { emailSchema } from "@calcom/lib/emailSchema";
import logger from "@calcom/lib/logger";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import prisma from "@calcom/prisma";

import checkSession from "../../_utils/auth";
import { ExchangeAuthentication, ExchangeVersion } from "../enums";
import { BuildCalendarService } from "../lib";

const formSchema = z
  .object({
    url: z.string().url(),
    username: emailSchema,
    password: z.string(),
    authenticationMethod: z.number().default(ExchangeAuthentication.STANDARD),
    exchangeVersion: z.number().default(ExchangeVersion.Exchange2016),
    useCompression: z.boolean().default(false),
  })
  .strict();

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export async function getHandler(req: any, res: any) {
  const session = checkSession(req);
  const body = formSchema.parse(req.body);
  const encrypted = symmetricEncrypt(JSON.stringify(body), process.env.CALENDSO_ENCRYPTION_KEY || "");
  const data = {
    type: "exchange_calendar",
    key: encrypted,
    userId: session.user?.id,
    teamId: null,
    appId: "exchange",
    invalid: false,
    delegationCredentialId: null,
  };

  try {
    const service = BuildCalendarService({ id: 0, user: { email: session.user.email || "" }, ...data, encryptedKey: null });
    await service?.listCalendars();
    await prisma.credential.create({ data });
  } catch (reason) {
    logger.info(reason);
    if (reason instanceof SoapFaultDetails && reason.message != "") {
      return res.status(500).json({ message: reason.message });
    }
    return res.status(500).json({ message: "Could not add this exchange account" });
  }

  return res.status(200).json({ url: "/apps/installed" });
}

export default defaultResponder(getHandler);
