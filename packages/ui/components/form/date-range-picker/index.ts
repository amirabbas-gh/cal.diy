// TODO: this `next/dynamic` usage was not auto-ported — use React.lazy + Suspense, route-level code splitting, or manual loading UIs — https://react.dev/reference/react/lazy
import dynamic from "next/dynamic";

export const DateRangePickerLazy = dynamic(() =>
  import("./DateRangePicker").then((mod) => mod.DatePickerWithRange)
);
