import getAppKeysFromSlug from "../../../_utils/getAppKeysFromSlug";

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export const getStaticProps = async (ctx: any) => {
  if (typeof ctx.params?.slug !== "string") return { notFound: true } as const;
  let clientId = "";
  let secretKey = "";
  const appKeys = await getAppKeysFromSlug("paypal");
  if (typeof appKeys.client_id === "string" && typeof appKeys.secret_key === "string") {
    clientId = appKeys.client_id;
    secretKey = appKeys.secret_key;
  }

  return {
    props: {
      clientId,
      secretKey,
    },
  };
};
