import { Nav } from "@/components/Nav";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <Nav />
      <main>{children}</main>
    </div>
  );
}
