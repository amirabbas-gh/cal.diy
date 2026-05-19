import { SkeletonLoader } from "@calcom/web/modules/apps/components/ConferencingAppsViewWebWrapper";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <SkeletonLoader />;
}

export const Route = createFileRoute("/settings/my-account/conferencing")({
  pendingComponent: Loading,
});
