import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-charcoal">
      <Navbar />
      <main className="relative flex-1">{children}</main>
      <Toaster />
    </div>
  );
}