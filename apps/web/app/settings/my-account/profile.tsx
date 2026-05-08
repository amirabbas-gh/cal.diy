import { createRouterCaller } from "app/_trpc/context";
import { _generateMetadata } from "app/_utils";

// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { redirect } from "@tanstack/react-router";


import { meRouter } from "@calcom/trpc/server/routers/viewer/me/_router";

import ProfileView from "~/settings/my-account/profile-view";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("profile"),
    (t) => t("profile_description"),
    undefined,
    undefined,
    "/settings/my-account/profile"
  );

const Page = async () => {
  const meCaller = await createRouterCaller(meRouter);
  const user = await meCaller.get({ includePasswordAdded: true });
  if (!user) {
    throw redirect({ to: "/auth/login" });
  }

  return <ProfileView user={user} />;
};

export const Route = createFileRoute("/settings/my-account/profile")({
  component: Page,
});
