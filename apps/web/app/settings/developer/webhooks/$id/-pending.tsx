import { WebhookFormSkeleton } from "~/webhooks/views/webhook-form-skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <WebhookFormSkeleton titleKey="edit_webhook" />;
}

export const Route = createFileRoute("/settings/developer/webhooks/$id")({
  pendingComponent: Loading,
});
