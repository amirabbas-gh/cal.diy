import getIP from "@calcom/lib/getIP";

// TODO: next/server migration (R4h): confirm `Request`/`Response` types match your runtime; port remaining `next/server` helpers — https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/api/ip")({
  server: {
    handlers: {
      GET: async (req: Request) => {
        const requestorIp = getIP(req);
        return Response.json({ ip: requestorIp });
      },
    },
  },
});
