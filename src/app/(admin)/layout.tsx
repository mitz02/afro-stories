import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      {children}
      <Toaster />
    </AdminShell>
  );
}