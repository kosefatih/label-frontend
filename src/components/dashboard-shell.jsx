import { MainNav } from "@/components/main-nav";

export function DashboardShell({ children }) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <MainNav />
          </div>
        </header>
        <div className="container grid flex-1 gap-12 py-8">{children}</div>
      </div>
    );
  }