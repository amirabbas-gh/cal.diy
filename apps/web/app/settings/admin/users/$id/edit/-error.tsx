"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Alert } from "@calcom/ui/components/alert";
import { createFileRoute } from '@tanstack/react-router';

function Error() {
  const { t } = useLocale();
  return <Alert severity="error" title={t("something_went_wrong")} />;
}

export const Route = createFileRoute("/settings/admin/users/$id/edit")({
  errorComponent: Error,
});
