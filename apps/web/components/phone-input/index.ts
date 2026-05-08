// TODO: this `next/dynamic` usage was not auto-ported — use React.lazy + Suspense, route-level code splitting, or manual loading UIs — https://react.dev/reference/react/lazy
import dynamic from "next/dynamic";

/** These are like 40kb that not every user needs */
const PhoneInputLazy = dynamic(
  () => import("./PhoneInput")
) as unknown as typeof import("./PhoneInput").default;

export default PhoneInputLazy;
