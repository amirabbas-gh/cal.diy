import { lazy } from 'react';

/** These are like 40kb that not every user needs */
const AddressInput = lazy(
  () => import("./AddressInput")
) as unknown as typeof import("./AddressInput").default;

export default AddressInput;
