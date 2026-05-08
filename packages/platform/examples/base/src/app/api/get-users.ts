import prisma from "../../lib/prismaClient";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/get-users")({
  server: {
    handlers: {
      GET: async () => {
        const existingUsers = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
          if (existingUsers && existingUsers.length) {
            return Response.json({
              users: existingUsers.map((item) => ({
                id: item.calcomUserId,
                email: item.email,
                username: item.calcomUsername ?? "",
                accessToken: item.accessToken ?? "",
              })),
            }, { status: 200 });
          }
          return Response.json({ users: [] }, { status: 400 });
      },
    },
  },
});
