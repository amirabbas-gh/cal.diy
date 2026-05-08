import { lazy } from 'react';

/** These are like 40kb that not every user needs */
const MultiEmail = lazy(() => import("./MultiEmail"), {
  ssr: false,
}) as unknown as typeof import("./MultiEmail").default;

export default MultiEmail;
