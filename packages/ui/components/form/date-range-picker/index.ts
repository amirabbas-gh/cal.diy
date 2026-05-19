// TODO: next/dist migration (R4dist): codegen — verify emitted bundle uses React.lazy (not next/dynamic)
import { lazy as dynamic } from "react";

export const DateRangePickerLazy = dynamic(() =>
  import("./DateRangePicker").then((mod) => mod.DatePickerWithRange)
);
