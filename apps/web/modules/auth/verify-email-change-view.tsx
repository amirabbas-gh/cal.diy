"use client";

import { useSession } from "next-auth/react";

// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useNavigate } from "@tanstack/react-router";

import { useEffect } from "react";
import React from "react";
import { Toaster } from "sonner";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { inferSSRProps } from "@calcom/types/inferSSRProps";
import { showToast } from "@calcom/ui/components/toast";

import type { getServerSideProps } from "@server/lib/auth/verify-email-change/getServerSideProps";

export type PageProps = inferSSRProps<typeof getServerSideProps>;

function VerifyEmailChange(props: PageProps) {
  const { update } = useSession();
  const { t, isLocaleReady } = useLocale();
  const router = useNavigate();

  useEffect(() => {
    async function updateSessionAndDisplayToast() {
      await update({ email: props.updatedEmail });
      if (isLocaleReady) {
        showToast(t("verify_email_change_success_toast", { email: props.updatedEmail }), "success");
      }
      router({ to: "/event-types" });
    }
    if (props.updateSession) {
      updateSessionAndDisplayToast();
    } else {
      if (isLocaleReady) {
        showToast(t("verify_email_change_failure_toast"), "error");
      }
    }
    // We only need this to run on initial mount. These props can't and won't change due to it being fetched serverside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Toaster position="bottom-right" />
    </div>
  );
}

export default VerifyEmailChange;
