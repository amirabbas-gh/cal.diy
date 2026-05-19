import { ZodError } from "zod";

import prisma from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { vitalSettingsUpdateSchema } from "@calcom/prisma/zod-utils";

export type VitalSettingsResponse = {
  connected: boolean;
  sleepValue: number;
  selectedParam: string;
};

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
const handler = async (
  req: any,
  res: any
): Promise<VitalSettingsResponse | any | void> => {
  if (req.method === "PUT" && req.session && req.session.user.id) {
    const userId = req.session.user.id;
    const body = req.body;
    try {
      const userWithMetadata = await prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          metadata: true,
        },
      });
      const userMetadata = userWithMetadata?.metadata as Prisma.JsonObject;
      const vitalSettings =
        ((userWithMetadata?.metadata as Prisma.JsonObject)?.vitalSettings as Prisma.JsonObject) || {};
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          metadata: {
            ...userMetadata,
            vitalSettings: {
              ...vitalSettings,
              ...body,
            },
          },
        },
      });

      if (vitalSettings) {
        res.status(200).json(vitalSettings);
      } else {
        res.status(404);
      }
    } catch (error) {
      res.status(500);
    }
  } else {
    res.status(400);
  }
  res.end();
};

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
function validate(
  handler: (
    req: any,
    res: any
  ) => Promise<VitalSettingsResponse | any | void>
) {
  // TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
  return async (req: any, res: any) => {
    if (req.method === "POST" || req.method === "PUT") {
      try {
        vitalSettingsUpdateSchema.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError && error?.name === "ZodError") {
          return res.status(400).json(error?.issues);
        }
        return res.status(402);
      }
    } else {
      return res.status(405);
    }
    await handler(req, res);
  };
}

export default validate(handler);
