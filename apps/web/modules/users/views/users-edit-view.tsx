"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { showToast } from "@calcom/ui/components/toast";

// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useLocation, useNavigate } from "@tanstack/react-router";

import type { FormValues } from "../components/UserForm";
import { UserForm } from "../components/UserForm";

interface User {
  id: number;
  name: string | null;
  email: string;
  username: string | null;
  bio: string | null;
  timeZone: string;
  weekStart: string;
  theme: string | null;
  defaultScheduleId: number | null;
  locale: string | null;
  timeFormat: number | null;
  allowDynamicBooking: boolean | null;
  identityProvider: string | null;
  role: string | null;
  avatarUrl: string | null;
  createdDate?: string | Date;
}

export function UsersEditView({ user }: { user: User }) {
  const { t } = useLocale();
  const pathname = useLocation().pathname;
  const router = useNavigate();
  const utils = trpc.useUtils();

  const mutation = trpc.viewer.users.update.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.viewer.users.list.invalidate(), utils.viewer.users.get.invalidate()]);
      showToast(t("user_updated_successfully"), "success");
      router({ to: `${pathname?.split("/users/")[0]}/users`, replace: true });
    },
    onError: (err) => {
      console.error(err.message);
      showToast(t("error_updating_user"), "error");
    },
  });

  return (
    <UserForm
      key={JSON.stringify(user)}
      onSubmit={(values: FormValues) => {
        const data: Record<string, unknown> = {
          name: values.name,
          email: values.email,
          username: values.username,
          bio: values.bio,
          timeZone: values.timeZone,
          weekStart: values.weekStart?.value,
          theme: values.theme,
          defaultScheduleId: values.defaultScheduleId,
          locale: values.locale?.value,
          timeFormat: values.timeFormat?.value,
          allowDynamicBooking: values.allowDynamicBooking,
          identityProvider: values.identityProvider?.value,
          role: values.role?.value,
          avatarUrl: values.avatarUrl,
          userId: user.id,
        };
        if (user.username === data.username) delete data.username;
        mutation.mutate(data as Parameters<typeof mutation.mutate>[0]);
      }}
      defaultValues={user}
    />
  );
}

export default UsersEditView;
