import { Suspense } from "react";
import EmailDetailPage from "@/components/email/EmailDetailPage";

export default function EmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <EmailDetailPage params={params} />
    </Suspense>
  );
}
