import { Navbar } from "@/components/Navbar";
import { createFileRoute } from '@tanstack/react-router';


function Embed(props: { calUsername: string; calEmail: string }) {
  return (
    <main className={"flex text-default flex flex-col"}>
      <Navbar username={props.calUsername} />
      <div>
        <h1 className="mx-8 my-4 text-2xl font-bold">This is the booker embed</h1>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/embed")({
  component: Embed,
});
