import { cn } from "@/lib/utils";

export function TabList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex", className)}>{children}</div>;
}

export function TabTrigger({
  children,
  active,
  onClick,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 items-center px-4 py-3 text-sm font-semibold transition-colors",
        active ? "text-gold" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold" />
      )}
    </button>
  );
}