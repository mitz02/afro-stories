import { HomeShell } from "@/components/home/shell";

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeShell>{children}</HomeShell>;
}