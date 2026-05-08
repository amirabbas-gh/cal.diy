import { z } from "zod";

import { WEBAPP_URL } from "@calcom/lib/constants";

const tokenSchema = z.object({
  token: z.string(),
});

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export async function getServerSideProps(context: any) {
  const parsed = tokenSchema.safeParse(context.query);
  if (!parsed.success) {
    return {
      notFound: true,
    } as const;
  }
  const { token } = parsed.data;

  if (!token) {
    return {
      notFound: true,
    } as const;
  }

  const params = new URLSearchParams({
    token,
  });

  const response = await fetch(`${WEBAPP_URL}/api/auth/verify-email?${params.toString()}`, {
    method: "POST",
  });

  if (!response.ok) {
    return {
      props: {
        updateSession: false,
        token,
        updatedEmail: false,
      },
    };
  }

  const data = await response.json();

  return {
    props: {
      updateSession: true,
      token,
      updatedEmail: data.updatedEmail ?? null,
    },
  };
}
