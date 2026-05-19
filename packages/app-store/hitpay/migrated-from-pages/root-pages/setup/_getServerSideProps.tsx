import { z } from "zod";

import { throwIfNotHaveAdminAccessToTeam } from "@calcom/app-store/_utils/throwIfNotHaveAdminAccessToTeam";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";

import { hitpayCredentialKeysSchema } from "../../lib/hitpayCredentialKeysSchema";

export type IHitPaySetupProps = z.infer<typeof hitpayCredentialKeysSchema>;

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export const getServerSideProps = async (ctx: any) => {
  const notFound = { notFound: true } as const;

  if (typeof ctx.params?.slug !== "string") return notFound;

  const { req, query } = ctx;
  const session = await getServerSession({ req });

  if (!session?.user?.id) {
    const redirect = { redirect: { permanent: false, destination: "/auth/login" } } as const;

    return redirect;
  }

  const teamId = query.teamId ? Number(query.teamId) : null;

  await throwIfNotHaveAdminAccessToTeam({ teamId, userId: session.user.id });
  const installForObject = teamId ? { teamId } : { userId: session.user.id };

  const credentials = await prisma.credential.findFirst({
    where: {
      type: "hitpay_payment",
      ...installForObject,
    },
  });

  let props: IHitPaySetupProps = {
    isSandbox: false,
  };

  if (credentials?.key) {
    const keyParsing = hitpayCredentialKeysSchema.safeParse(credentials.key);
    if (keyParsing.success) {
      props = {
        ...props,
        ...keyParsing.data,
      };
    }
  }

  return {
    props,
  };
};
