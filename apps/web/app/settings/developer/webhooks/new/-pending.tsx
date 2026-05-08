import { WebhookFormSkeleton } from "~/webhooks/views/webhook-form-skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <WebhookFormSkeleton />;
}

export const Route = createFileRoute("/settings/developer/webhooks/new")({
  pendingComponent: Loading,
});
