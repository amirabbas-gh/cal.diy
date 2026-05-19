import type { JSONObject } from "superjson/dist/types";

import prisma from "@calcom/prisma";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default async function handler(req: any, res: any) {
  if (req.method === "GET" && req.session && req.session.user.id) {
    const userId = req.session.user.id;
    try {
      const user = await prisma.user.findFirst({
        select: {
          metadata: true,
        },
        where: {
          id: userId,
        },
      });

      if (user && user.metadata && (user.metadata as JSONObject)?.vitalSettings) {
        res.status(200).json((user.metadata as JSONObject).vitalSettings);
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
}
