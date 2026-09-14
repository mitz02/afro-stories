import { HomeShell } from "@/components/home/shell";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeShell>{children}</HomeShell>;
}