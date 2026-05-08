import { Navbar } from "@/components/Navbar";

// TODO: next/navigation migration (R4g): use `throw redirect()` in loaders / beforeLoad — client nav: `useNavigate()` — https://tanstack.com/router/latest/docs/framework/react/guide/navigation
import { useLocation } from "@tanstack/react-router";

import { useNavigate, useRouter } from "@tanstack/react-router";


import { PaymentForm } from "@calcom/atoms";
import { createFileRoute } from '@tanstack/react-router';


function Payment(props: { calUsername: string; calEmail: string }) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const router = useRouter();

  const uid = pathname.split("/").pop();

  return (
    <main className={"flex min-h-screen flex-col"}>
      <Navbar username={props.calUsername} />
      <PaymentForm
        paymentUid={uid ?? ""}
        onPaymentSuccess={() => {
          navigate({ to: "/bookings" });
        }}
        onPaymentCancellation={() => {
          router.history.back();
        }}
      />
    </main>
  );
}

export const Route = createFileRoute("/payment/$paymentUid")({
  component: Payment,
});
