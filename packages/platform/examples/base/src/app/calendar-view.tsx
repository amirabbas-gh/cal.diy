import { Navbar } from "@/components/Navbar";

import { CalendarView } from "@calcom/atoms";
import { createFileRoute } from '@tanstack/react-router';


function CalendarViewAtom(props: { calUsername: string; calEmail: string }) {
  return (
    <main className={"flex min-h-screen flex-col"}>
      <Navbar username={props.calUsername} />
      <div data-testid="calendars-settings-atom">
        {/* <CalendarView isEventTypeView={true} username={props.calUsername} eventSlug="sixty-minutes" /> */}
        <CalendarView />
      </div>
    </main>
  );
}

export const Route = createFileRoute("/calendar-view")({
  component: CalendarViewAtom,
});
