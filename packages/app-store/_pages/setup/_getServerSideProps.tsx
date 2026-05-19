export const AppSetupPageMap = {
  alby: import("../../alby/pages/setup/_getServerSideProps"),
  make: import("../../make/pages/setup/_getServerSideProps"),
  stripe: import("../../stripepayment/pages/setup/_getServerSideProps"),
  hitpay: import("../../hitpay/pages/setup/_getServerSideProps"),
  btcpayserver: import("../../btcpayserver/pages/setup/_getServerSideProps"),
};

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export const getServerSideProps = async (ctx: any) => {
  const { slug } = ctx.params || {};
  if (typeof slug !== "string") return { notFound: true } as const;

  if (!(slug in AppSetupPageMap)) return { props: {} };

  const page = await AppSetupPageMap[slug as keyof typeof AppSetupPageMap];

  if (!page.getServerSideProps) return { props: {} };

  const props = await page.getServerSideProps(ctx);

  return props;
};
