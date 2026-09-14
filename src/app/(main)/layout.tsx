import { Navbar } from "@/components/navbar";
import { BottomNavigation } from "@/components/bottom-nav";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/toaster";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-charcoal">
      <Navbar />
      <main className="relative flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <BottomNavigation />
      <Toaster />
    </div>
  );
}