import getAppKeysFromSlug from "../../../_utils/getAppKeysFromSlug";

export interface IMakeSetupProps {
  inviteLink: string;
}

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export const getServerSideProps = async (ctx: any) => {
  const notFound = { notFound: true } as const;

  if (typeof ctx.params?.slug !== "string") return notFound;
  let inviteLink = "";
  const appKeys = await getAppKeysFromSlug("make");
  if (typeof appKeys.invite_link === "string") inviteLink = appKeys.invite_link;

  return {
    props: {
      inviteLink,
    },
  };
};
