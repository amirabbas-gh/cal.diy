import { AppHomePageSkeleton } from "app/(use-page-wrapper)/apps/(homepage)/skeleton";
import { createFileRoute } from '@tanstack/react-router';

function Loading() {
  return <AppHomePageSkeleton />;
}

export const Route = createFileRoute("/apps")({
  pendingComponent: Loading,
});
