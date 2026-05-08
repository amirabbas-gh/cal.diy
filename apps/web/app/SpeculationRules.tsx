// TODO: replace `next/script` with plain <script>/<head> or TanStack router head APIs as needed — https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js
import Script from "next/script";

export function SpeculationRules({
  prefetchPathsOnHover = [],
  prerenderPathsOnHover = [],
}: {
  prefetchPathsOnHover?: string[];
  prerenderPathsOnHover?: string[];
}) {
  const speculationRules = {
    prefetch: [
      {
        urls: prefetchPathsOnHover,
        eagerness: "moderate",
      },
    ],
    prerender: [
      {
        urls: prerenderPathsOnHover,
        eagerness: "moderate",
      },
    ],
  };

  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: Speculation rules require inline script
    <Script
      dangerouslySetInnerHTML={{
        __html: `${JSON.stringify(speculationRules)}`,
      }}
      type="speculationrules"
      id="speculation-rules"
    />
  );
}
