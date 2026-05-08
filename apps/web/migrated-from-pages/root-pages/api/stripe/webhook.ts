export const config = {
  api: {
    bodyParser: false,
  },
};

// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export default function handler(_req: any, res: any) {
  res.status(404).json({ message: "Billing webhooks are not available in community edition" });
}
