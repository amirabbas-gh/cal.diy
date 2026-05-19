import { randomBytes } from "node:crypto";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/api/csrf")({
  server: {
    handlers: {
      GET: async (req: Request) => {
        const url = new URL(req.url);
        const sameSiteParam = url.searchParams.get("sameSite");

        const useSecureCookies = WEBAPP_URL.startsWith("https://");

        // Validate the param, default to "lax"
        let sameSite: "lax" | "strict" | "none" = "lax";
        if (sameSiteParam === "strict" || (sameSiteParam === "none" && useSecureCookies)) {
          sameSite = sameSiteParam;
        }

        const token = randomBytes(32).toString("hex");
        const res = Response.json({ csrfToken: token });

        res.cookies.set("calcom.csrf_token", token, {
          httpOnly: true,
          secure: useSecureCookies,
          sameSite,
          path: "/",
        });

        return res;
      },
    },
  },
});
