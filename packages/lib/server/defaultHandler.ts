// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
type Handlers = {
  [method in "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "OPTIONS"]?: Promise<{ default: any }>;
};

/** Allows us to split big API handlers by method */
// TODO: `next/types erasure (R4j)`: replace `any` with real types (`Route.useParams`, `useLoaderData`, `FileRoutesByPath`, etc.) — https://tanstack.com/router/latest/docs/framework/react/guide/router-context
export const defaultHandler = (handlers: Handlers) => async (req: any, res: any) => {
  const handler = (await handlers[req.method as keyof typeof handlers])?.default;
  // auto catch unsupported methods.
  if (!handler) {
    return res
      .status(405)
      .json({ message: `Method Not Allowed (Allow: ${Object.keys(handlers).join(",")})` });
  }
  return await handler(req, res);
};
