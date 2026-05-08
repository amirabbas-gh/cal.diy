"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Alert } from "@calcom/ui/components/alert";

import Shell from "~/shell/Shell";
import { createFileRoute } from '@tanstack/react-router';

function Error() {
  const { t } = useLocale();
  return (
    <Shell>
      <Alert severity="error" title={t("something_went_wrong")} />
    </Shell>
  );
}

export const Route = createFileRoute("/event-types/$type")({
  errorComponent: Error,
});
