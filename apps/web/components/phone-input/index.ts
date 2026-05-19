// TODO: next/dist migration (R4dist): codegen — verify emitted bundle uses React.lazy (not next/dynamic)
import { lazy as dynamic } from "react";

/** These are like 40kb that not every user needs */
const PhoneInputLazy = dynamic(
  () => import("./PhoneInput")
) as unknown as typeof import("./PhoneInput").default;

export default PhoneInputLazy;
