import { ConsoleNav } from "@/components/console/ConsoleNav";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <ConsoleNav />
      <main className="console-page">{children}</main>
    </div>
  );
}
