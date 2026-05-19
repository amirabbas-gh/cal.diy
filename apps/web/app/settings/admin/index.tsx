import { _generateMetadata } from "app/_utils";
import { createFileRoute } from '@tanstack/react-router';

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("admin"),
    () => "",
    undefined,
    undefined,
    "/settings/admin"
  );

const Page = () => <h1>Admin index</h1>;
export const Route = createFileRoute("/settings/admin")({
  component: Page,
});
