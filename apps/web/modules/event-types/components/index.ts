// TODO: next/dist migration (R4dist): codegen — verify emitted bundle uses React.lazy (not next/dynamic)
import { lazy as dynamic } from "react";

export { default as CheckedTeamSelect } from "@calcom/features/eventtypes/components/CheckedTeamSelect";
export { default as EventTypeDescription } from "./EventTypeDescription";
export { LearnMoreLink } from "@calcom/features/eventtypes/components/LearnMoreLink";
export { MultiplePrivateLinksController } from "./MultiplePrivateLinksController";
export const EventTypeDescriptionLazy = dynamic(() => import("./EventTypeDescription"));
