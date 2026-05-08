// TODO: this `next/dynamic` usage was not auto-ported — use React.lazy + Suspense, route-level code splitting, or manual loading UIs — https://react.dev/reference/react/lazy
import dynamic from "next/dynamic";

export { default as CheckedTeamSelect } from "@calcom/features/eventtypes/components/CheckedTeamSelect";
export { default as EventTypeDescription } from "./EventTypeDescription";
export { LearnMoreLink } from "@calcom/features/eventtypes/components/LearnMoreLink";
export { MultiplePrivateLinksController } from "./MultiplePrivateLinksController";
export const EventTypeDescriptionLazy = dynamic(() => import("./EventTypeDescription"));
