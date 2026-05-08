
// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";

import { createFileRoute } from '@tanstack/react-router';

function ServerPageWrapper() {
  throw redirect({ to: "/" });
}

export const Route = createFileRoute("/enterprise")({
  component: ServerPageWrapper,
});
