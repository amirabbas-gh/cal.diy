import { X_CAL_CLIENT_ID, X_CAL_SECRET_KEY } from "@calcom/platform-constants";
import prisma from "../../lib/prismaClient";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/oauth2-user")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const body = typeof body === "string" ? JSON.parse(body) : body;
          const { email, authorizationCode } = body;

          const existingUser = await prisma.user.findFirst({
            orderBy: { createdAt: "desc" },
            select: {
              calcomUserId: true,
              email: true,
              calcomUsername: true,
              accessToken: true,
            },
          });
          if (existingUser && existingUser.calcomUserId) {
            return Response.json({
              id: existingUser.calcomUserId,
              email: existingUser.email,
              username: existingUser.calcomUsername ?? "",
              accessToken: existingUser.accessToken ?? "",
            }, { status: 200 });
          }

          const oAuthUser = await createOAuthUser(
            authorizationCode,
            email,
            "Keith",
            "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=3023&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          );
          

          return Response.json(oAuthUser, { status: 200 });
      },
    },
  },
});
