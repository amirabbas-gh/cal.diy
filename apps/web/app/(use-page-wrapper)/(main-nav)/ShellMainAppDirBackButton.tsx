"use client";


// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useNavigate, useRouter } from "@tanstack/react-router";


import { Button } from "@calcom/ui/components/button";

import type { LayoutProps } from "~/shell/Shell";

export const ShellMainAppDirBackButton = ({ backPath }: { backPath: LayoutProps["backPath"] }) => {
  const navigate = useNavigate();
  const router = useRouter();
  return (
    <Button
      variant="icon"
      size="sm"
      color="minimal"
      onClick={() => (typeof backPath === "string" ? navigate({ to: backPath as string }) : router.history.back())}
      StartIcon="arrow-left"
      aria-label="Go Back"
      className="rounded-md ltr:mr-2 rtl:ml-2"
      data-testid="go-back-button"
    />
  );
};
