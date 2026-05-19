// TODO: next/head migration (R4c-head): move meta tags to TanStack Start head APIs / document title — https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js
"use client";


import { markdownToSafeHTML } from "@calcom/lib/markdownToSafeHTML";

import PageWrapper from "@components/PageWrapper";
import { createFileRoute } from '@tanstack/react-router';

function Router({
  message,
  errorMessage,
}: {
  form?: { name: string } | null;
  message?: string;
  errorMessage?: string;
}) {
  return (
    <>
      <>
        <title>Cal.diy Forms</title>
      </>
      <div className="mx-auto my-0 max-w-3xl md:my-24">
        <div className="w-full max-w-4xl ltr:mr-2 rtl:ml-2">
          <div className="text-default bg-default -mx-4 rounded-sm border border-neutral-200 p-4 py-6 sm:mx-0 sm:px-8">
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized via markdownToSafeHTML */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: markdownToSafeHTML(message || errorMessage || null),
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/router")({
  component: Router,
});
