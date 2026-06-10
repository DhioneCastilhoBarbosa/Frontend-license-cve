import type { ReactNode } from "react";
import Sidebar, { type AppPage } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  activePage: AppPage;
  isDark: boolean;
  userEmail: string;
  onNavigate: (page: AppPage) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export default function AppLayout({
  children,
  activePage,
  isDark,
  userEmail,
  onNavigate,
  onToggleTheme,
  onLogout,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        activePage={activePage}
        isDark={isDark}
        userEmail={userEmail}
        onNavigate={onNavigate}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />
      <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
    </div>
  );
}
