import Header from "@/components/email/Header";
import Providers from "@/components/email/Providers";
import EmailSidebar from "@/components/email/Sidebar";

export default function EmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex h-[calc(100vh)] flex-col overflow-hidden bg-background">
        <Header />
        <div className="flex min-h-0 flex-1">
          <EmailSidebar />
          <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </Providers>
  );
}
