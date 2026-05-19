import getIP from "@calcom/lib/getIP";
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
