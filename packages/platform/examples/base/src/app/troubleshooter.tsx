import { TroubleShooter } from "@calcom/atoms";
import { Navbar } from "@/components/Navbar";
// eslint-disable-next-line @calcom/eslint/deprecated-imports-next-router

// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useNavigate } from "@tanstack/react-router";

import { createFileRoute } from '@tanstack/react-router';


function Troubleshooter(props: {
  calUsername: string;
  calEmail: string;
}) {
  const router = useNavigate();

  return (
    <main className={"flex min-h-screen flex-col"}>
      <Navbar username={props.calUsername} />
      <div data-testid="troubleshooter-atom">
        <TroubleShooter
          onManageCalendarsClick={() => {
            router({ to: "/calendars" });
          }}
          onInstallCalendarClick={() => {
            router({ to: "/calendars" });
          }}
        />
      </div>
    </main>
  );
}

export const Route = createFileRoute("/troubleshooter")({
  component: Troubleshooter,
});
