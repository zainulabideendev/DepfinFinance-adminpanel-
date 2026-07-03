"use client";

import { EmailProvider } from "@/context/EmailStore";
import ComposeModal from "@/components/email/ComposeModal";
import { useEmailStore } from "@/context/EmailStore";

function ComposeLayer() {
  const { composeOpen, composeData, closeCompose, sendEmail, saveDraft } = useEmailStore();
  return (
    <ComposeModal
      open={composeOpen}
      onClose={closeCompose}
      composeData={composeData}
      onSend={sendEmail}
      onSaveDraft={saveDraft}
    />
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EmailProvider>
      {children}
      <ComposeLayer />
    </EmailProvider>
  );
}
