// TODO: port or remove this `next/document` import for TanStack Start — https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
