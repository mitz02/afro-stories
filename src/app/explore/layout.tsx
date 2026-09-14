import { HomeShell } from "@/components/home/shell";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeShell>{children}</HomeShell>;
}